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
      { label: 'Publications', label_zh: '论文', id: 'stat-pub'        },
      { label: 'Citations',    label_zh: '引用', id: 'stat-cite'        },
      { label: 'Conferences',  label_zh: '会议', id: 'stat-conf'        },
      { label: 'Internships',  label_zh: '实习', id: 'stat-intern'      },
      { label: 'Awards',       label_zh: '奖项', id: 'stat-award'       },
      { label: 'Scholarship',  label_zh: '奖学金', id: 'stat-scholarship' },
    ];

    defs.forEach(function (d) {
      var item = document.createElement('div');
      item.className = 'stat-item';
      item.innerHTML =
        '<span class="stat-number" id="' + d.id + '">—</span>' +
        '<span class="stat-label">' +
          '<span lang="en">' + d.label + '</span>' +
          '<span lang="zh">' + d.label_zh + '</span>' +
        '</span>';
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

  /* ---- Publication status chips (bilingual-aware) ---- */
  function injectPubStatus() {
    var statusMap = {
      'In Preparation': 'pub-status pub-status--prep',
      'Under Review':   'pub-status pub-status--review',
      'Submitted':      'pub-status pub-status--review',
    };
    document.querySelectorAll('.page__content li').forEach(function (li) {
      var enEl = li.querySelector('[lang="en"]');
      var enText = (enEl ? enEl.textContent : li.textContent).trim();
      if (statusMap[enText]) {
        li.innerHTML = '<span class="' + statusMap[enText] + '">' + li.innerHTML + '</span>';
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
     Language toggle (EN / 中文)
     The initial class on <html> is set by an inline script in head.html
     so we don't flash the wrong language. This function just wires up
     the click handler and keeps the pill's active state in sync.
     ================================================================ */
  function setLang(lang) {
    if (lang !== 'en' && lang !== 'zh') lang = 'en';
    var html = document.documentElement;
    html.classList.remove('lang-en', 'lang-zh');
    html.classList.add('lang-' + lang);
    html.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.querySelectorAll('.lang-toggle [data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    try { localStorage.setItem('siteLang_v2', lang); } catch (e) {}
  }

  function initLangToggle() {
    var current = document.documentElement.classList.contains('lang-zh') ? 'zh' : 'en';
    document.querySelectorAll('.lang-toggle [data-lang]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === current);
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  }

  /* ================================================================
     Toast — frosted slide-up notification (bilingual)
     ================================================================ */
  var toastEl = null;
  var toastTimer = null;
  function showToast(enMsg, zhMsg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
      '<span><span lang="en">' + enMsg + '</span><span lang="zh">' + zhMsg + '</span></span>';
    // restart enter animation
    toastEl.classList.remove('toast--show');
    void toastEl.offsetWidth;
    toastEl.classList.add('toast--show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('toast--show');
    }, 2000);
  }

  function copyText(text, enMsg, zhMsg) {
    function done() { showToast(enMsg, zhMsg); }
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch (e) {
        showToast('Copy failed', '复制失败');
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  var COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  /* ================================================================
     Copy citation — button on each published paper-box
     ================================================================ */
  function buildCitation(box) {
    var textEl = box.querySelector('.paper-box-text');
    if (!textEl) return '';
    var titleLink = textEl.querySelector('a');
    var title = titleLink ? titleLink.textContent.trim() : '';
    var href = titleLink ? (titleLink.getAttribute('href') || '') : '';
    var authors = '';
    var ps = textEl.querySelectorAll('p');
    for (var i = 0; i < ps.length; i++) {
      if (ps[i].querySelector('strong')) { authors = ps[i].textContent.trim().replace(/\s+/g, ' '); break; }
    }
    var badge = box.querySelector('.badge');
    var venue = badge ? badge.textContent.trim() : '';
    var parts = [];
    if (authors) parts.push(authors.replace(/[,\s]+$/, '') + '.');
    if (title) parts.push('"' + title.replace(/[.\s]+$/, '') + '."');
    if (venue) parts.push(venue + '.');
    if (href && /^https?:/.test(href)) parts.push(href);
    return parts.join(' ');
  }

  function initCopyCitations() {
    // .paper-box is reused by Internships and Projects too — only the
    // Publications section (between #publications and #internship-experiences)
    // gets citation buttons.
    var pubAnchor = document.getElementById('publications');
    if (!pubAnchor) return;
    var endAnchor = document.getElementById('internship-experiences');
    var FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    document.querySelectorAll('.paper-box').forEach(function (box) {
      var afterStart = pubAnchor.compareDocumentPosition(box) & FOLLOWING;
      var beforeEnd = !endAnchor || (box.compareDocumentPosition(endAnchor) & FOLLOWING);
      if (!afterStart || !beforeEnd) return;
      var textEl = box.querySelector('.paper-box-text');
      if (!textEl) return;
      var citation = buildCitation(box);
      if (!citation) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-cite';
      btn.title = 'Copy citation';
      btn.setAttribute('aria-label', 'Copy citation');
      btn.innerHTML = COPY_SVG;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        copyText(citation, 'Citation copied', '引用已复制');
        btn.classList.add('copy-cite--ok');
        setTimeout(function () { btn.classList.remove('copy-cite--ok'); }, 1400);
      });
      box.appendChild(btn);
    });
  }

  /* ================================================================
     Copy email — button beside the sidebar mailto link
     ================================================================ */
  function initCopyEmail() {
    document.querySelectorAll('.author__urls a[href^="mailto:"]').forEach(function (link) {
      var addr = link.getAttribute('href').replace(/^mailto:/, '').trim();
      if (!addr) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-email';
      btn.title = 'Copy email';
      btn.setAttribute('aria-label', 'Copy email address');
      btn.innerHTML = COPY_SVG;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        copyText(addr, 'Email copied', '邮箱已复制');
        btn.classList.add('copy-email--ok');
        setTimeout(function () { btn.classList.remove('copy-email--ok'); }, 1400);
      });
      var li = link.parentNode;
      li.classList.add('has-copy');
      li.appendChild(btn);
    });
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
    initLangToggle();
    initCopyCitations();
    initCopyEmail();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
