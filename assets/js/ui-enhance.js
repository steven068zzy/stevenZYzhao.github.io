(function () {
  'use strict';

  /* ---- Scroll progress bar ---- */
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.insertBefore(bar, document.body.firstChild);

  /* ---- Back-to-top button ---- */
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '&#8679;';
  document.body.appendChild(btn);

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- Scroll handler ---- */
  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';

    if (scrollTop > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }

    updateActiveNav(scrollTop);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Active nav highlight ---- */
  var anchors = [];
  var navLinks = [];

  function buildNavMap() {
    document.querySelectorAll('.masthead__menu-item a').forEach(function (a) {
      navLinks.push(a);
    });
    document.querySelectorAll('h1[id], span[id].anchor').forEach(function (el) {
      anchors.push(el);
    });
  }

  function updateActiveNav(scrollTop) {
    if (!anchors.length) return;
    var current = anchors[0];
    for (var i = 0; i < anchors.length; i++) {
      if (anchors[i].getBoundingClientRect().top + scrollTop <= scrollTop + 80) {
        current = anchors[i];
      }
    }
    navLinks.forEach(function (a) {
      a.classList.remove('nav-active');
      var href = a.getAttribute('href') || '';
      if (current && href.indexOf(current.id) !== -1) {
        a.classList.add('nav-active');
      }
    });
  }

  /* ---- Fade-in on scroll via IntersectionObserver ---- */
  function initFadeIn() {
    if (!('IntersectionObserver' in window)) return;

    var style = document.createElement('style');
    style.textContent = [
      '.paper-box{opacity:0;transform:translateY(18px);}',
      '.paper-box.sz-visible{opacity:1;transform:translateY(0);transition:opacity .45s ease,transform .45s ease;}'
    ].join('');
    document.head.appendChild(style);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('sz-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.paper-box').forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---- Init on DOM ready ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      buildNavMap();
      initFadeIn();
      onScroll();
    });
  } else {
    buildNavMap();
    initFadeIn();
    onScroll();
  }
})();
