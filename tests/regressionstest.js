/**
 * Regressionstest ZEITSTEMPEL (iPhone-Version für Arturs Freundin)
 *
 * Grundlage: Arturs tests/regressionstest.js (Version 3.1), gleiche Technik:
 * die KOMPLETTE App wird in jsdom geladen (echtes index.html + alle Skripte).
 * Die Erwartungswerte stammen aus der Übergabe, Abschnitt 5 (Abnahmetests).
 *
 * AUSFÜHREN (einmalig jsdom installieren):
 *   cd <Ordner app>
 *   npm install jsdom
 *   node tests/regressionstest.js
 *
 * Die Uhr ist auf Freitag, 20.11.2026, 20:00 Uhr eingefroren.
 * Die Woche 16.–20.11.2026 ist eine normale Schulwoche (keine Ferien).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const KEY = 'zeitstempel:v1';
let FIXED_NOW = new Date('2026-11-20T20:00:00').getTime();

let passed = 0;
let failed = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) passed += 1; else failed += 1;
  console.log((ok ? '  ok     ' : '  FEHLER ') + name +
    (ok ? '' : '  -> erwartet ' + JSON.stringify(expected) + ', bekommen ' + JSON.stringify(actual)));
}
function section(title) { console.log('\n== ' + title); }
function ts(dateStr, clock) { return new Date(dateStr + 'T' + clock + ':00').getTime(); }
let evId = 0;
function day(dateStr, pairs, extra) {
  return Object.assign({ date: dateStr, edits: [], events: pairs.map(([type, clock]) =>
    ({ id: 'e' + (evId += 1), type, timestamp: ts(dateStr, clock) })) }, extra || {});
}

function bootApp(seedState, nowStr) {
  const now = nowStr ? new Date(nowStr).getTime() : FIXED_NOW;
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
    { runScripts: 'outside-only', url: 'http://localhost/', pretendToBeVisual: true });
  const w = dom.window;
  w.eval('(function(){var R=Date;function D(){if(!(this instanceof D))return new R(' + now + ').toString();' +
    'var a=[].slice.call(arguments);return a.length?new (Function.prototype.bind.apply(R,[null].concat(a)))():new R(' + now + ');}' +
    'D.prototype=R.prototype;D.now=function(){return ' + now + ';};D.parse=R.parse;D.UTC=R.UTC;window.Date=D;})();');
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  w.confirm = () => true;
  w.setInterval = () => 0;

  const store = {};
  if (seedState) store[KEY] = JSON.stringify(seedState);
  Object.defineProperty(w, 'localStorage', {
    value: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
    configurable: true,
  });

  const errors = [];
  w.addEventListener('error', (e) => errors.push(e.message));
  ['js/calculator.js', 'js/overtime.js', 'js/punchclock.js', 'js/ferien.js', 'js/transit.js', 'js/storage.js', 'js/app.js']
    .forEach((f) => w.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

  return {
    w, errors, store,
    api: w.__zeitstempelTest,
    t: (id) => ((w.document.getElementById(id) || {}).textContent || '').trim(),
    el: (id) => w.document.getElementById(id),
    q: (sel) => w.document.querySelector(sel),
    qa: (sel) => Array.from(w.document.querySelectorAll(sel)),
    click: (sel) => {
      const node = w.document.querySelector(sel);
      if (!node) throw new Error('Element nicht gefunden: ' + sel);
      node.click();
    },
  };
}

module.exports = { bootApp, check, section, ts, day };
if (require.main !== module) return;

// ===========================================================================
const empty = bootApp(null);
const C = empty.w.Calculator;
const api = empty.api;

section('Minuten statt Industriestunden (Übergabe 4.1)');
let sum = 0;
for (let i = 0; i < 20; i += 1) sum += C.toCentihours('8:07');
check('20 Tage à 8:07 = 162:20', C.centihoursToDisplay(sum), '162:20');
check('Eingabe 7:13 bleibt 7:13', C.centihoursToDisplay(C.toCentihours('7:13')), '7:13');

section('Startwerte und Speicher');
check('kein feierabend-rechner:v1', 'feierabend-rechner:v1' in empty.store, false);
check('Tagessoll 8:00', C.minutesToHHMM(api.targetNetMinutes()), '8:00');
check('Wochensoll 40:00', C.minutesToHHMM(api.weekTarget()), '40:00');
check('Di 17.11. automatisch Berufsschule', api.dayTypeIdFor('2026-11-17'), 'berufsschule');
check('Mi 18.11. automatisch Schule + Betrieb', api.dayTypeIdFor('2026-11-18'), 'schule-betrieb');
check('Mi 07.10. (Herbstferien) normaler Betriebstag', api.dayTypeIdFor('2026-10-07'), 'arbeit');
check('Urlaub 2026 = 0', api.vacationYearSettings('2026').days, 0);
check('Urlaub 2027 = 30', api.vacationYearSettings('2027').days, 30);

// ===========================================================================
section('Woche 16.–20.11.2026 (Übergabe 2.4)');
const week = bootApp({ workDays: {
  '2026-11-09': day('2026-11-09', [['clockIn', '07:45'], ['breakStart', '12:00'], ['breakEnd', '12:45'], ['clockOut', '16:15']]),
  '2026-11-16': day('2026-11-16', [['clockIn', '07:45'], ['clockOut', '16:15']]),
  '2026-11-18': day('2026-11-18', [['clockIn', '13:55'], ['clockOut', '16:30']]),
  '2026-11-19': day('2026-11-19', [['clockIn', '07:45'], ['breakStart', '12:00'], ['breakEnd', '12:20'], ['clockOut', '16:15']]),
  '2026-11-20': day('2026-11-20', [['clockIn', '07:45'], ['clockOut', '16:15']]),
} });
const wa = week.api;
const hm = (m) => C.minutesToHHMM(m);
let st = wa.dayStatsFor('2026-11-16');
check('Mo 7:45–16:15 ohne Pause zählt 8:00', hm(st.totalNetMinutes), '8:00');
check('Mo: Pause als automatisch markiert', [st.actualBreakMinutes, st.autoBreakMinutes], [0, 30]);
check('Mo: Saldo ±0', wa.dayBalance('2026-11-16').diff, 0);
check('Di Schule ohne Stempeln zählt 8:00', wa.dayValueFor('2026-11-17'), '8:00');
st = wa.dayStatsFor('2026-11-18');
check('Mi Schule 7:55–13:10 + 45 Weg + Betrieb bis 16:30 = 8:35', hm(st.totalNetMinutes), '8:35');
check('Mi Saldo +0:35', wa.dayBalance('2026-11-18').diff, 35);
check('Mi Kommen-Vorschlag 13:55', C.minutesToClock(wa.mixedTimesFor('2026-11-18').suggestedClockInMinutes), '13:55');
st = wa.dayStatsFor('2026-11-19');
check('Do Pause 20 Min. gestempelt zählt 8:00', hm(st.totalNetMinutes), '8:00');
check('Do Hinweis „Pause zu kurz"', st.breakTooShort, true);
st = wa.dayStatsFor('2026-11-09');
check('Mo 09.11. Pause 45 Min. zählt 7:45', hm(st.totalNetMinutes), '7:45');
check('Mo 09.11. Saldo −0:15', wa.dayBalance('2026-11-09').diff, -15);
check('Mo 09.11. voraussichtlicher Feierabend war 16:30', C.minutesToClock(st.projectedFeierabendMinutes), '16:30');
const w47 = wa.sumBalance((d) => d >= '2026-11-16' && d <= '2026-11-22');
check('Woche 16.–20.11. = 40:35', hm(w47.ist), '40:35');
check('Woche Saldo +0:35', w47.diff, 35);

section('Gleitzeit, live (Mo 23.11., 10:00)');
const live = bootApp({ workDays: {
  '2026-11-23': day('2026-11-23', [['clockIn', '07:58']]),
} }, '2026-11-23T10:00:00');
st = live.api.dayStatsFor('2026-11-23');
check('Kommen 7:58 -> Feierabend 16:28', C.minutesToClock(st.projectedFeierabendMinutes), '16:28');
check('keine „zu spät"-Meldung', /spät/i.test(live.el('statusCard').textContent), false);
check('Status-Karte zeigt 16:28', live.t('statusFeierabendTime'), '16:28');

section('Mittwoch-Varianten');
const flat = bootApp({ mixedDayMode: 'flat', workDays: {
  '2026-11-18': day('2026-11-18', [['clockIn', '13:55'], ['clockOut', '16:30']]) } });
check('Einstellung pauschal: Mi zählt 8:00', flat.api.dayValueFor('2026-11-18'), '8:00');
const early = bootApp({ workDays: {
  '2026-11-18': day('2026-11-18', [['clockIn', '07:45'], ['clockOut', '16:15']]) } });
check('Mi mit Kommen vor Schulende -> normaler Arbeitstag', early.api.dayTypeIdFor('2026-11-18'), 'arbeit');
check('… und zählt 8:00 (nicht doppelt)', early.api.dayValueFor('2026-11-18'), '8:00');
const brk = bootApp({ mixedBreakInBetrieb: true, workDays: {
  '2026-11-18': day('2026-11-18', [['clockIn', '13:55'], ['clockOut', '16:30']]) } });
check('Mi mit „Pause im Betrieb abziehen" = 8:05', brk.api.dayValueFor('2026-11-18'), '8:05');

section('Startseite und Tagesplan');
const TR = { walkHomeMinutes: '5', walkWorkMinutes: '7', toWork: [{ dep: '07:09', arr: '07:43' }],
  fromWork: [{ dep: '16:22', arr: '16:56' }, { dep: '16:47', arr: '17:21' }] };
const mo = bootApp({ zsStartDate: '2026-11-23', transit: TR, workDays: {
  '2026-11-23': day('2026-11-23', [['clockIn', '07:45']]) } }, '2026-11-23T10:00:00');
check('Startseite: Feierabend 16:15', mo.t('zsTodayTime'), '16:15');
check('Bus: nächster 16:22, Alternative bis 16:40 → +0:25',
  mo.t('zsTodayBus'), '🚌 nächster Bus 16:22 · oder bis 16:40 bleiben → Bus 16:47, +0:25 aufs Konto');
check('Konto steht in einer Zeile', /^Konto /.test(mo.t('zsTodayKonto')), true);
check('Pause ungestempelt wird erklärt', mo.t('statusPauseHint'), 'Pause nicht gestempelt? Dann werden 30 Min. automatisch abgezogen.');
const plan = bootApp({ zsStartDate: '2026-11-20', transit: Object.assign({}, TR, { walkWorkMinutes: '2' }) }, '2026-11-20T20:00:00');
const planRows = plan.qa('#zsPlanList .breakdown-row').map((r) => [r.querySelector('dt').textContent, r.querySelector('dd').textContent]);
const pr = Object.fromEntries(planRows);
check('Plan für Mo 23.11.', plan.t('zsPlanFor'), '· Mo 23.11.');
check('Bus 7:09 → 7:43, Fußweg 5, Fertigmachen 1:30: Aufstehen 05:34', pr['Aufstehen'], '05:34');
check('… Bett 21:34 (8:00 Schlaf)', pr['Bett (am Abend davor)'], '21:34');
check('… los 07:04', pr['Los'], '07:04');
check('… Arbeit ab 07:45, Feierabend 16:15', [pr['Arbeit ab'], pr['Feierabend']], ['07:45', '16:15']);
check('… zuhause 17:01 (Ankunft 16:56 + 5 Min. Fußweg)', pr['Zuhause'], '17:01 (Bus 16:22)');

section('Mittwoch auf der Startseite');
const mi = bootApp({ zsStartDate: '2026-11-18' }, '2026-11-18T13:50:00');
check('vor dem Betrieb: Feierabend 15:55 (Soll erreicht)', mi.t('zsTodayTime'), '15:55');
check('Knopf „Im Betrieb ab 13:55"', [mi.el('zsBtnSuggest').classList.contains('is-hidden'), mi.t('zsBtnSuggest')], [false, 'Im Betrieb ab 13:55']);
mi.click('#zsBtnSuggest');
check('… stempelt Kommen 13:55', mi.api.dayStatsFor('2026-11-18').clockInEvent && mi.w.PunchClock.minutesOfDay(mi.api.dayStatsFor('2026-11-18').clockInEvent.timestamp), 13 * 60 + 55);
check('… Hinweis nennt die Schulgutschrift', mi.t('statusPauseHint'), 'Schule 07:55–13:10 + 45 Min. Weg = 6:00 zählen schon');

section('Nachtragen');
const fix = bootApp({ zsStartDate: '2026-11-16', workDays: {
  '2026-11-19': day('2026-11-19', [['clockIn', '07:45']]) } }, '2026-11-20T07:30:00');
check('„Gestern kein Gehen gestempelt"', fix.t('zsFixText'), 'Gestern kein Gehen gestempelt. (+2 weitere)');
check('Startseite hängt nicht am gestrigen Tag', fix.t('zsTodaySub'), 'wenn du um 07:45 anfängst');
fix.click('#zsFixBtn');
check('vergessener Tag zeigt keine 20+ Std. (Stand zum voraussichtlichen Feierabend)', fix.api.dayStatsFor('2026-11-19').totalNetMinutes, 480);
check('Nachtragen-Formular offen', fix.el('zsQuickFill').classList.contains('is-hidden'), false);
check('… Gehen vorgeschlagen 16:15', fix.el('zsQfOut').value, '16:15');
fix.click('#zsQfSave');
check('… gespeichert: Do zählt 8:00', fix.api.dayValueFor('2026-11-19'), '8:00');
check('… nächster offener Tag wird gemeldet', fix.t('zsFixText'), 'Mi 18.11. nichts erfasst. (+1 weitere)');
check('Neuinstallation meldet keine alten Tage', bootApp(null, '2026-11-20T09:00:00').el('zsFixCard').classList.contains('is-hidden'), true);

section('Oberfläche');
check('vier Tabs: Heute, Kalender, Konto, Mehr', mo.qa('.nav-btn').map((b) => b.textContent.trim()), ['Heute', 'Kalender', 'Konto', 'Mehr']);
function visibleText(node) {
  let out = '';
  (function walk(n) {
    if (n.nodeType === 3) { out += n.textContent; return; }
    if (n.nodeType !== 1 || n.hidden || n.classList.contains('zs-off') || n.tagName === 'SCRIPT' || n.tagName === 'OPTION') return;
    n.childNodes.forEach(walk); out += ' ';
  })(node);
  return out;
}
const allText = ['panel-planen', 'panel-kalender', 'panel-verlauf', 'panel-infos', 'settingsDialog'].map((id) => visibleText(week.el(id))).join(' ');
check('keine Industriestunden sichtbar (Option aus)', /Industrie|\d,\d\d/.test(allText), false);
check('Name „Zeitstempel" im Titel', week.w.document.title, 'Zeitstempel');
check('Home-Bildschirm-Name', week.q('meta[name="apple-mobile-web-app-title"]').getAttribute('content'), 'Zeitstempel');
check('Design Rosé aktiv', week.w.document.body.getAttribute('data-theme'), 'rose');
const ind = bootApp({ displayUnit: 'industrie', workDays: week.api.state().workDays });
check('Option Industriestunden: Mi 8:35 = 8,58', ind.w.Calculator.centihoursToDisplay(515), '8,58');
check('… Konto bleibt exakt', ind.api.sumBalance((d) => d >= '2026-11-16' && d <= '2026-11-22').diff, 35);
check('über 10 Std. -> Hinweis § 3 ArbZG', /§ 3 ArbZG/.test(bootApp({ workDays: {
  '2026-11-20': day('2026-11-20', [['clockIn', '06:00']]) } }, '2026-11-20T17:00:00').t('zsTodaySub')), true);

section('iPhone / Offline');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const shell = JSON.parse('[' + /APP_SHELL = \[([\s\S]*?)\]/.exec(sw)[1].replace(/'/g, '"').replace(/,\s*$/, '') + ']');
check('ferien.js und transit.js im Offline-Cache', ['./js/ferien.js', './js/transit.js'].every((f) => shell.includes(f)), true);
check('alle Offline-Dateien existieren', shell.filter((f) => f !== './' && !fs.existsSync(path.join(ROOT, f))), []);
const scripts = Array.from(week.w.document.querySelectorAll('script[src]')).map((n) => './' + n.getAttribute('src'));
check('jedes Skript aus index.html ist im Offline-Cache', scripts.filter((f) => !shell.includes(f)), []);
const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
check('manifest: Name, standalone', [mf.name, mf.short_name, mf.display], ['Zeitstempel', 'Zeitstempel', 'standalone']);
check('Icon 180×180 vorhanden', fs.readFileSync(path.join(ROOT, 'assets/icons/apple-touch-icon.png')).readUInt32BE(16), 180);

section('Sicherheit');
const evil = bootApp({ dayTypes: [
  { id: 'arbeit', label: 'Arbeit', icon: '💼', mode: 'actual', creditIndustrial: '' },
  { id: 'x" onmouseover="alert(1)', label: '<img src=x onerror=alert(2)>', icon: '😈', mode: 'fixed', creditIndustrial: '' }] });
check('präpariertes Backup erzeugt keine Event-Handler', evil.qa('[onmouseover],[onerror]').length, 0);
const csp = (week.q('meta[http-equiv="Content-Security-Policy"]') || { getAttribute: () => '' }).getAttribute('content');
check('Content-Security-Policy: nur eigene Skripte, kein fremder Server',
  ["default-src 'none'", "script-src 'self'", "connect-src 'self'", "object-src 'none'"].every((r) => csp.includes(r)), true);
check('keine Inline-Styles/-Skripte im HTML (sonst blockiert die CSP)',
  /\sstyle="|\son[a-z]+="|<script>/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')), false);

// ===========================================================================
section('Ende');
check('keine Laufzeitfehler', [].concat(empty.errors, week.errors, live.errors, flat.errors, early.errors, brk.errors, mo.errors, plan.errors, mi.errors, fix.errors, ind.errors), []);
console.log('\n' + (failed ? 'FEHLER: ' + failed + ' fehlgeschlagen, ' : 'ALLES GRÜN: ') + passed + ' ok, ' + failed + ' Fehler');
process.exitCode = failed ? 1 : 0;
