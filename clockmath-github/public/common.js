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

document.addEventListener('DOMContentLoaded', function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
