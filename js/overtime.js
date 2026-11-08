/**
 * overtime.js
 * Reine Logik für den Überstunden-Rechner / das laufende Zeitkonto.
 * Kennt weder DOM noch localStorage direkt (storage.js übernimmt Persistenz,
 * calculator.js liefert die Centihours-Umrechnung — wird als Funktion
 * übergeben, um keine harte Abhängigkeit zwischen den Modulen zu erzeugen).
 * Eine Woche läuft Montag–Sonntag und wird über ihren Montag referenziert.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Overtime = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DAY_KEYS = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];
  const DAY_LABELS = {
    mo: 'Montag', di: 'Dienstag', mi: 'Mittwoch', do: 'Donnerstag',
    fr: 'Freitag', sa: 'Samstag', so: 'Sonntag',
  };
  const DAY_LABELS_SHORT = { mo: 'Mo', di: 'Di', mi: 'Mi', do: 'Do', fr: 'Fr', sa: 'Sa', so: 'So' };

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /** Montag der Woche, die `date` enthält. */
  function getMonday(date) {
    const d = stripTime(date);
    const day = d.getDay(); // 0=So, 1=Mo, ... 6=Sa
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  function addDays(date, n) {
    const d = stripTime(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  /** ISO-8601-Kalenderwoche (Donnerstag-Algorithmus). */
  function isoWeekInfo(date) {
    const d = stripTime(date);
    const dayNum = d.getDay() === 0 ? 7 : d.getDay();
    d.setDate(d.getDate() + 4 - dayNum); // auf den Donnerstag derselben Woche
    const isoYear = d.getFullYear();
    const yearStart = new Date(isoYear, 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return { isoYear, weekNo };
  }

  /** Eindeutiger, lexikographisch sortierbarer Wochen-Schlüssel, z. B. "2026-W33". */
  function weekKeyFor(mondayDate) {
    const { isoYear, weekNo } = isoWeekInfo(mondayDate);
    return isoYear + '-W' + String(weekNo).padStart(2, '0');
  }

  function formatDateShort(date) {
    const d = stripTime(date);
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
  }

  function weekRangeLabel(mondayDate) {
    const sunday = addDays(mondayDate, 6);
    return formatDateShort(mondayDate) + '–' + formatDateShort(sunday);
  }

  function emptyWeek() {
    const days = {};
    DAY_KEYS.forEach((k) => { days[k] = ''; });
    // `mode` (pro Tag: 'manual' | 'punch') und `punches` (Stempeluhr-Rohzeiten,
    // { start, breakStart, breakEnd, end }) sind rein für die Verlauf-UI da.
    // Der eigentliche Ist-Wert eines Tages steht immer als Industriestunden-
    // String in `days[key]`, egal welche Eingabeart genutzt wurde – dadurch
    // bleiben weekSumCentihours/weekDiffCentihours/runningBalanceCentihours
    // unverändert und kennen "Stempeluhr" gar nicht.
    return { days, mode: {}, punches: {} };
  }

  function hasAnyEntry(week) {
    if (!week || !week.days) return false;
    return DAY_KEYS.some((k) => String(week.days[k] || '').trim() !== '');
  }

  /** Summe der Woche in Centihours. Leere/ungültige Tageswerte zählen als 0. */
  function weekSumCentihours(week, toCentihoursFn) {
    if (!week || !week.days) return 0;
    let sum = 0;
    DAY_KEYS.forEach((k) => {
      const raw = week.days[k];
      if (!raw || !String(raw).trim()) return;
      try {
        sum += toCentihoursFn(raw);
      } catch (e) {
        // ungültige Eingabe wird wie kein Eintrag behandelt
      }
    });
    return sum;
  }

  function weekDiffCentihours(week, targetCentihours, toCentihoursFn) {
    return weekSumCentihours(week, toCentihoursFn) - targetCentihours;
  }

  /**
   * Laufendes Zeitkonto: Summe aller Wochen-Differenzen (Ist − Soll) über alle
   * Wochen mit tatsächlichen Einträgen, bis einschließlich uptoWeekKey.
   * Wochen ganz ohne Eingabe zählen NICHT als Minusstunden — nur Wochen, in
   * denen der Nutzer tatsächlich etwas eingetragen hat, fließen ein.
   */
  function runningBalanceCentihours(weeksMap, targetCentihours, uptoWeekKey, toCentihoursFn) {
    if (!weeksMap) return 0;
    let balance = 0;
    Object.keys(weeksMap)
      .filter((key) => key <= uptoWeekKey)
      .sort()
      .forEach((key) => {
        const week = weeksMap[key];
        if (!hasAnyEntry(week)) return;
        balance += weekDiffCentihours(week, targetCentihours, toCentihoursFn);
      });
    return balance;
  }

  // -------------------------------------------------------------------------
  // Version 2.1: Monatsebene. Rein additiv — die Wochenfunktionen oben bleiben
  // unverändert, die Monatsansicht setzt nur darauf auf.
  // -------------------------------------------------------------------------

  const MONTH_LABELS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];

  /** Erster Tag des Monats, n Monate versetzt (n darf negativ sein). */
  function addMonths(date, n) {
    const d = stripTime(date);
    return new Date(d.getFullYear(), d.getMonth() + n, 1);
  }

  /**
   * Umkehrung von weekKeyFor: Montag zu einem Wochen-Schlüssel wie "2026-W38".
   * Nutzt die ISO-8601-Regel, dass der 4. Januar immer in Kalenderwoche 1 liegt.
   * Sicherheitsnetz: Das Ergebnis wird zurückgerechnet und nur geliefert, wenn
   * es exakt denselben Schlüssel ergibt – sonst null. Damit kann ein fehler-
   * hafter Schlüssel niemals falsche Datumsangaben erzeugen.
   */
  function mondayForWeekKey(weekKey) {
    const match = /^(\d{4})-W(\d{1,2})$/.exec(String(weekKey || ''));
    if (!match) return null;
    const isoYear = parseInt(match[1], 10);
    const weekNo = parseInt(match[2], 10);
    if (!weekNo || weekNo > 53) return null;
    const monday = addDays(getMonday(new Date(isoYear, 0, 4)), (weekNo - 1) * 7);
    return weekKeyFor(monday) === weekKey ? monday : null;
  }

  /** Sortierbarer Monats-Schlüssel, z. B. "2026-09". */
  function monthKeyFor(date) {
    const d = stripTime(date);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function monthLabel(date) {
    const d = stripTime(date);
    return MONTH_LABELS[d.getMonth()] + ' ' + d.getFullYear();
  }

  /**
   * Alle Montage, die IM Monat von `date` liegen.
   * Eine Kalenderwoche wird damit genau dem Monat zugerechnet, in dem sie
   * BEGINNT. Das ist bewusst so gewählt: Wochen werden dadurch nie doppelt
   * gezählt und die Monatssumme bleibt exakt die Summe der gezeigten Wochen —
   * sonst müsste man Wochen, die über den Monatswechsel laufen, aufteilen,
   * was mit einem Wochensoll nicht sauber aufgeht.
   */
  function mondaysInMonth(date) {
    const base = stripTime(date);
    const first = new Date(base.getFullYear(), base.getMonth(), 1);
    const mondays = [];
    let monday = getMonday(first);
    if (monday.getMonth() !== first.getMonth() || monday.getFullYear() !== first.getFullYear()) {
      monday = addDays(monday, 7); // Montag liegt noch im Vormonat
    }
    while (monday.getMonth() === first.getMonth() && monday.getFullYear() === first.getFullYear()) {
      mondays.push(monday);
      monday = addDays(monday, 7);
    }
    return mondays;
  }

  /** Wochentags-Schlüssel ('mo'…'so') zu einem Datum "YYYY-MM-DD". */
  function dayKeyForDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return DAY_KEYS[(date.getDay() + 6) % 7];
  }

  /**
   * Version 3.0: Greift für dieses Datum eine wiederkehrende Regel?
   *
   * weekdays: { mo: true, ... } – feste Wochentage jede Woche
   * blocks:   [{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }] – Zeiträume
   *
   * Der String-Vergleich reicht, weil das ISO-Format YYYY-MM-DD
   * lexikografisch in derselben Reihenfolge sortiert wie chronologisch.
   * Ein Block mit vertauschten Grenzen wird still korrekt gedreht, statt
   * einfach nie zu greifen.
   */
  function matchesRecurringRule(dateStr, weekdays, blocks) {
    if (!dateStr) return false;

    const flags = weekdays || {};
    if (flags[dayKeyForDate(dateStr)]) return true;

    const list = Array.isArray(blocks) ? blocks : [];
    return list.some((block) => {
      if (!block || !block.from || !block.to) return false;
      const from = block.from <= block.to ? block.from : block.to;
      const to = block.from <= block.to ? block.to : block.from;
      return dateStr >= from && dateStr <= to;
    });
  }

  // ---------------------------------------------------------------------
  // Version 3.1: Berufsschul-Regeln
  //
  // Zwei Arten von Regeln, beide rein auf Datums-Strings:
  //   weekly – bestimmte Wochentage, optional nur jede n-te Woche
  //   block  – ein zusammenhängender Zeitraum (Blockunterricht)
  // Jede Regel kann zusätzlich auf einen Gültigkeitszeitraum begrenzt sein
  // (from/to), um das Lehrjahr abzubilden.
  // ---------------------------------------------------------------------

  /** Liegt dateStr in [from, to]? Leere Grenzen bedeuten "unbegrenzt". */
  function withinRange(dateStr, from, to) {
    if (from && dateStr < from) return false;
    if (to && dateStr > to) return false;
    return true;
  }

  /**
   * Wie viele ganze Wochen liegen zwischen zwei Daten?
   * Gerechnet wird von Montag zu Montag, damit "jede zweite Woche" sich auf
   * Kalenderwochen bezieht und nicht auf den Wochentag des Ankers.
   * Nutzt UTC-Mitternacht, damit die Sommerzeitumstellung die Differenz
   * nicht um eine Stunde und damit gelegentlich um einen Tag verschiebt.
   */
  function weeksBetween(fromDateStr, toDateStr) {
    const mondayOf = (s) => {
      const d = new Date(s + 'T00:00:00Z');
      const shift = (d.getUTCDay() + 6) % 7;
      d.setUTCDate(d.getUTCDate() - shift);
      return d;
    };
    const diffDays = Math.round((mondayOf(toDateStr) - mondayOf(fromDateStr)) / 86400000);
    return Math.floor(diffDays / 7);
  }

  /** Greift eine einzelne Regel an diesem Tag? */
  function ruleMatchesDate(dateStr, rule) {
    if (!rule || !dateStr) return false;

    if (rule.kind === 'block') {
      if (!rule.from || !rule.to) return false;
      const from = rule.from <= rule.to ? rule.from : rule.to;
      const to = rule.from <= rule.to ? rule.to : rule.from;
      return dateStr >= from && dateStr <= to;
    }

    // weekly
    if (!withinRange(dateStr, rule.from, rule.to)) return false;
    if (!(rule.weekdays || {})[dayKeyForDate(dateStr)]) return false;

    const interval = Math.max(1, parseInt(rule.interval, 10) || 1);
    if (interval === 1) return true;
    if (!rule.anchor) return true; // ohne Anker lässt sich kein Rhythmus bestimmen

    // Modulo kann in JS negativ werden (Datum vor dem Anker) - normalisieren,
    // sonst würde die Regel in der Vergangenheit auf den falschen Wochen sitzen.
    const weeks = weeksBetween(rule.anchor, dateStr);
    return ((weeks % interval) + interval) % interval === 0;
  }

  /** Liegt der Tag in einem der Ferienzeiträume? */
  function isInBreak(dateStr, breaks) {
    const list = Array.isArray(breaks) ? breaks : [];
    return list.some((b) => {
      if (!b || !b.from || !b.to) return false;
      const from = b.from <= b.to ? b.from : b.to;
      const to = b.from <= b.to ? b.to : b.from;
      return dateStr >= from && dateStr <= to;
    });
  }

  /**
   * Ist das ein Berufsschultag? Ferien stechen jede Regel – auch den
   * Blockunterricht, denn in den Ferien findet schlicht keine Schule statt.
   */
  function isSchoolDay(dateStr, rules, breaks) {
    if (!dateStr) return false;
    if (isInBreak(dateStr, breaks)) return false;
    const list = Array.isArray(rules) ? rules : [];
    return list.some((rule) => ruleMatchesDate(dateStr, rule));
  }

  /**
   * ZEITSTEMPEL: welche Regel greift an diesem Tag? (oder null)
   * Gebraucht, weil eine Regel jetzt auch einen gemischten Tag
   * "Schule + Betrieb" erzeugen kann und dafür ihre Schulzeiten mitbringt.
   * Bei mehreren passenden Regeln gewinnt die erste in der Liste.
   */
  function schoolRuleFor(dateStr, rules, breaks) {
    if (!dateStr) return null;
    if (isInBreak(dateStr, breaks)) return null;
    const list = Array.isArray(rules) ? rules : [];
    return list.filter((rule) => ruleMatchesDate(dateStr, rule))[0] || null;
  }

  /** Alle Datums-Strings von from bis to (einschließlich), gedeckelt. */
  function datesInRange(fromStr, toStr, limit) {
    const max = limit || 400;
    const from = fromStr <= toStr ? fromStr : toStr;
    const to = fromStr <= toStr ? toStr : fromStr;
    const out = [];
    let cursor = new Date(from + 'T00:00:00');
    for (let i = 0; i < max; i += 1) {
      const key = cursor.getFullYear() + '-' +
        String(cursor.getMonth() + 1).padStart(2, '0') + '-' +
        String(cursor.getDate()).padStart(2, '0');
      if (key > to) break;
      out.push(key);
      cursor = addDays(cursor, 1);
    }
    return out;
  }

  return {
    DAY_KEYS,
    DAY_LABELS,
    DAY_LABELS_SHORT,
    dayKeyForDate,
    matchesRecurringRule,
    withinRange,
    weeksBetween,
    ruleMatchesDate,
    isInBreak,
    isSchoolDay,
    schoolRuleFor,
    datesInRange,
    MONTH_LABELS,
    getMonday,
    addDays,
    addMonths,
    weekKeyFor,
    mondayForWeekKey,
    weekRangeLabel,
    formatDateShort,
    monthKeyFor,
    monthLabel,
    mondaysInMonth,
    emptyWeek,
    hasAnyEntry,
    weekSumCentihours,
    weekDiffCentihours,
    runningBalanceCentihours,
  };
});
