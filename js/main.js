(function () {
  'use strict';

  /* Header state */
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 60 + 'ms'; io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add('visible'); }); }

  /* FAQ */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var q = item.querySelector('.faq__q');
    var a = item.querySelector('.faq__a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(function (o) {
        o.classList.remove('open'); o.querySelector('.faq__a').style.maxHeight = null;
      });
      if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* Reviews slider */
  var track = document.getElementById('reviewsTrack');
  var prev = document.getElementById('revPrev');
  var next = document.getElementById('revNext');
  var index = 0;
  function perView() { return window.innerWidth <= 640 ? 1 : window.innerWidth <= 1100 ? 2 : 3; }
  function maxIndex() { return Math.max(0, track.children.length - perView()); }
  function cardStep() {
    var card = track.children[0];
    var cs = getComputedStyle(track);
    var gap = parseFloat(cs.columnGap || cs.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }
  function go(i) {
    index = Math.max(0, Math.min(i, maxIndex()));
    track.style.transform = 'translateX(' + (-index * cardStep()) + 'px)';
    prev.disabled = index === 0;
    next.disabled = index >= maxIndex();
  }
  prev.addEventListener('click', function () { go(index - 1); });
  next.addEventListener('click', function () { go(index + 1); });
  window.addEventListener('resize', function () { go(index); });
  go(0);

  /* Lightbox */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var items = Array.prototype.slice.call(document.querySelectorAll('.plate--grid'));
  var current = 0;
  function show(i) { current = (i + items.length) % items.length; lbImg.src = items[current].querySelector('img').src; }
  items.forEach(function (item) {
    item.addEventListener('click', function () {
      show(parseInt(item.dataset.index, 10));
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
