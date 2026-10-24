/* ==========================================================================
   NEXUS — FAQ accordion behaviour
   Static port of the VengeanceUI `faq-accordion` React component
   (components/ui/faq-accordion.tsx) to vanilla JS.

   The upstream component keeps a single `activeIndex` state: opening one
   item closes the previous one. This is the same state machine.
   ========================================================================== */
(function () {
  "use strict";

  function init(root) {
    if (root.dataset.nxfaqReady === "1") return;
    root.dataset.nxfaqReady = "1";

    var items = Array.prototype.slice.call(root.querySelectorAll(".nxfaq__item"));
    if (!items.length) return;

    var activeIndex = null;

    function toggleItem(index) {
      activeIndex = activeIndex === index ? null : index;
      render();
    }

    function render() {
      items.forEach(function (item, index) {
        var open = index === activeIndex;
        item.classList.toggle("is-open", open);
        var btn = item.querySelector(".nxfaq__q");
        if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
        // the upstream component swaps the glyph: {isActive ? "-" : "+"}
        var sign = item.querySelector(".nxfaq__sign");
        if (sign) sign.textContent = open ? "-" : "+";
      });
    }

    items.forEach(function (item, index) {
      var btn = item.querySelector(".nxfaq__q");
      if (!btn) return;
      btn.addEventListener("click", function () {
        toggleItem(index);
      });
    });

    // keyboard: up/down move between questions, home/end jump to the ends
    root.addEventListener("keydown", function (e) {
      var keys = ["ArrowDown", "ArrowUp", "Home", "End"];
      if (keys.indexOf(e.key) === -1) return;
      var btns = items.map(function (i) { return i.querySelector(".nxfaq__q"); }).filter(Boolean);
      var cur = btns.indexOf(document.activeElement);
      if (cur < 0) return;
      var next = cur;
      if (e.key === "ArrowDown") next = (cur + 1) % btns.length;
      else if (e.key === "ArrowUp") next = (cur - 1 + btns.length) % btns.length;
      else if (e.key === "Home") next = 0;
      else next = btns.length - 1;
      e.preventDefault();
      btns[next].focus();
    });

    render();
  }

  function boot() {
    document.querySelectorAll(".nxfaq").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
