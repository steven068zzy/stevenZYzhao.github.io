(function () {
  'use strict';

  /* ---- Scroll progress bar ---- */
  var progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  document.body.insertBefore(progressBar, document.body.firstChild);

  /* ---- Back-to-top button ---- */
  var backBtn = document.createElement('button');
  backBtn.id = 'back-to-top';
  backBtn.setAttribute('aria-label', 'Back to top');
  backBtn.title = 'Back to top';
  backBtn.innerHTML = '&#8679;';
  document.body.appendChild(backBtn);

  backBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ================================================================
     1. Floating orbs background
     ================================================================ */
  function injectOrbs() {
    var wrap = document.createElement('div');
    wrap.id = 'bg-orbs';
    var orbData = [
      { w: 440, h: 440, top: '-100px', left: '58%',  color: '#3b82f6', dur: '28s', delay: '0s',    op: 0.20 },
      { w: 310, h: 310, top: '58%',   left: '-70px', color: '#0ea5e9', dur: '22s', delay: '-8s',   op: 0.16 },
      { w: 270, h: 270, top: '28%',   left: '72%',   color: '#818cf8', dur: '19s', delay: '-14s',  op: 0.13 },
      { w: 360, h: 360, top: '78%',   left: '42%',   color: '#38bdf8', dur: '34s', delay: '-5s',   op: 0.11 },
    ];
    orbData.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'bg-orb';
      el.style.cssText =
        'width:' + d.w + 'px;height:' + d.h + 'px;' +
        'top:' + d.top + ';left:' + d.left + ';' +
        'background:' + d.color + ';' +
        '--orb-dur:' + d.dur + ';' +
        '--orb-delay:' + d.delay + ';' +
        '--orb-op:' + d.op + ';';
      wrap.appendChild(el);
    });
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  /* ================================================================
     3. 3D perspective tilt on paper-box
     ================================================================ */
  function init3DTilt() {
    if (!window.matchMedia('(hover: hover)').matches) return;

    document.querySelectorAll('.paper-box').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
        var dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
        var rotY =  dx * 5;
        var rotX = -dy * 4;
        card.style.transform =
          'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
        card.style.willChange = 'transform';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.willChange = '';
      });
    });
  }

  /* ================================================================
     4. Stats counter bar
     ================================================================ */
  function countUp(el, target, duration) {
    var startTime = null;
    var suffix = target >= 100 ? '+' : '';
    function step(ts) {
      if (!startTime) startTime = ts;
      var pct = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(pct * target) + suffix;
      if (pct < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  function initStatsBar() {
    var educationsAnchor = document.getElementById('educations');
    if (!educationsAnchor) return;

    var bar = document.createElement('div');
    bar.className = 'stats-bar';

    var defs = [
      { label: 'Publications', id: 'stat-pub'        },
      { label: 'Citations',    id: 'stat-cite'        },
      { label: 'Conferences',  id: 'stat-conf'        },
      { label: 'Internships',  id: 'stat-intern'      },
      { label: 'Awards',       id: 'stat-award'       },
      { label: 'Scholarship',  id: 'stat-scholarship' },
    ];

    defs.forEach(function (d) {
      var item = document.createElement('div');
      item.className = 'stat-item';
      item.innerHTML =
        '<span class="stat-number" id="' + d.id + '">—</span>' +
        '<span class="stat-label">' + d.label + '</span>';
      bar.appendChild(item);
    });

    educationsAnchor.parentNode.insertBefore(bar, educationsAnchor);

    var triggered = false;
    var io = new IntersectionObserver(function (entries) {
      if (triggered || !entries[0].isIntersecting) return;
      triggered = true;
      io.disconnect();

      // Hardcoded values
      var pubEl    = document.getElementById('stat-pub');
      var citeEl   = document.getElementById('stat-cite');
      var confEl   = document.getElementById('stat-conf');
      var internEl = document.getElementById('stat-intern');
      var awardEl  = document.getElementById('stat-award');

      if (pubEl)    countUp(pubEl,    6, 1000);
      if (citeEl)   countUp(citeEl,   6, 1000);
      if (confEl)   countUp(confEl,   9, 1000);
      if (internEl) countUp(internEl, 3, 1000);
      if (awardEl)  countUp(awardEl,  7, 1000);

      var scholarEl = document.getElementById('stat-scholarship');
      if (scholarEl) scholarEl.textContent = '$22,400+';
    }, { threshold: 0.2 });

    io.observe(bar);
  }

  /* ================================================================
     Scroll handler
     ================================================================ */
  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
    backBtn.classList.toggle('visible', scrollTop > 400);
    updateActiveNav(scrollTop);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Active nav highlight ---- */
  var anchors  = [];
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
      document.querySelectorAll('.paper-box').forEach(function (el) {
        el.classList.add('sz-visible');
      });
      return;
    }

    document.querySelectorAll('.paper-box').forEach(function (el, idx) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            setTimeout(function () {
              el.classList.add('sz-visible');
            }, (idx % 4) * 80);
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
    var awardsAnchor = document.getElementById('honors-and-awards');
    if (!awardsAnchor) return;
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

  /* ================================================================
     Init
     ================================================================ */
  function init() {
    injectOrbs();
    buildNavMap();
    initFadeIn();
    injectPubStatus();
    injectAwardStyle();  // must precede initStatsBar (award count)
    initStatsBar();
    init3DTilt();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
