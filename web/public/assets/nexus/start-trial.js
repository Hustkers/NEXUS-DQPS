/* ==========================================================================
   NEXUS — "Start Trial" toggle for the Discover Products section.

   Default state : "Discover Products With Potential"  ->  [ Start Trial ]
   Toggled state : "Start your Nexus trial"              ->  [ Open the live console ]

   Clicking the button swaps the section between the two states.
   ========================================================================== */
(function () {
  "use strict";

  var STATES = {
    idle: {
      title: "Discover Products With Potential",
      label: "Start Trial",
      // no href in the idle state: an <a> carrying a hash href is
      // intercepted by barba and navigates the whole page away
      href: null
    },
    trial: {
      title: "Start your Nexus trial",
      label: "Open the live console",
      href: "https://nexus-dqps.vercel.app/dashboard/overview"
    }
  };

  function init(section) {
    if (section.dataset.nxTrialReady === "1") return;
    section.dataset.nxTrialReady = "1";

    var trigger = section.querySelector("[data-nxtrial-trigger]");
    var title = section.querySelector("[data-nxtrial-title]");
    var label = section.querySelector("[data-nxtrial-label]");
    var body = section.querySelector("[data-nxtrial-body]");
    if (!trigger || !title || !label) return;

    var state = "idle";

    function apply(next) {
      state = next;
      var s = STATES[state];
      title.textContent = s.title;
      label.textContent = s.label;
      if (s.href) {
        trigger.setAttribute("href", s.href);
        trigger.removeAttribute("role");
      } else {
        trigger.removeAttribute("href");
        trigger.setAttribute("role", "button");
        trigger.setAttribute("tabindex", "0");
      }
      trigger.setAttribute("aria-label", s.label);
      section.setAttribute("data-nxtrial-state", state);
      if (body) {
        body.hidden = state !== "trial";
        // let the browser lay the paragraph out before the transition
        requestAnimationFrame(function () {
          body.style.maxHeight = state === "trial" ? body.scrollHeight + "px" : "0px";
        });
      }
    }

    trigger.addEventListener("click", function (e) {
      // the button toggles the section; in the trial state it links out
      if (state === "idle") {
        e.preventDefault();
        e.stopPropagation();
        apply("trial");
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    apply("idle");
  }

  function boot() {
    document.querySelectorAll("[data-nxtrial-section]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
