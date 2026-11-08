/**
 * ferien.js
 * Fest eingebaute Schulferientermine (Version 3.1).
 *
 * WARUM FEST EINGEBAUT UND NICHT AUS DEM NETZ?
 * Die App ist bewusst offline und ohne Konto gebaut. Ferientermine aus dem
 * Internet zu holen würde eine Netzverbindung erzwingen und die App von
 * einem fremden Dienst abhängig machen. Die Termine stehen dagegen Jahre
 * im Voraus fest - sie lassen sich also genauso gut mitliefern.
 *
 * QUELLE UND STAND
 * Erfasst am 22.09.2026 von schulferien.org (Hessen-Übersicht), quergeprüft
 * für die Sommerferien 2026 über eine zweite Suche, weil eine erste Quelle
 * dort abweichende Termine nannte (13.07.-21.08. statt 29.06.-07.08.);
 * die zweite Prüfung bestätigte 29.06.-07.08.2026.
 *
 * NUR HESSEN
 * Bewusst nur ein Bundesland: Termine, die ich nicht geprüft habe, wären
 * schlimmer als gar keine - falsche Ferien würden echte Berufsschultage
 * unterdrücken und damit das Zeitkonto verfälschen. Alle anderen
 * Bundesländer tragen ihre Zeiträume von Hand ein; das geht genauso gut.
 *
 * Hessen hat weder Winter- noch Pfingstferien.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Ferien = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STATES = [
    { id: 'he', label: 'Hessen' },
  ];

  // Stand der Daten – wird in der Oberfläche angezeigt, damit erkennbar ist,
  // wie alt die mitgelieferten Termine sind.
  const DATA_AS_OF = '22.09.2026';

  const BREAKS = {
    he: [
      { label: 'Weihnachtsferien 2025/26', from: '2025-12-22', to: '2026-01-10' },
      { label: 'Osterferien 2026',         from: '2026-03-30', to: '2026-04-10' },
      { label: 'Sommerferien 2026',        from: '2026-06-29', to: '2026-08-07' },
      { label: 'Herbstferien 2026',        from: '2026-10-05', to: '2026-10-17' },
      { label: 'Weihnachtsferien 2026/27', from: '2026-12-23', to: '2027-01-12' },
      { label: 'Osterferien 2027',         from: '2027-03-22', to: '2027-04-02' },
      { label: 'Sommerferien 2027',        from: '2027-06-28', to: '2027-08-06' },
      { label: 'Herbstferien 2027',        from: '2027-10-04', to: '2027-10-16' },
      { label: 'Weihnachtsferien 2027/28', from: '2027-12-23', to: '2028-01-11' },
      { label: 'Osterferien 2028',         from: '2028-04-03', to: '2028-04-14' },
      { label: 'Sommerferien 2028',        from: '2028-07-03', to: '2028-08-11' },
      { label: 'Herbstferien 2028',        from: '2028-10-09', to: '2028-10-20' },
      { label: 'Weihnachtsferien 2028/29', from: '2028-12-27', to: '2029-01-12' },
      { label: 'Osterferien 2029',         from: '2029-03-29', to: '2029-04-13' },
      { label: 'Sommerferien 2029',        from: '2029-07-16', to: '2029-08-24' },
      { label: 'Herbstferien 2029',        from: '2029-10-15', to: '2029-10-26' },
      { label: 'Weihnachtsferien 2029/30', from: '2029-12-24', to: '2030-01-11' },
    ],
  };

  function stateLabel(id) {
    const found = STATES.filter((s) => s.id === id)[0];
    return found ? found.label : '';
  }

  /** Ferienzeiträume eines Bundeslands, kopiert und mit eigener id versehen. */
  function breaksFor(stateId) {
    const list = BREAKS[stateId] || [];
    return list.map((b, i) => ({
      id: 'fer-' + stateId + '-' + i,
      label: b.label,
      from: b.from,
      to: b.to,
      source: stateId, // erkennbar mitgeliefert, nicht selbst eingetragen
    }));
  }

  return { STATES, DATA_AS_OF, stateLabel, breaksFor };
});
