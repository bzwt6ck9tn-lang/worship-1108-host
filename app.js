/* 牧者執事退修｜敬拜講稿｜2026.11.08 */
(function () {
  "use strict";

  var STORAGE_KEY = "worship1108host:order";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function syncNavVar() {
    var nav = $("nav.nav-chips");
    if (!nav) return;
    var h = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--nav-h", h + "px");
  }

  function navOffset() {
    var nav = $("nav.nav-chips");
    return (nav ? nav.getBoundingClientRect().height : 56) + 8;
  }

  function scrollToTarget(el, id) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - navOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    if (id && history.replaceState) {
      history.replaceState(null, "", "#" + id);
    }
  }

  function initNavSpy() {
    var nav = $("nav.nav-chips");
    if (!nav) return;
    var links = $all("a[href^='#']", nav);
    var sections = links.map(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      return document.getElementById(id);
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
        if (!sec) return;
        if (sec.getBoundingClientRect().top <= probe) idx = i;
      });
      links.forEach(function (a, i) {
        a.classList.toggle("active", i === idx);
        if (i === idx) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      if (links[idx] && nav) {
        var chip = links[idx];
        var left = chip.offsetLeft - 24;
        var right = chip.offsetLeft + chip.offsetWidth + 24;
        if (left < nav.scrollLeft) nav.scrollLeft = left;
        else if (right > nav.scrollLeft + nav.clientWidth) {
          nav.scrollLeft = right - nav.clientWidth;
        }
      }
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

  function loadOrder() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveOrder(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function updateNow(box) {
    var steps = $all(".order-step", box);
    var next = null;
    steps.forEach(function (btn) {
      btn.classList.remove("is-now");
      if (!next && !btn.classList.contains("is-done")) next = btn;
    });
    if (next) next.classList.add("is-now");

    var ids = {};
    steps.forEach(function (btn) {
      var id = btn.getAttribute("data-target");
      if (id) ids[id] = true;
    });
    Object.keys(ids).forEach(function (id) {
      var block = document.getElementById(id);
      if (!block) return;
      var related = steps.filter(function (btn) {
        return btn.getAttribute("data-target") === id;
      });
      var current = related.some(function (btn) {
        return btn.classList.contains("is-now");
      });
      block.classList.toggle("is-now", current);
    });

    var reset = $(".order-reset", box);
    if (reset) {
      var any = steps.some(function (btn) { return btn.classList.contains("is-done"); });
      reset.hidden = !any;
    }
  }

  function persistOrders() {
    var data = {};
    $all(".order-box").forEach(function (box) {
      var key = box.getAttribute("data-order");
      data[key] = $all(".order-step", box).map(function (btn) {
        return btn.classList.contains("is-done");
      });
    });
    saveOrder(data);
  }

  function initOrders() {
    var saved = loadOrder();
    $all(".order-box").forEach(function (box) {
      var key = box.getAttribute("data-order");
      var steps = $all(".order-step", box);
      var state = saved[key] || [];
      steps.forEach(function (btn, i) {
        var done = !!state[i];
        btn.classList.toggle("is-done", done);
        btn.setAttribute("aria-pressed", done ? "true" : "false");
        btn.addEventListener("click", function () {
          var nowDone = !btn.classList.contains("is-done");
          btn.classList.toggle("is-done", nowDone);
          btn.setAttribute("aria-pressed", nowDone ? "true" : "false");
          updateNow(box);
          persistOrders();
        });
      });
      var reset = $(".order-reset", box);
      if (reset) {
        reset.addEventListener("click", function () {
          steps.forEach(function (btn) {
            btn.classList.remove("is-done");
            btn.setAttribute("aria-pressed", "false");
          });
          updateNow(box);
          persistOrders();
        });
      }
      updateNow(box);
    });
  }

  function init() {
    initNavSpy();
    initOrders();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
