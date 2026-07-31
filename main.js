/* Royal Purple Express — interactions */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  doc.documentElement.classList.add('js'); // enables scroll-reveal; without JS, content stays visible

  /* Header scroll state */
  var header = doc.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    // lane progress
    var h = doc.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    var bar = doc.querySelector('.lane-progress i');
    if (bar) bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var toggle = doc.querySelector('.menu-toggle');
  /* The drawer is padded down by the header's real height so its first item never
     sits under the bar. The header shrinks once .scrolled applies, so keep this
     measurement fresh on load, on scroll and on resize — not just on open. */
  function syncHeaderHeight() {
    if (header) doc.documentElement.style.setProperty('--header-h', Math.ceil(header.getBoundingClientRect().height) + 'px');
  }
  syncHeaderHeight();
  window.addEventListener('load', syncHeaderHeight);
  window.addEventListener('resize', syncHeaderHeight);
  window.addEventListener('scroll', syncHeaderHeight, { passive: true });
  if (toggle) toggle.addEventListener('click', function () { syncHeaderHeight(); body.classList.toggle('nav-open'); });
  doc.querySelectorAll('.nav-links a:not(.nav-trigger)').forEach(function (a) {
    a.addEventListener('click', function () { body.classList.remove('nav-open'); doc.querySelectorAll('.has-mega.open').forEach(function (o) { o.classList.remove('open'); }); });
  });

  /* Dropdown (mega) submenus — click/tap to toggle, works on desktop and mobile */
  doc.querySelectorAll('.nav-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var li = btn.closest('.has-mega');
      var willOpen = !li.classList.contains('open');
      doc.querySelectorAll('.has-mega.open').forEach(function (o) { if (o !== li) o.classList.remove('open'); });
      li.classList.toggle('open', willOpen);
    });
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.has-mega')) doc.querySelectorAll('.has-mega.open').forEach(function (o) { o.classList.remove('open'); });
  });

  /* Scroll reveal */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  doc.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  /* Count-up stats */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, start = null;
    var dec = (target % 1 !== 0) ? 1 : 0;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var statIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); statIO.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  doc.querySelectorAll('[data-count]').forEach(function (el) { statIO.observe(el); });

  /* FAQ accordion */
  doc.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var ans = item.querySelector('.faq-a');
      var open = item.classList.contains('open');
      doc.querySelectorAll('.faq-item.open').forEach(function (o) {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; }
      });
      item.classList.toggle('open', !open);
      ans.style.maxHeight = open ? null : ans.scrollHeight + 'px';
    });
  });

  /* Lane rail waypoints */
  var waypoints = Array.prototype.slice.call(doc.querySelectorAll('.lane-rail .wp'));
  var sections = Array.prototype.slice.call(doc.querySelectorAll('[data-waypoint]'));
  if (waypoints.length && sections.length) {
    var wpIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = sections.indexOf(e.target);
          waypoints.forEach(function (w, i) { w.classList.toggle('active', i <= idx); });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { wpIO.observe(s); });
  }

  /* Magnetic primary buttons (pointer fine only) */
  if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    doc.querySelectorAll('.btn--primary').forEach(function (btn) {
      btn.addEventListener('mousemove', function (ev) {
        var r = btn.getBoundingClientRect();
        var x = ev.clientX - r.left - r.width / 2;
        var y = ev.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.28 + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* Reach visual nodes */
  var reach = doc.querySelector('.reach-visual');
  if (reach) {
    var pts = 7, R = reach.clientWidth;
    for (var i = 0; i < pts; i++) {
      var ang = (i / pts) * Math.PI * 2;
      var rad = 0.30 + (i % 3) * 0.08;
      var n = doc.createElement('span');
      n.className = 'node';
      n.style.left = (50 + Math.cos(ang) * rad * 100) + '%';
      n.style.top = (50 + Math.sin(ang) * rad * 100) + '%';
      n.style.opacity = 0.5 + (i % 3) * 0.2;
      reach.appendChild(n);
    }
  }

  /* Forms: AJAX submit — user stays on the page, sees inline confirmation */
  function wireAjaxForms() {
    doc.querySelectorAll('form[action*="formsubmit.co"]').forEach(function (form) {
      if (form.getAttribute('data-wired')) return;
      form.setAttribute('data-wired', '1');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var orig = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Sending\u2026'; }
        var url = form.getAttribute('action').replace('formsubmit.co/', 'formsubmit.co/ajax/');
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) { return r.json(); }).then(function () {
          var msg = form.parentNode.querySelector('.success-msg');
          if (!msg) {
            msg = doc.createElement('div');
            msg.className = 'success-msg';
            // Placed right after the form (i.e. beneath the submit button) so the
            // confirmation appears exactly where the user is already looking.
            form.parentNode.insertBefore(msg, form.nextSibling);
          }
          msg.textContent = 'Thank you. Your message has been sent. A coordinator will reach out within one business day.';
          msg.classList.add('show');
          msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          form.reset();
          if (btn) { btn.disabled = false; btn.innerHTML = orig; }
        }).catch(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = orig; }
          alert('Something went wrong sending your message. Please email info@royalpurpleexpress.com or use the WhatsApp button.');
        });
      });
    });
  }
  wireAjaxForms();

  /* Talk to an Expert — slide-in form (injected once, opened by [data-expert]) */
  (function () {
    var html =
      '<div class="expert-overlay" aria-hidden="true"></div>' +
      '<aside class="expert-panel" role="dialog" aria-modal="true" aria-label="Talk to an expert">' +
        '<div class="expert-head">' +
          '<div><span class="eyebrow">Talk to an expert</span><h3>Let\'s move your cargo.</h3></div>' +
          '<button type="button" class="expert-close" aria-label="Close panel"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<div class="expert-body">' +
          '<p class="lead">Tell us what you are shipping and a specialist will get back to you within one business day.</p>' +
          '<form data-expert-form action="https://formsubmit.co/29fe097d612957315b51cd9de2924a47" method="POST">' +
            '<input type="hidden" name="_subject" value="Talk to an expert — royalpurpleexpress.com">' +
            '<input type="hidden" name="_next" value="https://royalpurpleexpress.com/thanks">' +
            '<input type="hidden" name="_captcha" value="false">' +
            '<input type="hidden" name="_template" value="table">' +
            '<div class="field"><label>Full name</label><input type="text" name="name" required placeholder="Your name"></div>' +
            '<div class="field"><label>Work email</label><input type="email" name="email" required placeholder="you@company.com"></div>' +
            '<div class="field"><label>Company</label><input type="text" name="company" placeholder="Company name"></div>' +
            '<div class="field"><label>Phone</label><input type="tel" name="phone" placeholder="+234 ..."></div>' +
            '<div class="field"><label>What do you need help with?</label><select name="service"><option>Clearing &amp; Forwarding</option><option>Import</option><option>Export</option><option>Sea Freight</option><option>Air Freight</option><option>Haulage &amp; Distribution</option><option>Warehousing</option><option>Project Cargo</option><option>Not sure yet</option></select></div>' +
            '<div class="field"><label>Weight</label><input type="text" name="weight" placeholder="e.g. 2,500 kg"></div>' +
            '<div class="field"><label>Volume</label><input type="text" name="volume" placeholder="e.g. 18 CBM"></div>' +
            '<div class="field"><label>Container size</label><input type="text" name="container_size" placeholder="e.g. 20ft, 40ft or LCL"></div>' +
            '<div class="field"><label>Message</label><textarea name="message" placeholder="Origin, destination, cargo details, timeline"></textarea></div>' +
            '<button type="submit" class="btn btn--primary btn--lg" style="width:100%;justify-content:center">Send request</button>' +
          '</form>' +
          '<div class="success-msg expert-success">Thank you. Your request is in. A specialist will reach out within one business day.</div>' +
        '</div>' +
      '</aside>';
    var wrap = doc.createElement('div');
    wrap.innerHTML = html;
    while (wrap.firstChild) doc.body.appendChild(wrap.firstChild);
    var overlay = doc.querySelector('.expert-overlay');
    var panel = doc.querySelector('.expert-panel');
    function openPanel() { overlay.classList.add('open'); panel.classList.add('open'); body.style.overflow = 'hidden'; }
    function closePanel() { overlay.classList.remove('open'); panel.classList.remove('open'); body.style.overflow = ''; }
    doc.querySelectorAll('[data-expert]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); openPanel(); });
    });
    overlay.addEventListener('click', closePanel);
    panel.querySelector('.expert-close').addEventListener('click', closePanel);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
  })();

  wireAjaxForms(); /* wire the injected expert-panel form */

  /* Industry tab-switcher */
  var indTabs = doc.querySelectorAll('.indtab');
  if (indTabs.length) {
    indTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.getAttribute('data-tab');
        indTabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        doc.querySelectorAll('.indpanel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === id);
        });
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });
    /* Activate tab from URL hash (e.g. services#import) */
    function tabFromHash() {
      var id = location.hash.replace('#', '');
      if (!id) return;
      var t = doc.querySelector('.indtab[data-tab="' + id + '"]');
      if (t) {
        indTabs.forEach(function (x) { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        doc.querySelectorAll('.indpanel').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === id); });
        var sec = t.closest('section'); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    window.addEventListener('hashchange', tabFromHash);
    tabFromHash();
  }

  /* Customer stories slider */
  var strack = doc.querySelector('.story-track');
  if (strack) {
    var slides = strack.children.length;
    var prev = doc.querySelector('.snav-btn[data-dir="prev"]');
    var next = doc.querySelector('.snav-btn[data-dir="next"]');
    var dotsWrap = doc.querySelector('.sdots');
    var dots = [];
    for (var si = 0; si < slides; si++) {
      var dbtn = doc.createElement('button');
      dbtn.className = 'sdot' + (si === 0 ? ' active' : '');
      dbtn.setAttribute('aria-label', 'Go to story ' + (si + 1));
      (function (n) {
        dbtn.addEventListener('click', function () {
          strack.scrollTo({ left: n * strack.clientWidth, behavior: 'smooth' });
        });
      })(si);
      dotsWrap.appendChild(dbtn);
      dots.push(dbtn);
    }
    function syncStories() {
      var idx = Math.round(strack.scrollLeft / strack.clientWidth);
      idx = Math.max(0, Math.min(slides - 1, idx));
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === slides - 1;
    }
    strack.addEventListener('scroll', function () { requestAnimationFrame(syncStories); }, { passive: true });
    if (prev) prev.addEventListener('click', function () { strack.scrollBy({ left: -strack.clientWidth, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { strack.scrollBy({ left: strack.clientWidth, behavior: 'smooth' }); });
    syncStories();
  }

  /* Resources: category + tag filters */
  var rgrid = doc.querySelector('[data-resource-grid]');
  if (rgrid) {
    var flinks = doc.querySelectorAll('.flink');
    var tchips = doc.querySelectorAll('.tag-chip');
    var empty = doc.querySelector('.blog-empty');
    var activeCat = 'all';
    function applyBlogFilter(mode, val) {
      var shown = 0;
      activeCat = (mode === 'cat') ? val : 'all';
      flinks.forEach(function (l) { l.classList.toggle('active', mode === 'cat' && l.getAttribute('data-category') === val && val !== 'all'); });
      tchips.forEach(function (c) { c.classList.toggle('active', mode === 'tag' && c.getAttribute('data-tag') === val); });
      rgrid.querySelectorAll('.rc').forEach(function (card) {
        var ok = true;
        if (mode === 'cat' && val !== 'all') ok = card.getAttribute('data-category') === val;
        if (mode === 'tag') ok = (' ' + (card.getAttribute('data-tags') || '') + ' ').indexOf(' ' + val + ' ') !== -1;
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }
    flinks.forEach(function (l) {
      l.addEventListener('click', function () {
        var c = l.getAttribute('data-category');
        if (c === activeCat) c = 'all'; /* toggle off */
        applyBlogFilter('cat', c);
        if (history.replaceState) history.replaceState(null, '', c === 'all' ? location.pathname : '#' + c);
      });
    });
    tchips.forEach(function (c) {
      c.addEventListener('click', function () { applyBlogFilter('tag', c.getAttribute('data-tag')); });
    });
    function blogFromHash() {
      var h = location.hash.replace('#', '');
      if (h === 'blog' || h === 'guides') h = 'blogs';
      applyBlogFilter('cat', (h === 'news' || h === 'blogs') ? h : 'all');
    }
    window.addEventListener('hashchange', blogFromHash);
    blogFromHash();
  }

  /* Footer year */
  var yr = doc.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
