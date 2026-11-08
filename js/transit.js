/**
 * transit.js – ZEITSTEMPEL: Bus und Bahn nach Fahrplan (reine Logik).
 *
 * Arturs App kennt den Arbeitsweg nur als Dauer ("20 Min."). Wer mit Bus und
 * Bahn fährt, braucht stattdessen "welche Verbindung": morgens die späteste,
 * mit der man noch rechtzeitig ankommt, abends die erste nach Feierabend.
 * Mit Gleitzeit kommt dazu die Frage "lohnt es sich, länger zu bleiben?":
 * Statt 25 Min. an der Haltestelle zu warten, kann man die Zeit arbeiten.
 *
 * Kein Fahrplan aus dem Netz: Die Verbindungen trägt sie selbst ein
 * (offline, kein Konto, keine Kosten – wie in Arturs App).
 *
 * Alle Zeiten sind Minuten seit Mitternacht. Kein DOM, kein Speicher.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Transit = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function clockToMinutes(str) {
    const m = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(String(str || ''));
    if (!m) return null;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  }

  /**
   * Verbindungen aus Text oder Liste lesen.
   * Text: "07:09-07:43, 16:22-16:56" (Komma, Semikolon oder Zeilenumbruch;
   * Bindestrich, Pfeil oder Leerzeichen zwischen Abfahrt und Ankunft).
   * Liste: [{ dep: '07:09', arr: '07:43' }]
   * Ergebnis: [{ dep, arr }] in Minuten, nach Abfahrt sortiert. Unlesbares
   * wird übersprungen und in "invalid" gemeldet.
   */
  function parseConnections(input) {
    const out = [];
    const invalid = [];
    let items = [];
    if (Array.isArray(input)) {
      items = input.map((c) => (c ? [c.dep, c.arr] : [null, null]));
    } else {
      items = String(input || '').split(/[,;\n]+/).map((part) => part.trim()).filter(Boolean)
        .map((part) => {
          const times = part.match(/\d{1,2}[:.]\d{2}/g) || [];
          return times.length === 2 ? times : [part, null];
        });
    }
    items.forEach((pair) => {
      const dep = clockToMinutes(pair[0]);
      const arr = clockToMinutes(pair[1]);
      if (dep === null || arr === null || arr < dep) {
        if (pair[0] || pair[1]) invalid.push(String(pair[0] || '') + (pair[1] ? '-' + pair[1] : ''));
        return;
      }
      out.push({ dep, arr });
    });
    out.sort((a, b) => a.dep - b.dep);
    return { connections: out, invalid };
  }

  /** Zurück in Text, z. B. für das Eingabefeld. */
  function formatConnections(list) {
    const pad = (n) => String(n).padStart(2, '0');
    const clock = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
    return (list || []).map((c) => clock(c.dep) + '-' + clock(c.arr)).join(', ');
  }

  /**
   * Morgens: späteste Verbindung, mit der man bis targetMinutes da ist.
   * walkFrom = Fußweg zuhause -> Haltestelle, walkTo = Haltestelle -> Ziel.
   * Ergebnis null, wenn keine Verbindung passt.
   */
  function planMorningRide(connections, targetMinutes, walkFrom, walkTo) {
    const wf = Math.max(0, walkFrom || 0);
    const wt = Math.max(0, walkTo || 0);
    const fitting = (connections || []).filter((c) => c.arr + wt <= targetMinutes);
    if (!fitting.length) return null;
    const ride = fitting.reduce((best, c) => (c.arr > best.arr || (c.arr === best.arr && c.dep > best.dep) ? c : best));
    return {
      dep: ride.dep,
      arr: ride.arr,
      leaveMinutes: ride.dep - wf,      // Haus verlassen
      atTargetMinutes: ride.arr + wt,   // am Ziel
      spareMinutes: targetMinutes - (ride.arr + wt),
    };
  }

  /**
   * Abends: erste Verbindung nach Feierabend und – wegen Gleitzeit – die
   * Alternative "bis zur nächsten Verbindung weiterarbeiten".
   * Ergebnis: { next, later } oder null (keine Verbindung mehr).
   *   next:  { dep, arr, leaveWorkMinutes, waitMinutes, homeMinutes }
   *   later: { dep, arr, stayUntilMinutes, extraMinutes, homeMinutes } | null
   * later wird nur gezeigt, wenn man dafür höchstens maxExtra Minuten
   * länger bleibt (Standard 60) – sonst ist es kein sinnvoller Vorschlag.
   */
  function planEveningRide(connections, endMinutes, walkFrom, walkHome, maxExtra) {
    const wf = Math.max(0, walkFrom || 0);
    const wh = Math.max(0, walkHome || 0);
    const limit = Number.isFinite(maxExtra) ? maxExtra : 60;
    const after = (connections || []).filter((c) => c.dep - wf >= endMinutes);
    if (!after.length) return null;
    const first = after[0];
    const next = {
      dep: first.dep,
      arr: first.arr,
      leaveWorkMinutes: endMinutes,
      waitMinutes: first.dep - wf - endMinutes,
      homeMinutes: first.arr + wh,
    };
    let later = null;
    const second = after[1];
    if (second) {
      const stayUntil = second.dep - wf;
      const extra = stayUntil - endMinutes;
      if (extra > 0 && extra <= limit) {
        later = {
          dep: second.dep,
          arr: second.arr,
          stayUntilMinutes: stayUntil,
          extraMinutes: extra,
          homeMinutes: second.arr + wh,
        };
      }
    }
    return { next, later };
  }

  return {
    clockToMinutes,
    parseConnections,
    formatConnections,
    planMorningRide,
    planEveningRide,
  };
});
