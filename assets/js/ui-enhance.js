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
      { w: 820, h: 820, top: '-240px', left: '46%',   color: '#3b82f6', dur: '34s', delay: '0s',    op: 0.22 },
      { w: 640, h: 640, top: '42%',    left: '-220px', color: '#38bdf8', dur: '26s', delay: '-9s',   op: 0.18 },
      { w: 560, h: 560, top: '18%',    left: '68%',    color: '#94a3b8', dur: '22s', delay: '-15s',  op: 0.40 },
      { w: 700, h: 700, top: '68%',    left: '36%',    color: '#60a5fa', dur: '38s', delay: '-6s',   op: 0.18 },
      { w: 460, h: 460, top: '60%',    left: '76%',    color: '#fbbf24', dur: '30s', delay: '-12s',  op: 0.10 },
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
        var rotY =  dx * 3;
        var rotX = -dy * 2.5;
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
    document.querySelectorAll('.site-nav a[href^="#"]').forEach(function (a) {
      navLinks.push(a);
    });
    document.querySelectorAll('span[id].anchor').forEach(function (el) {
      anchors.push(el);
    });
  }

  function updateActiveNav(scrollTop) {
    if (!anchors.length) return;
    var current = anchors[0];
    var activeBranch = null;
    for (var i = 0; i < anchors.length; i++) {
      if (anchors[i].offsetParent === null) continue;   // inside the hidden branch
      // A section is current once its marker has passed under the sticky bars.
      if (anchors[i].getBoundingClientRect().top <= (masthead ? masthead.offsetHeight : 0) + 120) {
        current = anchors[i];
      }
    }
    if (current) activeBranch = branchOf(current);
    navLinks.forEach(function (a) {
      a.classList.remove('nav-active');
      var id = (a.getAttribute('href') || '').replace(/^.*#/, '');
      if (!current || !id) return;
      var li = a.parentNode;
      if (a.classList.contains('site-nav__link') && li && li.classList.contains('has-children')) {
        // A group label stays lit while any of its sections is on screen.
        var ids = [].map.call(li.querySelectorAll('.site-nav__menu a'), function (c) {
          return (c.getAttribute('href') || '').replace(/^.*#/, '');
        });
        if (id === current.id || ids.indexOf(current.id) !== -1 || (BRANCHES[id] && activeBranch === id)) {
          a.classList.add('nav-active');
        }
      } else if (id === current.id) {
        a.classList.add('nav-active');
      }
    });
    document.querySelectorAll('.subnav a').forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace(/^#/, '');
      a.classList.toggle('is-active', !!current && id === current.id);
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
    // Accepted papers have no DOI to link yet, so their title sits in .pub-title.
    // Take the English span when the title is bilingual, not both at once.
    if (!title) {
      var titleEl = textEl.querySelector('.pub-title');
      if (titleEl) {
        var enTitle = titleEl.querySelector('[lang="en"]');
        title = (enTitle || titleEl).textContent.trim();
      }
    }
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
    // .paper-box is reused by Projects too — only the Publications section
    // (between #publications and #selected-projects) gets citation buttons.
    var pubAnchor = document.getElementById('publications');
    if (!pubAnchor) return;
    var endAnchor = document.getElementById('selected-projects');
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
     Three-tier layout: Academic / Entrepreneurship branch switch
     ================================================================ */
  var BRANCHES = {};
  var lensSwitch = null;
  var masthead = document.querySelector('.masthead');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setMastheadVar() {
    if (masthead) document.documentElement.style.setProperty('--masthead-h', (masthead.offsetHeight + 10) + 'px');
  }

  function branchOf(el) {
    while (el && el !== document.body) {
      if (el.getAttribute && el.hasAttribute('data-branch')) return el.getAttribute('data-branch');
      el = el.parentNode;
    }
    return null;
  }

  function positionLens() {
    if (!lensSwitch) return;
    var tab = lensSwitch.querySelector('.lens-tab.is-active');
    if (!tab) return;
    var sw = lensSwitch.getBoundingClientRect();
    var r = tab.getBoundingClientRect();
    lensSwitch.style.setProperty('--lens-x', (r.left - sw.left) + 'px');
    lensSwitch.style.setProperty('--lens-y', (r.top - sw.top) + 'px');
    lensSwitch.style.setProperty('--lens-w', r.width + 'px');
    lensSwitch.style.setProperty('--lens-h', r.height + 'px');
  }

  function activateBranch(name, animate) {
    if (!BRANCHES[name]) return false;
    var changed = false;
    Object.keys(BRANCHES).forEach(function (k) {
      var el = BRANCHES[k];
      var show = (k === name);
      if (show && el.hidden) changed = true;
      el.hidden = !show;
      el.classList.remove('is-entering');
      if (show && animate && changed && !reduceMotion) {
        void el.offsetWidth;
        el.classList.add('is-entering');
      }
    });
    if (lensSwitch) {
      lensSwitch.setAttribute('data-active', name);
      lensSwitch.querySelectorAll('.lens-tab').forEach(function (t) {
        var on = t.getAttribute('data-target') === name;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      positionLens();
    }
    return changed;
  }

  // Scroll to an id, opening the branch that holds it first. Keeps the
  // heading clear of the sticky masthead (and the sticky sub-nav inside a branch).
  function goTo(id, pushHash, instant) {
    var el = document.getElementById(id);
    if (!el) return false;
    var target = el;
    if (BRANCHES[id]) {
      activateBranch(id, true);
      target = document.getElementById('what-i-do') || el;
    } else {
      var b = branchOf(el);
      if (b) activateBranch(b, false);
    }
    // scroll-margin-top in glass.css keeps the target clear of the sticky bars
    var smooth = !(reduceMotion || instant);
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    if (smooth) {
      // Images without a fixed height can load mid-scroll and push the target
      // down, so once the glide ends, snap to where the target now is.
      var settled = false;
      var settle = function () {
        if (settled) return;
        settled = true;
        var want = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        if (Math.abs(target.getBoundingClientRect().top - want) > 24) {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      };
      if ('onscrollend' in window) window.addEventListener('scrollend', settle, { once: true });
      setTimeout(settle, 1500);
    }
    if (pushHash) {
      try { history.pushState(null, '', '#' + id); } catch (e) { location.hash = id; }
    }
    return true;
  }

  function initBranches() {
    setMastheadVar();
    window.addEventListener('resize', setMastheadVar);
    document.querySelectorAll('[data-branch]').forEach(function (el) {
      BRANCHES[el.getAttribute('data-branch')] = el;
    });
    lensSwitch = document.querySelector('.lens-switch');
    if (!lensSwitch) return;

    lensSwitch.querySelectorAll('.lens-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        var name = t.getAttribute('data-target');
        activateBranch(name, true);
        try { history.replaceState(null, '', '#' + name); } catch (e) {}
      });
    });

    // In-page links: open the right branch, then scroll with the sticky bars accounted for.
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      goTo(id, true);
    });

    var initial = 'academic';
    var h = (location.hash || '').slice(1);
    if (h) {
      var target = document.getElementById(h);
      if (BRANCHES[h]) initial = h;
      else if (target) { var b = branchOf(target); if (b) initial = b; }
    }
    activateBranch(initial, false);
    positionLens();
    if (h && document.getElementById(h)) {
      var jump = function () { goTo(h, false, true); onScroll(); };
      jump();
      setTimeout(jump, 80);
      window.addEventListener('load', function () { setTimeout(jump, 50); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(jump, 0); });
    }

    window.addEventListener('hashchange', function () {
      var id = (location.hash || '').slice(1);
      if (id) goTo(id, false);
    });
    window.addEventListener('resize', positionLens);
    window.addEventListener('load', positionLens);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionLens);
  }

  /* ================================================================
     Site menu: hover/focus opens a group on desktop (CSS); on touch
     screens the first tap opens it; on phones a button shows the sheet.
     ================================================================ */
  function initSiteNav() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var toggle = nav.querySelector('.site-nav__toggle');
    var coarse = window.matchMedia('(hover: none)').matches;

    function closeGroups() {
      nav.querySelectorAll('.has-children.is-open').forEach(function (li) {
        li.classList.remove('is-open');
        var l = li.querySelector('.site-nav__link');
        if (l) l.setAttribute('aria-expanded', 'false');
      });
    }
    function setSheet(open) {
      nav.classList.toggle('is-open', open);
      if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      setMastheadVar();
    }
    if (toggle) {
      toggle.addEventListener('click', function () { setSheet(!nav.classList.contains('is-open')); });
    }
    nav.querySelectorAll('.has-children > .site-nav__link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var li = link.parentNode;
        if (coarse && window.innerWidth > 900 && !li.classList.contains('is-open')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          closeGroups();
          li.classList.add('is-open');
          link.setAttribute('aria-expanded', 'true');
        }
      }, true);
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) { closeGroups(); return; }
      if (e.target.closest && e.target.closest('a[href^="#"]')) { closeGroups(); setSheet(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeGroups(); setSheet(false); }
    });
  }

  /* ================================================================
     Cursor-following sheen on glass cards (CSS reads --mx / --my)
     ================================================================ */
  function initSpecular() {
    var sel = '.paper-box, .cv-org, .jr-card, .vt-hero, .vt-product, .tl__body, .fund-card, .press-card, .team-card, .book-card';
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add('lg-card'); });
    if (!window.matchMedia('(hover: hover)').matches) return;
    var pending = null;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.lg-card') : null;
      if (!card || pending) return;
      pending = requestAnimationFrame(function () {
        pending = null;
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }, { passive: true });
  }

  /* ================================================================
     Init
     ================================================================ */
  function init() {
    injectOrbs();
    buildNavMap();
    initBranches();
    initSiteNav();
    initFadeIn();
    injectPubStatus();
    injectAwardStyle();
    init3DTilt();
    initSpecular();
    initLangToggle();
    initCopyCitations();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
