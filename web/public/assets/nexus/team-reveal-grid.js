/* ==========================================================================
   NEXUS — team reveal grid
   Static port of the VengeanceUI `team-reveal-grid` registry component
   (Ashutoshx7/VengeanceUI → public/r/team-reveal-grid.json) to static
   HTML/CSS/JS.

   Upstream behaviour preserved:
     · a responsive grid of portraits that grow and de-saturate on activation
     · the expertise line fades up over the lower third of the portrait
     · auto-rotation between members, paused while the user interacts
     · hover / focus selects a member
     · the title carries an animated hand-drawn underline
   ========================================================================== */

/* --------------------------------------------------------------- members */
var NEXUS_TEAM = [
  {
    id: "jay-gopal-tripathy",
    name: "Jay Gopal Tripathy",
    role: "Frontend Engineer",
    expertise: "Builds the NEXUS console — the mission-control surface where every budget move is reviewed, explained and executed.",
    image: "/assets/nexus/team/jay-gopal.webp",
    imagePosition: "center top",
    accent: "#3355ff"
  },
  {
    id: "shivam-kumar",
    name: "Shivam Kumar",
    role: "Backend Engineer",
    expertise: "Owns the decision APIs and the execution path — turning a reallocation proposal into a real budget mutation on the ad platforms.",
    image: "/assets/nexus/team/shi-ivam.png",
    imagePosition: "center top",
    accent: "#f04f78"
  },
  {
    id: "abhishek",
    name: "Abhishek",
    role: "Data Engineer",
    expertise: "Builds the unified commerce ledger — normalising Meta, Google, Amazon and Shopify into one warehouse you can reason about.",
    image: "/assets/nexus/team/Abhishek-singh06.png",
    imagePosition: "center top",
    accent: "#8b5cf6"
  },
  {
    id: "pragyan-jain",
    name: "Pragyan Jain",
    role: "Optimization Engineer",
    expertise: "Ships the constrained solver, the saturating response curves and the bandits that decide where the next dollar lands.",
    image: "/assets/nexus/team/pragyan-jain.png",
    imagePosition: "center 22%",
    accent: "#14b8a6"
  },
  {
    id: "anushree-tiwari",
    name: "Anushree Tiwari",
    role: "Platform Engineer",
    expertise: "Keeps the engine observable in production — deploys, monitors and traces the pipeline end to end.",
    image: "/assets/nexus/team/anushree-tiwari.png",
    imagePosition: "center 52%",
    accent: "#f59e0b"
  },
  {
    id: "garv-gupta",
    name: "Garv Gupta",
    role: "Product Engineer",
    expertise: "Builds the connectors and the product surfaces that turn raw ad telemetry into decisions you can act on.",
    image: "/assets/nexus/team/garv2412.png",
    imagePosition: "center top",
    accent: "#fb4f43"
  }
];

/* ------------------------------------------------------------------ init */
function initTeam(root) {
  if (root.dataset.nxTeamReady === "1") return;
  root.dataset.nxTeamReady = "1";

  var members = NEXUS_TEAM;
  var items = Array.prototype.slice.call(root.querySelectorAll("[data-team-item]"));
  if (!items.length) return;

  var activeId = members[0].id;
  var interacting = false;
  var timer = null;
  var ROTATION = 2800;

  /* The upstream effect depends on [autoPlay, interacting, members,
     resolvedActiveId, rotationInterval, selectMember] - so the timer is torn
     down and rebuilt whenever the active member changes or the pointer enters
     or leaves the grid. This mirrors that exactly: syncTimer() is called
     after every state change, and it only runs a timer while nobody is
     interacting. */
  function syncTimer() {
    if (timer) { clearInterval(timer); timer = null; }
    if (interacting) return;
    if (members.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(function () {
      var i = members.findIndex(function (m) { return m.id === activeId; });
      var next = members[(i < 0 ? 0 : i + 1) % members.length];
      activate(next.id, false);
    }, Math.max(ROTATION, 1200));
  }

  function activate(id) {
    activeId = id;
    items.forEach(function (item) {
      var on = item.dataset.teamItem === id;
      item.classList.toggle("is-active", on);
      var btn = item.querySelector("[data-team-btn]");
      if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
    });
    syncTimer();
  }

  function setInteracting(on) {
    if (interacting === on) return;
    interacting = on;
    syncTimer();
  }

  function restart() {
    syncTimer();
  }

  items.forEach(function (item) {
    var btn = item.querySelector("[data-team-btn]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      setInteracting(true);
      activate(item.dataset.teamItem);
    });
    btn.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") {
        setInteracting(true);
        activate(item.dataset.teamItem);
      }
    });
    btn.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") setInteracting(false);
    });
    btn.addEventListener("focus", function () {
      setInteracting(true);
      activate(item.dataset.teamItem);
    });
    btn.addEventListener("blur", function () { setInteracting(false); });
  });

  activate(members[0].id);
}

function bootTeam() {
  document.querySelectorAll("[data-team-root]").forEach(initTeam);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootTeam);
} else {
  bootTeam();
}
