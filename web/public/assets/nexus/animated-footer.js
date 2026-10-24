/* ==========================================================================
   NEXUS — animated footer behaviour
   Static port of the NEXUS-DQPS `animated-footer` React component
   (web/src/components/ui/animated-footer.tsx) to vanilla JS.

   Upstream behaviour preserved:
     · the two hand photographs are sampled into an ASCII cell grid, with the
       contrast boosted (norm^0.82) so fine anatomical detail survives
     · the pointer lights a wandering cluster of cells
     · the whole scene drifts with a soft pointer parallax
     · the hands slide in from the edges and the display wordmark unmasks
       character-by-character when the footer scrolls into view
     · the render loop is capped at 36fps
   ========================================================================== */
(function () {
  "use strict";

  var ASCII_CHARS = "..::-=+xX#0369";
  var HIGHLIGHT_LIFETIME = 300;
  var CLUSTER_SIZE = 10;
  var PARALLAX_EASE = 0.05;
  var FPS_INTERVAL = 1000 / 36;

  function buildHandCells(image, cols, chars) {
    var rows = Math.max(
      1,
      Math.round(cols / (image.naturalWidth / image.naturalHeight || 1))
    );
    var sampler = document.createElement("canvas");
    sampler.width = cols;
    sampler.height = rows;
    var sCtx = sampler.getContext("2d");
    var cells = new Map();
    if (!sCtx) return { rows: rows, cells: cells };

    sCtx.drawImage(image, 0, 0, cols, rows);
    var pixels = sCtx.getImageData(0, 0, cols, rows).data;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var offset = (r * cols + c) * 4;
        var brightness =
          (pixels[offset] * 0.299 +
            pixels[offset + 1] * 0.587 +
            pixels[offset + 2] * 0.114) /
          255;
        var darkness = 1 - brightness;
        // skip pure background only - keeps contours and fine detail
        if (darkness < 0.05) continue;
        var norm = Math.min(1, Math.max(0, (darkness - 0.05) / 0.95));
        var boosted = Math.pow(norm, 0.82);
        var charIdx = Math.min(
          chars.length - 1,
          Math.max(1, Math.floor(boosted * chars.length))
        );
        cells.set(c + "," + r, {
          col: c,
          row: r,
          char: chars[charIdx],
          highlightEndTime: 0
        });
      }
    }
    return { rows: rows, cells: cells };
  }

  function highlightCluster(cells, startCell) {
    var now = Date.now();
    startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;

    var steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
    var lit = [startCell];
    var current = startCell;

    for (var s = 0; s < steps; s++) {
      var nbs = [];
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          var nb = cells.get((current.col + dx) + "," + (current.row + dy));
          if (nb && lit.indexOf(nb) < 0) nbs.push(nb);
        }
      }
      if (!nbs.length) break;
      var next = nbs[Math.floor(Math.random() * nbs.length)];
      next.highlightEndTime = now + HIGHLIGHT_LIFETIME + s * 10;
      lit.push(next);
      current = next;
    }
  }

  function init(root) {
    if (root.dataset.nxAfReady === "1") return;
    root.dataset.nxAfReady = "1";

    var cfg = {
      leftImage: root.dataset.afLeft || "/assets/nexus/animated-footer/hand-left.jpg",
      rightImage: root.dataset.afRight || "/assets/nexus/animated-footer/hand-right.jpg"
    };

    var leftWrap = root.querySelector("[data-af-wrap='left']");
    var rightWrap = root.querySelector("[data-af-wrap='right']");
    var leftCanvas = root.querySelector("[data-af-canvas='left']");
    var rightCanvas = root.querySelector("[data-af-canvas='right']");
    if (!leftWrap || !rightWrap || !leftCanvas || !rightCanvas) return;

    // the reveal flag lives on the footer element itself (the ASCII stage is
    // only the canvas host) - upstream adds `is-revealed` to the footer root
    var footerRoot = root.closest(".nxfoot") || root;

    var hands = [];
    var isMobile = window.innerWidth <= 680;
    var columns = isMobile ? 48 : 80;
    var cellSize = isMobile ? 12 : 18;
    var fontSize = isMobile ? 11 : 16;

    function setupHand(image, canvas, direction) {
      var res = buildHandCells(image, columns, ASCII_CHARS);
      if (!res.cells.size) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = columns * cellSize * dpr;
      canvas.height = res.rows * cellSize * dpr;

      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = "600 " + fontSize + "px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      var metrics = ctx.measureText("X");
      var ascent = metrics.actualBoundingBoxAscent || fontSize * 0.7;
      var descent = metrics.actualBoundingBoxDescent || 2;
      var glyphHeight = ascent + descent;
      var baselineOffset = cellSize / 2 + glyphHeight / 2 - descent;

      hands.push({
        canvas: canvas,
        ctx: ctx,
        cells: res.cells,
        cellList: Array.from(res.cells.values()),
        rows: res.rows,
        columns: columns,
        cellSize: cellSize,
        baselineOffset: baselineOffset,
        direction: direction
      });

      // paint right away - never leave the stage blank waiting for a scroll
      paintOnce();
    }

    function loadHand(src, canvas, direction) {
      if (!src) return;
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () { setupHand(img, canvas, direction); };
      img.src = src;
      if (img.complete && img.naturalWidth) setupHand(img, canvas, direction);
    }

    loadHand(cfg.leftImage, leftCanvas, 1);
    loadHand(cfg.rightImage, rightCanvas, -1);

    /* Paint one frame as soon as the hands are decoded, independent of the
       observer. If anything stops the intersection callback from firing (a
       late image decode, an unusual scroll container, a browser that never
       reports the footer as visible) the art would otherwise stay blank. */
    function paintOnce() {
      if (!hands.length) return;
      var style = getComputedStyle(document.documentElement);
      var isDark = document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      var charColor = style.getPropertyValue("--footer-ascii-color").trim() ||
        (isDark ? "#94a3b8" : "#1e40af");
      var hoverBg = style.getPropertyValue("--footer-accent").trim() || "#2563eb";
      var hoverChar = style.getPropertyValue("--footer-on-accent").trim() || "#ffffff";
      var now = Date.now();
      for (var i = 0; i < hands.length; i++) {
        renderHand(hands[i], now, charColor, hoverBg, hoverChar);
      }
    }

    function hoverHand(hand, clientX, clientY) {
      var rect = hand.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var mouseCol = ((clientX - rect.left) / rect.width) * hand.columns;
      var mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

      var closest = null;
      var closestDist = Infinity;
      for (var i = 0; i < hand.cellList.length; i++) {
        var cell = hand.cellList[i];
        var dx = mouseCol - cell.col;
        var dy = mouseRow - cell.row;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) { closestDist = dist; closest = cell; }
      }
      if (closest && closestDist <= 7) highlightCluster(hand.cells, closest);
    }

    var pointer = { x: 0, y: 0 };
    var drift = { x: 0, y: 0 };
    var curtainOffset = 100;
    var targetCurtain = 100;
    var isVisible = false;
    var rafId = 0;
    var lastFrameTime = 0;

    function onMouseMove(e) {
      // listen on the footer root, not the canvas stage: the display stage and
      // the top card are siblings of the stage, so their pointer events would
      // never bubble down to it (upstream listens on the footer element)
      var rect = footerRoot.getBoundingClientRect();
      var w = rect.width || 1;
      var h = rect.height || 1;
      pointer.x = ((e.clientX - rect.left) / w - 0.5) * 36;
      pointer.y = ((e.clientY - rect.top) / h - 0.5) * 36;
      for (var i = 0; i < hands.length; i++) hoverHand(hands[i], e.clientX, e.clientY);
    }
    footerRoot.addEventListener("mousemove", onMouseMove);

    function renderHand(hand, now, charCol, hoverBg, hoverChar) {
      var ctx = hand.ctx;
      var cs = hand.cellSize;
      ctx.clearRect(0, 0, hand.columns * cs, hand.rows * cs);
      for (var i = 0; i < hand.cellList.length; i++) {
        var cell = hand.cellList[i];
        var x = cell.col * cs;
        var y = cell.row * cs;
        var isLit = cell.highlightEndTime > now;
        if (isLit) {
          ctx.fillStyle = hoverBg;
          ctx.fillRect(x, y, cs, cs);
          ctx.fillStyle = hoverChar;
        } else {
          ctx.fillStyle = charCol;
        }
        ctx.fillText(cell.char, x + cs / 2, y + hand.baselineOffset);
      }
    }

    function frame(timestamp) {
      if (!isVisible) return;
      rafId = requestAnimationFrame(frame);
      if (timestamp - lastFrameTime < FPS_INTERVAL) return;
      lastFrameTime = timestamp;

      // upstream reads the theme tokens from documentElement on every frame,
      // so a theme change repaints the art immediately
      var style = getComputedStyle(document.documentElement);
      var isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      var charColor =
        style.getPropertyValue("--footer-ascii-color").trim() ||
        (isDark ? "#94a3b8" : "#1e40af");
      var hoverBg =
        style.getPropertyValue("--footer-accent").trim() ||
        style.getPropertyValue("--accent").trim() ||
        "#2563eb";
      var hoverChar =
        style.getPropertyValue("--footer-on-accent").trim() ||
        style.getPropertyValue("--on-accent").trim() ||
        "#ffffff";

      var now = Date.now();
      for (var i = 0; i < hands.length; i++) {
        renderHand(hands[i], now, charColor, hoverBg, hoverChar);
      }

      drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
      drift.y += (pointer.y - drift.y) * PARALLAX_EASE;
      curtainOffset += (targetCurtain - curtainOffset) * 0.08;
      // the easing is asymptotic - snap once it is close enough so the art
      // lands exactly in place instead of creeping for ever
      if (Math.abs(targetCurtain - curtainOffset) < 0.05) curtainOffset = targetCurtain;

      leftWrap.style.transform =
        "translateY(-50%) translateX(" + -curtainOffset + "%) translate(" + drift.x + "px, " + -drift.y + "px)";
      rightWrap.style.transform =
        "translateY(-50%) translateX(" + curtainOffset + "%) translate(" + -drift.x + "px, " + -drift.y + "px)";
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            reveal();
          } else {
            isVisible = false;
            targetCurtain = 100;
            cancelAnimationFrame(rafId);
          }
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(root);

    function reveal() {
      isVisible = true;
      targetCurtain = 0;
      footerRoot.classList.add("is-revealed");
      footerRoot.classList.remove("is-armed");
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
    }

    /* The wordmark is visible by default, so a browser that never runs this
       file - or a capture that never scrolls - still shows a complete footer.
       The mask is only armed once the footer is a viewport away, which is
       when the scroll reveal can actually play; the same poll reveals it if
       the intersection callback is ever starved. */
    var guard = window.setInterval(function () {
      if (footerRoot.classList.contains("is-revealed")) {
        window.clearInterval(guard);
        return;
      }
      var r = root.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh && r.bottom > 0) {
        reveal();
        paintOnce();
        window.clearInterval(guard);
      } else if (r.top > vh && r.top < vh * 2.2) {
        footerRoot.classList.add("is-armed");
      }
    }, 400);
  }

  function boot() {
    document.querySelectorAll("[data-af-root]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
