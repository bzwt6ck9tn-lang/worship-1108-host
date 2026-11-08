/* 牧者執事退修｜敬拜講稿｜2026.11.08 */
(function () {
  "use strict";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function syncNavVar() {
    var nav = $("nav.nav-chips");
    if (!nav) return;
    document.documentElement.style.setProperty("--nav-h", nav.getBoundingClientRect().height + "px");
  }

  function navOffset() {
    var nav = $("nav.nav-chips");
    return (nav ? nav.getBoundingClientRect().height : 56) + 8;
  }

  function scrollToTarget(el, id) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - navOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    if (id && history.replaceState) history.replaceState(null, "", "#" + id);
  }

  function initNavSpy() {
    var nav = $("nav.nav-chips");
    if (!nav) return;
    var links = $all("a[href^='#']", nav);
    var sections = links.map(function (a) {
      return document.getElementById((a.getAttribute("href") || "").slice(1));
    });

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href") || "";
        if (href.charAt(0) !== "#") return;
        var id = href.slice(1);
        var el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        scrollToTarget(el, id);
      });
    });

    function update() {
      var probe = navOffset() + 12;
      var idx = 0;
      sections.forEach(function (sec, i) {
        if (sec && sec.getBoundingClientRect().top <= probe) idx = i;
      });
      links.forEach(function (a, i) {
        a.classList.toggle("active", i === idx);
        if (i === idx) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }, { passive: true });
    window.addEventListener("resize", function () {
      syncNavVar();
      update();
    });
    syncNavVar();
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initNavSpy);
  else initNavSpy();
})();
