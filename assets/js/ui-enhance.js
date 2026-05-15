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
    btn.classList.toggle('visible', scrollTop > 400);
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

  /* ---- Staggered fade-in for paper-box cards ---- */
  function initFadeIn() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show all cards
      document.querySelectorAll('.paper-box').forEach(function (el) {
        el.classList.add('sz-visible');
      });
      return;
    }

    var cards = document.querySelectorAll('.paper-box');
    cards.forEach(function (el, idx) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            // Stagger: each card enters 80ms after the previous one in the same viewport batch
            setTimeout(function () {
              el.classList.add('sz-visible');
            }, (idx % 4) * 80); // reset stagger every 4 cards
            io.unobserve(el);
          }
        });
      }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
      io.observe(el);
    });
  }

  /* ---- Publication status chips ---- */
  function injectPubStatus() {
    var statusMap = {
      'In Preparation': 'pub-status pub-status--prep',
      'Under Review':   'pub-status pub-status--review',
      'Submitted':      'pub-status pub-status--review',
    };

    document.querySelectorAll('.page__content li').forEach(function (li) {
      var text = li.textContent.trim();
      if (statusMap[text]) {
        li.innerHTML = '<span class="' + statusMap[text] + '">' + text + '</span>';
      }
    });
  }

  /* ---- Awards gold accent ---- */
  function injectAwardStyle() {
    // Find the Awards h1 and style the following li items
    var awardsAnchor = document.getElementById('honors-and-awards');
    if (!awardsAnchor) return;

    // Walk siblings until next h1 or end
    var el = awardsAnchor.nextElementSibling;
    while (el) {
      if (el.tagName === 'H1') break;
      if (el.tagName === 'UL') {
        el.querySelectorAll('li').forEach(function (li) {
          li.classList.add('award-item');
        });
      }
      el = el.nextElementSibling;
    }
  }

  /* ---- Init on DOM ready ---- */
  function init() {
    buildNavMap();
    initFadeIn();
    injectPubStatus();
    injectAwardStyle();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
