/**
 * calculator.js
 * Reine Berechnungslogik des Feierabend-Rechners – komplett UI-frei und ohne Seiteneffekte.
 *
 * ZENTRALES KONZEPT: "Industriestunden"
 * --------------------------------------
 * Der Nutzer gibt Nettoarbeitszeit als Dezimalzahl ein, z. B. 7,20.
 * Mathematisch ist das GENAU die übliche Dezimalstunden-Schreibweise
 * (0,20 h = 0,20 × 60 Min = 12 Min – keine eigene Zeiteinheit).
 * Die App nennt es "Industriestunden", weil das der in der Praxis
 * (v. a. Lohn-/Zeiterfassungssysteme) gebräuchliche Begriff für diese
 * Schreibweise ist – vor allem um sie klar von der häufigen FEHLLESUNG
 * abzugrenzen, bei der man 7,20 fälschlich als "7 Std. 20 Min." liest.
 *
 * Um Fließkomma-Rundungsfehler zu vermeiden (7.2 ist in IEEE-754 nicht
 * exakt darstellbar), wird intern NIE mit der Dezimalzahl selbst gerechnet.
 * Stattdessen wird sie einmalig beim Einlesen in eine Ganzzahl
 * "Centihours" (Hundertstel-Stunden) verwandelt, z. B. 7,20 -> 720.
 * Ab dort läuft ausschließlich Integer-Arithmetik.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Calculator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MINUTES_PER_DAY = 1440;

  // ---------------------------------------------------------------------
  // Grundumrechnungen
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // ZEITSTEMPEL (Version für Arturs Freundin, 08.11.2026):
  // Die interne Einheit ist hier MINUTEN, nicht mehr Centihours.
  //
  // Warum: 1 Centihour = 0,6 Min. Normale Minuten lassen sich darin nicht
  // exakt ablegen. Beispiel 8:07 = 487 Min. = 811,67 Centihours -> gerundet
  // 812. Zwanzig solcher Tage ergeben 16 240 Centihours = 162:24 statt
  // richtig 162:20 – die Abweichung wächst mit jedem Tag.
  //
  // Damit der übrige Code (app.js, overtime.js) unverändert bleiben kann,
  // behalten die Funktionen ihre alten Namen. Alles, was dort
  // "Centihours" heißt, sind in dieser App ganze MINUTEN:
  //   toCentihours('8:07')        -> 487
  //   toCentihours('7,20')        -> 432  (Dezimalstunden, = 7:12)
  //   centihoursToDisplay(487)    -> '8:07'  (oder '8,12' bei Industrie-Anzeige)
  //   centihoursToNormalMinutes   -> unverändert (Minuten bleiben Minuten)
  //   normalMinutesToCentihours   -> unverändert
  // ---------------------------------------------------------------------

  // Anzeige: 'hm' = Std:Min (Standard) | 'industrie' = Dezimalstunden 8,12
  let displayMode = 'hm';
  function setDisplayMode(m) { displayMode = m === 'industrie' ? 'industrie' : 'hm'; }
  function getDisplayMode() { return displayMode; }

  /**
   * Eingabe -> ganze Minuten.
   * "8:07" -> 487 | "8" -> 480 | "7,20" bzw. 7.2 -> 432 (Dezimalstunden)
   */
  function toCentihours(value) {
    const raw = typeof value === 'string' ? value.trim() : value;
    if (typeof raw === 'string' && raw.indexOf(':') !== -1) {
      const m = /^(\d{1,3}):(\d{1,2})$/.exec(raw);
      if (!m || parseInt(m[2], 10) > 59) {
        throw new Error('Ungültige Zeitangabe: ' + value + ' (Format 8:00)');
      }
      return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    }
    const normalized = typeof raw === 'string' ? raw.replace(',', '.') : raw;
    if (normalized === '' || normalized === null || normalized === undefined) {
      throw new Error('Ungültige Zeitangabe: leer');
    }
    const num = Number(normalized);
    if (!Number.isFinite(num) || num < 0) {
      throw new Error('Ungültige Zeitangabe: ' + value);
    }
    return Math.round(num * 60);
  }

  /** Minuten -> Anzeige. 487 -> "8:07" (bzw. "8,12" bei Industrie-Anzeige) */
  function centihoursToDisplay(minutes) {
    if (displayMode === 'industrie') {
      return (Math.round((minutes * 100) / 60) / 100).toFixed(2).replace('.', ',');
    }
    return minutesToHHMM(minutes);
  }

  /** In dieser App identisch: interne Einheit = Minuten. */
  function centihoursToNormalMinutes(minutes) {
    return Math.round(minutes);
  }

  /** In dieser App identisch: interne Einheit = Minuten. */
  function normalMinutesToCentihours(normalMinutes) {
    return Math.round(normalMinutes);
  }

  /** Normale Minuten (Integer) -> "H:MM"-String, z. B. 432 -> "7:12" */
  function minutesToHHMM(totalMinutes, opts) {
    const options = opts || {};
    const sign = totalMinutes < 0 ? '-' : '';
    const abs = Math.abs(Math.round(totalMinutes));
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    const mm = String(m).padStart(2, '0');
    if (options.padHours) {
      return sign + String(h).padStart(2, '0') + ':' + mm;
    }
    return sign + h + ':' + mm;
  }

  /** Minuten seit Mitternacht (0-1439) -> "HH:MM" Uhrzeit-String */
  function minutesToClock(minutesSinceMidnight) {
    const m = ((minutesSinceMidnight % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  }

  /** "HH:MM" Uhrzeit-String -> Minuten seit Mitternacht */
  function clockToMinutes(clockStr) {
    const parts = String(clockStr).split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      throw new Error('Ungültige Uhrzeit: ' + clockStr);
    }
    return h * 60 + m;
  }

  // ---------------------------------------------------------------------
  // Pausenregelung (§ 4 ArbZG) — austauschbar
  // ---------------------------------------------------------------------

  /** Gesetzliche Standardregel nach § 4 ArbZG. 45 Min. ERSETZEN die 30 Min. */
  function legalBreakForNetMinutes(netMinutes) {
    if (netMinutes > 540) return 45; // > 9 Std.
    if (netMinutes > 360) return 30; // > 6 Std.
    return 0;
  }

  // Registry austauschbarer Pausenregeln (Abschnitt 17: gesetzlich / betrieblich / benutzerdefiniert)
  const breakRules = {
    legal: {
      id: 'legal',
      label: 'Gesetzlich (§ 4 ArbZG)',
      fn: legalBreakForNetMinutes,
    },
  };

  function registerBreakRule(id, label, fn) {
    breakRules[id] = { id, label, fn };
  }

  function getBreakRule(id) {
    return breakRules[id] || breakRules.legal;
  }

  // ---------------------------------------------------------------------
  // Hauptberechnungen
  // ---------------------------------------------------------------------

  /**
   * Vorwärts: Arbeitsbeginn + Nettoarbeitszeit(Industrie) -> Feierabend.
   * @param {number} startMinutes - Arbeitsbeginn in Minuten seit Mitternacht
   * @param {number} industrialCentihours - Nettoarbeitszeit als Centihours
   * @param {string} [breakRuleId] - z. B. 'legal'
   */
  function calculateFeierabend(startMinutes, industrialCentihours, breakRuleId) {
    const netMinutes = centihoursToNormalMinutes(industrialCentihours);
    const pauseMinutes = getBreakRule(breakRuleId || 'legal').fn(netMinutes);
    const totalMinutes = netMinutes + pauseMinutes;
    const endMinutesRaw = startMinutes + totalMinutes;
    const endMinutes = ((endMinutesRaw % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const overflowsToNextDay = endMinutesRaw >= MINUTES_PER_DAY;

    return {
      startMinutes,
      industrialCentihours,
      netMinutes,
      pauseMinutes,
      totalMinutes,
      endMinutes,
      overflowsToNextDay,
    };
  }

  /**
   * Rückwärts: Gewünschter Feierabend + Nettoarbeitszeit(Industrie) -> nötiger Arbeitsbeginn.
   */
  function calculateArbeitsbeginn(desiredEndMinutes, industrialCentihours, breakRuleId) {
    const netMinutes = centihoursToNormalMinutes(industrialCentihours);
    const pauseMinutes = getBreakRule(breakRuleId || 'legal').fn(netMinutes);
    const totalMinutes = netMinutes + pauseMinutes;
    const startMinutesRaw = desiredEndMinutes - totalMinutes;
    const startMinutes = ((startMinutesRaw % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const underflowsToPreviousDay = startMinutesRaw < 0;

    return {
      desiredEndMinutes,
      industrialCentihours,
      netMinutes,
      pauseMinutes,
      totalMinutes,
      startMinutes,
      underflowsToPreviousDay,
    };
  }

  /**
   * Pausenstatus-Einstufung für die Ampel-Anzeige (Abschnitt 22).
   */
  function pauseStatus(netMinutes, breakRuleId) {
    const pauseMinutes = getBreakRule(breakRuleId || 'legal').fn(netMinutes);
    if (pauseMinutes >= 45) return { level: 'blue', minutes: 45, label: '45 Min. Pause erforderlich' };
    if (pauseMinutes >= 30) return { level: 'orange', minutes: 30, label: '30 Min. Pause erforderlich' };
    return { level: 'green', minutes: 0, label: 'Keine gesetzliche Pause erforderlich' };
  }

  /**
   * Arbeitsfortschritt in % bezogen auf die NETTOarbeitszeit (Pause zählt nicht als Arbeit).
   * Annahme (nicht gesetzlich vorgeschrieben, da die Lage der Pause frei wählbar ist):
   * Die Pause wird nach min(netMinutes, 360) Minuten Nettoarbeit eingelegt, also direkt
   * nach Erreichen der 6-Stunden-Schwelle, sofern überhaupt eine Pause anfällt.
   * Das beeinflusst NUR die Fortschrittsanzeige, nicht die Feierabend-Berechnung.
   */
  function computeProgress(nowMinutes, startMinutes, netMinutes, pauseMinutes) {
    if (netMinutes <= 0) return 0;
    let elapsed = nowMinutes - startMinutes;
    // Über Mitternacht hinweg arbeitende Schichten (Rand-Case) einfach linear behandeln.
    if (elapsed < 0) elapsed += MINUTES_PER_DAY;

    const breakStart = pauseMinutes > 0 ? Math.min(netMinutes, 360) : netMinutes;
    const breakEnd = breakStart + pauseMinutes;

    let workedMinutes;
    if (elapsed <= breakStart) {
      workedMinutes = elapsed;
    } else if (elapsed <= breakEnd) {
      workedMinutes = breakStart;
    } else {
      workedMinutes = elapsed - pauseMinutes;
    }

    workedMinutes = Math.max(0, Math.min(workedMinutes, netMinutes));
    return Math.round((workedMinutes / netMinutes) * 1000) / 10; // 1 Nachkommastelle
  }

  /**
   * Countdown bis Feierabend in Minuten (nicht negativ; null wenn Arbeitsbeginn
   * noch in der Zukunft liegt oder Feierabend bereits erreicht wurde).
   */
  function minutesUntil(nowMinutes, targetMinutes) {
    let diff = targetMinutes - nowMinutes;
    if (diff < 0) diff += MINUTES_PER_DAY;
    return diff;
  }

  /**
   * Berechnet Nettoarbeitszeit und Pause aus vier Stempeluhr-Zeiten – genau
   * wie ein Terminal mit Karten-Erfassung: Kommen, Gehen (Pause-Beginn),
   * Kommen (Pause-Ende), Gehen (Feierabend). Wirft einen Error mit
   * verständlicher Meldung, wenn die Reihenfolge unplausibel ist.
   * Bewusste Einschränkung (MVP): keine Schichten über Mitternacht hinweg,
   * genau eine Pause. Alle vier Parameter sind "HH:MM"-Strings.
   */
  function calculateFromPunches(startClock, breakStartClock, breakEndClock, endClock) {
    const startMinutes = clockToMinutes(startClock);
    const breakStartMinutes = clockToMinutes(breakStartClock);
    const breakEndMinutes = clockToMinutes(breakEndClock);
    const endMinutes = clockToMinutes(endClock);

    if (breakStartMinutes < startMinutes) {
      throw new Error('Pause-Beginn liegt vor dem Kommen.');
    }
    if (breakEndMinutes < breakStartMinutes) {
      throw new Error('Pause-Ende liegt vor dem Pause-Beginn.');
    }
    if (endMinutes < breakEndMinutes) {
      throw new Error('Gehen liegt vor dem Pause-Ende.');
    }

    const pauseMinutes = breakEndMinutes - breakStartMinutes;
    const totalSpanMinutes = endMinutes - startMinutes;
    const netMinutes = totalSpanMinutes - pauseMinutes;
    const industrialCentihours = normalMinutesToCentihours(netMinutes);

    return {
      startMinutes, breakStartMinutes, breakEndMinutes, endMinutes,
      pauseMinutes, totalSpanMinutes, netMinutes, industrialCentihours,
    };
  }

  /**
   * Nettoarbeitszeit aus einer reinen Anwesenheitsspanne.
   * Gedacht für die schnelle Erfassung: nur Kommen und Gehen eintragen, die
   * Pause rechnet die App selbst aus der eingestellten Pausenregel.
   *
   * Der Knackpunkt: Die Pausenregel hängt an der NETTOzeit, die Nettozeit
   * hängt aber an der Pause. Deshalb wird angenähert, bis sich nichts mehr
   * ändert. Bei einer Spanne wie 6:30 pendelt das zwischen zwei Werten
   * (6:30 netto verlangt 30 Min. Pause, 6:00 netto verlangt keine) – in dem
   * Fall wird bewusst die kleinere, also die vorsichtige und arbeitsrechtlich
   * saubere Nettozeit genommen.
   *
   * pauseOverrideMinutes: wenn gesetzt (>= 0), gilt genau diese Pause und es
   * wird nichts automatisch berechnet.
   */
  function calculateFromSpan(startClock, endClock, pauseOverrideMinutes, breakRuleId) {
    const startMinutes = clockToMinutes(startClock);
    const endMinutes = clockToMinutes(endClock);
    if (endMinutes < startMinutes) {
      throw new Error('Gehen liegt vor dem Kommen.');
    }

    const grossMinutes = endMinutes - startMinutes;
    const ruleFn = getBreakRule(breakRuleId || 'legal').fn;

    let pauseMinutes;
    let automatic;
    if (Number.isFinite(pauseOverrideMinutes) && pauseOverrideMinutes >= 0) {
      pauseMinutes = Math.min(pauseOverrideMinutes, grossMinutes);
      automatic = false;
    } else {
      let net = grossMinutes - ruleFn(grossMinutes);
      for (let i = 0; i < 4; i += 1) {
        const nextNet = grossMinutes - ruleFn(net);
        if (nextNet === net) break;
        net = Math.min(net, nextNet);
      }
      pauseMinutes = Math.max(0, grossMinutes - net);
      automatic = true;
    }

    const netMinutes = Math.max(0, grossMinutes - pauseMinutes);
    return {
      startMinutes,
      endMinutes,
      grossMinutes,
      pauseMinutes,
      netMinutes,
      automatic,
      industrialCentihours: normalMinutesToCentihours(netMinutes),
    };
  }

  // ---------------------------------------------------------------------
  // Tagesplanung rund um die Arbeitszeit (Version 2.9)
  //
  // Beide Funktionen sind reine Rechnungen auf Minutenwerten und wissen
  // nichts von Speicher oder Oberfläche. Eine "Aktivität" ist ein Ort, an
  // dem man sich eine Weile aufhält (Gym, Einkaufen, Arzt) und der auf dem
  // Weg liegt. Sie braucht genau drei Zahlen:
  //   durationMinutes    – wie lange man dort ist
  //   travelHomeMinutes  – Weg zwischen Zuhause und dem Ort
  //   travelWorkMinutes  – Weg zwischen dem Ort und der Arbeit
  // Bewusste Annahme: Hin- und Rückweg derselben Strecke dauern gleich
  // lang. Getrennte Werte je Richtung wären vier statt zwei Eingaben für
  // einen Unterschied, den man morgens ohnehin nicht kennt.
  // ---------------------------------------------------------------------

  /** Summiert die Etappen und rechnet sie ab einem Startzeitpunkt vorwärts durch. */
  function buildTimeline(startMinutes, legs) {
    let cursor = startMinutes;
    const timeline = legs
      .filter((leg) => leg && leg.minutes > 0)
      .map((leg) => {
        const from = cursor;
        cursor += leg.minutes;
        return {
          key: leg.key,
          label: leg.label,
          minutes: leg.minutes,
          fromMinutes: from,
          toMinutes: cursor,
        };
      });
    return { legs: timeline, endMinutes: cursor, totalMinutes: cursor - startMinutes };
  }

  /**
   * Rückwärts vom Arbeitsbeginn: Wann muss ich aufstehen?
   *
   * opts: { prepMinutes, bufferMinutes, commuteMinutes, activity }
   * Mit Aktivität führt der Weg über den Ort, der normale Arbeitsweg
   * entfällt dann also und wird durch die beiden Teilstrecken ersetzt.
   */
  function planMorning(startMinutes, opts) {
    const o = opts || {};
    const prep = Math.max(0, o.prepMinutes || 0);
    const buffer = Math.max(0, o.bufferMinutes || 0);
    const act = o.activity || null;

    const legs = [{ key: 'prep', label: 'Fertigmachen', minutes: prep }];
    if (act) {
      legs.push({ key: 'travelTo', label: 'Weg zu ' + act.label, minutes: Math.max(0, act.travelHomeMinutes || 0) });
      legs.push({ key: 'activity', label: act.label, minutes: Math.max(0, act.durationMinutes || 0) });
      legs.push({ key: 'travelWork', label: 'Weg zur Arbeit', minutes: Math.max(0, act.travelWorkMinutes || 0) });
    } else {
      legs.push({ key: 'commute', label: 'Arbeitsweg', minutes: Math.max(0, o.commuteMinutes || 0) });
    }
    legs.push({ key: 'buffer', label: 'Puffer', minutes: buffer });

    const totalMinutes = legs.reduce((sum, leg) => sum + Math.max(0, leg.minutes || 0), 0);
    const wakeMinutes = startMinutes - totalMinutes;
    const built = buildTimeline(wakeMinutes, legs);

    return {
      wakeMinutes,
      leaveMinutes: wakeMinutes + prep, // Zeitpunkt, an dem es aus dem Haus geht
      startMinutes,
      totalMinutes,
      legs: built.legs,
      hasActivity: !!act,
    };
  }

  /**
   * Vorwärts vom Feierabend: Wann bin ich zuhause?
   * opts: { commuteMinutes, activity }
   */
  function planEvening(endMinutes, opts) {
    const o = opts || {};
    const act = o.activity || null;

    const legs = [];
    if (act) {
      legs.push({ key: 'travelTo', label: 'Weg zu ' + act.label, minutes: Math.max(0, act.travelWorkMinutes || 0) });
      legs.push({ key: 'activity', label: act.label, minutes: Math.max(0, act.durationMinutes || 0) });
      legs.push({ key: 'travelHome', label: 'Weg nach Hause', minutes: Math.max(0, act.travelHomeMinutes || 0) });
    } else {
      legs.push({ key: 'commute', label: 'Rückweg', minutes: Math.max(0, o.commuteMinutes || 0) });
    }

    const built = buildTimeline(endMinutes, legs);
    return {
      endMinutes,
      homeMinutes: built.endMinutes,
      totalMinutes: built.totalMinutes,
      legs: built.legs,
      hasActivity: !!act,
    };
  }

  /**
   * Schlafrechner (Version 3.0).
   *
   * wakeMinutes ist die Aufstehzeit am NÄCHSTEN Morgen, nowMinutes die
   * aktuelle Uhrzeit heute Abend. Damit die Rechnung über Mitternacht
   * stimmt, wird intern auf einer durchlaufenden Zeitachse gerechnet:
   * die Aufstehzeit liegt um einen Tag versetzt, sobald sie vor "jetzt"
   * liegt - sonst käme bei 23:00 jetzt und 05:55 aufstehen ein negativer
   * Wert heraus statt der richtigen 6:55 Std.
   *
   * Bewusst ohne Einschlafdauer: eine Zahl weniger, die niemand ehrlich
   * kennt. Wer Puffer will, trägt ihn beim Schlafbedarf mit ein.
   */
  function planSleep(wakeMinutes, sleepNeedMinutes, nowMinutes) {
    const need = Math.max(0, sleepNeedMinutes || 0);
    const bedMinutes = wakeMinutes - need;

    let sleepIfNowMinutes = null;
    if (Number.isFinite(nowMinutes)) {
      let wakeAhead = wakeMinutes;
      while (wakeAhead <= nowMinutes) wakeAhead += MINUTES_PER_DAY;
      sleepIfNowMinutes = wakeAhead - nowMinutes;
    }

    return {
      bedMinutes,
      needMinutes: need,
      sleepIfNowMinutes,
      // true, sobald die Zeit fürs Bett laut Plan erreicht bzw. vorbei ist
      isPastBedtime: sleepIfNowMinutes !== null && sleepIfNowMinutes < need,
    };
  }

  return {
    MINUTES_PER_DAY,
    setDisplayMode,
    getDisplayMode,
    toCentihours,
    centihoursToDisplay,
    centihoursToNormalMinutes,
    normalMinutesToCentihours,
    minutesToHHMM,
    minutesToClock,
    clockToMinutes,
    legalBreakForNetMinutes,
    registerBreakRule,
    getBreakRule,
    breakRules,
    calculateFeierabend,
    calculateArbeitsbeginn,
    pauseStatus,
    computeProgress,
    minutesUntil,
    calculateFromPunches,
    calculateFromSpan,
    planMorning,
    planEvening,
    planSleep,
  };
});
