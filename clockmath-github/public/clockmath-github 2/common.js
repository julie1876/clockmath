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
  ['/sleep-calculator', 'Sleep Calculator']
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

document.addEventListener('DOMContentLoaded', function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  cmAllMenu();
  cmTitleMenu();
});
