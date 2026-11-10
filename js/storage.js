/**
 * storage.js
 * Persistenz-Layer (localStorage). Kein Backend, alles lokal auf dem Gerät.
 * Von der Berechnungslogik (calculator.js) und der UI (app.js) getrennt,
 * damit später IndexedDB oder Sync ohne Umbau ergänzt werden kann.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Storage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ZEITSTEMPEL: eigener Schlüssel, damit niemals Daten mit Arturs
  // "Feierabend-Rechner" (feierabend-rechner:v1) verwechselt werden.
  const KEY = 'zeitstempel:v1';

  // Schema-Version rein informativ (Version 2.0 fügt nur neue Top-Level-Felder
  // hinzu, verändert keine bestehende Feldform -> der load()-Merge weiter unten
  // reicht als "Migration", kein Umbauschritt nötig).
  const SCHEMA_VERSION = 2;

  const DEFAULT_STATE = {
    schemaVersion: SCHEMA_VERSION,
    mode: 'forward', // 'forward' = Feierabend berechnen | 'backward' = Arbeitsbeginn berechnen
    startClock: '07:45',
    industrialInput: '8:00', // ZEITSTEMPEL: Minuten-Format H:MM
    desiredEndClock: '16:15',
    breakRuleId: 'legal',

    // Version 2.7: selbst angelegte Pausenregeln.
    // Aufbau: { id, label, steps: [{ fromMinutes, pauseMinutes }] }
    // Ausgewertet wird die höchste Stufe, deren fromMinutes die Nettozeit
    // nicht überschreitet - damit lassen sich betriebliche Regelungen wie
    // "ab 5 Std. 20 Minuten, ab 8 Std. 45 Minuten" abbilden.
    customBreakRules: [],
    theme: 'rose', // ZEITSTEMPEL: 'rose' (Standard) | 'design1' | 'design2' | 'design3'

    // Erinnerungen (Version 2.4). Die Auslöser kommen aus den ECHTEN
    // Stempelzeiten, nicht mehr aus der Planung im Rechner.
    notificationsEnabled: false, // Hauptschalter
    notifyLeadMinutes: '15', // Vorwarnung X Minuten vor Erreichen des Solls
    notifyBreakReminder: true, // Hinweis auf fehlende bzw. erfüllte Pause
    presets: [],
    history: [], // vorbereitet für Wochenübersicht (Abschnitt 20)

    // Überstunden-Rechner / Zeitkonto
    weeklyTargetIndustrial: '40:00', // feste Wochensoll-Vorgabe, in Einstellungen änderbar
    weeks: {}, // Schlüssel = ISO-Wochen-Key (z. B. "2026-W33") -> { days: { mo: '7,20', ... } }

    // Arbeitsweg (Hin-/Rückweg getrennt, in Minuten, als String für einfache Eingabe-Bindung)
    commuteToWorkMinutes: '',
    commuteFromWorkMinutes: '',

    // Zuhause: Ankunft wird automatisch aus Feierabend + Rückweg berechnet (siehe app.js).
    // desiredHomeArrival ist optional: wenn gesetzt, wird zusätzlich rückwärts gerechnet,
    // wann losgefahren werden muss und ob das mit dem geplanten Feierabend zeitlich passt.
    desiredHomeArrival: '',

    // Pufferzeit nach Feierabend (z. B. Umziehen, Weg zum Auto), rein informativ,
    // NICHT Teil der Arbeitszeit-Berechnung selbst.
    bufferMinutes: '',

    // Einfache Terminliste (z. B. "Gym"), ohne Kollisionsprüfung
    appointments: [], // { id, time: 'HH:MM', label: string }

    // Anzeigeeinheit für die Zeitkonto-Karte im Verlauf-Tab
    zeitkontoUnit: 'normal', // 'both' | 'normal' | 'industrie'

    // Version 2.8: Welche Wochentage sind Arbeitstage?
    // Daraus ergibt sich das Tagessoll (Wochensoll geteilt durch die Anzahl
    // der Arbeitstage) und damit das Zeitkonto auf TAGESbasis. Vorher wurde
    // pauschal das volle Wochensoll abgezogen, sobald eine Woche irgendeinen
    // Eintrag hatte - am Montagmorgen stand die Woche dadurch sofort mit
    // einem kompletten Wochensoll im Minus.
    workdays: { mo: true, di: true, mi: true, do: true, fr: true, sa: false, so: false },

    // Version 2.8: Morgen-Planer. Wie lange brauchst du zum Fertigmachen und
    // wie viel Luft willst du zusätzlich haben? Der Arbeitsweg kommt aus
    // commuteToWorkMinutes, damit es nur eine Quelle dafür gibt.
    morningPrepMinutes: '90',
    morningBufferMinutes: '0',

    // Version 2.9: Aktivitäten, die vor oder nach der Arbeit auf dem Weg
    // liegen (Gym, Einkaufen, Arzt). Einmal anlegen, danach je Tag
    // antippen. Aufbau:
    //   { id, label, icon, durationMinutes, travelHomeMinutes, travelWorkMinutes }
    // travelHomeMinutes = Weg zwischen Zuhause und dem Ort,
    // travelWorkMinutes = Weg zwischen dem Ort und der Arbeit.
    // Ab Werk leer - was jemand vor der Arbeit macht, kann die App nicht raten.
    activities: [],
    activityBeforeId: '', // '' = heute nichts vor der Arbeit
    activityAfterId: '',  // '' = heute nichts nach der Arbeit

    // Version 3.0: Dauer NUR für heute, ohne die gespeicherte Aktivität zu
    // ändern ("heute mache ich nur eine Stunde Gym"). Leer = gespeicherte
    // Dauer gilt. Format wie bei der Aktivität selbst: "1:00" oder "60".
    activityBeforeMinutesOverride: '',
    activityAfterMinutesOverride: '',

    // Version 3.0: Schlafbedarf für den Schlafrechner. Die Uhrzeit fürs Bett
    // ergibt sich aus der Aufstehzeit minus diesem Wert - bewusst ohne
    // Einschlafdauer, sonst wird aus einer simplen Rechnung eine Bastelei.
    sleepNeed: '8:00',

    // Version 3.0: Urlaubsanspruch pro Jahr als Grundwert.
    vacationDaysPerYear: '30',

    // Version 3.1: Abweichender Anspruch je Kalenderjahr plus Resturlaub aus
    // dem Vorjahr. Wer mitten im Jahr anfängt, hat anteilig weniger - das
    // kann die App nicht ausrechnen, weil sie das Eintrittsdatum nicht kennt.
    // Aufbau: { '2026': { days: '13', carry: '7' } }
    // Fehlt ein Jahr, gilt vacationDaysPerYear und kein Übertrag.
    // ZEITSTEMPEL: 2026 ist laut Fragebogen nicht relevant -> 0 statt 30.
    vacationYears: { '2026': { days: '0', carry: '' } },

    // Version 3.0 (durch 3.1 ersetzt, bleibt für die Migration stehen).
    schoolWeekdays: { mo: false, di: false, mi: false, do: false, fr: false, sa: false, so: false },
    schoolBlocks: [],

    // Version 3.1: Berufsschule als Regelliste. Zwei Arten:
    //   { id, label, kind: 'weekly', weekdays: {...}, interval: 1|2|3|4,
    //     anchor: 'YYYY-MM-DD', from: '', to: '' }
    //   { id, label, kind: 'block', from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    //
    // interval + anchor bilden "jeden zweiten Freitag" ab: gezählt werden die
    // Wochen zwischen dem Montag des Ankerdatums und dem Montag des geprüften
    // Tages. from/to grenzen eine Regel aufs Lehrjahr ein - im zweiten
    // Lehrjahr gilt ein anderer Rhythmus, ohne dass die alte Regel gelöscht
    // und damit die Vergangenheit verfälscht werden muss.
    // ZEITSTEMPEL: ab Werk ihre beiden Schultage (Fragebogen 08.11.2026).
    // Dienstag: > 5 Schulstunden, einmal pro Woche voll freigestellt
    //   -> fester Tag mit der durchschnittlichen täglichen Ausbildungszeit
    //      (§ 15 Abs. 1 Nr. 2, Abs. 2 Nr. 2 BBiG).
    // Mittwoch: Schule, danach Betrieb -> gemischter Tag; angerechnet werden
    //   Unterricht inkl. Pausen + notwendige Wegezeit + Zeit im Betrieb
    //   (§ 15 Abs. 2 Nr. 1 BBiG).
    schoolRules: [
      { id: 'rule-di', label: 'Berufsschule Dienstag', kind: 'weekly', weekdays: { di: true },
        interval: 1, anchor: '', from: '', to: '', dayType: 'berufsschule' },
      { id: 'rule-mi', label: 'Schule + Betrieb Mittwoch', kind: 'weekly', weekdays: { mi: true },
        interval: 1, anchor: '', from: '', to: '', dayType: 'schule-betrieb',
        schoolFrom: '07:55', schoolTo: '13:10', travelMinutes: '45' },
    ],

    // Version 3.1: Ferien. In diesen Zeiträumen fällt Berufsschule aus,
    // egal welche Regel sonst greifen würde.
    schoolBreaks: [],

    // Version 3.1: Bundesland für die mitgelieferten Ferientermine.
    // '' = keins gewählt. Nur Hessen ist fest eingebaut und überprüft;
    // alle anderen Länder tragen ihre Zeiträume von Hand ein.
    schoolState: 'he',

    // Version 2.9: Welche Karten im Tab "Planen" sind zugeklappt?
    // Schlüssel = data-card des <details>-Elements, Wert = true (zu).
    // Fehlt ein Schlüssel, gilt der im HTML gesetzte Ausgangszustand.
    collapsedCards: {},

    // Version 2.0: echte Stempeluhr. Schlüssel = Datum "YYYY-MM-DD" (lokale Zeit),
    // Wert = WorkDay { date, dayType?, events: [{id,type,timestamp}], edits: [...] }.
    // Rohereignisse sind die Quelle der Wahrheit; Anwesenheit/Pause/Netto/Saldo
    // werden daraus abgeleitet (siehe punchclock.js), nie direkt gespeichert.
    workDays: {},

    // ---- ZEITSTEMPEL-eigene Einstellungen ---------------------------------
    // Mindestpause automatisch abziehen, wenn keine oder zu wenig Pause
    // gestempelt wurde (ohne Stempeluhr im Betrieb das Hauptrisiko).
    autoBreak: true,
    // Mischtag "Schule + Betrieb": 'sum' = Schule + Weg + Betrieb (§ 15 BBiG),
    // 'flat' = Tag zählt pauschal wie ein voller Arbeitstag.
    mixedDayMode: 'sum',
    // Bezahlte Pause: an diesen Wochentagen zählt die Pause (bis zu
    // paidBreakMinutes) als Arbeitszeit. Bei ihr freitags 30 Min.
    // ("die halbe Stunde wird geschenkt", Angabe von Artur 10.11.2026).
    paidBreakDays: { fr: true },
    paidBreakMinutes: '30',
    // Pflichtpause auch im Betrieb abziehen, wenn am Mischtag keine gestempelt
    // ist? Standard nein: die Schulpausen zählen bereits als Pause.
    mixedBreakInBetrieb: false,
    // Zeitanzeige: 'hm' = Std:Min | 'industrie' = Dezimalstunden
    displayUnit: 'hm',
    // Bus und Bahn: feste Verbindungen statt einer pauschalen Wegdauer.
    // Jede Verbindung: { dep: 'HH:MM', arr: 'HH:MM' }
    transit: {
      walkHomeMinutes: '5',  // zuhause <-> Haltestelle (PLATZHALTER, noch nicht erfragt)
      walkWorkMinutes: '2',  // Haltestelle <-> Betrieb: ABGELEITET aus 7:43 an / 7:45 Beginn
      toWork: [{ dep: '07:09', arr: '07:43' }],
      fromWork: [],          // Rückfahrten noch nicht erfragt
      toSchool: [],          // noch nicht erfragt
      fromSchool: [],
    },

    // Version 2.1: Tagestypen.
    // WICHTIG: Hier ist bewusst NICHT fest verdrahtet, wie viel ein Typ zählt.
    // - mode 'actual': es zählt die tatsächlich erfasste Zeit (normaler Arbeitstag).
    // - mode 'fixed':  es zählt die unter creditIndustrial eingestellte Gutschrift
    //                  in Industriestunden. LEER bedeutet seit Version 2.5:
    //                  es gilt die Standard-Nettoarbeitszeit des Nutzers
    //                  (Berufsschule, Urlaub, Krank und Feiertag zählen damit
    //                  ohne jede Einstellung als normaler Arbeitstag).
    //                  Nur 'frei' steht ab Werk ausdrücklich auf 0,00.
    // Die Werte sind in den Einstellungen frei änderbar.
    dayTypes: [
      { id: 'arbeit', label: 'Arbeit', icon: '💼', mode: 'actual', creditIndustrial: '' },
      { id: 'berufsschule', label: 'Berufsschule', icon: '🎓', mode: 'fixed', creditIndustrial: '' },
      // ZEITSTEMPEL: Schule, danach Betrieb. Wie 'Arbeit' gestempelt, plus
      // Schulzeit und Weg als Gutschrift (siehe app.js mixedContextFor).
      { id: 'schule-betrieb', label: 'Schule + Betrieb', icon: '🏫', mode: 'actual', mixed: true, creditIndustrial: '' },
      { id: 'urlaub', label: 'Urlaub', icon: '🏖', mode: 'fixed', creditIndustrial: '' },
      { id: 'krank', label: 'Krank', icon: '🤒', mode: 'fixed', creditIndustrial: '' },
      { id: 'feiertag', label: 'Feiertag', icon: '🎌', mode: 'fixed', creditIndustrial: '' },
      { id: 'frei', label: 'Frei', icon: '🌙', mode: 'fixed', creditIndustrial: '0:00' },
      // Version 3.1: Wochenende als eigener Typ. Wie "Frei" ohne Soll, aber
      // getrennt zählbar - in der Statistik ist der Unterschied zwischen
      // "normales Wochenende" und "eigens freigenommen" durchaus relevant.
      { id: 'wochenende', label: 'Wochenende', icon: '🛋', mode: 'fixed', creditIndustrial: '0:00' },
    ],
  };

  function isStorageAvailable() {
    try {
      const t = '__fr_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    if (!isStorageAvailable()) return Object.assign({}, DEFAULT_STATE);
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      // Merge, damit neue Felder aus späteren Versionen nicht fehlen
      return Object.assign({}, DEFAULT_STATE, parsed);
    } catch (e) {
      console.warn('Feierabend-Rechner: Konnte gespeicherte Daten nicht lesen, nutze Standard.', e);
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function save(state) {
    if (!isStorageAvailable()) return false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('Feierabend-Rechner: Konnte Daten nicht speichern.', e);
      return false;
    }
  }

  function update(patch) {
    const current = load();
    const next = Object.assign({}, current, patch);
    save(next);
    return next;
  }

  function addHistoryEntry(entry) {
    const current = load();
    const history = current.history.slice(-27); // max ~4 Wochen vorhalten
    history.push(entry);
    return update({ history });
  }

  function reset() {
    save(Object.assign({}, DEFAULT_STATE));
    return Object.assign({}, DEFAULT_STATE);
  }

  return {
    DEFAULT_STATE,
    isStorageAvailable,
    load,
    save,
    update,
    addHistoryEntry,
    reset,
  };
});
