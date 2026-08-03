// The Radiance — site.js
// Year stamp + scroll reveal + photo gallery/lightbox. No tracking, no external calls.
(function () {
  "use strict";

  // footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // scroll reveal (respects reduced motion via CSS)
  var items = document.querySelectorAll(
    ".building__intro, .facts__item, .plan, .amenity-list li, .neighborhood__text, .neighborhood__map, .section__head, .gallery__section, .gallery__item, .avail__card"
  );
  items.forEach(function (el) { el.classList.add("reveal"); });

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }
  function forceReveal() { items.forEach(function (el) { el.classList.add("in"); }); }
  window.addEventListener("load", function () { setTimeout(forceReveal, 1200); });
  setTimeout(forceReveal, 2500); // hard backstop

  // ---- Gallery (grouped by room type) ----
  // Image lists mirror site/img/gallery/*.jpg (kept in sync; add/remove there).
  var SECTIONS = [
    { title: "Bedrooms", imgs: [
      "img/gallery/gallery_01.jpg", "img/gallery/gallery_03.jpg",
      "img/gallery/gallery_04.jpg", "img/gallery/gallery_07.jpg",
      "img/gallery/gallery_16.jpg", "img/gallery/gallery_32.jpg"
    ] },
    { title: "Living Rooms", imgs: [
      "img/gallery/gallery_05.jpg", "img/gallery/gallery_09.jpg",
      "img/gallery/gallery_11.jpg", "img/gallery/gallery_12.jpg",
      "img/gallery/gallery_15.jpg", "img/gallery/gallery_17.jpg",
      "img/gallery/gallery_22.jpg", "img/gallery/gallery_23.jpg",
      "img/gallery/gallery_27.jpg", "img/gallery/gallery_28.jpg",
      "img/gallery/gallery_29.jpg", "img/gallery/gallery_36.jpg"
    ] },
    { title: "Kitchens", imgs: [
      "img/gallery/gallery_06.jpg", "img/gallery/gallery_10.jpg",
      "img/gallery/gallery_13.jpg", "img/gallery/gallery_18.jpg",
      "img/gallery/gallery_19.jpg", "img/gallery/gallery_20.jpg",
      "img/gallery/gallery_21.jpg", "img/gallery/gallery_26.jpg",
      "img/gallery/gallery_30.jpg", "img/gallery/gallery_31.jpg"
    ] },
    { title: "Bathrooms", imgs: [
      "img/gallery/gallery_02.jpg", "img/gallery/gallery_24.jpg",
      "img/gallery/gallery_25.jpg", "img/gallery/gallery_34.jpg",
      "img/gallery/gallery_35.jpg"
    ] },
    { title: "Closets & Laundry", imgs: [
      "img/gallery/gallery_08.jpg", "img/gallery/gallery_14.jpg",
      "img/gallery/gallery_33.jpg"
    ] }
  ];

  // flat list for lightbox navigation (in display order)
  var GALLERY = [];
  SECTIONS.forEach(function (s) {
    s.imgs.forEach(function (src) { GALLERY.push(src); });
  });

  // ---- Lightbox (supports multiple named galleries) ----
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCount = document.getElementById("lbCount");
  var GL_SETS = {};   // name -> array of src
  var GL_CAP = {};    // name -> caption prefix
  var currentSet = "gallery";
  var current = 0;

  function render() {
    var set = GL_SETS[currentSet];
    lbImg.src = set[current];
    lbImg.alt = (GL_CAP[currentSet] || "The Radiance") + " photo " + (current + 1);
    lbCount.textContent = (current + 1) + " / " + set.length;
  }
  function openLightbox(setName, idx) {
    currentSet = setName;
    current = idx;
    render();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function step(d) {
    var set = GL_SETS[currentSet];
    current = (current + d + set.length) % set.length;
    render();
  }

  function buildGallery(container, setName, items) {
    if (!container) return;
    GL_SETS[setName] = items.imgs.map(function (i) { return i; });
    GL_CAP[setName] = items.caption || "The Radiance";
    items.imgs.forEach(function (src, i) {
      var fig = document.createElement("figure");
      fig.className = "gallery__item reveal";
      var img = document.createElement("img");
      img.src = src;
      img.alt = (items.caption || "The Radiance") + " image";
      img.loading = "lazy";
      fig.appendChild(img);
      fig.addEventListener("click", function () { openLightbox(setName, i); });
      container.appendChild(fig);
    });
  }

  // Interior gallery (grouped by room type)
  var grid = document.getElementById("galleryGrid");
  if (grid) {
    SECTIONS.forEach(function (s, idx) {
      var sec = document.createElement("div");
      sec.className = "gallery__section reveal";

      var h = document.createElement("h3");
      h.className = "gallery__section-title";
      h.textContent = s.title + " (" + s.imgs.length + ")";
      sec.appendChild(h);

      var g = document.createElement("div");
      g.className = "gallery__grid";
      buildGallery(g, "gallery" + idx, { imgs: s.imgs, caption: "The Radiance " + s.title });
      sec.appendChild(g);
      grid.appendChild(sec);
    });
  }

  // Floor-plan gallery
  var planGrid = document.getElementById("planGalleryGrid");
  if (planGrid) {
    buildGallery(planGrid, "plans", {
      imgs: [
        "img/plans/Unit_1A_1BR_TypeA.png",
        "img/plans/Unit_1B_1BR_TypeB.png",
        "img/plans/Unit_1C_1BR_TypeB.png",
        "img/plans/Unit_2A_2BR_TypeB.png",
        "img/plans/Unit_2B_2BR_TypeB.png",
        "img/plans/Unit_3A_3BR_TypeB.png",
        "img/plans/Unit_3B_3BR_TypeB.png",
        "img/plans/Unit_3C_3BR_TypeB.png",
        "img/plans/Accessible_TypeA_Detail.png"
      ],
      caption: "The Radiance floor plan"
    });
  }

  // Gallery items are built dynamically AFTER the initial observer list was
  // captured — re-gather and reveal them so they don't stay hidden.
  var galleryItems = document.querySelectorAll(".gallery__section, .gallery__item");
  if ("IntersectionObserver" in window) {
    galleryItems.forEach(function (el) { io.observe(el); });
  }
  // forceReveal() only covers the static `items` list, so reveal these explicitly.
  galleryItems.forEach(function (el) { el.classList.add("reveal", "in"); });

  if (lb) {
    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
    document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }
})();
