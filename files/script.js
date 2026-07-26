/* ==========================================================================
   TRENDZ SHOEMART — script.js
   Vanilla JS, no external dependencies. Every feature below is self-
   contained and guarded with null-checks so a missing element never
   throws an error elsewhere on the page.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initPreloader();
  initHeaderScroll();
  initMobileMenu();
  initRevealAnimations();
  initActiveNavLink();
  initGalleryLightbox();
  initBackToTop();
  initImageFallback();
  initFooterYear();
});

/* ---------- Preloader ---------- */
function initPreloader() {
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  var hidden = false;
  function hide() {
    if (hidden) return;
    hidden = true;
    preloader.classList.add('done');
  }

  window.addEventListener('load', function () { setTimeout(hide, 300); });
  setTimeout(hide, 3000); // safety fallback if some external asset stalls
}

/* ---------- Header scroll state ---------- */
function initHeaderScroll() {
  var header = document.getElementById('header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    document.body.classList.remove('lock-scroll');
  }

  hamburger.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('lock-scroll', isOpen);
  });

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ---------- Scroll-reveal (fades + the signature stitch-line draw-in) ---------- */
function initRevealAnimations() {
  var items = document.querySelectorAll('.reveal-up, [data-stitch]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('active'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- Active nav link tracking ---------- */
function initActiveNavLink() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  if (!sections.length || !navLinks.length) return;

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(function (sec) { observer.observe(sec); });
}

/* ---------- Gallery lightbox ---------- */
function initGalleryLightbox() {
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var closeBtn = document.getElementById('lightboxClose');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  if (!items.length || !lightbox || !lightboxImg) return;

  var slides = items.map(function (item) {
    var img = item.querySelector('img');
    var tag = item.querySelector('.tile-tag');
    return {
      src: img ? img.src : '',
      alt: img ? img.alt : '',
      tag: tag ? tag.textContent : ''
    };
  });

  var currentIndex = 0;

  function updateImage() {
    var slide = slides[currentIndex];
    if (!slide) return;
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.alt + (slide.tag ? ' (' + slide.tag + ')' : '');
  }

  function open(index) {
    currentIndex = index;
    updateImage();
    lightbox.classList.add('open');
    document.body.classList.add('lock-scroll');
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.classList.remove('lock-scroll');
  }

  function next() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateImage();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateImage();
  }

  items.forEach(function (item, index) {
    item.addEventListener('click', function () { open(index); });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
}

/* ---------- Back-to-top button ---------- */
function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  function onScroll() {
    if (window.scrollY > 500) btn.classList.add('show');
    else btn.classList.remove('show');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Graceful fallback for any hotlinked image that fails to load ---------- */
function initImageFallback() {
  var imgs = document.querySelectorAll('.gallery-item img, .hero-cell img, .about-media img');
  imgs.forEach(function (img) {
    img.addEventListener('error', function () {
      var wrapper = this.closest('.gallery-item, .hero-cell, .about-media-frame');
      if (!wrapper) return;
      wrapper.classList.add('img-fallback');
      if (!wrapper.querySelector('.fallback-icon')) {
        var icon = document.createElement('i');
        icon.className = 'fa-solid fa-shoe-prints fallback-icon';
        wrapper.appendChild(icon);
      }
    }, { once: true });
  });
}

/* ---------- Footer year ---------- */
function initFooterYear() {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
