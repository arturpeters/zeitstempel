/**
 * punchclock.js
 * Version 2.0: echte Stempeluhr als reine Logik (kein DOM, keine Persistenz -
 * beides bleibt Aufgabe von app.js/storage.js, genau wie bei calculator.js).
 *
 * Rechnet ausschließlich auf echten Zeitstempeln (ms seit Epoche), nie auf
 * "wie lange ist die App schon offen". Damit sind Randfälle wie App-Neustart,
 * Handy-Neustart, Seiten-Reload oder eine über Stunden geschlossene App
 * automatisch korrekt (Spezifikation Abschnitt 29).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PunchClock = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TYPES = {
    CLOCK_IN: 'clockIn',
    BREAK_START: 'breakStart',
    BREAK_END: 'breakEnd',
    CLOCK_OUT: 'clockOut',
  };

  const TYPE_LABELS = {
    clockIn: 'Kommen',
    breakStart: 'Pause Start',
    breakEnd: 'Pause Ende',
    clockOut: 'Gehen',
  };

  // Status = Zustand NACH dem letzten (chronologisch sortierten) Event.
  const STATUS = {
    IDLE: 'idle', // Noch nicht begonnen
    WORKING: 'working', // Arbeitet
    ON_BREAK: 'onBreak', // Pause
    DONE: 'done', // Feierabend / Tag abgeschlossen
  };

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  // Lokaler Datums-Key "YYYY-MM-DD". Bewusst NICHT toISOString() (das ist UTC
  // und würde rund um Mitternacht/Zeitzonen den falschen Kalendertag liefern).
  function dateKey(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function todayKey(now) {
    return dateKey(now || new Date());
  }

  function sortEvents(events) {
    return events.slice().sort((a, b) => a.timestamp - b.timestamp);
  }

  let idCounter = 0;
  function makeId() {
    idCounter += 1;
    return 'ev' + Date.now().toString(36) + idCounter.toString(36);
  }

  function createEvent(type, timestamp) {
    return { id: makeId(), type: type, timestamp: timestamp };
  }

  function emptyWorkDay(date) {
    return { date: date, events: [], edits: [] };
  }

  function statusForEvents(events) {
    const sorted = sortEvents(events);
    if (sorted.length === 0) return STATUS.IDLE;
    const last = sorted[sorted.length - 1];
    switch (last.type) {
      case TYPES.CLOCK_IN: return STATUS.WORKING;
      case TYPES.BREAK_END: return STATUS.WORKING;
      case TYPES.BREAK_START: return STATUS.ON_BREAK;
      case TYPES.CLOCK_OUT: return STATUS.DONE;
      default: return STATUS.IDLE;
    }
  }

  function statusLabel(status) {
    switch (status) {
      case STATUS.IDLE: return 'Noch nicht begonnen';
      case STATUS.WORKING: return 'Arbeitet';
      case STATUS.ON_BREAK: return 'Pause';
      case STATUS.DONE: return 'Feierabend';
      default: return '';
    }
  }

  // Welche Event-Typen sind im gegebenen Status als NÄCHSTES plausibel?
  // Nach "Pause beenden" geht es zurück auf WORKING (nicht auf einen
  // "verbrauchten Pausenslot") -> beliebig viele Pausen pro Tag sind erlaubt.
  function allowedNextTypes(status) {
    switch (status) {
      case STATUS.IDLE: return [TYPES.CLOCK_IN];
      case STATUS.WORKING: return [TYPES.BREAK_START, TYPES.CLOCK_OUT];
      case STATUS.ON_BREAK: return [TYPES.BREAK_END];
      case STATUS.DONE: return [];
      default: return [];
    }
  }

  // Live-Stempeln über die Kommen/Pause/Gehen-Buttons: verhindert
  // Doppel-Stempeln (Abschnitt 2) und rückwärtslaufende Zeitstempel.
  function validateStamp(events, type, timestamp) {
    const status = statusForEvents(events);
    const allowed = allowedNextTypes(status);
    if (allowed.indexOf(type) === -1) {
      return { ok: false, error: 'Das geht gerade nicht (Status: ' + statusLabel(status) + ').' };
    }
    const sorted = sortEvents(events);
    const last = sorted[sorted.length - 1];
    if (last && timestamp < last.timestamp) {
      return { ok: false, error: 'Zeitstempel liegt vor dem letzten Eintrag.' };
    }
    return { ok: true };
  }

  // Vollständige Plausibilitätsprüfung einer beliebigen (z. B. nachträglich
  // editierten) Event-Liste - prüft die ganze Kette, nicht nur den letzten
  // Schritt. Gibt eine Liste verständlicher, deutscher Fehlermeldungen zurück
  // (leer = alles plausibel). Wird beim Speichern im Tages-Detail aufgerufen
  // (Abschnitt 30).
  function validateSequence(events) {
    const sorted = sortEvents(events);
    const errors = [];
    let state = STATUS.IDLE;
    let prevTimestamp = null;

    sorted.forEach((ev) => {
      if (prevTimestamp !== null && ev.timestamp < prevTimestamp) {
        errors.push(TYPE_LABELS[ev.type] + ' liegt zeitlich vor einem früheren Eintrag.');
      } else if (prevTimestamp !== null && ev.timestamp === prevTimestamp) {
        errors.push(TYPE_LABELS[ev.type] + ': gleicher Zeitpunkt wie der vorherige Eintrag.');
      }

      const allowed = allowedNextTypes(state);
      if (allowed.indexOf(ev.type) === -1) {
        if (ev.type === TYPES.CLOCK_IN && state === STATUS.WORKING) {
          errors.push('Zweimal „Kommen" ohne dazwischenliegendes „Gehen".');
        } else if (ev.type === TYPES.CLOCK_IN && state === STATUS.ON_BREAK) {
          errors.push('„Kommen" während einer laufenden Pause.');
        } else if (ev.type === TYPES.CLOCK_OUT && state === STATUS.IDLE) {
          errors.push('„Gehen" ohne vorheriges „Kommen".');
        } else if (ev.type === TYPES.CLOCK_OUT && state === STATUS.ON_BREAK) {
          errors.push('„Gehen" während einer laufenden Pause - erst „Pause Ende" stempeln.');
        } else if (ev.type === TYPES.BREAK_START && state !== STATUS.WORKING) {
          errors.push('„Pause Start" ist an dieser Stelle nicht möglich (Status: ' + statusLabel(state) + ').');
        } else if (ev.type === TYPES.BREAK_END && state !== STATUS.ON_BREAK) {
          errors.push('„Pause Ende" ohne vorherigen „Pause Start".');
        } else {
          errors.push(TYPE_LABELS[ev.type] + ' ist an dieser Stelle nicht plausibel.');
        }
      }

      switch (ev.type) {
        case TYPES.CLOCK_IN: state = STATUS.WORKING; break;
        case TYPES.BREAK_START: state = STATUS.ON_BREAK; break;
        case TYPES.BREAK_END: state = STATUS.WORKING; break;
        case TYPES.CLOCK_OUT: state = STATUS.DONE; break;
        default: break;
      }
      prevTimestamp = ev.timestamp;
    });

    return errors;
  }

  function minutesOfDay(timestampMs) {
    const d = new Date(timestampMs);
    return d.getHours() * 60 + d.getMinutes();
  }

  // Leitet aus einer Event-Liste alle Live-/Anzeigewerte ab. Reine Funktion,
  // keine Seiteneffekte.
  // - targetNetMinutes: geplante Netto-Soll-Arbeitszeit in normalen Minuten
  // - breakRuleFn: (netMinutes) => erforderliche Pausenminuten, z. B.
  //   Calculator.getBreakRule(id).fn (austauschbare Pausenregel, Abschnitt 5)
  // - nowMs: aktueller Zeitpunkt in ms; nur relevant, solange der Tag noch
  //   nicht mit "Gehen" abgeschlossen ist
  //
  // ZEITSTEMPEL: opts.autoBreak = true -> Mindestpause wird abgezogen, auch
  // wenn keine oder eine zu kurze Pause gestempelt wurde:
  //   abgezogene Pause = größer von (gestempelte Pausen, Pflichtpause)
  // Ohne Stempeluhr im Betrieb ist Vergessen das Hauptrisiko - ein Tag
  // 7:45-16:15 ohne gestempelte Pause zählt so 8:00 und nicht 8:30.
  // opts.extraBreakMinutes: zusätzlich anzurechnende Pausen außerhalb der
  // Stempelzeiten (z. B. Schulpausen am Mischtag), die bei der Frage
  // "reicht die Pause?" mitzählen.
  function deriveStats(events, targetNetMinutes, breakRuleFn, nowMs, opts) {
    const o = opts || {};
    const sorted = sortEvents(events);
    const status = statusForEvents(sorted);
    const clockInEvent = sorted.filter((e) => e.type === TYPES.CLOCK_IN)[0] || null;
    const clockOutCandidates = sorted.filter((e) => e.type === TYPES.CLOCK_OUT);
    const clockOutEvent = clockOutCandidates.length ? clockOutCandidates[clockOutCandidates.length - 1] : null;

    // Pausenintervalle einsammeln (mehrere pro Tag sind möglich).
    const breaks = [];
    let openBreakStart = null;
    sorted.forEach((ev) => {
      if (ev.type === TYPES.BREAK_START) {
        openBreakStart = ev.timestamp;
      } else if (ev.type === TYPES.BREAK_END && openBreakStart !== null) {
        breaks.push({ start: openBreakStart, end: ev.timestamp });
        openBreakStart = null;
      }
    });
    const hasOpenBreak = openBreakStart !== null;

    const referenceNow = (status === STATUS.DONE && clockOutEvent) ? clockOutEvent.timestamp : (nowMs || Date.now());

    // Tatsächliche Pause bisher: abgeschlossene Pausen + laufende Pause bis jetzt.
    // Netto-Arbeitszeit darf während einer laufenden Pause NICHT weiterlaufen
    // (Abschnitt 3) - das ist hier automatisch der Fall, weil sie abgezogen wird.
    let actualBreakMs = 0;
    breaks.forEach((b) => { actualBreakMs += (b.end - b.start); });
    if (hasOpenBreak) actualBreakMs += Math.max(0, referenceNow - openBreakStart);
    let actualBreakMinutes = Math.round(actualBreakMs / 60000);

    // ZEITSTEMPEL: Pause nachträglich angegeben (Abfrage nach "Gehen").
    // Gilt nur, solange keine Pause gestempelt ist – Stempel gehen vor.
    //   opts.breakAnswer = { minutes: 30 } -> wie 30 Min. gestempelt
    //   opts.breakAnswer = { none: true }  -> bewusst keine Pause: nichts
    //                                         automatisch abziehen
    const answer = (o.breakAnswer && !breaks.length && !hasOpenBreak) ? o.breakAnswer : null;
    let breakConfirmedNone = false;
    let breakFromAnswerMinutes = 0;
    if (answer && answer.none) {
      breakConfirmedNone = true;
    } else if (answer && answer.minutes > 0) {
      breakFromAnswerMinutes = Math.round(answer.minutes);
      actualBreakMinutes = breakFromAnswerMinutes;
    }

    let grossMinutes = 0;
    if (clockInEvent) {
      const end = (status === STATUS.DONE && clockOutEvent) ? clockOutEvent.timestamp : referenceNow;
      grossMinutes = Math.max(0, Math.round((end - clockInEvent.timestamp) / 60000));
    }
    let netMinutes = Math.max(0, grossMinutes - actualBreakMinutes);
    let deductedBreakMinutes = actualBreakMinutes;
    let autoBreakMinutes = 0;
    let breakTooShort = false;
    if (o.autoBreak && !breakConfirmedNone && breakRuleFn && clockInEvent) {
      const extra = Math.max(0, o.extraBreakMinutes || 0);
      const extraNet = Math.max(0, o.extraNetMinutes || 0);
      // Pflichtpause hängt an der Nettozeit, die Nettozeit an der Pause ->
      // annähern; bei Pendeln gilt die kleinere (vorsichtige) Nettozeit.
      const deduct = (net) => Math.max(actualBreakMinutes, breakRuleFn(net + extraNet) - extra);
      let net = Math.max(0, grossMinutes - deduct(Math.max(0, grossMinutes - actualBreakMinutes)));
      for (let i = 0; i < 4; i += 1) {
        const nextNet = Math.max(0, grossMinutes - deduct(net));
        if (nextNet === net) break;
        net = Math.min(net, nextNet);
      }
      netMinutes = net;
      deductedBreakMinutes = grossMinutes - net;
      autoBreakMinutes = Math.max(0, deductedBreakMinutes - actualBreakMinutes);
      breakTooShort = actualBreakMinutes > 0 && autoBreakMinutes > 0;
    }

    // ZEITSTEMPEL: bezahlte Pause (z. B. freitags "die halbe Stunde wird
    // geschenkt"). Die Pause wird weiterhin genommen und gilt als Pause im
    // Sinne von § 4 ArbZG, zählt aber bis opts.paidBreakMinutes als
    // Arbeitszeit. Längere Pausen werden nur um den Überhang gekürzt.
    const paidBreak = Math.max(0, o.paidBreakMinutes || 0);
    let paidBreakCreditMinutes = 0;
    if (paidBreak && clockInEvent) {
      paidBreakCreditMinutes = Math.min(paidBreak, deductedBreakMinutes);
      netMinutes += paidBreakCreditMinutes;
      deductedBreakMinutes -= paidBreakCreditMinutes;
    }

    const requiredBreakMinutes = breakRuleFn ? breakRuleFn(targetNetMinutes) : 0;
    const remainingBreakMinutes = Math.max(0, requiredBreakMinutes - actualBreakMinutes);
    const remainingNetMinutes = Math.max(0, targetNetMinutes - netMinutes);

    // Voraussichtlicher Feierabend = Kommen + Soll-Netto + die GRÖSSERE der
    // beiden Pausen (erforderlich vs. tatsächlich genommen/laufend). Eine
    // länger genommene Pause verschiebt den Feierabend nach hinten, eine noch
    // nicht vollständig genommene zieht ihn nicht künstlich vor (Abschnitt 6).
    let projectedFeierabendMinutes = null;
    if (clockInEvent) {
      const effectivePause = Math.max(0, Math.max(requiredBreakMinutes, actualBreakMinutes) - paidBreak);
      projectedFeierabendMinutes = minutesOfDay(clockInEvent.timestamp) + targetNetMinutes + effectivePause;
    }

    return {
      status: status,
      clockInEvent: clockInEvent,
      clockOutEvent: clockOutEvent,
      breaks: breaks,
      hasOpenBreak: hasOpenBreak,
      openBreakStart: openBreakStart,
      grossMinutes: grossMinutes,
      netMinutes: netMinutes,
      actualBreakMinutes: actualBreakMinutes,
      requiredBreakMinutes: requiredBreakMinutes,
      remainingBreakMinutes: remainingBreakMinutes,
      remainingNetMinutes: remainingNetMinutes,
      projectedFeierabendMinutes: projectedFeierabendMinutes,
      // ZEITSTEMPEL: tatsächlich abgezogene Pause und ihr automatischer Anteil
      deductedBreakMinutes: deductedBreakMinutes,
      autoBreakMinutes: autoBreakMinutes,
      breakTooShort: breakTooShort,
      paidBreakCreditMinutes: paidBreakCreditMinutes,
      breakConfirmedNone: breakConfirmedNone,
      breakFromAnswerMinutes: breakFromAnswerMinutes,
      // Tagessaldo = Netto bisher minus Soll. Negativ solange das Soll noch
      // nicht erreicht ist, 0 bei genau erreichtem Soll, positiv bei Überstunden
      // - live und ohne Sonderfälle über den ganzen Tag hinweg konsistent.
      dailyBalanceMinutes: clockInEvent ? netMinutes - targetNetMinutes : null,
    };
  }

  // --- Event-CRUD mit Änderungsprotokoll (Abschnitt 10/11) ---
  // Alle Funktionen sind unveränderlich (geben ein neues WorkDay-Objekt
  // zurück, mutieren das übergebene nicht) - passend zum bestehenden
  // "ensureWeek()"-Klon-Muster in app.js.

  function cloneWorkDay(workDay) {
    const clone = {
      date: workDay.date,
      events: (workDay.events || []).map((e) => ({ id: e.id, type: e.type, timestamp: e.timestamp })),
      edits: (workDay.edits || []).map((e) => Object.assign({}, e)),
    };
    // Tagestyp (Version 2.1) mitnehmen, falls gesetzt - sonst gilt der
    // Standardtyp. Bewusst nur durchgereicht: punchclock.js kennt die
    // Bedeutung der Typen nicht, das entscheidet allein die Konfiguration.
    if (workDay.dayType) clone.dayType = workDay.dayType;
    // ZEITSTEMPEL: abweichende Schulzeiten an genau diesem Tag (Mischtag)
    if (workDay.school) clone.school = Object.assign({}, workDay.school);
    if (workDay.breakAnswer) clone.breakAnswer = Object.assign({}, workDay.breakAnswer);
    return clone;
  }

  function addEvent(workDay, type, timestamp) {
    const wd = cloneWorkDay(workDay);
    wd.events.push(createEvent(type, timestamp));
    return wd;
  }

  function editEventTimestamp(workDay, eventId, newTimestamp, editedAt) {
    const wd = cloneWorkDay(workDay);
    const ev = wd.events.filter((e) => e.id === eventId)[0];
    if (!ev) return wd;
    wd.edits.push({
      eventId: eventId,
      field: 'timestamp',
      oldValue: ev.timestamp,
      newValue: newTimestamp,
      editedAt: editedAt || Date.now(),
    });
    ev.timestamp = newTimestamp;
    return wd;
  }

  function removeEvent(workDay, eventId, editedAt) {
    const wd = cloneWorkDay(workDay);
    const ev = wd.events.filter((e) => e.id === eventId)[0];
    if (ev) {
      wd.edits.push({
        eventId: eventId,
        field: 'deleted',
        oldValue: ev.timestamp,
        newValue: null,
        editedAt: editedAt || Date.now(),
      });
    }
    wd.events = wd.events.filter((e) => e.id !== eventId);
    return wd;
  }

  return {
    TYPES: TYPES,
    TYPE_LABELS: TYPE_LABELS,
    STATUS: STATUS,
    dateKey: dateKey,
    todayKey: todayKey,
    sortEvents: sortEvents,
    createEvent: createEvent,
    emptyWorkDay: emptyWorkDay,
    statusForEvents: statusForEvents,
    statusLabel: statusLabel,
    allowedNextTypes: allowedNextTypes,
    validateStamp: validateStamp,
    validateSequence: validateSequence,
    minutesOfDay: minutesOfDay,
    deriveStats: deriveStats,
    cloneWorkDay: cloneWorkDay,
    addEvent: addEvent,
    editEventTimestamp: editEventTimestamp,
    removeEvent: removeEvent,
  };
});
