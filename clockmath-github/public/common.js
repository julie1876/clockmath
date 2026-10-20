/* ClockMath — shared time helpers */
var CM = (function () {
  // "HH:MM" (24h, from <input type="time">) -> minutes after midnight, or null
  function toMin(v) {
    if (!v || !/^\d{1,2}:\d{2}/.test(v)) return null;
    var p = v.split(':');
    var h = parseInt(p[0], 10), m = parseInt(p[1], 10);
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
  }

  // Minutes from start to end; if end is earlier, assume it is the next day
  function span(start, end) {
    var d = end - start;
    if (d < 0) d += 1440;
    return d;
  }

  // 510 -> "8 hours 30 minutes"
  function hm(min) {
    min = Math.round(min);
    var neg = min < 0;
    min = Math.abs(min);
    var h = Math.floor(min / 60), m = min % 60;
    var parts = [];
    if (h) parts.push(h + (h === 1 ? ' hour' : ' hours'));
    if (m || !h) parts.push(m + (m === 1 ? ' minute' : ' minutes'));
    return (neg ? '-' : '') + parts.join(' ');
  }

  // 510 -> "8:30"
  function hmShort(min) {
    min = Math.round(min);
    var h = Math.floor(min / 60), m = min % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  // 510 -> "8.50"
  function dec(min) {
    return (Math.round(min / 60 * 100) / 100).toFixed(2);
  }

  // minutes after midnight -> "1:30 PM"
  function clock12(min) {
    min = ((Math.round(min) % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    var ap = h < 12 ? 'AM' : 'PM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }

  // minutes after midnight -> "1330"
  function military(min) {
    min = ((Math.round(min) % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + (m < 10 ? '0' : '') + m;
  }

  function money(n) {
    return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }

  return { toMin: toMin, span: span, hm: hm, hmShort: hmShort, dec: dec, clock12: clock12, military: military, money: money, num: num };
})();

/* List of every calculator. To add a new one, add a line here and it appears in the "All calculators" menu on every page. */
var CM_TOOLS = [
  ['/', 'Hours Between Two Times'],
  ['/lunch-break-calculator', 'Lunch Break Calculator'],
  ['/timesheet-calculator', 'Timesheet Calculator'],
  ['/time-card-calculator', 'Time Card Calculator'],
  ['/overtime-calculator', 'Overtime Calculator'],
  ['/decimal-hours-converter', 'Decimal Hours Converter'],
  ['/add-subtract-time', 'Add or Subtract Time'],
  ['/military-time-converter', 'Military Time Converter'],
  ['/salary-to-hourly', 'Salary to Hourly'],
  ['/days-between-dates', 'Days Between Dates'],
  ['/time-zone-converter', 'Time Zone Converter'],
  ['/sleep-calculator', 'Sleep Calculator'],
  ['/break-laws', 'Break Laws by State']
];

function cmAllMenu() {
  var nav = document.querySelector('.site-nav');
  if (!nav || document.getElementById('cm-all')) return;
  var here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

  var wrap = document.createElement('div');
  wrap.className = 'all-menu';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'cm-all';
  btn.className = 'all-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'cm-all-list');
  btn.innerHTML = 'All calculators <span aria-hidden="true">▾</span>';

  var list = document.createElement('div');
  list.id = 'cm-all-list';
  list.className = 'all-list';
  list.hidden = true;
  CM_TOOLS.forEach(function (t) {
    var a = document.createElement('a');
    a.href = t[0];
    a.textContent = t[1];
    if (t[0] === here) a.setAttribute('aria-current', 'page');
    list.appendChild(a);
  });

  function setOpen(open) {
    list.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(list.hidden); });
  document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });

  wrap.appendChild(btn);
  wrap.appendChild(list);
  nav.appendChild(wrap);
}

/* "Switch calculator" dropdown beside the main title (calculator pages only) */
function cmTitleMenu() {
  var h1 = document.querySelector('main h1');
  if (!h1 || document.getElementById('cm-switch')) return;
  var here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  var isTool = CM_TOOLS.some(function (t) { return t[0] === here; });
  if (!isTool) return;

  var row = document.createElement('div');
  row.className = 'title-row';
  h1.parentNode.insertBefore(row, h1);
  row.appendChild(h1);

  var box = document.createElement('div');
  box.className = 'title-switch';
  var label = document.createElement('label');
  label.setAttribute('for', 'cm-switch');
  label.textContent = 'Switch calculator';
  var sel = document.createElement('select');
  sel.id = 'cm-switch';
  CM_TOOLS.forEach(function (t) {
    var o = document.createElement('option');
    o.value = t[0];
    o.textContent = t[1];
    if (t[0] === here) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', function () { if (sel.value !== here) location.href = sel.value; });
  box.appendChild(label);
  box.appendChild(sel);
  row.appendChild(box);
}

/* Top menu: the Military Time button is replaced by Break Laws (Military Time stays in "All calculators") */
function cmNavFix() {
  var nav = document.querySelector('.site-nav');
  if (!nav) return;
  var mil = nav.querySelector(':scope > a[href="/military-time-converter"]');
  if (mil) {
    mil.href = '/break-laws';
    mil.textContent = 'Break Laws';
    mil.removeAttribute('aria-current');
  }
  if (location.pathname.indexOf('/break-laws') === 0) {
    var bl = nav.querySelector(':scope > a[href="/break-laws"]');
    if (bl) bl.setAttribute('aria-current', 'page');
  }
}

/* ------------------------------------------------------------------
   Home screen app ("Get the app" button)
   Adds the app settings to every page, so no page HTML needs editing.
   ------------------------------------------------------------------ */
var CM_APP = (function () {
  var head = document.head;
  function addTag(tag, attrs) {
    var sel = tag + Object.keys(attrs).filter(function (k) { return k === 'rel' || k === 'name'; })
      .map(function (k) { return '[' + k + '="' + attrs[k] + '"]'; }).join('');
    if (head.querySelector(sel)) return;
    var el = document.createElement(tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    head.appendChild(el);
  }
  addTag('link', { rel: 'manifest', href: '/manifest.webmanifest' });
  addTag('link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' });
  addTag('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
  addTag('meta', { name: 'mobile-web-app-capable', content: 'yes' });
  addTag('meta', { name: 'apple-mobile-web-app-title', content: 'ClockMath' });
  addTag('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' });

  var css = document.createElement('style');
  css.textContent =
    '.app-btn{font:inherit;font-size:.92rem;font-weight:700;line-height:1.2;padding:7px 14px;min-height:0;border-radius:999px;' +
      'background:var(--accent,#0e8a6a);color:#fff;border:1.5px solid var(--accent,#0e8a6a);cursor:pointer;display:inline-flex;align-items:center;gap:6px}' +
    '.app-btn[hidden]{display:none}' +
    '.app-btn:hover{background:#0b6f55;border-color:#0b6f55}' +
    '.app-btn svg{width:15px;height:15px}' +
    '.app-help{position:fixed;inset:0;z-index:100;background:rgba(20,30,60,.45);display:flex;align-items:flex-end;justify-content:center;padding:16px}' +
    '.app-help[hidden]{display:none}' +
    '.app-help .box{background:#fff;color:var(--text,#1c2333);border-radius:16px;max-width:420px;width:100%;padding:20px 20px 16px;box-shadow:0 10px 40px rgba(0,0,0,.25)}' +
    '.app-help h2{margin:0 0 6px;font-size:1.2rem}' +
    '.app-help p{margin:0 0 10px;color:var(--muted,#5b6478)}' +
    '.app-help ol{margin:0 0 14px;padding-left:22px}' +
    '.app-help li{margin-bottom:6px}' +
    '.app-help .row{display:flex;justify-content:flex-end}' +
    '@media(min-width:600px){.app-help{align-items:center}}' +
    '@media(max-width:560px){.app-btn{font-size:.85rem;padding:6px 11px}}' +
    '@media print{.app-btn,.app-help{display:none!important}}';
  head.appendChild(css);

  // Lets the installed app open (and the calculators work) without a connection
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  var ua = navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /android/i.test(ua);
  var installed = function () {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  };
  var deferred = null, btn = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    show();
  });
  window.addEventListener('appinstalled', function () {
    deferred = null;
    if (btn) btn.hidden = true;
  });

  function show() {
    if (btn && !installed()) btn.hidden = false;
  }

  function helpBox() {
    var box = document.getElementById('cm-app-help');
    if (box) return box;
    var steps;
    if (isIOS) {
      steps = '<li>Tap the <strong>Share</strong> button <span aria-hidden="true">(the square with an arrow pointing up)</span>.</li>' +
              '<li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>' +
              '<li>Tap <strong>Add</strong>.</li>';
    } else if (isAndroid) {
      steps = '<li>Tap the <strong>⋮</strong> menu at the top right of your browser.</li>' +
              '<li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li>' +
              '<li>Tap <strong>Install</strong> or <strong>Add</strong>.</li>';
    } else {
      steps = '<li>Open your browser menu.</li>' +
              '<li>Choose <strong>Install ClockMath</strong> or <strong>Add to Home screen</strong>.</li>';
    }
    box = document.createElement('div');
    box.id = 'cm-app-help';
    box.className = 'app-help';
    box.hidden = true;
    box.innerHTML =
      '<div class="box" role="dialog" aria-modal="true" aria-labelledby="cm-app-title">' +
        '<h2 id="cm-app-title">Add ClockMath to your home screen</h2>' +
        '<p>It opens like an app, without the browser bars, and the calculators work even without a connection.</p>' +
        '<ol>' + steps + '</ol>' +
        '<div class="row"><button type="button" class="secondary" id="cm-app-close">Got it</button></div>' +
      '</div>';
    document.body.appendChild(box);
    function close() { box.hidden = true; if (btn) btn.focus(); }
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.getElementById('cm-app-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
    return box;
  }

  function setup() {
    var nav = document.querySelector('.site-nav');
    if (!nav || document.getElementById('cm-app')) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'cm-app';
    btn.className = 'app-btn';
    btn.hidden = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>Get the app';
    btn.addEventListener('click', function () {
      if (deferred) {
        var p = deferred;
        deferred = null;
        p.prompt();
        p.userChoice.then(function (c) { if (c && c.outcome === 'accepted') btn.hidden = true; }).catch(function () {});
      } else {
        var box = helpBox();
        box.hidden = false;
        document.getElementById('cm-app-close').focus();
      }
    });
    nav.appendChild(btn);
    // Phones always see the button; computers only when the browser can install it
    if (isIOS || isAndroid || deferred) show();
  }

  return { setup: setup };
})();

document.addEventListener('DOMContentLoaded', function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  cmNavFix();
  cmAllMenu();
  CM_APP.setup();
});
