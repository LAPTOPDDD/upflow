(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function onScroll() {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer:fine)').matches) {
    var gx = window.innerWidth / 2, gy = 200;
    window.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY;
      glow.style.opacity = '1';
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 6, 5) * 0.06 + 's';
    io.observe(el);
  });

  document.querySelectorAll('.feature').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* gallery lightbox */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var cur = 0;

  function show(i) {
    if (!shots.length) return;
    cur = (i + shots.length) % shots.length;
    var img = shots[cur].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }
  function open(i) { show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); }
  function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); }

  shots.forEach(function (s) {
    s.addEventListener('click', function () { open(parseInt(s.getAttribute('data-index'), 10) || 0); });
  });
  if (lb) {
    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', function () { show(cur - 1); });
    lbNext.addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* reviews slider */
  var track = document.getElementById('reviewsTrack');
  if (track) {
    var step = function () {
      var card = track.querySelector('.review');
      return card ? card.offsetWidth + 18 : 360;
    };
    document.getElementById('revPrev').addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    document.getElementById('revNext').addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
  }
})();
