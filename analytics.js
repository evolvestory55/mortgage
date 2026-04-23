/* ============================================================
   MORTGAGE & LOANS — ANALYTICS · ADS · COUNTER WIDGET
   Server-side PHP backend ile çalışır
   ============================================================ */
(function () {
  'use strict';

  const API = 'api.php';
  const ONLINE_TTL = 5 * 60e3;

  /* ── Visitor / Session IDs ──────────────────────── */
  function getVid() {
    let id = localStorage.getItem('mt_vid');
    if (!id) {
      id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('mt_vid', id);
    }
    return id;
  }
  function getSid() {
    let id = sessionStorage.getItem('mt_sid');
    const ts = parseInt(sessionStorage.getItem('mt_sid_t') || '0');
    if (!id || Date.now() - ts > 30 * 60e3) {
      id = 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
    sessionStorage.setItem('mt_sid', id);
    sessionStorage.setItem('mt_sid_t', Date.now().toString());
    return id;
  }
  function pageName() { return location.pathname.split('/').pop() || 'index.html'; }

  /* ── Track page view ────────────────────────────── */
  function track() {
    const fd = new FormData();
    fd.append('action', 'track');
    fd.append('vid', getVid());
    fd.append('sid', getSid());
    fd.append('page', pageName());
    fetch(API, { method: 'POST', body: fd }).catch(() => {});
  }

  /* ── Get live stats for widget ──────────────────── */
  function loadWidget() {
    fetch(API + '?action=get_data', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const s = d.stats;
        showWidget(s.onlineNow, s.todayViews, s.todayVisitors);
      })
      .catch(() => {
        /* Fallback: show static widget */
        showWidget('—', '—', '—');
      });
  }

  function showWidget(online, views, visitors) {
    const el = document.createElement('div');
    el.id = 'mt-counter-widget';
    el.innerHTML =
      '<div class="mt-cw-row">' +
        '<span class="mt-cw-dot"></span>' +
        '<span class="mt-cw-val">' + online + '</span><span class="mt-cw-lbl">Online</span>' +
        '<span class="mt-cw-sep">·</span>' +
        '<span class="mt-cw-val">' + views + '</span><span class="mt-cw-lbl">Views</span>' +
        '<span class="mt-cw-sep">·</span>' +
        '<span class="mt-cw-val">' + visitors + '</span><span class="mt-cw-lbl">Visitors</span>' +
      '</div>';
    document.body.appendChild(el);
  }

  /* ── Ad injection ───────────────────────────────── */
  function injectAds() {
    function mkAd(id, label) {
      const w = document.createElement('div');
      w.className = 'mt-ad-slot'; w.id = id;
      w.innerHTML =
        '<div class="mt-ad-label">' + label + '</div>' +
        '<div class="mt-ad-container">' +
        '  <ins class="adsbygoogle" style="display:block" data-ad-format="auto" data-full-width-responsive="true"></ins>' +
        '</div>';
      return w;
    }

    const hero = document.querySelector('.page-hero');
    if (hero && hero.nextSibling) hero.parentNode.insertBefore(mkAd('ad-after-hero', 'Advertisement'), hero.nextSibling);

    const col = document.querySelector('.calc-layout [data-animate="fadeInRight"]');
    if (col) {
      const cards = col.querySelectorAll(':scope > .card');
      if (cards.length >= 2) cards[1].parentNode.insertBefore(mkAd('ad-in-content', 'Sponsored'), cards[1]);
    }

    const ft = document.querySelector('.site-footer');
    if (ft) ft.parentNode.insertBefore(mkAd('ad-before-footer', 'Advertisement'), ft);
  }

  /* ── Styles ─────────────────────────────────────── */
  function styles() {
    const css = document.createElement('style');
    css.textContent = [
      '.mt-ad-slot{margin:1.5rem 0;padding:16px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:14px;text-align:center}',
      '.mt-ad-label{font-size:.68rem;color:#4A5980;text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px}',
      '.mt-ad-container{min-height:90px;display:flex;align-items:center;justify-content:center}',
      '#mt-counter-widget{position:fixed;bottom:20px;left:20px;z-index:9999;background:rgba(10,22,40,.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 18px;box-shadow:0 8px 32px rgba(0,0,0,.5);font-family:var(--font-body,sans-serif);transition:.3s}',
      '#mt-counter-widget:hover{border-color:rgba(45,126,255,.35)}',
      '.mt-cw-row{display:flex;align-items:center;gap:8px;white-space:nowrap}',
      '.mt-cw-dot{width:7px;height:7px;border-radius:50%;background:#10B981;box-shadow:0 0 6px #10B981;animation:mt-pulse 2s ease-in-out infinite}',
      '.mt-cw-val{font-family:var(--font-mono,monospace);font-size:.95rem;font-weight:600;color:#EEF2FF}',
      '.mt-cw-lbl{font-size:.62rem;color:#4A5980;text-transform:uppercase;letter-spacing:.04em;margin-right:2px}',
      '.mt-cw-sep{color:rgba(255,255,255,.12);font-size:.9rem}',
      '@keyframes mt-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
      '@media(max-width:480px){#mt-counter-widget{bottom:10px;left:10px;padding:8px 12px}.mt-cw-lbl{display:none}.mt-cw-val{font-size:.82rem}}'
    ].join('\n');
    document.head.appendChild(css);
  }

  /* ── Init ───────────────────────────────────────── */
  function init() {
    styles();
    track();
    injectAds();
    loadWidget();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
