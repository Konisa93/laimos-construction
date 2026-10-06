(function () {
  var root = document.documentElement;

  // Language: saved choice first, then the browser's language
  var langButtons = document.querySelectorAll("[data-set-lang]");

  function setLang(lang) {
    root.lang = lang;
    langButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
    });
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  setLang(saved || ((navigator.language || "").toLowerCase().indexOf("el") === 0 ? "el" : "en"));

  langButtons.forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.setLang); });
  });

  // Phone and tablet menu
  var top = document.querySelector(".top");
  var menuButton = document.querySelector(".top__menu");

  function setMenu(open) {
    top.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }

  menuButton.addEventListener("click", function () { setMenu(!top.classList.contains("is-open")); });
  document.querySelectorAll(".top__nav a, .top__logo").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { setMenu(false); });

  // Header hides while scrolling down and returns when scrolling up
  var lastY = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (Math.abs(y - lastY) < 6) return;
    top.classList.toggle("is-hidden", y > lastY && y > 240 && !top.classList.contains("is-open"));
    lastY = y;
  }, { passive: true });
  top.addEventListener("focusin", function () { top.classList.remove("is-hidden"); });

  // Photos fade in once as they come into view
  var revealItems = document.querySelectorAll(".work .shot, .build .shot, .about__img");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach(function (el) { el.classList.add("reveal"); observer.observe(el); });
  }

  // Photo viewer: steps through the photos of the group that was opened
  var viewer = document.getElementById("viewer");
  var viewerImg = document.getElementById("viewer-img");
  var set = [];
  var index = 0;

  function show(i) {
    index = (i + set.length) % set.length;
    viewerImg.classList.remove("is-ready");
    viewerImg.src = set[index].dataset.full;
    viewerImg.alt = set[index].querySelector("img").alt;
    if (viewerImg.complete) viewerImg.classList.add("is-ready");
  }
  viewerImg.addEventListener("load", function () { viewerImg.classList.add("is-ready"); });

  document.querySelectorAll(".shot").forEach(function (shot) {
    shot.addEventListener("click", function () {
      set = Array.prototype.slice.call(shot.closest(".work, .build").querySelectorAll(".shot"));
      show(set.indexOf(shot));
      viewer.showModal();
    });
  });

  viewer.addEventListener("click", function (e) {
    var step = e.target.closest("[data-step]");
    if (step) { show(index + Number(step.dataset.step)); return; }
    if (e.target === viewer || e.target.closest("[data-close]") || e.target.tagName === "FIGURE") viewer.close();
  });

  // Swipe left or right on a touch screen to change photo
  var touchX = null;
  viewer.addEventListener("touchstart", function (e) { touchX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  viewer.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  viewer.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });
})();
