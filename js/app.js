/**
 * app.js
 * UI-Bindung: verbindet calculator.js (reine Logik) und storage.js (Persistenz)
 * mit dem DOM. Enthält keine Berechnungslogik selbst.
 */
(function () {
  'use strict';

  const C = window.Calculator;
  const S = window.Storage;
  const O = window.Overtime;
  const P = window.PunchClock;
  const F = window.Ferien;
  const T = window.Transit; // ZEITSTEMPEL: Bus und Bahn

  // ---- DOM refs ---------------------------------------------------------
  const el = (id) => document.getElementById(id);

  const settingsBtn = el('settingsBtn');
  const settingsDialog = el('settingsDialog');
  const themePicker = el('themePicker');
  const defaultIndustrialInput = el('defaultIndustrialInput');
  const notificationsToggle = el('notificationsToggle');
  const resetDataBtn = el('resetDataBtn');

  const modeForwardBtn = el('modeForwardBtn');
  const modeBackwardBtn = el('modeBackwardBtn');

  const startTimeInput = el('startTimeInput');
  const nowBtn = el('nowBtn');
  const startQuickChips = el('startQuickChips');
  const desiredEndInput = el('desiredEndInput');
  const endQuickChips = el('endQuickChips');

  const industrialInput = el('industrialInput');
  const industrialHint = el('industrialHint');
  const decBtn = el('decBtn');
  const incBtn = el('incBtn');

  const heroLabel = el('heroLabel');
  const heroTime = el('heroTime');
  const countdownText = el('countdownText');
  const countdownPill = el('countdownPill');

  const progressFill = el('progressFill');
  const progressPercent = el('progressPercent');
  const progressDetail = el('progressDetail');
  const progressCard = document.querySelector('.progress-card');

  const pauseStatusDot = el('pauseStatusDot');
  const pauseStatusText = el('pauseStatusText');

  const bdStart = el('bdStart');
  const bdIndustrial = el('bdIndustrial');
  const bdNormal = el('bdNormal');
  const bdPause = el('bdPause');
  const bdTotal = el('bdTotal');
  const bdEndLabel = el('bdEndLabel');
  const bdEnd = el('bdEnd');

  const presetList = el('presetList');
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // ---- Zeitkonto / Wochenübersicht DOM refs --------------------------------
  const zeitkontoValueEl = el('zeitkontoValue');
  const zeitkontoNormalEl = el('zeitkontoNormal');
  const weekPrevBtn = el('weekPrevBtn');
  const weekNextBtn = el('weekNextBtn');
  const weekTodayBtn = el('weekTodayBtn');
  const weekRangeLabelEl = el('weekRangeLabel');
  const weekDaysEl = el('weekDays');
  const weekTargetEl = el('weekTarget');
  const weekSumEl = el('weekSum');
  const weekDiffEl = el('weekDiff');
  const weeklyTargetInput = el('weeklyTargetInput');

  // ---- Arbeitsweg / Zuhause / Termine DOM refs -----------------------------
  const commuteToWorkInput = el('commuteToWorkInput');
  const commuteFromWorkInput = el('commuteFromWorkInput');
  const bdCommuteRow = el('bdCommuteRow');
  const bdCommute = el('bdCommute');
  const bdCommuteLabel = el('bdCommuteLabel');
  const homeArrivalAuto = el('homeArrivalAuto');
  const homeHint = el('homeHint');
  const desiredHomeArrivalInput = el('desiredHomeArrivalInput');
  const homeReverseResult = el('homeReverseResult');
  const appointmentList = el('appointmentList');
  const appointmentEmpty = el('appointmentEmpty');
  const appointmentForm = el('appointmentForm');
  const appointmentTimeInput = el('appointmentTimeInput');
  const appointmentLabelInput = el('appointmentLabelInput');
  const appointmentNextGap = el('appointmentNextGap');

  // ---- Puffer / Was-wäre-wenn / Zeitkonto-Umschalter / Export DOM refs -----
  const bufferInput = el('bufferInput');
  const bdBufferRow = el('bdBufferRow');
  const bdBuffer = el('bdBuffer');
  const wwennStartSlider = el('wwennStartSlider');
  const wwennStartValue = el('wwennStartValue');
  const wwennResult = el('wwennResult');
  const zeitkontoUnitToggle = el('zeitkontoUnitToggle');
  const csvExportBtn = el('csvExportBtn');
  const pdfExportBtn = el('pdfExportBtn');
  const presetForm = el('presetForm');
  const presetNameInput = el('presetNameInput');

  // ---- Stempeluhr (Status-Card) DOM refs -----------------------------------
  const statusCard = el('statusCard');
  const statusDot = el('statusDot');
  const statusBadgeText = el('statusBadgeText');
  const statusSince = el('statusSince');
  const statusMainRow = el('statusMainRow');
  const statusWorked = el('statusWorked');
  const statusRemainingWrap = el('statusRemainingWrap');
  const statusRemainingLabel = el('statusRemainingLabel');
  const statusRemaining = el('statusRemaining');
  const statusFeierabendRow = el('statusFeierabendRow');
  const statusFeierabendTime = el('statusFeierabendTime');
  const statusBalance = el('statusBalance');
  const statusPauseHint = el('statusPauseHint');
  const statusEvents = el('statusEvents');
  const statusActions = el('statusActions');
  const statusError = el('statusError');
  const statusDoneHint = el('statusDoneHint');
  const btnKommen = el('btnKommen');
  const btnPauseStart = el('btnPauseStart');
  const btnPauseEnd = el('btnPauseEnd');
  const btnGehen = el('btnGehen');

  // ---- Tages-Detail-Dialog (Verlauf) DOM refs ------------------------------
  const dayDetailDialog = el('dayDetailDialog');
  const dayDetailTitle = el('dayDetailTitle');
  const dayDetailSummary = el('dayDetailSummary');
  const dayDetailEvents = el('dayDetailEvents');
  const dayDetailError = el('dayDetailError');
  const dayDetailAddBtn = el('dayDetailAddBtn');
  const dayDetailTypes = el('dayDetailTypes');
  const dayDetailTypeHint = el('dayDetailTypeHint');
  let dayDetailDateKey = null; // welcher Tag ist gerade im Dialog geöffnet

  // ---- Zeitkonto-Kacheln / Monatsübersicht / Einstellungen (V2.1) ---------
  const zkTodayValue = el('zkTodayValue');
  const zkTodayNormal = el('zkTodayNormal');
  const zkTodayNote = el('zkTodayNote');
  const zkWeekValue = el('zkWeekValue');
  const zkWeekNormal = el('zkWeekNormal');
  const zkMonthValue = el('zkMonthValue');
  const zkMonthNormal = el('zkMonthNormal');

  const monthPrevBtn = el('monthPrevBtn');
  const monthNextBtn = el('monthNextBtn');
  const monthTodayBtn = el('monthTodayBtn');
  const monthRangeLabelEl = el('monthRangeLabel');
  const monthWeeksEl = el('monthWeeks');
  const monthTargetEl = el('monthTarget');
  const monthSumEl = el('monthSum');
  const monthDiffEl = el('monthDiff');

  const morningStartInput = el('morningStartInput');
  const morningPrepInput = el('morningPrepInput');
  const morningBufferInput = el('morningBufferInput');
  const morningWakeTime = el('morningWakeTime');
  const morningBreakdown = el('morningBreakdown');
  const morningHint = el('morningHint');
  const workdayPicker = el('workdayPicker');
  const workdayHint = el('workdayHint');

  // Aktivitäten vor/nach der Arbeit (Version 2.9)
  const activityBeforeChips = el('activityBeforeChips');
  const activityAfterChips = el('activityAfterChips');
  const activityBeforePlan = el('activityBeforePlan');
  const activityAfterPlan = el('activityAfterPlan');
  const activityList = el('activityList');
  const activityEmpty = el('activityEmpty');
  const activityForm = el('activityForm');
  const activityLabelInput = el('activityLabelInput');
  const activityDurationInput = el('activityDurationInput');
  const activityTravelHomeInput = el('activityTravelHomeInput');
  const activityTravelWorkInput = el('activityTravelWorkInput');
  const activityStatus = el('activityStatus');
  const activityDurationEcho = el('activityDurationEcho');
  const sleepNeedEcho = el('sleepNeedEcho');
  const activitySaveBtn = el('activitySaveBtn');
  const activityCancelBtn = el('activityCancelBtn');
  const activityManage = el('activityManage');
  const activityBeforeOverride = el('activityBeforeOverride');
  const activityAfterOverride = el('activityAfterOverride');
  const activityBeforeOverrideInput = el('activityBeforeOverrideInput');
  const activityAfterOverrideInput = el('activityAfterOverrideInput');

  // Schlafrechner (Version 3.0)
  const sleepBedTime = el('sleepBedTime');
  const sleepHint = el('sleepHint');
  const sleepNowLine = el('sleepNowLine');
  const sleepNeedInput = el('sleepNeedInput');

  // Tab "Mein Tag" (Version 3.0)
  const myDayTimeline = el('myDayTimeline');
  const myDayDate = el('myDayDate');
  const myDayNow = el('myDayNow');

  // Urlaubskonto + Wochenprognose (Version 3.0)
  const vacationUsed = el('vacationUsed');
  const vacationRemaining = el('vacationRemaining');
  const vacationHint = el('vacationHint');
  const vacationPerYearInput = el('vacationPerYearInput');
  const forecastDone = el('forecastDone');
  const forecastOpen = el('forecastOpen');
  const forecastPerDay = el('forecastPerDay');
  const forecastHint = el('forecastHint');

  // Berufsschul-Regeln und Ferien (Version 3.1)
  const schoolWeekdayPicker = el('schoolWeekdayPicker');
  const schoolRuleList_el = el('schoolRuleList');
  const schoolRuleEmpty = el('schoolRuleEmpty');
  const schoolRuleKind = el('schoolRuleKind');
  const schoolRuleLabel = el('schoolRuleLabel');
  const schoolRuleInterval = el('schoolRuleInterval');
  const schoolRuleAnchor = el('schoolRuleAnchor');
  const schoolRuleFrom = el('schoolRuleFrom');
  const schoolRuleTo = el('schoolRuleTo');
  const schoolRuleAddBtn = el('schoolRuleAddBtn');
  const schoolWeeklyFields = el('schoolWeeklyFields');
  const schoolBlockFields = el('schoolBlockFields');
  const schoolAnchorField = el('schoolAnchorField');
  const schoolBlockFrom = el('schoolBlockFrom');
  const schoolBlockTo = el('schoolBlockTo');
  const schoolBreakList = el('schoolBreakList');
  const schoolBreakLabel = el('schoolBreakLabel');
  const schoolBreakFrom = el('schoolBreakFrom');
  const schoolBreakTo = el('schoolBreakTo');
  const schoolBreakAddBtn = el('schoolBreakAddBtn');
  const schoolStateSelect = el('schoolStateSelect');
  const schoolStateHint = el('schoolStateHint');
  const schoolStatus = el('schoolStatus');
  const schoolHint = el('schoolHint');

  // Urlaubsjahr (Version 3.1)
  const vacationYearLabel = el('vacationYearLabel');
  const vacationPrevBtn = el('vacationPrevBtn');
  const vacationNextBtn = el('vacationNextBtn');
  const vacationWarning = el('vacationWarning');
  const vacationYearSettingLabel = el('vacationYearSettingLabel');
  const vacationDaysInput = el('vacationDaysInput');
  const vacationCarryInput = el('vacationCarryInput');
  const vacationYearSaveBtn = el('vacationYearSaveBtn');

  // Kalender-Tab (Version 3.1)
  const calendarGrid = el('calendarGrid');
  const calendarMonthLabel = el('calendarMonthLabel');
  const calendarPrevBtn = el('calendarPrevBtn');
  const calendarNextBtn = el('calendarNextBtn');
  const calendarTodayBtn = el('calendarTodayBtn');
  const calendarSelection = el('calendarSelection');
  const calendarTypeChips = el('calendarTypeChips');
  const calendarClearBtn = el('calendarClearBtn');
  const calendarStatus = el('calendarStatus');

  // Mein Tag: heute/morgen (Version 3.1)
  const myDayToggle = el('myDayToggle');

  const zeitkontoCarry = el('zeitkontoCarry');
  const monthViewToggle = el('monthViewToggle');
  const monthCalendarEl = el('monthCalendar');
  const monthLegend = el('monthLegend');

  const ruleNameInput = el('ruleNameInput');
  const ruleFrom1 = el('ruleFrom1');
  const rulePause1 = el('rulePause1');
  const ruleFrom2 = el('ruleFrom2');
  const rulePause2 = el('rulePause2');
  const ruleFrom3 = el('ruleFrom3');
  const rulePause3 = el('rulePause3');
  const ruleSaveBtn = el('ruleSaveBtn');
  const ruleStatus = el('ruleStatus');
  const ruleList = el('ruleList');

  const breakRuleSelect = el('breakRuleSelect');
  const settingsUnitToggle = el('settingsUnitToggle');
  const dayTypeSettings = el('dayTypeSettings');
  const settingsCsvBtn = el('settingsCsvBtn');

  // ---- Backup / Statistik / Änderungsverlauf (Version 2.2) ----------------
  const backupExportBtn = el('backupExportBtn');
  const backupImportBtn = el('backupImportBtn');
  const backupFileInput = el('backupFileInput');
  const backupTextBlock = el('backupTextBlock');
  const backupTextarea = el('backupTextarea');
  const backupCopyBtn = el('backupCopyBtn');
  const backupTextImportBtn = el('backupTextImportBtn');
  const backupStatus = el('backupStatus');

  const dayDetailHistory = el('dayDetailHistory');
  const dayDetailHistoryList = el('dayDetailHistoryList');

  // ---- Erinnerungen (Version 2.4) ----------------------------------------
  const reminderBanner = el('reminderBanner');
  const reminderTitle = el('reminderTitle');
  const reminderBody = el('reminderBody');
  const reminderClose = el('reminderClose');
  const notifyLeadSelect = el('notifyLeadSelect');
  const notifyBreakToggle = el('notifyBreakToggle');
  const notifySupportHint = el('notifySupportHint');
  // Merkt pro Kalendertag, welche Erinnerung schon raus ist – verhindert, dass
  // der Sekundentakt dieselbe Meldung wieder und wieder auslöst.
  const firedReminders = { date: null, types: {} };

  const statRangeToggle = el('statRangeToggle');
  const statList = el('statList');
  const statTypes = el('statTypes');
  const statHint = el('statHint');
  let statRange = 'month'; // 'month' | 'all'

  // ---- State --------------------------------------------------------------
  let state = S.load();
  let mode = state.mode || 'forward';
  let lastValidCentihours = safeToCentihours(state.industrialInput, 480); // ZEITSTEMPEL: Minuten
  let notifiedEnd = null; // verhindert Mehrfach-Benachrichtigung am selben Tag
  let notifiedSoon = null;
  let currentWeekMonday = O.getMonday(new Date());
  let currentMonthDate = new Date(); // irgendein Tag im gerade angezeigten Monat

  // Zuletzt vom Rechner ermittelter Feierabend in Minuten seit Mitternacht.
  // Die Abendplanung (Aktivität nach der Arbeit) hängt daran, damit sie
  // dieselbe Zeit benutzt wie die Hero-Karte und sich nicht davon löst.
  let lastPlannedEndMinutes = 0;

  // Welche Aktivität wird gerade im Formular bearbeitet? null = neue anlegen.
  // Bewusst NICHT gespeichert: ein halb fertiger Bearbeitungsvorgang soll
  // einen App-Neustart nicht überleben.
  let editingActivityId = null;

  // Version 3.1
  let vacationYear = String(new Date().getFullYear()); // im Urlaubskonto geblättertes Jahr
  let schoolFormWeekdays = { mo: false, di: false, mi: false, do: false, fr: false, sa: false, so: false };
  let myDayOffset = 0;              // 0 = heute, 1 = morgen
  let calendarMonthDate = new Date(); // im Kalender-Tab angezeigter Monat
  let calendarFrom = null;          // erster angetippter Tag einer Auswahl
  let calendarTo = null;            // zweiter angetippter Tag

  // Schnelle Tageserfassung im Verlauf (Version 2.5):
  // nur Kommen und Gehen eintragen, die Pause rechnet die App selbst.
  // Das optionale Pausenfeld ist nur für Tage gedacht, an denen die Pause
  // bewusst von der Regel abweicht – leer lassen heißt "automatisch".
  const PUNCH_FIELDS = [
    { key: 'start', label: 'Kommen', type: 'time' },
    { key: 'end', label: 'Gehen', type: 'time' },
    { key: 'pause', label: 'Pause (Min., optional)', type: 'number' },
  ];

  function safeToCentihours(value, fallback) {
    try {
      return C.toCentihours(value);
    } catch (e) {
      return fallback;
    }
  }

  // ---- Init ---------------------------------------------------------------
  function init() {
    document.body.setAttribute('data-theme', state.theme || 'design3');
    document.body.setAttribute('data-mode', mode);

    startTimeInput.value = state.startClock || '07:00';
    desiredEndInput.value = state.desiredEndClock || '16:00';
    industrialInput.value = state.industrialInput || '7,20';
    defaultIndustrialInput.value = state.industrialInput || '7,20';
    weeklyTargetInput.value = state.weeklyTargetIndustrial || '36,00';
    notificationsToggle.checked = !!state.notificationsEnabled;
    notifyLeadSelect.value = String(state.notifyLeadMinutes || '15');
    morningStartInput.value = state.startClock || '07:00';
    morningPrepInput.value = state.morningPrepMinutes || '';
    morningBufferInput.value = state.morningBufferMinutes || '';
    sleepNeedInput.value = state.sleepNeed || '';
    renderDurationEcho(sleepNeedInput, sleepNeedEcho);
    vacationPerYearInput.value = state.vacationDaysPerYear || '';
    notifyBreakToggle.checked = state.notifyBreakReminder !== false;

    commuteToWorkInput.value = state.commuteToWorkMinutes || '';
    commuteFromWorkInput.value = state.commuteFromWorkMinutes || '';
    desiredHomeArrivalInput.value = state.desiredHomeArrival || '';
    bufferInput.value = state.bufferMinutes || '';

    // Was-wäre-wenn-Slider startet beim aktuellen Arbeitsbeginn (auf den 5-Min.-Raster
    // des Sliders gerundet), damit die Simulation sinnvoll vom Ist-Zustand ausgeht.
    const startMinutesForSlider = safeInt(C.clockToMinutes(startTimeInput.value || '07:00'), 420);
    wwennStartSlider.value = String(clamp(round5(startMinutesForSlider), 300, 660));

    setActiveModeButtons();
    setActiveThemeRadio();
    setActiveQuickChip(startQuickChips, startTimeInput.value);
    setActiveQuickChip(endQuickChips, desiredEndInput.value);
    registerExtraBreakRules();
    renderBreakRuleOptions();
    renderCustomRuleList();
    renderDayTypeSettings();
    renderNotifySupportHint();
    renderWorkdayPicker();
    // Reihenfolge: erst die Karten in ihren gemerkten Zustand bringen, DANN
    // Listener binden - sonst würde das Wiederherstellen selbst als
    // Nutzeraktion durchgehen und den Zustand gleich wieder überschreiben.
    applyCollapsedCards();
    renderActivities();
    renderMorning();
    renderSleep();
    migrateSchoolRules();
    syncSchoolRuleForm();
    renderSchoolSettings();
    renderCalendarTab();
    setActiveZeitkontoUnitButtons();
    renderPresets();
    bindEvents();
    render();
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
    renderAppointments();
    renderStatus();
    renderVacation();
    renderForecast();
    renderMyDay();
    zsInit(); // ZEITSTEMPEL

    setInterval(render, 1000 * 15); // Live-Countdown (Planungsrechner) alle 15s aktualisieren
    // "Mein Tag" und der Schlafrechner zeigen beide die aktuelle Uhrzeit bzw.
    // die Jetzt-Markierung - einmal pro Minute reicht dafür völlig.
    setInterval(() => { renderMyDay(); renderSleep(); renderPlan(); }, 1000 * 60);
    // Die Stempeluhr-Status-Card tickt schneller (Abschnitt 3: "live", ohne Reload)
    // und erkennt nebenbei einen Tageswechsel über Mitternacht (Abschnitt 12).
    setInterval(renderStatus, 1000);
  }

  function safeInt(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }
  function round5(n) { return Math.round(n / 5) * 5; }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function bindEvents() {
    settingsBtn.addEventListener('click', () => settingsDialog.showModal());

    modeForwardBtn.addEventListener('click', () => setMode('forward'));
    modeBackwardBtn.addEventListener('click', () => setMode('backward'));

    startTimeInput.addEventListener('input', () => {
      setActiveQuickChip(startQuickChips, startTimeInput.value);
      persist({ startClock: startTimeInput.value });
      morningStartInput.value = startTimeInput.value;
      render();
      renderMorning();
    });
    desiredEndInput.addEventListener('input', () => {
      setActiveQuickChip(endQuickChips, desiredEndInput.value);
      persist({ desiredEndClock: desiredEndInput.value });
      render();
    });

    nowBtn.addEventListener('click', () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      startTimeInput.value = hh + ':' + mm;
      setActiveQuickChip(startQuickChips, startTimeInput.value);
      persist({ startClock: startTimeInput.value });
      morningStartInput.value = startTimeInput.value;
      render();
      renderMorning();
    });

    startQuickChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      startTimeInput.value = btn.dataset.time;
      setActiveQuickChip(startQuickChips, startTimeInput.value);
      persist({ startClock: startTimeInput.value });
      morningStartInput.value = startTimeInput.value;
      render();
      renderMorning();
    });
    endQuickChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      desiredEndInput.value = btn.dataset.time;
      setActiveQuickChip(endQuickChips, desiredEndInput.value);
      persist({ desiredEndClock: desiredEndInput.value });
      render();
    });

    industrialInput.addEventListener('input', () => {
      try {
        lastValidCentihours = C.toCentihours(industrialInput.value);
        persist({ industrialInput: industrialInput.value });
        render();
      } catch (e) {
        // Während der Eingabe (z. B. "7,") einfach nichts neu berechnen.
      }
    });
    industrialInput.addEventListener('blur', () => {
      industrialInput.value = C.centihoursToDisplay(lastValidCentihours);
      persist({ industrialInput: industrialInput.value });
      render();
    });

    decBtn.addEventListener('click', () => stepIndustrial(-5));
    incBtn.addEventListener('click', () => stepIndustrial(5));

    navBtns.forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.target));
    });

    themePicker.addEventListener('change', (e) => {
      const value = e.target.value;
      document.body.setAttribute('data-theme', value);
      persist({ theme: value });
    });

    defaultIndustrialInput.addEventListener('change', () => {
      try {
        const c = C.toCentihours(defaultIndustrialInput.value);
        const display = C.centihoursToDisplay(c);
        defaultIndustrialInput.value = display;
        industrialInput.value = display;
        lastValidCentihours = c;
        persist({ industrialInput: display });
        render();
      } catch (e) {
        defaultIndustrialInput.value = industrialInput.value;
      }
    });

    notificationsToggle.addEventListener('change', async () => {
      // Wichtig: Der Schalter bleibt auch dann nutzbar, wenn die Umgebung
      // keine System-Benachrichtigungen kennt – die Erinnerungen erscheinen
      // dann als Hinweis in der App. Früher wurde der Schalter in dem Fall
      // stillschweigend wieder ausgeschaltet, was wie ein Defekt wirkte.
      if (notificationsToggle.checked && typeof window.Notification !== 'undefined') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          // Ablehnung ist kein Fehler – In-App-Hinweise funktionieren weiter.
        }
      }
      persist({ notificationsEnabled: notificationsToggle.checked });
      renderNotifySupportHint();
    });

    notifyLeadSelect.addEventListener('change', () => {
      persist({ notifyLeadMinutes: notifyLeadSelect.value });
    });

    notifyBreakToggle.addEventListener('change', () => {
      persist({ notifyBreakReminder: notifyBreakToggle.checked });
    });

    reminderClose.addEventListener('click', () => {
      reminderBanner.classList.add('is-hidden');
    });

    resetDataBtn.addEventListener('click', () => {
      if (confirm('Wirklich alle gespeicherten Daten zurücksetzen?\n\nDer jetzige Stand wird vorher auf dem Gerät gesichert.')) {
        const doReset = () => { S.reset(); location.reload(); };
        zsSnapshot('vor Zurücksetzen').then(doReset, doReset);
      }
    });

    // ---- Wochenübersicht / Zeitkonto ----
    weekPrevBtn.addEventListener('click', () => {
      currentWeekMonday = O.addDays(currentWeekMonday, -7);
      renderWeekDays();
      renderWeekSummary();
    });
    weekNextBtn.addEventListener('click', () => {
      currentWeekMonday = O.addDays(currentWeekMonday, 7);
      renderWeekDays();
      renderWeekSummary();
    });
    weekTodayBtn.addEventListener('click', () => {
      currentWeekMonday = O.getMonday(new Date());
      renderWeekDays();
      renderWeekSummary();
    });

    weeklyTargetInput.addEventListener('change', () => {
      try {
        const c = C.toCentihours(weeklyTargetInput.value);
        const display = C.centihoursToDisplay(c);
        weeklyTargetInput.value = display;
        persist({ weeklyTargetIndustrial: display });
        renderWeekSummary();
        renderWorkdayPicker(); // Tagessoll hängt am Wochensoll
        renderMonth();
        renderStatus();
      } catch (e) {
        weeklyTargetInput.value = state.weeklyTargetIndustrial || '36,00';
      }
    });

    // Event-Delegation: die 7 Tages-Inputs werden bei jeder Wochennavigation
    // neu erzeugt, daher hier einmalig am Container gebunden statt pro Input.
    weekDaysEl.addEventListener('input', (e) => {
      const input = e.target.closest('.week-day-input');
      if (!input) return;
      const day = input.dataset.day;
      const weekKey = weekKeyForCurrent();
      const weeks = ensureWeek(weekKey);
      weeks[weekKey].days[day] = input.value;
      persist({ weeks });
      renderWeekSummary();
    });
    // blur bubbelt nicht -> Capture-Phase nötig für Event-Delegation
    weekDaysEl.addEventListener('blur', (e) => {
      const input = e.target.closest && e.target.closest('.week-day-input');
      if (!input) return;
      const day = input.dataset.day;
      const weekKey = weekKeyForCurrent();
      const weeks = ensureWeek(weekKey);
      const raw = input.value;
      if (raw && raw.trim()) {
        try {
          const c = C.toCentihours(raw);
          const display = C.centihoursToDisplay(c);
          input.value = display;
          weeks[weekKey].days[day] = display;
        } catch (err) {
          input.value = '';
          weeks[weekKey].days[day] = '';
        }
      }
      persist({ weeks });
      renderWeekSummary();
    }, true);

    // ---- Stempeluhr: Eingabeart pro Tag umschalten ----
    weekDaysEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.week-day-mode-btn');
      if (!btn) return;
      const day = btn.dataset.day;
      const weekKey = weekKeyForCurrent();
      const weeks = ensureWeek(weekKey);
      const week = weeks[weekKey];
      const currentMode = (week.mode && week.mode[day]) || 'manual';
      week.mode[day] = currentMode === 'punch' ? 'manual' : 'punch';
      persist({ weeks });
      renderWeekDays();
      renderWeekSummary();
    });

    // ---- Stempeluhr: vier Zeitfelder (Kommen/Gehen/Kommen/Gehen) ----
    weekDaysEl.addEventListener('input', (e) => {
      const punchInput = e.target.closest('.punch-input');
      if (!punchInput) return;
      const day = punchInput.dataset.day;
      const field = punchInput.dataset.field;
      const weekKey = weekKeyForCurrent();
      const weeks = ensureWeek(weekKey);
      const week = weeks[weekKey];
      const existing = week.punches[day] || {};
      const punches = Object.assign({}, existing, { [field]: punchInput.value });
      week.punches[day] = punches;

      const desc = describePunches(punches);
      const resultEl = weekDaysEl.querySelector('.week-day-punch-result[data-day="' + day + '"]');
      if (resultEl) {
        resultEl.textContent = desc.text;
        resultEl.className = 'week-day-punch-result' + (desc.cls ? ' ' + desc.cls : '');
      }

      if (desc.cls === 'is-ok') {
        try {
          const override = pauseOverrideFor(punches);
          const r = C.calculateFromSpan(
            punches.start, punches.end,
            override === null ? undefined : override,
            state.breakRuleId || 'legal'
          );
          week.days[day] = C.centihoursToDisplay(r.industrialCentihours);
          const resultLabelEl = weekDaysEl.querySelector('.week-day-row[data-day="' + day + '"] .week-day-result');
          if (resultLabelEl) resultLabelEl.textContent = week.days[day] + ' h';
        } catch (err) {
          // von describePunches bereits als Fehlertext angezeigt
        }
      }

      persist({ weeks });
      renderWeekSummary();
    });

    // ---- Arbeitsweg ----
    commuteToWorkInput.addEventListener('change', () => {
      const minutes = parseCommuteMinutes(commuteToWorkInput.value);
      commuteToWorkInput.value = minutes === null ? '' : String(minutes);
      persist({ commuteToWorkMinutes: commuteToWorkInput.value });
      render();
      renderMorning(); // gleicher Arbeitsweg -> Morgen-Planer sofort mitziehen
    });
    // Morgen-Planer (Version 2.8)
    morningStartInput.addEventListener('input', () => {
      // Der Arbeitsbeginn ist derselbe Wert wie im Rechner - nur eine Quelle.
      persist({ startClock: morningStartInput.value });
      startTimeInput.value = morningStartInput.value;
      setActiveQuickChip(startQuickChips, startTimeInput.value);
      render();
      renderMorning();
    });
    morningPrepInput.addEventListener('change', () => {
      const minutes = parseCommuteMinutes(morningPrepInput.value);
      morningPrepInput.value = minutes === null ? '' : String(minutes);
      persist({ morningPrepMinutes: morningPrepInput.value });
      renderMorning();
    });
    morningBufferInput.addEventListener('change', () => {
      const minutes = parseCommuteMinutes(morningBufferInput.value);
      morningBufferInput.value = minutes === null ? '' : String(minutes);
      persist({ morningBufferMinutes: morningBufferInput.value });
      renderMorning();
    });

    // Aktivitäten vor/nach der Arbeit (Version 2.9)
    activityBeforeChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.activity-chip');
      if (btn) setActivitySlot('before', btn.dataset.activity || '');
    });
    activityAfterChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.activity-chip');
      if (btn) setActivitySlot('after', btn.dataset.activity || '');
    });
    activityList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.activity-remove');
      if (removeBtn) {
        removeActivity(removeBtn.dataset.remove);
        return;
      }
      const editBtn = e.target.closest('[data-edit]');
      if (editBtn) startEditActivity(editBtn.dataset.edit);
    });
    activityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveActivity();
    });
    activityCancelBtn.addEventListener('click', cancelEditActivity);

    // Live-Rückmeldung, wie die Dauer verstanden wurde
    activityDurationInput.addEventListener('input', () =>
      renderDurationEcho(activityDurationInput, activityDurationEcho));
    sleepNeedInput.addEventListener('input', () =>
      renderDurationEcho(sleepNeedInput, sleepNeedEcho));

    // Tagesdauer ("heute nur eine Stunde")
    activityBeforeOverrideInput.addEventListener('change', () => {
      setActivityOverride('before', activityBeforeOverrideInput.value.trim());
    });
    activityAfterOverrideInput.addEventListener('change', () => {
      setActivityOverride('after', activityAfterOverrideInput.value.trim());
    });

    // Schlafrechner (Version 3.0)
    sleepNeedInput.addEventListener('change', () => {
      const minutes = parseDurationMinutes(sleepNeedInput.value);
      if (minutes === null) {
        sleepNeedInput.value = state.sleepNeed || '';
        return;
      }
      const normalized = C.minutesToHHMM(minutes);
      sleepNeedInput.value = normalized;
      persist({ sleepNeed: normalized });
      renderDurationEcho(sleepNeedInput, sleepNeedEcho);
      renderSleep();
      renderMyDay();
    });

    // Urlaubsanspruch (Version 3.0)
    vacationPerYearInput.addEventListener('change', () => {
      const days = parseInt(vacationPerYearInput.value.trim(), 10);
      vacationPerYearInput.value = Number.isNaN(days) || days < 0 ? '' : String(days);
      persist({ vacationDaysPerYear: vacationPerYearInput.value });
      renderVacation();
    });

    // Berufsschul-Regeln und Ferien (Version 3.1)
    schoolWeekdayPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-school-day]');
      if (btn) toggleSchoolFormWeekday(btn.dataset.schoolDay);
    });
    schoolRuleKind.addEventListener('change', syncSchoolRuleForm);
    schoolRuleInterval.addEventListener('change', syncSchoolRuleForm);
    schoolRuleAddBtn.addEventListener('click', addSchoolRule);
    schoolRuleList_el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-school-rule]');
      if (btn) removeSchoolRule(btn.dataset.schoolRule);
    });
    schoolBreakAddBtn.addEventListener('click', addSchoolBreak);
    schoolBreakList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-school-break]');
      if (btn) removeSchoolBreak(btn.dataset.schoolBreak);
    });
    schoolStateSelect.addEventListener('change', () => {
      persist({ schoolState: schoolStateSelect.value });
      renderSchoolSettings();
      refreshHistoryViews();
    });

    // Urlaubsjahr (Version 3.1)
    vacationPrevBtn.addEventListener('click', () => shiftVacationYear(-1));
    vacationNextBtn.addEventListener('click', () => shiftVacationYear(1));
    vacationYearSaveBtn.addEventListener('click', saveVacationYear);

    // Kalender-Tab (Version 3.1)
    calendarGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-cal-date]');
      if (cell) pickCalendarDay(cell.dataset.calDate);
    });
    calendarTypeChips.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cal-type]');
      if (btn) applyCalendarType(btn.dataset.calType);
    });
    calendarClearBtn.addEventListener('click', () => applyCalendarType(''));
    calendarPrevBtn.addEventListener('click', () => shiftCalendarMonth(-1));
    calendarNextBtn.addEventListener('click', () => shiftCalendarMonth(1));
    calendarTodayBtn.addEventListener('click', () => {
      calendarMonthDate = new Date();
      renderCalendarTab();
    });

    // Mein Tag: heute/morgen (Version 3.1)
    myDayToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-day-offset]');
      if (btn) setMyDayOffset(parseInt(btn.dataset.dayOffset, 10) || 0);
    });

    // Einklappbare Karten: Zustand merken (Version 2.9)
    document.querySelectorAll('.collapsible-card').forEach((card) => {
      card.addEventListener('toggle', () => rememberCardState(card));
    });

    // Arbeitstage (Version 2.8): bestimmen das Tagessoll
    workdayPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.workday-chip');
      if (!btn) return;
      toggleWorkday(btn.dataset.day);
    });

    commuteFromWorkInput.addEventListener('change', () => {
      const minutes = parseCommuteMinutes(commuteFromWorkInput.value);
      commuteFromWorkInput.value = minutes === null ? '' : String(minutes);
      persist({ commuteFromWorkMinutes: commuteFromWorkInput.value });
      render();
    });

    // ---- Zuhause (automatisch: Feierabend + Rückweg) ----
    // Reverse-Eingabe: "ich möchte um X zuhause sein" -> Losfahrzeit/Puffer berechnen.
    desiredHomeArrivalInput.addEventListener('input', () => {
      persist({ desiredHomeArrival: desiredHomeArrivalInput.value });
      render();
    });

    // ---- Pufferzeit ----
    bufferInput.addEventListener('change', () => {
      const minutes = parseCommuteMinutes(bufferInput.value);
      bufferInput.value = minutes === null ? '' : String(minutes);
      persist({ bufferMinutes: bufferInput.value });
      render();
    });

    // ---- Was-wäre-wenn (reine Simulation, nichts wird gespeichert) ----
    wwennStartSlider.addEventListener('input', () => renderWwenn());

    // ---- Zeitkonto: Anzeigeeinheit ----
    zeitkontoUnitToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.unit-btn');
      if (!btn) return;
      persist({ zeitkontoUnit: btn.dataset.unit });
      setActiveZeitkontoUnitButtons();
      renderWeekSummary();
    });

    // ---- Export: CSV + Drucken/PDF ----
    csvExportBtn.addEventListener('click', exportCsv);
    pdfExportBtn.addEventListener('click', () => window.print());

    // ---- Arbeitsprofile: speichern + löschen ----
    presetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = presetNameInput.value.trim();
      if (!name) return;
      const presets = (state.presets || []).slice();
      presets.push({
        id: 'preset-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        name,
        startClock: startTimeInput.value,
        industrialInput: industrialInput.value,
        // Version 2.1: Pausenregel und Arbeitsweg gehören mit zum Profil.
        // Ältere Profile ohne diese Felder bleiben gültig – beim Anwenden
        // werden fehlende Felder einfach übersprungen.
        breakRuleId: state.breakRuleId || 'legal',
        commuteToWorkMinutes: state.commuteToWorkMinutes || '',
        commuteFromWorkMinutes: state.commuteFromWorkMinutes || '',
      });
      persist({ presets });
      presetForm.reset();
      renderPresets();
    });

    presetList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.preset-remove');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        const presets = (state.presets || []).filter((p) => p.id !== id);
        persist({ presets });
        renderPresets();
        return;
      }
      const main = e.target.closest('.preset-main');
      if (!main) return;
      const id = main.dataset.id;
      const preset = (state.presets || []).find((p) => p.id === id);
      if (!preset) return;
      startTimeInput.value = preset.startClock;
      industrialInput.value = preset.industrialInput;
      lastValidCentihours = safeToCentihours(preset.industrialInput, lastValidCentihours);
      setMode('forward');
      setActiveQuickChip(startQuickChips, startTimeInput.value);

      const patch = { startClock: preset.startClock, industrialInput: preset.industrialInput };
      // Nur übernehmen, was im Profil auch hinterlegt ist (ältere Profile
      // kennen diese Felder nicht und sollen nichts überschreiben).
      if (preset.breakRuleId) patch.breakRuleId = preset.breakRuleId;
      if (typeof preset.commuteToWorkMinutes === 'string') patch.commuteToWorkMinutes = preset.commuteToWorkMinutes;
      if (typeof preset.commuteFromWorkMinutes === 'string') patch.commuteFromWorkMinutes = preset.commuteFromWorkMinutes;
      persist(patch);

      commuteToWorkInput.value = state.commuteToWorkMinutes || '';
      commuteFromWorkInput.value = state.commuteFromWorkMinutes || '';
      renderBreakRuleOptions();
      switchTab('planen');
      render();
      renderStatus();
      renderWeekDays();
      renderWeekSummary();
      renderMonth();
    });

    // ---- Termine ----
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const time = appointmentTimeInput.value;
      const label = appointmentLabelInput.value.trim();
      if (!time || !label) return;

      const appointments = (state.appointments || []).slice();
      appointments.push({ id: 'apt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), time, label });
      persist({ appointments });
      appointmentForm.reset();
      renderAppointments();
      render();
    });

    appointmentList.addEventListener('click', (e) => {
      const btn = e.target.closest('.appointment-remove');
      if (!btn) return;
      const id = btn.dataset.id;
      const appointments = (state.appointments || []).filter((a) => a.id !== id);
      persist({ appointments });
      renderAppointments();
      render();
    });

    // ---- Stempeluhr: Kommen / Pause starten / Pause beenden / Gehen ----
    btnKommen.addEventListener('click', () => stampEvent(P.TYPES.CLOCK_IN));
    btnPauseStart.addEventListener('click', () => stampEvent(P.TYPES.BREAK_START));
    btnPauseEnd.addEventListener('click', () => stampEvent(P.TYPES.BREAK_END));
    btnGehen.addEventListener('click', () => stampEvent(P.TYPES.CLOCK_OUT));

    // ---- Verlauf: Tag öffnet die Detailansicht ----
    weekDaysEl.addEventListener('click', (e) => {
      const openBtn = e.target.closest('.week-day-real, .week-day-type');
      if (!openBtn) return;
      openDayDetail(openBtn.dataset.dateKey);
    });

    // ---- Monatsübersicht: Navigation + Sprung in die Woche ----
    monthPrevBtn.addEventListener('click', () => {
      currentMonthDate = O.addMonths(currentMonthDate, -1);
      renderMonth();
    });
    monthNextBtn.addEventListener('click', () => {
      currentMonthDate = O.addMonths(currentMonthDate, 1);
      renderMonth();
    });
    monthTodayBtn.addEventListener('click', () => {
      currentMonthDate = new Date();
      renderMonth();
    });
    monthWeeksEl.addEventListener('click', (e) => {
      const row = e.target.closest('.month-week-row');
      if (!row || !row.dataset.monday) return;
      currentWeekMonday = O.getMonday(new Date(row.dataset.monday + 'T00:00:00'));
      renderWeekDays();
      renderWeekSummary();
      if (typeof weekDaysEl.scrollIntoView === 'function') {
        weekDaysEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // ---- Tages-Detail: Tagestyp wählen ----
    dayDetailTypes.addEventListener('click', (e) => {
      const btn = e.target.closest('.daytype-chip');
      if (!btn || !dayDetailDateKey) return;
      setDayTypeFor(dayDetailDateKey, btn.dataset.typeId);
      renderDayDetail(dayDetailDateKey);
      renderWeekDays();
      renderWeekSummary();
      renderMonth();
      renderStatus();
    });

    // ---- Einstellungen: Pausenregel ----
    breakRuleSelect.addEventListener('change', () => {
      persist({ breakRuleId: breakRuleSelect.value });
      render();
      renderStatus();
      renderWeekDays();
      renderWeekSummary();
      renderMonth();
    });

    // ---- Einstellungen: Anzeigeeinheit (gespiegelt zum Verlauf-Umschalter) ----
    settingsUnitToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.unit-btn');
      if (!btn) return;
      persist({ zeitkontoUnit: btn.dataset.unit });
      setActiveZeitkontoUnitButtons();
      applyZeitkontoUnitVisibility();
    });

    // ---- Einstellungen: Gutschriften je Tagestyp ----
    dayTypeSettings.addEventListener('change', (e) => {
      const input = e.target.closest('.daytype-input');
      if (!input) return;
      const stored = updateDayTypeCredit(input.dataset.typeId, input.value);
      input.value = stored;
      renderWeekDays();
      renderWeekSummary();
      renderMonth();
      renderStatus();
    });

    // ---- Einstellungen: CSV-Export (gleiche Funktion wie im Verlauf) ----
    settingsCsvBtn.addEventListener('click', () => {
      backupTextBlock.open = true;
      exportCsv();
    });

    // ---- Backup erstellen / wiederherstellen (Version 2.2) ----
    backupExportBtn.addEventListener('click', exportBackup);

    backupImportBtn.addEventListener('click', () => backupFileInput.click());

    backupFileInput.addEventListener('change', () => {
      const file = backupFileInput.files && backupFileInput.files[0];
      backupTextBlock.open = true;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => applyBackupJson(String(reader.result || ''));
      reader.onerror = () => setBackupStatus('Die Datei konnte nicht gelesen werden.', true);
      reader.readAsText(file);
      backupFileInput.value = ''; // gleiche Datei soll erneut wählbar bleiben
    });

    backupCopyBtn.addEventListener('click', async () => {
      if (!backupTextarea.value.trim()) exportBackup();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(backupTextarea.value);
          setBackupStatus('In die Zwischenablage kopiert.');
          return;
        }
        throw new Error('clipboard unavailable');
      } catch (e) {
        backupTextarea.focus();
        backupTextarea.select();
        setBackupStatus('Der Text ist markiert – bitte von Hand kopieren (gedrückt halten → Kopieren).', true);
      }
    });

    backupTextImportBtn.addEventListener('click', () => {
      const text = backupTextarea.value.trim();
      if (!text) {
        setBackupStatus('Bitte zuerst ein Backup in das Textfeld einfügen.', true);
        return;
      }
      applyBackupJson(text);
    });

    // ---- Monat: Liste oder Kalender ----
    monthViewToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.unit-btn');
      if (!btn) return;
      const view = btn.dataset.view;
      monthViewToggle.querySelectorAll('.unit-btn').forEach((other) => {
        other.classList.toggle('is-active', other.dataset.view === view);
      });
      monthWeeksEl.classList.toggle('is-hidden', view !== 'list');
      monthCalendarEl.classList.toggle('is-hidden', view !== 'calendar');
      monthLegend.classList.toggle('is-hidden', view !== 'calendar');
    });

    // Tag im Kalender antippen öffnet dieselbe Detailansicht wie im Verlauf.
    monthCalendarEl.addEventListener('click', (e) => {
      const cell = e.target.closest('.calendar-cell');
      if (!cell || !cell.dataset.dateKey) return;
      openDayDetail(cell.dataset.dateKey);
    });

    // ---- Einstellungen: eigene Pausenregeln ----
    ruleSaveBtn.addEventListener('click', saveCustomRule);

    ruleList.addEventListener('click', (e) => {
      const btn = e.target.closest('.rule-remove');
      if (!btn) return;
      if (!confirm('Diese Pausenregel wirklich löschen?')) return;
      removeCustomRule(btn.dataset.ruleId);
    });

    // ---- Statistik: Zeitraum umschalten ----
    statRangeToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.unit-btn');
      if (!btn) return;
      statRange = btn.dataset.range;
      statRangeToggle.querySelectorAll('.unit-btn').forEach((other) => {
        other.classList.toggle('is-active', other.dataset.range === statRange);
      });
      renderStats();
    });

    // ---- Tages-Detail-Dialog: Eintrag bearbeiten/löschen/hinzufügen ----
    dayDetailEvents.addEventListener('input', (e) => {
      const input = e.target.closest('.day-detail-event-time');
      if (!input) return;
      const eventId = input.dataset.eventId;
      const dateStr = dayDetailDateKey;
      const clock = input.value; // "HH:MM"
      if (!clock) return;
      const wd = getWorkDay(dateStr);
      const original = wd.events.find((ev) => ev.id === eventId);
      if (!original) return;
      const newTimestamp = combineDateAndClock(dateStr, clock, original.timestamp);
      const updated = P.editEventTimestamp(wd, eventId, newTimestamp, Date.now());
      saveWorkDayIfValid(dateStr, updated, input);
    });

    dayDetailEvents.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.day-detail-event-remove');
      if (!removeBtn) return;
      if (!confirm('Möchtest du diesen Eintrag wirklich löschen?')) return;
      const dateStr = dayDetailDateKey;
      const wd = getWorkDay(dateStr);
      const updated = P.removeEvent(wd, removeBtn.dataset.eventId, Date.now());
      saveWorkDayIfValid(dateStr, updated, null);
    });

    dayDetailAddBtn.addEventListener('click', () => {
      const dateStr = dayDetailDateKey;
      if (!dateStr) return;
      const existingMenu = dayDetailDialog.querySelector('.day-detail-add-menu');
      if (existingMenu) { existingMenu.remove(); return; }
      const wd = getWorkDay(dateStr);
      const menu = document.createElement('div');
      menu.className = 'day-detail-add-menu';
      [P.TYPES.CLOCK_IN, P.TYPES.BREAK_START, P.TYPES.BREAK_END, P.TYPES.CLOCK_OUT].forEach((type) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '+ ' + P.TYPE_LABELS[type];
        btn.addEventListener('click', () => {
          const nowClock = C.minutesToClock(new Date().getHours() * 60 + new Date().getMinutes());
          const timestamp = combineDateAndClock(dateStr, nowClock, Date.now());
          const updated = P.addEvent(wd, type, timestamp);
          saveWorkDayIfValid(dateStr, updated, null);
          menu.remove();
        });
        menu.appendChild(btn);
      });
      dayDetailAddBtn.insertAdjacentElement('afterend', menu);
    });
  }

  // ---- Stempeluhr: Hilfsfunktionen -------------------------------------------

  /** Setzt Uhrzeit "HH:MM" auf den Kalendertag von dateStr, behält Sekunden/ms
   *  des ursprünglichen Zeitstempels bei Bearbeitung möglichst simpel (auf 0). */
  function combineDateAndClock(dateStr, clockStr, fallbackTimestamp) {
    const parts = dateStr.split('-').map(Number);
    const clockParts = clockStr.split(':').map(Number);
    if (parts.length !== 3 || clockParts.length !== 2) return fallbackTimestamp;
    const d = new Date(parts[0], parts[1] - 1, parts[2], clockParts[0], clockParts[1], 0, 0);
    return d.getTime();
  }

  function getWorkDay(dateStr) {
    const existing = state.workDays && state.workDays[dateStr];
    return existing ? P.cloneWorkDay(existing) : P.emptyWorkDay(dateStr);
  }

  function saveWorkDay(dateStr, workDay) {
    const workDays = Object.assign({}, state.workDays || {});
    workDays[dateStr] = workDay;
    persist({ workDays });
  }

  /** Validiert die komplette Event-Kette vor dem Speichern (Abschnitt 30).
   *  Bei Fehlern wird NICHT gespeichert, stattdessen eine verständliche
   *  Fehlermeldung angezeigt - passiert typischerweise nur bei nachträglichem
   *  Verschieben eines Zeitpunkts über einen anderen Eintrag hinweg. */
  function saveWorkDayIfValid(dateStr, workDay, focusEl) {
    const errors = P.validateSequence(workDay.events);
    if (errors.length > 0) {
      dayDetailError.textContent = errors[0];
      dayDetailError.classList.remove('is-hidden');
      return;
    }
    dayDetailError.classList.add('is-hidden');
    saveWorkDay(dateStr, workDay);
    renderDayDetail(dateStr);
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
    renderStatus();
  }

  /** Findet den Tag, der gerade "offen" ist (Arbeitet/Pause), auch wenn das
   *  über Mitternacht hinweg der gestrige Kalendertag ist (Abschnitt 29:
   *  Zeitberechnung darf nicht von der App-Laufzeit abhängen). Ohne offenen
   *  Tag gilt der heutige Kalendertag. */
  function activeWorkDayKey() {
    const workDays = state.workDays || {};
    const keys = Object.keys(workDays).sort(); // chronologisch, jüngster zuletzt
    for (let i = keys.length - 1; i >= 0; i -= 1) {
      const wd = workDays[keys[i]];
      const status = P.statusForEvents(wd.events || []);
      if (status === P.STATUS.WORKING || status === P.STATUS.ON_BREAK) {
        // ZEITSTEMPEL: Nur ein frischer offener Tag (Kommen vor < 16 Std.)
        // gilt als laufend. Ein vergessenes Gehen von gestern darf nicht
        // dazu führen, dass "Gehen" heute früh den gestrigen Tag abschließt.
        const first = P.sortEvents(wd.events || [])[0];
        if (keys[i] === P.todayKey() || (first && Date.now() - first.timestamp < 16 * 3600000)) return keys[i];
        break;
      }
    }
    return P.todayKey();
  }

  function stampEvent(type) {
    const dateStr = activeWorkDayKey();
    const wd = getWorkDay(dateStr);
    const now = Date.now();
    const check = P.validateStamp(wd.events, type, now);
    if (!check.ok) {
      statusError.textContent = check.error;
      statusError.classList.remove('is-hidden');
      return;
    }
    statusError.classList.add('is-hidden');
    const updated = P.addEvent(wd, type, now);
    saveWorkDay(dateStr, updated);
    renderStatus();
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
  }

  function parseCommuteMinutes(raw) {
    if (raw === null || raw === undefined) return null;
    const trimmed = String(raw).trim();
    if (!trimmed) return null;
    const n = parseInt(trimmed, 10);
    if (isNaN(n) || n < 0) return null;
    return Math.min(n, 999);
  }

  // ---- Helpers --------------------------------------------------------------
  function persist(patch) {
    state = S.update(patch);
  }

  function setMode(next) {
    mode = next;
    document.body.setAttribute('data-mode', mode);
    setActiveModeButtons();
    persist({ mode });
    render();
  }

  function setActiveModeButtons() {
    const forward = mode === 'forward';
    modeForwardBtn.classList.toggle('is-active', forward);
    modeForwardBtn.setAttribute('aria-selected', String(forward));
    modeBackwardBtn.classList.toggle('is-active', !forward);
    modeBackwardBtn.setAttribute('aria-selected', String(!forward));
  }

  function setActiveThemeRadio() {
    const radios = themePicker.querySelectorAll('input[type="radio"]');
    radios.forEach((r) => {
      r.checked = r.value === (state.theme || 'design3');
    });
  }

  function setActiveQuickChip(container, timeValue) {
    container.querySelectorAll('.chip').forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.time === timeValue);
    });
  }

  function stepIndustrial(deltaCentihours) {
    lastValidCentihours = Math.max(0, lastValidCentihours + deltaCentihours);
    const display = C.centihoursToDisplay(lastValidCentihours);
    industrialInput.value = display;
    persist({ industrialInput: display });
    render();
  }

  function switchTab(target) {
    tabPanels.forEach((panel) => {
      panel.classList.toggle('is-hidden', panel.dataset.panel !== target);
    });
    navBtns.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.target === target);
    });
    // Statistik erst beim Öffnen berechnen – sie wertet alle erfassten Tage
    // aus und muss nicht bei jedem Stempeln mitlaufen.
    if (target === 'statistik') {
      renderStats();
      renderVacation();
    }
    // "Mein Tag" zeigt eine Jetzt-Markierung – beim Öffnen frisch zeichnen,
    // statt auf den Minutentakt zu warten.
    if (target === 'tag') renderMyDay();
    if (target === 'kalender') renderCalendarTab();
  }

  function renderPresets() {
    presetList.innerHTML = '';
    (state.presets || []).forEach((preset) => {
      const item = document.createElement('div');
      item.className = 'preset-item';
      item.innerHTML =
        '<div class="preset-main" data-id="' + escapeHtml(preset.id) + '" role="button" tabindex="0">' +
          '<span class="preset-name">' + escapeHtml(preset.name) + '</span>' +
          '<span class="preset-detail">' + escapeHtml(preset.startClock) + ' · ' + escapeHtml(preset.industrialInput) + ' Industrie' +
            (preset.breakRuleId && preset.breakRuleId !== 'legal'
              ? ' · ' + escapeHtml(C.getBreakRule(preset.breakRuleId).label)
              : '') +
          '</span>' +
        '</div>' +
        '<button type="button" class="preset-remove" data-id="' + escapeHtml(preset.id) + '" aria-label="Profil löschen">×</button>';
      presetList.appendChild(item);
    });
  }

  // ZEITSTEMPEL (Sicherheit): escapt jetzt auch Anführungszeichen. Vorher
  // wurden nur < > & ersetzt – in Attributen wie data-type-id="…" hätte ein
  // präpariertes Backup sonst aus dem Attribut ausbrechen können.
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- Termine --------------------------------------------------------------
  function renderAppointments() {
    const appointments = (state.appointments || []).slice().sort((a, b) => a.time.localeCompare(b.time));
    appointmentList.innerHTML = '';
    appointmentEmpty.classList.toggle('is-hidden', appointments.length > 0);

    appointments.forEach((apt) => {
      const item = document.createElement('div');
      item.className = 'appointment-item';
      item.innerHTML =
        '<span class="appointment-time">' + escapeHtml(apt.time) + '</span>' +
        '<span class="appointment-label">' + escapeHtml(apt.label) + '</span>' +
        '<button type="button" class="appointment-remove" data-id="' + escapeHtml(apt.id) + '" aria-label="Termin löschen">×</button>';
      appointmentList.appendChild(item);
    });
  }

  // ---- ZEITSTEMPEL: Pausentext ---------------------------------------------
  /** Ein Satz, der erklärt, welche Pause zählt - nie ein unerklärter Wert. */
  function pauseTextFor(stats) {
    if (!stats || !stats.clockInEvent) return null;
    const done = stats.status === 'done';
    if (stats.mixed) {
      const mx = stats.mixed;
      let t = 'Schule ' + C.minutesToClock(mx.fromMinutes) + '–' + C.minutesToClock(mx.toMinutes) +
        ' + ' + mx.travelMinutes + ' Min. Weg = ' + C.minutesToHHMM(mx.creditMinutes) + ' zählen schon';
      if (stats.actualBreakMinutes > 0) t += ' · Pause im Betrieb ' + stats.actualBreakMinutes + ' Min.';
      if (stats.autoBreakMinutes > 0) t += ' · ' + stats.autoBreakMinutes + ' Min. Pause automatisch';
      return { text: t, warn: false };
    }
    const actual = stats.actualBreakMinutes;
    const deducted = stats.deductedBreakMinutes;
    const required = stats.requiredBreakMinutes || 0;
    if (state.autoBreak === false) {
      if (!required && !actual) return null;
      return { text: 'Pause: ' + actual + ' Min. gestempelt (Pflicht: ' + stats.requiredBreakMinutes + ' Min.)', warn: stats.remainingBreakMinutes > 0 };
    }
    if (stats.paidBreakCreditMinutes > 0 || (zsPaidBreakForStats(stats) > 0)) {
      const paid = zsPaidBreakForStats(stats);
      if (done) {
        return { text: 'Pause heute bezahlt (' + paid + ' Min. zählen als Arbeitszeit)' +
          (deducted > 0 ? ' · ' + deducted + ' Min. darüber abgezogen' : ''), warn: false };
      }
      return { text: 'Heute ist die Pause bezahlt – ' + paid + ' Min. zählen als Arbeitszeit.', warn: false };
    }
    if (done) {
      if (!deducted) return null;
      if (actual === 0) return { text: 'Pause: ' + deducted + ' Min. automatisch abgezogen (nicht gestempelt)', warn: false };
      if (stats.breakTooShort) return { text: 'Pause zu kurz: ' + actual + ' Min. gestempelt, ' + deducted + ' Min. abgezogen', warn: true };
      return { text: 'Pause: ' + actual + ' Min. gestempelt ✓', warn: false };
    }
    if (stats.status === 'onBreak') return { text: 'Pause läuft · bisher ' + actual + ' Min.', warn: false };
    if (!required) return null;
    if (actual === 0) return { text: 'Pause nicht gestempelt? Dann werden ' + required + ' Min. automatisch abgezogen.', warn: false };
    if (actual < required) return { text: 'Pause: ' + actual + ' Min. gestempelt · Pflicht ' + required + ' Min., der Rest wird automatisch abgezogen', warn: true };
    return { text: 'Pause: ' + actual + ' Min. gestempelt ✓', warn: false };
  }

  function zsPaidBreakForStats(stats) {
    if (!stats || !stats.clockInEvent) return 0;
    return zsPaidBreakFor(P.dateKey(new Date(stats.clockInEvent.timestamp)));
  }

  function pauseCellText(stats) {
    if (!stats.clockInEvent) return '–';
    const parts = [];
    if (stats.actualBreakMinutes > 0) parts.push(stats.actualBreakMinutes + ' Min. gestempelt');
    if (stats.autoBreakMinutes > 0) parts.push(stats.autoBreakMinutes + ' Min. automatisch');
    if (stats.paidBreakCreditMinutes > 0) return (parts.join(' + ') || '0 Min.') + ' · bezahlt, zählt als Arbeit';
    if (!parts.length) return '0 Min.';
    return parts.join(' + ') + (stats.breakTooShort ? ' (zu kurz)' : '');
  }

  // ---- Stempeluhr: Status-Card (live) ----------------------------------------
  function renderStatus() {
    const dateStr = activeWorkDayKey();
    const wd = getWorkDay(dateStr);
    const targetNetMinutes = C.centihoursToNormalMinutes(lastValidCentihours);
    const breakRule = C.getBreakRule(state.breakRuleId || 'legal');
    const stats = dayStatsFor(dateStr, wd.events, Date.now());

    statusCard.setAttribute('data-status', stats.status);
    statusBadgeText.textContent = P.statusLabel(stats.status);

    const isPastDay = dateStr !== P.todayKey();
    if (stats.clockInEvent) {
      // "T00:00:00" (ohne "Z") erzwingt lokale statt UTC-Interpretation des
      // Datums-Strings - sonst könnte der Tag in negativen Zeitzonen verrutschen.
      statusSince.textContent = (isPastDay ? O.formatDateShort(new Date(dateStr + 'T00:00:00')) + ' · ' : '') +
        'Seit ' + clockOf(stats.clockInEvent.timestamp);
      statusSince.classList.remove('is-hidden');
    } else {
      statusSince.classList.add('is-hidden');
    }

    const showMetrics = stats.status !== 'idle';
    statusMainRow.classList.toggle('is-hidden', !showMetrics);
    statusFeierabendRow.classList.toggle('is-hidden', !showMetrics);
    statusEvents.classList.toggle('is-hidden', !showMetrics);

    if (showMetrics) {
      statusWorked.textContent = C.minutesToHHMM(stats.totalNetMinutes) + ' h';

      if (stats.remainingNetMinutes > 0) {
        statusRemainingLabel.textContent = 'Noch erforderlich';
        statusRemaining.textContent = C.minutesToHHMM(stats.remainingNetMinutes) + ' h';
        statusRemainingWrap.classList.remove('is-hidden');
      } else if (stats.status !== 'done') {
        statusRemainingLabel.textContent = 'Überstunden';
        statusRemaining.textContent = '+' + C.minutesToHHMM(Math.max(0, stats.dailyBalanceMinutes)) + ' h';
        statusRemainingWrap.classList.remove('is-hidden');
      } else {
        statusRemainingWrap.classList.add('is-hidden');
      }

      if (stats.projectedFeierabendMinutes !== null) {
        statusFeierabendTime.textContent = C.minutesToClock(stats.projectedFeierabendMinutes);
      } else {
        statusFeierabendTime.textContent = '–';
      }

      if (stats.dailyBalanceMinutes !== null) {
        const sign = stats.dailyBalanceMinutes > 0 ? '+' : (stats.dailyBalanceMinutes < 0 ? '-' : '±');
        statusBalance.textContent = 'Aktueller Tagessaldo: ' + sign + C.minutesToHHMM(Math.abs(stats.dailyBalanceMinutes)) + ' h';
        statusBalance.classList.toggle('is-positive', stats.dailyBalanceMinutes > 0);
        statusBalance.classList.toggle('is-negative', stats.dailyBalanceMinutes <= 0);
        statusBalance.classList.remove('is-hidden');
      } else {
        statusBalance.classList.add('is-hidden');
      }

      // ZEITSTEMPEL: Pause erklären - gestempelt oder automatisch?
      const pauseInfo = pauseTextFor(stats);
      if (pauseInfo) {
        statusPauseHint.textContent = pauseInfo.text;
        statusPauseHint.classList.toggle('is-warning', !!pauseInfo.warn);
        statusPauseHint.classList.remove('is-hidden');
      } else {
        statusPauseHint.classList.add('is-hidden');
      }

      // Mini-Log der heutigen Events (Abschnitt 9: automatisches Protokoll sichtbar)
      statusEvents.innerHTML = P.sortEvents(wd.events).map((ev) =>
        '<span class="status-event-chip">' + P.TYPE_LABELS[ev.type] + ' ' + clockOf(ev.timestamp) + '</span>'
      ).join('');
    }

    // Buttons je nach Status ein-/ausblenden (Doppel-Stempel-Schutz zusätzlich in stampEvent())
    btnKommen.classList.toggle('is-hidden', stats.status !== 'idle');
    btnPauseStart.classList.toggle('is-hidden', stats.status !== 'working');
    btnPauseEnd.classList.toggle('is-hidden', stats.status !== 'onBreak');
    btnGehen.classList.toggle('is-hidden', stats.status !== 'working');
    statusActions.classList.toggle('is-hidden', stats.status === 'done');
    statusDoneHint.classList.toggle('is-hidden', stats.status !== 'done');

    // Erinnerungen hängen an denselben abgeleiteten Werten wie die Anzeige –
    // dadurch stimmen Meldung und angezeigter Stand immer überein.
    checkReminders(stats);
    if (typeof renderZeitstempel === 'function' && zs) renderZeitstempel();
  }

  // ---- Erinnerungen aus den echten Stempelzeiten (Version 2.4) -------------

  /**
   * Was kann diese Umgebung überhaupt?
   * Wichtig: Eine Android-WebView (also die installierte App) kennt die
   * Web-Benachrichtigungen in aller Regel NICHT – dort ist `Notification`
   * schlicht nicht vorhanden. Deshalb wird der Zustand offen angezeigt, statt
   * einen Schalter anzubieten, der nichts tut.
   */
  function notificationSupport() {
    if (typeof window.Notification === 'undefined') return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return 'default';
  }

  function renderNotifySupportHint() {
    const support = notificationSupport();
    let text;
    if (support === 'unsupported') {
      text = 'Diese App kann keine System-Benachrichtigungen anzeigen. Erinnerungen erscheinen deshalb als Hinweis oben in der App – zusammen mit einer kurzen Vibration.';
    } else if (support === 'denied') {
      text = 'System-Benachrichtigungen sind für diese App blockiert. Erinnerungen erscheinen weiterhin als Hinweis in der App.';
    } else if (support === 'granted') {
      text = 'System-Benachrichtigungen sind erlaubt. Zusätzlich erscheint der Hinweis in der App.';
    } else {
      text = 'Beim Aktivieren wirst du einmal um Erlaubnis für Benachrichtigungen gefragt.';
    }
    notifySupportHint.textContent = text +
      ' Erinnerungen können nur ausgelöst werden, solange die App geöffnet ist – für Meldungen im Hintergrund bräuchte es einen Server oder eine native Erweiterung.';
  }

  function showReminderBanner(title, body) {
    reminderTitle.textContent = title;
    reminderBody.textContent = body;
    reminderBanner.classList.remove('is-hidden');
  }

  function deliverReminder(title, body) {
    try {
      if (typeof window.Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body: body });
      }
    } catch (e) {
      // Fällt weich auf den In-App-Hinweis zurück.
    }
    showReminderBanner(title, body);
    try {
      if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
    } catch (e) {
      // Vibration ist nur ein Extra.
    }
  }

  function fireReminder(type, title, body) {
    const today = P.todayKey();
    if (firedReminders.date !== today) {
      firedReminders.date = today;
      firedReminders.types = {};
    }
    if (firedReminders.types[type]) return;
    firedReminders.types[type] = true;
    deliverReminder(title, body);
  }

  /**
   * Prüft bei jedem Status-Takt, ob eine Erinnerung fällig ist.
   * Grundlage sind ausschließlich die abgeleiteten Werte aus den echten
   * Stempelzeiten (stats), nicht die Planungswerte aus dem Rechner.
   */
  function checkReminders(stats) {
    if (!state.notificationsEnabled) return;
    if (stats.status === 'idle' || stats.status === 'done') return;

    const lead = parseInt(state.notifyLeadMinutes || '15', 10) || 0;
    const remaining = stats.remainingNetMinutes;

    if (remaining === 0) {
      fireReminder('end', 'Arbeitszeit erreicht', 'Deine geplante Arbeitszeit ist erreicht.');
    } else if (lead > 0 && remaining <= lead) {
      fireReminder('soon', 'Feierabend rückt näher',
        'Noch ' + C.minutesToHHMM(remaining) + ' Std. bis deine Sollzeit erreicht ist.');
    }

    if (state.notifyBreakReminder) {
      // Fehlende Pause rechtzeitig melden – sie verschiebt den Feierabend.
      if (stats.status === 'working' && stats.remainingBreakMinutes > 0 && remaining <= Math.max(lead, 30)) {
        fireReminder('breakDue', 'Pause noch nicht vollständig',
          'Dir fehlen noch ' + stats.remainingBreakMinutes + ' Min. Pause. Ohne sie verschiebt sich dein Feierabend nach hinten.');
      }
      // Während der Pause: Bescheid geben, sobald sie ausreicht.
      if (stats.status === 'onBreak' && stats.actualBreakMinutes > 0 && stats.remainingBreakMinutes === 0) {
        fireReminder('breakDone', 'Pause erfüllt',
          'Du hast ' + stats.actualBreakMinutes + ' Min. Pause gemacht – das reicht für die erforderliche Pause.');
      }
    }
  }

  function clockOf(timestampMs) {
    const d = new Date(timestampMs);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  // ---- Tages-Detail-Dialog (Verlauf) -----------------------------------------
  function openDayDetail(dateStr) {
    dayDetailDateKey = dateStr;
    renderDayDetail(dateStr);
    dayDetailDialog.showModal();
  }

  function renderDayDetail(dateStr) {
    const wd = getWorkDay(dateStr);
    const dateObj = new Date(dateStr + 'T00:00:00');
    dayDetailTitle.textContent = O.formatDateShort(dateObj) + ' ' + (O.DAY_LABELS[O.DAY_KEYS[(dateObj.getDay() + 6) % 7]] || '');

    // ---- Tagestyp-Auswahl (Version 2.1) ----
    const activeTypeId = dayTypeIdFor(dateStr);
    const activeType = dayTypeById(activeTypeId);
    dayDetailTypes.innerHTML = dayTypeList().map((type) =>
      '<button type="button" class="daytype-chip' + (type.id === activeTypeId ? ' is-active' : '') + '" ' +
        'data-type-id="' + escapeHtml(type.id) + '">' +
        escapeHtml(type.icon + ' ' + type.label) +
      '</button>'
    ).join('');

    if (activeType.mode === 'fixed') {
      const credit = dayTypeCreditCentihours(activeType);
      dayDetailTypeHint.textContent = 'Dieser Tag zählt mit ' + C.centihoursToDisplay(credit) + ' h' +
        (dayTypeUsesDefault(activeType) ? ' (deine Standard-Nettoarbeitszeit)' : '') +
        ' – ganz ohne Kommen und Gehen. Änderbar unter Einstellungen → Tagestypen.';
      dayDetailTypeHint.classList.remove('is-hidden');
      dayDetailTypeHint.classList.remove('is-warning');
    } else {
      dayDetailTypeHint.classList.add('is-hidden');
      dayDetailTypeHint.classList.remove('is-warning');
    }

    const targetNetMinutes = C.centihoursToNormalMinutes(lastValidCentihours);
    const breakRule = C.getBreakRule(state.breakRuleId || 'legal');
    const stats = dayStatsFor(dateStr, wd.events, Date.now());

    if (activeType.mode === 'fixed') {
      dayDetailSummary.innerHTML =
        '<div class="breakdown-row"><dt>Tagestyp</dt><dd>' + escapeHtml(activeType.label) + '</dd></div>' +
        '<div class="breakdown-row highlight"><dt>Zählt als</dt><dd>' +
          C.centihoursToDisplay(dayTypeCreditCentihours(activeType)) + ' h' +
        '</dd></div>';
    } else {
      dayDetailSummary.innerHTML =
        (stats.mixed
          ? '<div class="breakdown-row"><dt>Schule ' + C.minutesToClock(stats.mixed.fromMinutes) + '–' + C.minutesToClock(stats.mixed.toMinutes) + '</dt><dd>' + C.minutesToHHMM(stats.mixed.schoolMinutes) + ' h</dd></div>' +
            '<div class="breakdown-row"><dt>Weg zum Betrieb</dt><dd>' + C.minutesToHHMM(stats.mixed.travelMinutes) + ' h</dd></div>' +
            '<div class="breakdown-row"><dt>Betrieb</dt><dd>' + C.minutesToHHMM(stats.netMinutes) + ' h</dd></div>'
          : '') +
        '<div class="breakdown-row"><dt>' + (stats.mixed ? 'Zählt insgesamt' : 'Nettoarbeitszeit') + '</dt><dd>' + C.minutesToHHMM(stats.totalNetMinutes) + ' h</dd></div>' +
        '<div class="breakdown-row"><dt>Pause</dt><dd>' + pauseCellText(stats) + '</dd></div>' +
        '<div class="breakdown-row highlight"><dt>Tagessaldo</dt><dd class="' + (stats.dailyBalanceMinutes > 0 ? 'is-positive' : stats.dailyBalanceMinutes < 0 ? 'is-negative' : '') + '">' +
          (stats.dailyBalanceMinutes == null ? '–' : (stats.dailyBalanceMinutes >= 0 ? '+' : '-') + C.minutesToHHMM(Math.abs(stats.dailyBalanceMinutes))) +
        '</dd></div>';
    }

    dayDetailEvents.innerHTML = P.sortEvents(wd.events).map((ev) =>
      '<div class="day-detail-event-row">' +
        '<span class="day-detail-event-type">' + escapeHtml(P.TYPE_LABELS[ev.type]) + '</span>' +
        '<input type="time" class="day-detail-event-time" data-event-id="' + ev.id + '" value="' + clockOf(ev.timestamp) + '" />' +
        '<button type="button" class="day-detail-event-remove" data-event-id="' + ev.id + '" aria-label="Eintrag löschen">×</button>' +
      '</div>'
    ).join('') || '<p class="empty-hint">Noch keine Einträge für diesen Tag.</p>';

    // ---- Änderungsverlauf (Abschnitt 11, sichtbar seit Version 2.2) ----
    const edits = (wd.edits || []).slice().sort((a, b) => (b.editedAt || 0) - (a.editedAt || 0));
    if (edits.length) {
      dayDetailHistory.classList.remove('is-hidden');
      dayDetailHistoryList.innerHTML = edits.map((edit) => {
        const when = new Date(edit.editedAt);
        const whenText = isNaN(when.getTime()) ? 'unbekannt'
          : O.formatDateShort(when) + ' ' + clockOf(edit.editedAt);
        const what = edit.field === 'deleted'
          ? 'Eintrag gelöscht (war ' + clockOf(edit.oldValue) + ')'
          : clockOf(edit.oldValue) + ' → ' + clockOf(edit.newValue);
        return '<div class="history-row">' +
          '<span class="history-what">' + escapeHtml(what) + '</span>' +
          '<span class="history-when">' + escapeHtml(whenText) + '</span>' +
        '</div>';
      }).join('');
    } else {
      dayDetailHistory.classList.add('is-hidden');
      dayDetailHistoryList.innerHTML = '';
    }

    dayDetailError.classList.add('is-hidden');
    zsRenderQuickFill(dateStr, wd, activeType, stats);
    const existingMenu = dayDetailDialog.querySelector('.day-detail-add-menu');
    if (existingMenu) existingMenu.remove();
  }

  // ---- Morgen-Planer: Wann aufstehen? (Version 2.8) ------------------------
  /**
   * Rückwärts vom Arbeitsbeginn: Aufstehen = Arbeitsbeginn − Puffer − Weg −
   * Fertigmachen. Nutzt denselben Arbeitsweg wie der Rest der App, damit es
   * dafür nur eine Quelle gibt.
   */
  function renderMorning() {
    const startRaw = morningStartInput.value || state.startClock || '07:00';
    const prep = parseCommuteMinutes(morningPrepInput.value) || 0;
    const buffer = parseCommuteMinutes(morningBufferInput.value) || 0;
    const commute = parseCommuteMinutes(state.commuteToWorkMinutes) || 0;
    const activity = effectiveActivity('before');

    let startMinutes;
    try {
      startMinutes = C.clockToMinutes(startRaw);
    } catch (e) {
      morningWakeTime.textContent = '–';
      morningBreakdown.innerHTML = '';
      morningHint.textContent = 'Bitte einen gültigen Arbeitsbeginn eintragen.';
      return;
    }

    const plan = C.planMorning(startMinutes, {
      prepMinutes: prep,
      bufferMinutes: buffer,
      commuteMinutes: commute,
      activity: activity,
    });

    morningWakeTime.textContent = C.minutesToClock(plan.wakeMinutes);
    morningBreakdown.innerHTML =
      planRowsHtml(plan.legs) +
      '<div class="breakdown-row highlight"><dt>Arbeitsbeginn</dt><dd>' +
        C.minutesToClock(plan.startMinutes) + '</dd></div>';

    const parts = ['Zusammen ' + C.minutesToHHMM(plan.totalMinutes) + ' Std. vor Arbeitsbeginn.'];
    if (activity) {
      parts.push('Mit „' + activity.label + '" auf dem Weg – der normale Arbeitsweg entfällt dafür.');
    } else if (commute === 0) {
      parts.push('Der Arbeitsweg steht noch auf 0 – eintragen unter Einstellungen → Arbeitsweg.');
    }
    if (plan.wakeMinutes < 0) parts.push('Achtung: Das liegt am Vorabend.');
    morningHint.textContent = parts.join(' ');

    // Alles Weitere, das an der Aufstehzeit hängt, zieht direkt mit:
    // der Zeitstrahl in der Aktivitäten-Karte, die Zeit fürs Bett und
    // der Tagesüberblick.
    renderActivityPlans();
    renderSleep();
    renderMyDay();
  }

  // ---- Aktivitäten vor und nach der Arbeit (Version 2.9) --------------------
  /**
   * Eine Aktivität ist ein Ort auf dem Weg (Gym, Einkaufen, Arzt) mit einer
   * Verweildauer und zwei Wegzeiten. Die eigentliche Rechnung steckt in
   * Calculator.planMorning / planEvening; hier geht es nur um Speichern,
   * Auswahl und Darstellung.
   */
  function activityListData() {
    const list = state.activities;
    return Array.isArray(list) ? list : [];
  }

  function activityById(id) {
    if (!id) return null;
    return activityListData().filter((a) => a.id === id)[0] || null;
  }

  /**
   * Version 3.0: Die Aktivität, wie sie HEUTE gilt.
   * Ist für den Platz eine abweichende Tagesdauer eingetragen ("heute nur
   * eine Stunde"), wird eine Kopie mit dieser Dauer zurückgegeben - die
   * gespeicherte Aktivität bleibt unangetastet.
   */
  function effectiveActivity(slot) {
    const base = activityById(slot === 'before' ? state.activityBeforeId : state.activityAfterId);
    if (!base) return null;

    const raw = slot === 'before' ? state.activityBeforeMinutesOverride : state.activityAfterMinutesOverride;
    const override = parseDurationMinutes(raw);
    if (override === null) return base;

    return Object.assign({}, base, { durationMinutes: override, isOverridden: true });
  }

  /**
   * Dauer-Eingabe: „1:20" (Stunden:Minuten) ODER eine reine Minutenzahl („80").
   * Beides ergibt 80. Gibt null zurück, wenn nichts Sinnvolles drinsteht.
   *
   * WICHTIG: Das ist bewusst KEINE Industriestunden-Eingabe. Industriestunden
   * (7,20 = 7 Std. 12 Min.) gelten in dieser App ausschließlich für die
   * Arbeitszeit selbst, weil der Betrieb so abrechnet. Alles rundherum -
   * Wege, Fertigmachen, Gym, Puffer, Schlaf - ist in ganz normalen Stunden
   * und Minuten gedacht. Deshalb trennt hier ein Doppelpunkt und kein Komma.
   */
  function parseDurationMinutes(raw) {
    const str = String(raw == null ? '' : raw).trim().replace(',', ':').replace('.', ':');
    if (!str) return null;
    if (str.indexOf(':') !== -1) {
      const parts = str.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (Number.isNaN(h) || Number.isNaN(m) || m < 0 || m > 59 || h < 0) return null;
      return h * 60 + m;
    }
    const n = parseInt(str, 10);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  }

  /**
   * Eine Dauer in Klartext: 80 -> "1 Std. 20 Min.", 45 -> "45 Min."
   * Gedacht als Rückmeldung direkt am Eingabefeld, damit nie ein Zweifel
   * bleibt, wie die Eingabe verstanden wurde - gerade weil "1,20" je nach
   * Gewohnheit entweder 1:20 oder Industriestunden meinen könnte. In dieser
   * App heißt es immer 1 Std. 20 Min.
   */
  function durationInWords(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return m + ' Min.';
    if (m === 0) return h + ' Std.';
    return h + ' Std. ' + m + ' Min.';
  }

  /** Schreibt die verstandene Dauer unter ein Eingabefeld. */
  function renderDurationEcho(input, echoEl) {
    if (!input || !echoEl) return;
    const raw = String(input.value || '').trim();
    if (!raw) {
      echoEl.textContent = '';
      echoEl.classList.remove('is-error');
      return;
    }
    const minutes = parseDurationMinutes(raw);
    if (minutes === null) {
      echoEl.textContent = 'nicht lesbar';
      echoEl.classList.add('is-error');
      return;
    }
    echoEl.textContent = '= ' + durationInWords(minutes);
    echoEl.classList.remove('is-error');
  }

  /** Zeilen einer Wegstrecke als Aufschlüsselung („von – bis", Dauer). */
  function planRowsHtml(legs) {
    return legs.map((leg) =>
      '<div class="breakdown-row"><dt>' + escapeHtml(leg.label) +
        '<span class="plan-leg-span">' + C.minutesToClock(leg.fromMinutes) + ' – ' +
        C.minutesToClock(leg.toMinutes) + '</span></dt>' +
      '<dd>' + C.minutesToHHMM(leg.minutes) + ' Std.</dd></div>'
    ).join('');
  }

  function activityChipsHtml(selectedId) {
    const chips = ['<button type="button" class="activity-chip' + (!selectedId ? ' is-active' : '') +
      '" data-activity="" aria-pressed="' + (!selectedId ? 'true' : 'false') + '">nichts</button>'];
    activityListData().forEach((a) => {
      const active = a.id === selectedId;
      chips.push('<button type="button" class="activity-chip' + (active ? ' is-active' : '') +
        '" data-activity="' + escapeHtml(a.id) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
        escapeHtml(a.label) + '</button>');
    });
    return chips.join('');
  }

  function renderActivityChips() {
    activityBeforeChips.innerHTML = activityChipsHtml(state.activityBeforeId || '');
    activityAfterChips.innerHTML = activityChipsHtml(state.activityAfterId || '');
    renderActivityOverride('before');
    renderActivityOverride('after');
  }

  /**
   * Das Feld für die Tagesdauer erscheint nur, wenn überhaupt etwas
   * eingeplant ist - sonst stünde da ein Eingabefeld ohne Bezug.
   */
  function renderActivityOverride(slot) {
    const wrap = slot === 'before' ? activityBeforeOverride : activityAfterOverride;
    const input = slot === 'before' ? activityBeforeOverrideInput : activityAfterOverrideInput;
    const base = activityById(slot === 'before' ? state.activityBeforeId : state.activityAfterId);

    wrap.classList.toggle('is-hidden', !base);
    if (!base) return;

    input.value = (slot === 'before' ? state.activityBeforeMinutesOverride : state.activityAfterMinutesOverride) || '';
    input.placeholder = C.minutesToHHMM(base.durationMinutes);

    const note = wrap.querySelector('.activity-override-note');
    const minutes = parseDurationMinutes(input.value);
    note.textContent = minutes === null
      ? 'leer = ' + durationInWords(base.durationMinutes) + ' wie gespeichert'
      : '= ' + durationInWords(minutes) + ' statt ' + durationInWords(base.durationMinutes);
  }

  function renderActivityManageList() {
    const list = activityListData();
    activityEmpty.classList.toggle('is-hidden', list.length > 0);
    activityList.innerHTML = list.map((a) =>
      '<div class="activity-item' + (a.id === editingActivityId ? ' is-editing' : '') + '">' +
        '<button type="button" class="activity-item-text" data-edit="' + escapeHtml(a.id) + '" ' +
          'aria-label="' + escapeHtml(a.label) + ' bearbeiten">' +
          '<strong>' + escapeHtml(a.label) + '</strong>' +
          '<span>' + C.minutesToHHMM(a.durationMinutes) + ' Std. · ' +
            'zuhause ↔ dort ' + a.travelHomeMinutes + ' Min. · ' +
            'dort ↔ Arbeit ' + a.travelWorkMinutes + ' Min.</span>' +
        '</button>' +
        '<button type="button" class="activity-remove" data-remove="' + escapeHtml(a.id) + '" ' +
          'aria-label="' + escapeHtml(a.label) + ' löschen">×</button>' +
      '</div>'
    ).join('');

    // Der Knopf sagt, was er tut - "Speichern" wäre beim Bearbeiten irreführend.
    activitySaveBtn.textContent = editingActivityId ? 'Änderungen speichern' : 'Aktivität speichern';
    activityCancelBtn.classList.toggle('is-hidden', !editingActivityId);
  }

  /** Bestehende Aktivität ins Formular laden. */
  function startEditActivity(id) {
    const entry = activityById(id);
    if (!entry) return;

    editingActivityId = id;
    activityLabelInput.value = entry.label;
    activityDurationInput.value = C.minutesToHHMM(entry.durationMinutes);
    activityTravelHomeInput.value = String(entry.travelHomeMinutes || '');
    activityTravelWorkInput.value = String(entry.travelWorkMinutes || '');

    renderDurationEcho(activityDurationInput, activityDurationEcho);
    renderActivityManageList();
    activityManage.open = true;
    setActivityStatus('„' + entry.label + '" wird bearbeitet.');
  }

  function cancelEditActivity() {
    editingActivityId = null;
    clearActivityForm();
    renderActivityManageList();
    setActivityStatus('');
  }

  function clearActivityForm() {
    activityLabelInput.value = '';
    activityDurationInput.value = '';
    activityTravelHomeInput.value = '';
    activityTravelWorkInput.value = '';
    renderDurationEcho(activityDurationInput, activityDurationEcho);
  }

  /**
   * Die beiden Zeitstrahlen. „Vorher" hängt am Arbeitsbeginn des Morgen-Planers,
   * „nachher" am aktuell berechneten Feierabend – so bleibt beides mit dem
   * Rechner oben konsistent, statt eigene Zeiten zu erfinden.
   */
  function renderActivityPlans() {
    const before = effectiveActivity('before');
    if (!before) {
      activityBeforePlan.innerHTML = '';
    } else {
      let startMinutes;
      try {
        startMinutes = C.clockToMinutes(morningStartInput.value || state.startClock || '07:00');
      } catch (e) {
        startMinutes = 420;
      }
      const plan = C.planMorning(startMinutes, {
        prepMinutes: parseCommuteMinutes(morningPrepInput.value) || 0,
        bufferMinutes: parseCommuteMinutes(morningBufferInput.value) || 0,
        activity: before,
      });
      activityBeforePlan.innerHTML =
        '<div class="breakdown-row highlight"><dt>Aufstehen</dt><dd>' +
          C.minutesToClock(plan.wakeMinutes) + '</dd></div>' +
        planRowsHtml(plan.legs) +
        '<div class="breakdown-row highlight"><dt>Arbeitsbeginn</dt><dd>' +
          C.minutesToClock(plan.startMinutes) + '</dd></div>';
    }

    const after = effectiveActivity('after');
    if (!after) {
      activityAfterPlan.innerHTML = '';
    } else {
      const plan = C.planEvening(lastPlannedEndMinutes, { activity: after });
      activityAfterPlan.innerHTML =
        '<div class="breakdown-row highlight"><dt>Feierabend</dt><dd>' +
          C.minutesToClock(plan.endMinutes) + '</dd></div>' +
        planRowsHtml(plan.legs) +
        '<div class="breakdown-row highlight"><dt>Zuhause</dt><dd>' +
          C.minutesToClock(plan.homeMinutes) + '</dd></div>';
    }
  }

  function renderActivities() {
    renderActivityChips();
    renderActivityManageList();
    renderActivityPlans();
  }

  function setActivitySlot(slot, id) {
    // Beim Wechsel fällt eine Tagesdauer weg - sie gehörte zur vorherigen
    // Auswahl und wäre für die neue schlicht falsch.
    persist(slot === 'before'
      ? { activityBeforeId: id, activityBeforeMinutesOverride: '' }
      : { activityAfterId: id, activityAfterMinutesOverride: '' });
    refreshPlanning();
  }

  function setActivityOverride(slot, raw) {
    persist(slot === 'before'
      ? { activityBeforeMinutesOverride: raw }
      : { activityAfterMinutesOverride: raw });
    refreshPlanning();
  }

  /** Alles neu zeichnen, was an der Tagesplanung hängt. */
  function refreshPlanning() {
    renderActivityChips();
    renderMorning();   // ruft renderActivityPlans() mit auf
    renderSleep();
    render();          // Zuhause-Ankunft hängt an der Aktivität nach der Arbeit
    renderMyDay();
  }

  function setActivityStatus(message, isError) {
    activityStatus.textContent = message;
    activityStatus.classList.toggle('is-hidden', !message);
    activityStatus.classList.toggle('is-error', !!isError);
  }

  /** Legt eine Aktivität an ODER speichert die gerade bearbeitete. */
  function saveActivity() {
    const label = String(activityLabelInput.value || '').trim();
    if (!label) {
      setActivityStatus('Bitte einen Namen eintragen, z. B. Gym.', true);
      return;
    }
    const duration = parseDurationMinutes(activityDurationInput.value);
    if (duration === null || duration === 0) {
      setActivityStatus('Bitte eine Dauer eintragen – als 1:20 oder als Minutenzahl 80.', true);
      return;
    }
    const travelHome = parseCommuteMinutes(activityTravelHomeInput.value) || 0;
    const travelWork = parseCommuteMinutes(activityTravelWorkInput.value) || 0;
    const fields = {
      label: label,
      durationMinutes: duration,
      travelHomeMinutes: travelHome,
      travelWorkMinutes: travelWork,
    };

    if (editingActivityId) {
      // Die id bleibt erhalten, damit eine eingeplante Aktivität nach dem
      // Bearbeiten weiterhin eingeplant ist.
      persist({
        activities: activityListData().map((a) =>
          a.id === editingActivityId ? Object.assign({}, a, fields) : a),
      });
      editingActivityId = null;
      clearActivityForm();
      renderActivities();
      renderMorning();
      render();
      setActivityStatus('„' + label + '" geändert.');
      return;
    }

    persist({
      activities: activityListData().concat([Object.assign({ id: 'act-' + Date.now().toString(36) }, fields)]),
    });
    clearActivityForm();
    renderActivities();
    setActivityStatus('„' + label + '" gespeichert – oben antippen, um sie einzuplanen.');
  }

  function removeActivity(id) {
    const entry = activityById(id);
    if (!entry) return;
    if (!confirm('„' + entry.label + '" wirklich löschen?')) return;

    const patch = { activities: activityListData().filter((a) => a.id !== id) };
    // Eine gelöschte Aktivität darf nicht als Auswahl zurückbleiben.
    if (state.activityBeforeId === id) {
      patch.activityBeforeId = '';
      patch.activityBeforeMinutesOverride = '';
    }
    if (state.activityAfterId === id) {
      patch.activityAfterId = '';
      patch.activityAfterMinutesOverride = '';
    }
    persist(patch);

    if (editingActivityId === id) {
      editingActivityId = null;
      clearActivityForm();
    }
    renderActivityManageList();
    refreshPlanning();
    setActivityStatus('„' + entry.label + '" gelöscht.');
  }

  // ---- Schlafrechner (Version 3.0) ------------------------------------------
  /**
   * Bewusst an die ECHTE Aufstehzeit gekoppelt, nicht an eine zweite
   * Eingabe: Wenn morgen Gym ansteht und du deshalb um 04:30 raus musst,
   * verschiebt sich die Zeit fürs Bett automatisch mit. Genau darin liegt
   * der Nutzen - eine zweite Uhrzeit von Hand zu pflegen könnte man auch im
   * Kopf rechnen.
   */
  function currentWakeMinutes() {
    let startMinutes;
    try {
      startMinutes = C.clockToMinutes(morningStartInput.value || state.startClock || '07:00');
    } catch (e) {
      return null;
    }
    return C.planMorning(startMinutes, {
      prepMinutes: parseCommuteMinutes(morningPrepInput.value) || 0,
      bufferMinutes: parseCommuteMinutes(morningBufferInput.value) || 0,
      commuteMinutes: parseCommuteMinutes(state.commuteToWorkMinutes) || 0,
      activity: effectiveActivity('before'),
    }).wakeMinutes;
  }

  function renderSleep() {
    const need = parseDurationMinutes(state.sleepNeed);
    const wakeMinutes = currentWakeMinutes();

    if (need === null || need === 0 || wakeMinutes === null) {
      sleepBedTime.textContent = '–';
      sleepHint.textContent = 'Trag unten ein, wie viel Schlaf du brauchst – z. B. 7:00.';
      sleepNowLine.textContent = '';
      return;
    }

    const now = new Date();
    const plan = C.planSleep(wakeMinutes, need, now.getHours() * 60 + now.getMinutes());

    sleepBedTime.textContent = C.minutesToClock(plan.bedMinutes);
    sleepHint.textContent = 'Für ' + C.minutesToHHMM(need) + ' Std. Schlaf bis zum Aufstehen um ' +
      C.minutesToClock(wakeMinutes) + '.';

    // Zweite Richtung: was ab jetzt noch drin wäre. Rein informativ formuliert.
    sleepNowLine.textContent = 'Ab jetzt ins Bett: ' +
      C.minutesToHHMM(plan.sleepIfNowMinutes) + ' Std. bis zum Aufstehen.';
    sleepNowLine.classList.toggle('is-short', plan.isPastBedtime);
  }

  // ---- Tab "Mein Tag": ein Zeitstrahl für den ganzen Tag (Version 3.0) ------
  /**
   * Hier wird NICHTS neu gerechnet. Alle Zeitpunkte kommen aus den bereits
   * vorhandenen Rechnungen (Morgen-Planer, Feierabend-Rechner, Abendplanung,
   * Schlafrechner) - dieser Tab führt sie nur an einer Stelle zusammen.
   * Dadurch kann er auch nicht von den einzelnen Karten abweichen.
   */
  function buildMyDay() {
    const stops = [];
    const add = (minutes, label, note, kind) => {
      stops.push({ minutes, label, note: note || '', kind: kind || '' });
    };

    let startMinutes;
    try {
      startMinutes = C.clockToMinutes(startTimeInput.value || state.startClock || '07:00');
    } catch (e) {
      return stops;
    }

    // Morgen
    const morning = C.planMorning(startMinutes, {
      prepMinutes: parseCommuteMinutes(morningPrepInput.value) || 0,
      bufferMinutes: parseCommuteMinutes(morningBufferInput.value) || 0,
      commuteMinutes: parseCommuteMinutes(state.commuteToWorkMinutes) || 0,
      activity: effectiveActivity('before'),
    });
    add(morning.wakeMinutes, 'Aufstehen', '', 'wake');
    morning.legs.forEach((leg) => {
      if (leg.key === 'prep') return; // beginnt mit dem Aufstehen, keine eigene Zeile
      add(leg.fromMinutes, leg.label, C.minutesToHHMM(leg.minutes) + ' Std.', 'travel');
    });

    // Arbeit.
    // Die Pause steht bewusst NUR als Hinweis am Arbeitsbeginn und nicht als
    // eigene Station: Wann du tatsächlich Pause machst, weiß die App nicht -
    // eine erfundene Uhrzeit auf einem Zeitstrahl wäre schlicht gelogen.
    // Auf dem Zeitstrahl stehen ÜBERALL normale Stunden, auch bei der Arbeit.
    // Industriestunden gehören ins Zeitkonto und in den Verlauf, wo gegen das
    // Wochensoll gerechnet wird - zwischen "0:10 Std." Weg und "7,20 h" Arbeit
    // hin und her zu springen wäre nur verwirrend.
    const r = C.calculateFeierabend(startMinutes, lastValidCentihours, state.breakRuleId || 'legal');
    add(startMinutes, 'Arbeitsbeginn',
      C.minutesToHHMM(C.centihoursToNormalMinutes(lastValidCentihours)) + ' Std. netto' +
      (r.pauseMinutes > 0 ? ' + ' + r.pauseMinutes + ' Min. Pause' : ''), 'work');
    add(r.endMinutes, 'Feierabend', '', 'work');

    // Abend
    const after = effectiveActivity('after');
    const evening = C.planEvening(r.endMinutes, {
      activity: after,
      commuteMinutes: parseCommuteMinutes(state.commuteFromWorkMinutes) || 0,
    });
    evening.legs.forEach((leg) => {
      add(leg.fromMinutes, leg.label, C.minutesToHHMM(leg.minutes) + ' Std.', 'travel');
    });
    if (evening.legs.length) add(evening.homeMinutes, 'Zuhause', '', 'home');

    // Nacht
    const need = parseDurationMinutes(state.sleepNeed);
    if (need) {
      const sleep = C.planSleep(morning.wakeMinutes, need, null);
      add(sleep.bedMinutes, 'Ins Bett', C.minutesToHHMM(need) + ' Std. Schlaf', 'sleep');
    }

    return stops;
  }

  function renderMyDay() {
    const stops = buildMyDay();
    const now = new Date();
    const shown = O.addDays(new Date(), myDayOffset);
    const isToday = myDayOffset === 0;
    // Nur für heute gibt es ein "jetzt". Für morgen wäre jede Markierung
    // erfunden, also bleibt der Zeitstrahl dort vollständig ungefärbt.
    const nowMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : null;

    myDayDate.textContent = O.formatDateShort(shown);
    myDayNow.textContent = isToday
      ? C.minutesToClock(now.getHours() * 60 + now.getMinutes()) + ' Uhr'
      : 'Vorschau – der Tag hat noch nicht begonnen.';

    if (myDayToggle) {
      myDayToggle.querySelectorAll('.unit-btn').forEach((btn) => {
        btn.classList.toggle('is-active', parseInt(btn.dataset.dayOffset, 10) === myDayOffset);
      });
    }

    if (!stops.length) {
      myDayTimeline.innerHTML = '<p class="empty-hint">Bitte zuerst einen gültigen Arbeitsbeginn eintragen.</p>';
      return;
    }

    // Die letzte Station, die schon vorbei ist - davor liegt die Jetzt-Marke.
    let nowIndex = -1;
    if (nowMinutes !== null) {
      stops.forEach((stop, i) => { if (stop.minutes <= nowMinutes) nowIndex = i; });
    }

    myDayTimeline.innerHTML = stops.map((stop, i) => {
      const past = nowMinutes !== null && stop.minutes <= nowMinutes;
      return (i === nowIndex ? nowMarkerHtml(nowMinutes) : '') +
        '<div class="day-stop' + (past ? ' is-past' : '') + ' is-' + stop.kind + '">' +
          '<span class="day-stop-time">' + C.minutesToClock(stop.minutes) + '</span>' +
          '<span class="day-stop-dot" aria-hidden="true"></span>' +
          '<span class="day-stop-text">' +
            '<strong>' + escapeHtml(stop.label) + '</strong>' +
            (stop.note ? '<span>' + escapeHtml(stop.note) + '</span>' : '') +
          '</span>' +
        '</div>';
    }).join('');
  }

  function setMyDayOffset(offset) {
    myDayOffset = offset;
    renderMyDay();
  }

  function nowMarkerHtml(nowMinutes) {
    return '<div class="day-now"><span class="day-now-time">' + C.minutesToClock(nowMinutes) +
      '</span><span class="day-now-line"></span><span class="day-now-label">jetzt</span></div>';
  }

  // ---- Kalender-Tab: Zeiträume einplanen (Version 3.1) ---------------------
  /**
   * Der Kalender löst das Problem, das die Monatsansicht offen ließ: Urlaub
   * Tag für Tag anzutippen ist Quälerei. Hier tippt man Anfang und Ende an
   * und setzt den Tagestyp für den ganzen Zeitraum auf einmal.
   *
   * Ablauf bewusst ohne Ziehen/Wischen, weil Drag auf Touch unzuverlässig
   * ist: erster Tipp = Anfang, zweiter Tipp = Ende, dritter Tipp beginnt
   * eine neue Auswahl.
   */
  function calendarSelectedDates() {
    if (!calendarFrom) return [];
    if (!calendarTo) return [calendarFrom];
    return O.datesInRange(calendarFrom, calendarTo, 400);
  }

  function pickCalendarDay(dateStr) {
    if (!calendarFrom || (calendarFrom && calendarTo)) {
      calendarFrom = dateStr;
      calendarTo = null;
    } else if (dateStr === calendarFrom) {
      calendarTo = dateStr; // einzelner Tag durch zweimaliges Antippen
    } else {
      calendarTo = dateStr;
      if (calendarTo < calendarFrom) {
        const swap = calendarFrom;
        calendarFrom = calendarTo;
        calendarTo = swap;
      }
    }
    renderCalendarTab();
  }

  function applyCalendarType(typeId) {
    const dates = calendarSelectedDates();
    if (!dates.length) {
      setCalendarStatus('Erst Tage im Kalender antippen.', true);
      return;
    }

    const workDays = Object.assign({}, state.workDays || {});
    dates.forEach((dateStr) => {
      const existing = workDays[dateStr];
      const next = existing
        ? Object.assign({}, existing, { events: (existing.events || []).slice() })
        : { date: dateStr, events: [], edits: [] };
      if (typeId) {
        next.dayType = typeId;
      } else {
        delete next.dayType;
      }
      // Ein Tag ohne Typ und ohne Ereignisse ist leer - dann lieber ganz raus,
      // damit er nicht als "erfasst" gilt und Minusstunden erzeugt.
      if (!next.dayType && !(next.events || []).length) {
        delete workDays[dateStr];
      } else {
        workDays[dateStr] = next;
      }
    });
    persist({ workDays: workDays });

    const type = typeId ? dayTypeById(typeId) : null;
    setCalendarStatus(dates.length + (dates.length === 1 ? ' Tag ' : ' Tage ') +
      (type ? 'auf ' + type.icon + ' ' + type.label + ' gesetzt.' : 'zurückgesetzt.'));

    calendarFrom = null;
    calendarTo = null;
    renderCalendarTab();
    refreshHistoryViews();
  }

  function setCalendarStatus(message, isError) {
    calendarStatus.textContent = message;
    calendarStatus.classList.toggle('is-hidden', !message);
    calendarStatus.classList.toggle('is-error', !!isError);
  }

  function renderCalendarTab() {
    const base = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth(), 1);
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const leading = (base.getDay() + 6) % 7; // Montag = 0
    const todayStr = P.todayKey();
    const selected = calendarSelectedDates();
    const selectedSet = {};
    selected.forEach((d) => { selectedSet[d] = true; });

    calendarMonthLabel.textContent = O.monthLabel(calendarMonthDate);

    let html = '<div class="calendar-head">' +
      O.DAY_KEYS.map((key) => '<span>' + O.DAY_LABELS_SHORT[key] + '</span>').join('') +
      '</div><div class="calendar-grid">';
    for (let i = 0; i < leading; i += 1) html += '<span class="calendar-cell is-empty"></span>';

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateStr = P.dateKey(new Date(base.getFullYear(), base.getMonth(), day));
      const wd = state.workDays && state.workDays[dateStr];
      const explicitType = wd && wd.dayType ? dayTypeById(wd.dayType) : null;
      const auto = !explicitType && !(wd && wd.events && wd.events.length) && isAutoSchoolDay(dateStr);

      const classes = ['calendar-cell', 'is-pickable'];
      if (dateStr === todayStr) classes.push('is-today');
      if (selectedSet[dateStr]) classes.push('is-selected');
      if (dateStr === calendarFrom) classes.push('is-range-start');
      if (dateStr === calendarTo) classes.push('is-range-end');
      if (auto) classes.push('is-auto');

      const mark = explicitType ? explicitType.icon : (auto ? '🎓' : '');
      html += '<button type="button" class="' + classes.join(' ') + '" data-cal-date="' + dateStr + '" ' +
        'aria-label="' + escapeHtml(formatDateDe(dateStr)) + '">' +
        '<span class="calendar-day">' + day + '</span>' +
        (mark ? '<span class="calendar-mark">' + mark + '</span>' : '') +
        '</button>';
    }
    html += '</div>';
    calendarGrid.innerHTML = html;

    // Auswahl-Text
    if (!calendarFrom) {
      calendarSelection.textContent = 'Nichts ausgewählt – tippe den ersten Tag an.';
    } else if (!calendarTo) {
      calendarSelection.textContent = 'Ab ' + formatDateDe(calendarFrom) +
        ' – jetzt den letzten Tag antippen (oder denselben Tag nochmal für einen einzelnen).';
    } else {
      calendarSelection.textContent = formatDateDe(calendarFrom) + ' – ' + formatDateDe(calendarTo) +
        ' · ' + selected.length + (selected.length === 1 ? ' Tag' : ' Tage');
    }

    // Tagestyp-Knöpfe
    calendarTypeChips.innerHTML = dayTypeList().map((type) =>
      '<button type="button" class="activity-chip" data-cal-type="' + escapeHtml(type.id) + '">' +
        escapeHtml(type.icon + ' ' + type.label) +
      '</button>'
    ).join('');

    const hasSelection = selected.length > 0;
    calendarTypeChips.classList.toggle('is-disabled', !hasSelection);
    calendarClearBtn.disabled = !hasSelection;
  }

  function shiftCalendarMonth(delta) {
    calendarMonthDate = O.addMonths(calendarMonthDate, delta);
    renderCalendarTab();
  }

  // ---- Urlaubskonto (Version 3.0) -------------------------------------------
  /**
   * Der Verbrauch steckt längst in den Tagestypen - es fehlte nur die
   * Auswertung. Der Jahresanspruch dagegen steht in keiner Datei und kann
   * auch nicht erraten werden, den muss der Nutzer eintragen.
   * Gezählt wird das laufende Kalenderjahr, inklusive bereits eingetragener
   * künftiger Urlaubstage - denn die sind ja schon verplant.
   */
  /** Anspruch und Übertrag für ein Jahr – mit Rückfall auf den Grundwert. */
  function vacationYearSettings(year) {
    const perYear = (state.vacationYears || {})[year] || {};
    const days = parseInt(String(perYear.days == null ? '' : perYear.days).trim(), 10);
    const carry = parseInt(String(perYear.carry == null ? '' : perYear.carry).trim(), 10);
    const fallback = parseInt(String(state.vacationDaysPerYear || '').trim(), 10);

    return {
      days: Number.isNaN(days) ? (Number.isNaN(fallback) ? null : fallback) : days,
      carry: Number.isNaN(carry) ? 0 : carry,
      isCustom: !Number.isNaN(days),
    };
  }

  function vacationStats(yearOverride) {
    const year = yearOverride || String(new Date().getFullYear());
    const todayStr = P.todayKey();
    let taken = 0;
    let planned = 0;

    Object.keys(state.workDays || {}).forEach((dateStr) => {
      if (dateStr.slice(0, 4) !== year) return;
      const wd = state.workDays[dateStr];
      if (!wd || wd.dayType !== 'urlaub') return;
      if (dateStr <= todayStr) taken += 1; else planned += 1;
    });

    const cfg = vacationYearSettings(year);
    const total = cfg.days === null ? null : cfg.days + cfg.carry;
    return {
      year,
      taken,
      planned,
      used: taken + planned,
      days: cfg.days,
      carry: cfg.carry,
      isCustom: cfg.isCustom,
      total,
      remaining: total === null ? null : total - (taken + planned),
    };
  }

  function renderVacation() {
    const v = vacationStats(vacationYear);
    vacationYearLabel.textContent = v.year;
    vacationUsed.textContent = String(v.used);
    vacationRemaining.textContent = v.remaining === null ? '–' : String(v.remaining);
    vacationRemaining.classList.toggle('is-negative', v.remaining !== null && v.remaining < 0);

    const parts = [v.taken + ' genommen'];
    if (v.planned) parts.push(v.planned + ' schon eingeplant');
    if (v.total === null) {
      parts.push('Anspruch unter Einstellungen → Urlaub eintragen');
    } else {
      parts.push('von ' + v.total + ' Tagen' +
        (v.carry ? ' (' + v.days + ' Anspruch + ' + v.carry + ' Übertrag)' : ' Anspruch'));
    }
    vacationHint.textContent = parts.join(' · ') + '.' +
      (v.isCustom ? '' : ' Für dieses Jahr gilt der Grundwert.');

    // Warnung, bevor es der Chef merkt.
    if (v.remaining !== null && v.remaining < 0) {
      vacationWarning.textContent = 'Achtung: ' + Math.abs(v.remaining) +
        (Math.abs(v.remaining) === 1 ? ' Tag mehr eingetragen' : ' Tage mehr eingetragen') +
        ', als dir für ' + v.year + ' zustehen.';
      vacationWarning.classList.remove('is-hidden');
    } else {
      vacationWarning.classList.add('is-hidden');
    }

    renderVacationYearSettings();
  }

  /** Eingabefelder für das aktuell gewählte Urlaubsjahr. */
  function renderVacationYearSettings() {
    const cfg = (state.vacationYears || {})[vacationYear] || {};
    vacationYearSettingLabel.textContent = vacationYear;
    vacationDaysInput.value = cfg.days == null ? '' : String(cfg.days);
    vacationCarryInput.value = cfg.carry == null ? '' : String(cfg.carry);
    vacationDaysInput.placeholder = String(state.vacationDaysPerYear || '30');
  }

  function saveVacationYear() {
    const years = Object.assign({}, state.vacationYears || {});
    const days = vacationDaysInput.value.trim();
    const carry = vacationCarryInput.value.trim();

    if (!days && !carry) {
      delete years[vacationYear]; // nichts eingetragen = Grundwert gilt wieder
    } else {
      years[vacationYear] = { days: days, carry: carry };
    }
    persist({ vacationYears: years });
    renderVacation();
  }

  function shiftVacationYear(delta) {
    vacationYear = String(parseInt(vacationYear, 10) + delta);
    renderVacation();
  }

  // ---- Stunden-Prognose für die laufende Woche (Version 3.0) ----------------
  /**
   * Beantwortet die Frage, die das Zeitkonto bisher offen ließ: Was ist
   * diese Woche noch offen, und wie verteilt sich das auf die Tage, die
   * noch kommen? Gezählt werden nur Arbeitstage laut Einstellung, die
   * weder schon abgeschlossen noch vorbei sind.
   */
  function weekForecast() {
    const monday = O.getMonday(new Date());
    const range = weekRangeKeys(monday);
    const done = sumBalance((dateStr) => dateStr >= range.from && dateStr <= range.to);
    const target = weekTargetCentihours();
    const todayStr = P.todayKey();

    let openDays = 0;
    let comingCredit = 0;
    for (let i = 0; i < 7; i += 1) {
      const dateStr = P.dateKey(O.addDays(monday, i));
      if (dateStr < todayStr) continue;          // vorbei
      if (dayBalance(dateStr)) continue;         // zählt schon mit
      if (!isWorkdayDate(dateStr)) continue;     // kein Arbeitstag
      const type = dayTypeById(dayTypeIdFor(dateStr));
      if (!typeCountsAsWorkday(type)) continue;  // "Frei"
      if (type.mode === 'fixed') {
        // Berufsschule, Urlaub & Co. bringen ihre Gutschrift selbst mit.
        // Sie sind keine "offenen" Tage, aber ihre Stunden zählen trotzdem
        // aufs Wochensoll - sonst würde die Prognose sie den übrigen Tagen
        // aufbürden und verlangt plötzlich 9,17 h statt 6,77 h pro Tag.
        comingCredit += dayTypeCreditCentihours(type);
        continue;
      }
      openDays += 1;
    }

    const remaining = target - done.ist - comingCredit;
    return {
      target,
      doneCentihours: done.ist,
      comingCredit,
      remainingCentihours: remaining,
      openDays,
      perDayCentihours: openDays > 0 ? Math.round(remaining / openDays) : null,
    };
  }

  function renderForecast() {
    const f = weekForecast();
    forecastDone.textContent = C.centihoursToDisplay(f.doneCentihours) + ' h';
    forecastOpen.textContent = C.centihoursToDisplay(Math.max(0, f.remainingCentihours)) + ' h';

    if (f.remainingCentihours <= 0) {
      forecastHint.textContent = 'Wochensoll von ' + C.centihoursToDisplay(f.target) +
        ' h ist erreicht – ' + fmtSignedIndustrial(-f.remainingCentihours) + ' h darüber.';
      forecastPerDay.textContent = '–';
      return;
    }
    if (f.openDays === 0) {
      forecastPerDay.textContent = '–';
      forecastHint.textContent = 'Diese Woche sind keine offenen Arbeitstage mehr übrig – ' +
        C.centihoursToDisplay(f.remainingCentihours) + ' h bleiben als Minus stehen.';
      return;
    }

    forecastPerDay.textContent = C.centihoursToDisplay(f.perDayCentihours) + ' h';
    forecastHint.textContent = 'Verteilt auf ' + f.openDays +
      (f.openDays === 1 ? ' offenen Arbeitstag' : ' offene Arbeitstage') + ' – das sind je ' +
      C.minutesToHHMM(C.centihoursToNormalMinutes(f.perDayCentihours)) + ' Std.' +
      (f.comingCredit > 0
        ? ' Berufsschule, Urlaub & Co. sind mit ' + C.centihoursToDisplay(f.comingCredit) +
          ' h bereits abgezogen.'
        : '');
  }

  // ---- Einstellungen: Berufsschul-Regeln (Version 3.1) ----------------------
  const INTERVAL_LABELS = { 1: 'jede Woche', 2: 'jede 2. Woche', 3: 'jede 3. Woche', 4: 'jede 4. Woche' };

  /** Eine Regel in einem Satz, damit die Liste ohne Nachdenken lesbar ist. */
  function ruleDescription(rule) {
    if (rule.kind === 'block') {
      return 'Block ' + formatDateDe(rule.from) + ' – ' + formatDateDe(rule.to);
    }
    const days = O.DAY_KEYS.filter((k) => (rule.weekdays || {})[k])
      .map((k) => O.DAY_LABELS_SHORT[k]).join(', ') || 'kein Tag';
    const parts = [days, INTERVAL_LABELS[Math.max(1, parseInt(rule.interval, 10) || 1)]];
    if (rule.interval > 1 && rule.anchor) parts.push('ab ' + formatDateDe(rule.anchor));
    if (rule.from || rule.to) {
      parts.push('gültig ' + (rule.from ? formatDateDe(rule.from) : '…') +
        ' – ' + (rule.to ? formatDateDe(rule.to) : '…'));
    }
    return parts.join(' · ');
  }

  function renderSchoolSettings() {
    // Wochentage des Regel-Formulars
    schoolWeekdayPicker.innerHTML = O.DAY_KEYS.map((key) =>
      '<button type="button" class="workday-chip' + (schoolFormWeekdays[key] ? ' is-active' : '') + '" ' +
        'data-school-day="' + key + '" aria-pressed="' + (schoolFormWeekdays[key] ? 'true' : 'false') + '">' +
        O.DAY_LABELS_SHORT[key] +
      '</button>'
    ).join('');

    // Regelliste
    const rules = schoolRuleList();
    schoolRuleList_el.innerHTML = rules.map((rule) =>
      '<div class="activity-item">' +
        '<div class="activity-item-text as-static">' +
          '<strong>' + escapeHtml(rule.label || (rule.kind === 'block' ? 'Blockwoche' : 'Schultage')) + '</strong>' +
          '<span>' + escapeHtml(ruleDescription(rule)) + '</span>' +
        '</div>' +
        '<button type="button" class="activity-remove" data-school-rule="' + escapeHtml(rule.id) + '" ' +
          'aria-label="Regel löschen">×</button>' +
      '</div>'
    ).join('');
    schoolRuleEmpty.classList.toggle('is-hidden', rules.length > 0);

    // Ferien: eigene zuerst, dann die mitgelieferten
    const own = Array.isArray(state.schoolBreaks) ? state.schoolBreaks : [];
    const packaged = state.schoolState ? F.breaksFor(state.schoolState) : [];
    schoolBreakList.innerHTML =
      own.map((b) =>
        '<div class="activity-item">' +
          '<div class="activity-item-text as-static">' +
            '<strong>' + escapeHtml(b.label || 'Ferien') + '</strong>' +
            '<span>' + escapeHtml(formatDateDe(b.from) + ' – ' + formatDateDe(b.to)) + '</span>' +
          '</div>' +
          '<button type="button" class="activity-remove" data-school-break="' + escapeHtml(b.id) + '" ' +
            'aria-label="Ferienzeitraum löschen">×</button>' +
        '</div>'
      ).join('') +
      packaged.map((b) =>
        '<div class="activity-item is-packaged">' +
          '<div class="activity-item-text as-static">' +
            '<strong>' + escapeHtml(b.label) + '</strong>' +
            '<span>' + escapeHtml(formatDateDe(b.from) + ' – ' + formatDateDe(b.to)) + ' · mitgeliefert</span>' +
          '</div>' +
        '</div>'
      ).join('');

    schoolStateSelect.value = state.schoolState || '';
    schoolStateHint.textContent = state.schoolState
      ? 'Ferientermine für ' + F.stateLabel(state.schoolState) + ' sind fest eingebaut (Stand ' +
        F.DATA_AS_OF + '). Bitte einmal mit deinem Schulkalender abgleichen – ändern sich Termine, trägst du sie unten selbst nach.'
      : 'Ohne Bundesland trägst du deine Ferien unten selbst ein. Fest eingebaut und geprüft ist bislang nur Hessen.';

    schoolHint.textContent = schoolRulesActive()
      ? 'An diesen Tagen gilt automatisch Berufsschule. In den Ferien fällt sie aus. Ein von Hand gesetzter Tagestyp und echte Stempelzeiten haben immer Vorrang.'
      : 'Noch keine Regel – Schultage müssen einzeln im Kalender oder Verlauf angetippt werden.';
  }

  function toggleSchoolFormWeekday(dayKey) {
    schoolFormWeekdays[dayKey] = !schoolFormWeekdays[dayKey];
    renderSchoolSettings();
  }

  function addSchoolRule() {
    const kind = schoolRuleKind.value;

    if (kind === 'block') {
      const from = schoolBlockFrom.value;
      const to = schoolBlockTo.value;
      if (!from || !to) {
        setSchoolStatus('Bitte Anfang und Ende des Blocks wählen.', true);
        return;
      }
      persist({ schoolRules: schoolRuleList().concat([{
        id: 'rule-' + Date.now().toString(36),
        label: schoolRuleLabel.value.trim() || 'Blockunterricht',
        kind: 'block',
        from: from <= to ? from : to,
        to: from <= to ? to : from,
      }]) });
    } else {
      if (!O.DAY_KEYS.some((k) => schoolFormWeekdays[k])) {
        setSchoolStatus('Bitte mindestens einen Wochentag wählen.', true);
        return;
      }
      const interval = Math.max(1, parseInt(schoolRuleInterval.value, 10) || 1);
      if (interval > 1 && !schoolRuleAnchor.value) {
        setSchoolStatus('Bei „jede 2. Woche" brauche ich einen Starttermin – einen Tag, an dem Schule war.', true);
        return;
      }
      persist({ schoolRules: schoolRuleList().concat([{
        id: 'rule-' + Date.now().toString(36),
        label: schoolRuleLabel.value.trim() || 'Schultage',
        kind: 'weekly',
        weekdays: Object.assign({}, schoolFormWeekdays),
        interval: interval,
        anchor: schoolRuleAnchor.value || '',
        from: schoolRuleFrom.value || '',
        to: schoolRuleTo.value || '',
      }]) });
    }

    resetSchoolRuleForm();
    renderSchoolSettings();
    refreshHistoryViews();
    setSchoolStatus('Regel gespeichert.');
  }

  function resetSchoolRuleForm() {
    schoolFormWeekdays = { mo: false, di: false, mi: false, do: false, fr: false, sa: false, so: false };
    schoolRuleLabel.value = '';
    schoolRuleAnchor.value = '';
    schoolRuleFrom.value = '';
    schoolRuleTo.value = '';
    schoolBlockFrom.value = '';
    schoolBlockTo.value = '';
    schoolRuleInterval.value = '1';
  }

  function removeSchoolRule(id) {
    persist({ schoolRules: schoolRuleList().filter((r) => r.id !== id) });
    renderSchoolSettings();
    refreshHistoryViews();
    setSchoolStatus('Regel gelöscht.');
  }

  function addSchoolBreak() {
    const from = schoolBreakFrom.value;
    const to = schoolBreakTo.value;
    if (!from || !to) {
      setSchoolStatus('Bitte Anfang und Ende der Ferien wählen.', true);
      return;
    }
    persist({ schoolBreaks: (state.schoolBreaks || []).concat([{
      id: 'brk-' + Date.now().toString(36),
      label: schoolBreakLabel.value.trim() || 'Ferien',
      from: from <= to ? from : to,
      to: from <= to ? to : from,
    }]) });
    schoolBreakLabel.value = '';
    schoolBreakFrom.value = '';
    schoolBreakTo.value = '';
    renderSchoolSettings();
    refreshHistoryViews();
    setSchoolStatus('Ferien gespeichert – an diesen Tagen fällt die Berufsschule aus.');
  }

  function removeSchoolBreak(id) {
    persist({ schoolBreaks: (state.schoolBreaks || []).filter((b) => b.id !== id) });
    renderSchoolSettings();
    refreshHistoryViews();
    setSchoolStatus('Ferienzeitraum gelöscht.');
  }

  /** Zeigt im Regel-Formular nur die Felder, die zur gewählten Art passen. */
  function syncSchoolRuleForm() {
    const isBlock = schoolRuleKind.value === 'block';
    schoolWeeklyFields.classList.toggle('is-hidden', isBlock);
    schoolBlockFields.classList.toggle('is-hidden', !isBlock);
    schoolAnchorField.classList.toggle('is-hidden',
      isBlock || (parseInt(schoolRuleInterval.value, 10) || 1) === 1);
  }

  function setSchoolStatus(message, isError) {
    schoolStatus.textContent = message;
    schoolStatus.classList.toggle('is-hidden', !message);
    schoolStatus.classList.toggle('is-error', !!isError);
  }

  /** Alles neu zeichnen, was von Tagestypen abhängt. */
  function refreshHistoryViews() {
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
    renderStatus();
    renderVacation();
    renderForecast();
    renderCalendarTab();
  }

  // ---- Einklappbare Karten im Tab "Planen" (Version 2.9) --------------------
  /**
   * Der Zustand jeder Karte wird gespeichert, damit die App genauso wieder
   * aufgeht, wie man sie verlassen hat. Der im HTML gesetzte Ausgangszustand
   * gilt nur beim allerersten Start.
   */
  function applyCollapsedCards() {
    const saved = state.collapsedCards || {};
    document.querySelectorAll('.collapsible-card').forEach((card) => {
      const key = card.dataset.card;
      if (!key || !Object.prototype.hasOwnProperty.call(saved, key)) return;
      card.open = !saved[key];
    });
  }

  function rememberCardState(card) {
    const key = card.dataset.card;
    if (!key) return;
    const saved = Object.assign({}, state.collapsedCards || {});
    saved[key] = !card.open;
    persist({ collapsedCards: saved });
  }

  // ---- Einstellungen: Arbeitstage (bestimmen das Tagessoll) ----------------
  function renderWorkdayPicker() {
    const flags = workdayFlags();
    workdayPicker.innerHTML = O.DAY_KEYS.map((key) =>
      '<button type="button" class="workday-chip' + (flags[key] ? ' is-active' : '') + '" ' +
        'data-day="' + key + '" aria-pressed="' + (flags[key] ? 'true' : 'false') + '">' +
        O.DAY_LABELS_SHORT[key] +
      '</button>'
    ).join('');
    workdayHint.textContent = workdayCount() + ' Arbeitstage · Tagessoll ' +
      zsWithNormal(dailyTargetCentihours()) + ' aus Wochensoll ' +
      C.centihoursToDisplay(weekTargetCentihours()) + ' h.';
  }

  function toggleWorkday(dayKey) {
    const flags = Object.assign({}, workdayFlags());
    flags[dayKey] = !flags[dayKey];
    if (!O.DAY_KEYS.some((key) => flags[key])) return; // mindestens ein Tag muss bleiben
    persist({ workdays: flags });
    renderWorkdayPicker();
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
    renderStatus();
  }

  // ---- Was-wäre-wenn (reine Simulation) --------------------------------------
  /** Berechnet den simulierten Feierabend für den aktuellen Sliderwert, ohne etwas zu speichern. */
  function renderWwenn() {
    const sliderMinutes = parseInt(wwennStartSlider.value, 10);
    wwennStartValue.textContent = C.minutesToClock(sliderMinutes);
    const breakRuleId = state.breakRuleId || 'legal';
    const r = C.calculateFeierabend(sliderMinutes, lastValidCentihours, breakRuleId);
    wwennResult.textContent = C.minutesToClock(r.endMinutes);
  }

  // ---- Zeitkonto: Anzeigeeinheit ---------------------------------------------
  function setActiveZeitkontoUnitButtons() {
    const unit = state.zeitkontoUnit || 'both';
    [zeitkontoUnitToggle, settingsUnitToggle].forEach((container) => {
      if (!container) return;
      container.querySelectorAll('.unit-btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.unit === unit);
      });
    });
  }

  function applyZeitkontoUnitVisibility() {
    const unit = state.zeitkontoUnit || 'both';
    document.querySelectorAll('.zk-industrial').forEach((node) => {
      node.classList.toggle('is-hidden', unit === 'normal');
    });
    document.querySelectorAll('.zk-normal-unit').forEach((node) => {
      node.classList.toggle('is-hidden', unit === 'industrie');
    });
  }

  // ---- Einstellungen: Pausenregel + Tagestypen (Version 2.1) ---------------

  /**
   * Zusätzliche Pausenregeln über den bereits vorhandenen Erweiterungspunkt
   * in calculator.js. Nichts davon ist im Rechenkern fest verdrahtet – die
   * gewählte Regel ist nur eine Funktion, die zu einer Nettozeit die nötige
   * Pause liefert.
   */
  function registerExtraBreakRules() {
    C.registerBreakRule('none', 'Keine automatische Pause', () => 0);
    C.registerBreakRule('fixed30', 'Immer 30 Minuten', () => 30);
    C.registerBreakRule('fixed45', 'Immer 45 Minuten', () => 45);
    registerCustomBreakRules();
  }

  function customRuleList() {
    return Array.isArray(state.customBreakRules) ? state.customBreakRules : [];
  }

  /** Aus gespeicherten Stufen eine Pausenfunktion bauen und registrieren. */
  function registerCustomBreakRules() {
    customRuleList().forEach((rule) => {
      const steps = (rule.steps || [])
        .filter((step) => Number.isFinite(step.fromMinutes) && Number.isFinite(step.pauseMinutes))
        .sort((a, b) => a.fromMinutes - b.fromMinutes);
      C.registerBreakRule(rule.id, rule.label, (netMinutes) => {
        let pause = 0;
        steps.forEach((step) => {
          if (netMinutes >= step.fromMinutes) pause = step.pauseMinutes;
        });
        return pause;
      });
    });
  }

  function describeRuleSteps(rule) {
    const steps = (rule.steps || []).slice().sort((a, b) => a.fromMinutes - b.fromMinutes);
    if (!steps.length) return 'keine Stufen';
    return steps
      .map((step) => 'ab ' + C.minutesToHHMM(step.fromMinutes) + ' Std. → ' + step.pauseMinutes + ' Min.')
      .join(', ');
  }

  function renderCustomRuleList() {
    const rules = customRuleList();
    if (!rules.length) {
      ruleList.innerHTML = '<p class="settings-hint">Noch keine eigene Regel angelegt.</p>';
      return;
    }
    ruleList.innerHTML = rules.map((rule) =>
      '<div class="rule-item">' +
        '<span class="rule-item-text">' +
          '<strong>' + escapeHtml(rule.label) + '</strong>' +
          '<span>' + escapeHtml(describeRuleSteps(rule)) + '</span>' +
        '</span>' +
        '<button type="button" class="rule-remove" data-rule-id="' + escapeHtml(rule.id) + '" aria-label="Regel löschen">×</button>' +
      '</div>'
    ).join('');
  }

  function setRuleStatus(text, isError) {
    ruleStatus.textContent = text;
    ruleStatus.classList.remove('is-hidden');
    ruleStatus.classList.toggle('is-error', !!isError);
  }

  /** Eingaben des Regel-Baukastens einlesen und als neue Regel speichern. */
  function saveCustomRule() {
    const label = ruleNameInput.value.trim();
    if (!label) {
      setRuleStatus('Bitte zuerst einen Namen für die Regel eingeben.', true);
      return;
    }

    const steps = [];
    [[ruleFrom1, rulePause1], [ruleFrom2, rulePause2], [ruleFrom3, rulePause3]].forEach(([fromEl, pauseEl]) => {
      const fromRaw = String(fromEl.value || '').trim();
      const pauseRaw = String(pauseEl.value || '').trim();
      if (!fromRaw && !pauseRaw) return; // Stufe bewusst leer gelassen
      const fromHours = Number(fromRaw.replace(',', '.'));
      const pauseMinutes = parseInt(pauseRaw, 10);
      if (!Number.isFinite(fromHours) || fromHours < 0 || isNaN(pauseMinutes) || pauseMinutes < 0) return;
      steps.push({ fromMinutes: Math.round(fromHours * 60), pauseMinutes });
    });

    if (!steps.length) {
      setRuleStatus('Bitte mindestens eine vollständige Stufe eintragen (ab … Std. → … Min.).', true);
      return;
    }

    const rule = {
      id: 'custom-' + Date.now().toString(36),
      label: label,
      steps: steps,
    };
    const customBreakRules = customRuleList().concat([rule]);
    persist({ customBreakRules });

    registerCustomBreakRules();
    persist({ breakRuleId: rule.id }); // direkt verwenden
    renderBreakRuleOptions();
    renderCustomRuleList();
    ruleNameInput.value = '';
    [ruleFrom1, rulePause1, ruleFrom2, rulePause2, ruleFrom3, rulePause3].forEach((input) => { input.value = ''; });
    setRuleStatus('Regel „' + rule.label + '" gespeichert und aktiviert: ' + describeRuleSteps(rule));

    render();
    renderStatus();
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
  }

  function removeCustomRule(ruleId) {
    const remaining = customRuleList().filter((rule) => rule.id !== ruleId);
    const patch = { customBreakRules: remaining };
    // Falls gerade genau diese Regel aktiv war, zurück auf die gesetzliche.
    if (state.breakRuleId === ruleId) patch.breakRuleId = 'legal';
    persist(patch);
    renderBreakRuleOptions();
    renderCustomRuleList();
    setRuleStatus('Regel gelöscht.');
    render();
    renderStatus();
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
  }

  function renderBreakRuleOptions() {
    const current = state.breakRuleId || 'legal';
    breakRuleSelect.innerHTML = '';
    Object.keys(C.breakRules).forEach((id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = C.breakRules[id].label;
      if (id === current) option.selected = true;
      breakRuleSelect.appendChild(option);
    });
  }

  function renderDayTypeSettings() {
    dayTypeSettings.innerHTML = '';
    dayTypeList().forEach((type) => {
      const row = document.createElement('div');
      row.className = 'daytype-row';
      if (type.mode === 'actual') {
        row.innerHTML =
          '<span class="daytype-name">' + escapeHtml(type.icon + ' ' + type.label) + '</span>' +
          '<span class="daytype-note">zählt die erfasste Zeit</span>';
      } else {
        row.innerHTML =
          '<span class="daytype-name">' + escapeHtml(type.icon + ' ' + type.label) + '</span>' +
          '<input type="text" inputmode="decimal" class="daytype-input" ' +
            'data-type-id="' + escapeHtml(type.id) + '" ' +
            'placeholder="' + escapeHtml(C.centihoursToDisplay(lastValidCentihours)) + '" ' +
            'value="' + escapeHtml(type.creditIndustrial || '') + '" ' +
            'aria-label="Gutschrift für ' + escapeHtml(type.label) + '" />' +
          '<span class="daytype-unit">h</span>';
      }
      dayTypeSettings.appendChild(row);
    });
  }

  function updateDayTypeCredit(typeId, rawValue) {
    const trimmed = String(rawValue || '').trim();
    let stored = '';
    if (trimmed) {
      try {
        stored = C.centihoursToDisplay(C.toCentihours(trimmed));
      } catch (e) {
        stored = '';
      }
    }
    const dayTypes = dayTypeList().map((type) => (
      type.id === typeId ? Object.assign({}, type, { creditIndustrial: stored }) : Object.assign({}, type)
    ));
    persist({ dayTypes });
    return stored;
  }

  // ---- Datei-Download (gemeinsam für CSV und Backup) -------------------------
  /**
   * Bietet einen Text als Datei zum Download an. In einer Android-WebView wird
   * ein Blob-Download je nach Gerät stillschweigend verworfen – deshalb gibt es
   * überall zusätzlich den Weg über das Textfeld/die Zwischenablage.
   */
  function downloadTextFile(fileName, text, mimeType) {
    try {
      const blob = new Blob(['﻿' + text], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  function formatDateDe(dateStr) {
    const parts = String(dateStr).split('-');
    return parts.length === 3 ? parts[2] + '.' + parts[1] + '.' + parts[0] : dateStr;
  }

  /**
   * Alle Datumsangaben, zu denen überhaupt Daten vorliegen – aus den echten
   * Arbeitstagen UND aus dem alten Wochenbestand (dort über den Wochen-
   * Schlüssel zurückgerechnet).
   */
  function allDataDates() {
    const set = {};
    Object.keys(state.workDays || {}).forEach((dateStr) => { set[dateStr] = true; });

    Object.keys(state.weeks || {}).forEach((weekKey) => {
      const monday = O.mondayForWeekKey(weekKey);
      if (!monday) return;
      const week = state.weeks[weekKey] || {};
      O.DAY_KEYS.forEach((dayKey, idx) => {
        const raw = week.days && week.days[dayKey];
        if (raw && String(raw).trim()) set[P.dateKey(O.addDays(monday, idx))] = true;
      });
    });

    // Version 3.0: Automatische Berufsschultage haben oft gar keinen eigenen
    // Eintrag - sie ergeben sich ja aus einer Regel. Damit sie trotzdem ins
    // Zeitkonto zählen, werden sie hier ergänzt. Bewusst BEGRENZT auf den
    // Zeitraum vom ersten erfassten Tag bis heute: ohne Grenze müsste man
    // eine unendliche Vergangenheit ablaufen, und Tage vor der ersten
    // Nutzung der App sollen ohnehin nicht mitzählen.
    if (schoolRulesActive()) {
      const known = Object.keys(set).sort();
      const todayStr = P.todayKey();
      if (known.length) {
        let cursor = new Date(known[0] + 'T00:00:00');
        for (let guard = 0; guard < 1100; guard += 1) { // ~3 Jahre Sicherheitsnetz
          const dateStr = P.dateKey(cursor);
          if (dateStr > todayStr) break;
          if (isAutoSchoolDay(dateStr)) set[dateStr] = true;
          cursor = O.addDays(cursor, 1);
        }
      }
    }

    return Object.keys(set).sort();
  }

  /** Eine CSV-Zeile im vorgegebenen Format, oder null wenn der Tag leer ist. */
  function csvRowForDate(dateStr) {
    const value = dayValueFor(dateStr);
    if (!String(value).trim()) return null;

    const type = dayTypeById(dayTypeIdFor(dateStr));
    const wd = state.workDays && state.workDays[dateStr];
    const netCentihours = safeToCentihours(value, 0);
    const netMinutes = C.centihoursToNormalMinutes(netCentihours);

    let kommen = '';
    let gehen = '';
    let pauseMinutes = 0;
    if (type.mode !== 'fixed' && wd && wd.events && wd.events.length) {
      const stats = dayStatsFor(dateStr, wd.events, Date.now());
      if (stats.clockInEvent) kommen = clockOf(stats.clockInEvent.timestamp);
      if (stats.clockOutEvent) gehen = clockOf(stats.clockOutEvent.timestamp);
      pauseMinutes = stats.deductedBreakMinutes;
    }

    // Sollzeit: an festen Tagestypen ist die Gutschrift zugleich das Soll,
    // dadurch ist der Saldo dort sauber 0 statt eines Schein-Minus.
    const sollCentihours = type.mode === 'fixed' ? netCentihours : lastValidCentihours;
    const sollMinutes = C.centihoursToNormalMinutes(sollCentihours);

    return [
      formatDateDe(dateStr),
      kommen,
      gehen,
      C.minutesToHHMM(pauseMinutes, { padHours: true }),
      C.minutesToHHMM(netMinutes, { padHours: true }),
      C.minutesToHHMM(sollMinutes, { padHours: true }),
      C.minutesToHHMM(netMinutes - sollMinutes, { padHours: true }),
    ];
  }

  // ---- Backup: erstellen und wiederherstellen (Version 2.2) -----------------
  const BACKUP_FORMAT = 'feierabend-rechner-backup';

  function backupFileName() {
    return 'Feierabend-Rechner_Backup_' + P.todayKey() + '.json';
  }

  function setBackupStatus(text, isError) {
    backupStatus.textContent = text;
    backupStatus.classList.remove('is-hidden');
    backupStatus.classList.toggle('is-error', !!isError);
  }

  function exportBackup() {
    const backup = {
      format: BACKUP_FORMAT,
      appVersion: '2.2',
      schemaVersion: state.schemaVersion || 2,
      exportedAt: new Date().toISOString(),
      state: state,
    };
    const json = JSON.stringify(backup, null, 2);
    backupTextarea.value = json;
    backupTextBlock.open = true;
    downloadTextFile(backupFileName(), json, 'application/json');
    const dayCount = Object.keys(state.workDays || {}).length;
    setBackupStatus(
      'Backup erstellt (' + dayCount + ' erfasste Tage). Es sollte als ' + backupFileName() +
      ' im Download-Ordner liegen. Falls nicht: Text unten kopieren und sicher ablegen.'
    );
  }

  /**
   * Spielt ein Backup ein. Warnt vorher ausdrücklich und zeigt, was im Backup
   * steckt – Wiederherstellen überschreibt den aktuellen Stand vollständig.
   */
  function applyBackupJson(rawText) {
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      setBackupStatus('Das ist kein gültiges Backup – der Text konnte nicht gelesen werden.', true);
      return;
    }

    const incoming = (parsed && parsed.state && typeof parsed.state === 'object') ? parsed.state : parsed;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      setBackupStatus('Das ist kein gültiges Backup – unerwarteter Inhalt.', true);
      return;
    }

    const known = ['weeks', 'workDays', 'presets', 'weeklyTargetIndustrial', 'industrialInput'];
    const looksValid = known.some((key) => Object.prototype.hasOwnProperty.call(incoming, key));
    if (!looksValid) {
      setBackupStatus('Das sieht nicht nach einem Backup dieser App aus.', true);
      return;
    }

    const dates = Object.keys(incoming.workDays || {}).sort();
    const weekCount = Object.keys(incoming.weeks || {}).length;
    const range = dates.length ? formatDateDe(dates[0]) + ' bis ' + formatDateDe(dates[dates.length - 1]) : 'keine Stempeltage';
    let exportedAt = 'unbekannt';
    if (parsed && parsed.exportedAt) {
      const d = new Date(parsed.exportedAt);
      if (!isNaN(d.getTime())) exportedAt = O.formatDateShort(d) + ' ' + clockOf(d.getTime());
    }

    const confirmed = confirm(
      'Backup wirklich wiederherstellen?\n\n' +
      'Erstellt am: ' + exportedAt + '\n' +
      'Enthält: ' + dates.length + ' Tage mit Stempelzeiten (' + range + '), ' + weekCount + ' Wochen.\n\n' +
      'Der aktuelle Stand wird ersetzt. Er wird vorher automatisch gesichert ' +
      '(Mehr → Sicherungen auf diesem iPhone).' +
      (parsed && String(parsed.appVersion || '').indexOf('zeitstempel') !== 0
        ? '\n\nHINWEIS: Das sieht nach einem Backup aus einer anderen App aus (nicht Zeitstempel).' : '')
    );
    if (!confirmed) {
      setBackupStatus('Abgebrochen – es wurde nichts verändert.');
      return;
    }

    // Auf die Standardwerte legen, damit Felder aus neueren Versionen, die im
    // Backup fehlen, nicht undefined werden.
    // ZEITSTEMPEL: jetzigen Stand vorher auf dem Gerät sichern.
    const doRestore = () => { S.save(Object.assign({}, S.DEFAULT_STATE, incoming)); location.reload(); };
    if (typeof zsSnapshot === 'function') zsSnapshot('vor Wiederherstellen').then(doRestore, doRestore);
    else doRestore();
  }

  // ---- Statistik (Version 2.2) ----------------------------------------------
  function statsFor(range) {
    const monthKey = O.monthKeyFor(new Date());
    const dates = allDataDates().filter((dateStr) => range === 'all' || dateStr.slice(0, 7) === monthKey);

    const typeCounts = {};
    let workDayCount = 0;
    let netSumWork = 0;
    let startSum = 0;
    let startCount = 0;
    let endSum = 0;
    let endCount = 0;
    let countedDays = 0;

    dates.forEach((dateStr) => {
      const value = dayValueFor(dateStr);
      if (!String(value).trim()) return; // angelegter, aber leerer Tag
      // Der gerade laufende Tag und vorausgeplante Tage verzerren jeden
      // Durchschnitt (um 08:37 sind erst 1,5 Std. erfasst) - also erst zählen,
      // wenn der Tag wirklich abgeschlossen ist.
      if (dateStr > P.todayKey() || !dayIsClosed(dateStr)) return;
      countedDays += 1;

      const typeId = dayTypeIdFor(dateStr);
      typeCounts[typeId] = (typeCounts[typeId] || 0) + 1;

      const type = dayTypeById(typeId);
      if (type.mode === 'fixed') return; // Urlaub/Krank zählen nicht als Arbeitstag

      workDayCount += 1;
      netSumWork += safeToCentihours(value, 0);

      const wd = state.workDays && state.workDays[dateStr];
      if (wd && wd.events && wd.events.length) {
        const stats = dayStatsFor(dateStr, wd.events, Date.now());
        if (stats.clockInEvent) {
          startSum += P.minutesOfDay(stats.clockInEvent.timestamp);
          startCount += 1;
        }
        if (stats.clockOutEvent) {
          endSum += P.minutesOfDay(stats.clockOutEvent.timestamp);
          endCount += 1;
        }
      }
    });

    return {
      countedDays,
      workDayCount,
      netSumWork,
      typeCounts,
      avgNet: workDayCount ? Math.round(netSumWork / workDayCount) : null,
      avgStart: startCount ? Math.round(startSum / startCount) : null,
      avgEnd: endCount ? Math.round(endSum / endCount) : null,
    };
  }

  function renderStats() {
    const stats = statsFor(statRange);
    // Der Saldo muss denselben Zeitraum abdecken wie die übrigen Kennzahlen,
    // sonst stünde im Monatsblick der Gesamtstand.
    const statMonthKey = O.monthKeyFor(new Date());
    const balance = sumBalance(
      statRange === 'all' ? null : (dateStr) => dateStr.slice(0, 7) === statMonthKey
    ).diff;

    const withNormal = zsWithNormal;

    const rows = [
      ['Ø Arbeitsbeginn', stats.avgStart === null ? '–' : C.minutesToClock(stats.avgStart) + ' Uhr'],
      ['Ø Feierabend', stats.avgEnd === null ? '–' : C.minutesToClock(stats.avgEnd) + ' Uhr'],
      ['Ø Nettoarbeitszeit', stats.avgNet === null ? '–' : withNormal(stats.avgNet)],
      ['Arbeitstage', String(stats.workDayCount)],
      ['Gesamte Arbeitszeit', withNormal(stats.netSumWork)],
    ];

    statList.innerHTML = rows.map(([label, value]) =>
      '<div class="breakdown-row"><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>'
    ).join('') +
      '<div class="breakdown-row highlight"><dt>Zeitkonto gesamt</dt>' +
      '<dd class="' + (balance > 0 ? 'is-positive' : (balance < 0 ? 'is-negative' : '')) + '">' +
        escapeHtml(fmtSignedIndustrial(balance)) + ' h</dd></div>';

    statHint.textContent = statRange === 'month'
      ? 'Zeitraum: ' + O.monthLabel(new Date()) + ' · ' + stats.countedDays + ' erfasste Tage. Urlaub, Krank und Feiertag zählen nicht als Arbeitstag.'
      : 'Zeitraum: alle erfassten Tage (' + stats.countedDays + '). Urlaub, Krank und Feiertag zählen nicht als Arbeitstag.';

    statTypes.innerHTML = dayTypeList().map((type) =>
      '<div class="stat-type-row">' +
        '<span>' + escapeHtml(type.icon + ' ' + type.label) + '</span>' +
        '<span class="stat-type-count">' + (stats.typeCounts[type.id] || 0) + '</span>' +
      '</div>'
    ).join('');
  }

  // ---- CSV-Export -------------------------------------------------------------
  function exportCsv() {
    // Format laut Spezifikation (Abschnitt 20), eine Zeile je Tag:
    // Datum;Kommen;Gehen;Pause;Nettoarbeitszeit;Sollzeit;Saldo
    const rows = [['Datum', 'Kommen', 'Gehen', 'Pause', 'Nettoarbeitszeit', 'Sollzeit', 'Saldo']];
    let dayRows = 0;
    allDataDates().forEach((dateStr) => {
      const row = csvRowForDate(dateStr);
      if (!row) return;
      rows.push(row);
      dayRows += 1;
    });

    // Zweiter Block mit den Wochensummen, durch eine Leerzeile abgetrennt,
    // damit der Tagesblock oben exakt dem vorgegebenen Format entspricht.
    const weeks = effectiveWeeksMap();
    const targetCentihours = weekTargetCentihours();
    rows.push([]);
    rows.push(['Woche', 'Wochensoll', 'Wochen-Ist', 'Differenz']);
    Object.keys(weeks).sort().forEach((weekKey) => {
      const week = weeks[weekKey];
      if (!O.hasAnyEntry(week)) return;
      const sum = O.weekSumCentihours(week, C.toCentihours);
      rows.push([
        weekKey,
        C.centihoursToDisplay(targetCentihours),
        C.centihoursToDisplay(sum),
        fmtSignedIndustrial(sum - targetCentihours),
      ]);
    });

    const csv = rows.map((row) => row.map(csvEscape).join(';')).join('\r\n');
    const fileName = 'Feierabend-Rechner_Zeiten_' + P.todayKey() + '.csv';
    backupTextarea.value = csv;
    downloadTextFile(fileName, csv, 'text/csv;charset=utf-8;');
    setBackupStatus('CSV mit ' + dayRows + ' Tagen erstellt. Sollte als ' + fileName +
      ' im Download-Ordner liegen – falls nicht, steht sie hier im Textfeld.');
  }

  function csvEscape(value) {
    const str = String(value == null ? '' : value);
    if (str.indexOf(';') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // ---- Überstunden-Rechner / Zeitkonto --------------------------------------
  function weekKeyForCurrent() {
    return O.weekKeyFor(currentWeekMonday);
  }

  function getWeek(weekKey) {
    return (state.weeks && state.weeks[weekKey]) || O.emptyWeek();
  }

  /** Liefert eine neue weeks-Map mit garantiert vorhandenem Eintrag für weekKey (für persist()). */
  function ensureWeek(weekKey) {
    const weeks = Object.assign({}, state.weeks || {});
    if (!weeks[weekKey]) {
      weeks[weekKey] = O.emptyWeek();
    } else {
      const w = weeks[weekKey];
      weeks[weekKey] = {
        days: Object.assign({}, w.days),
        mode: Object.assign({}, w.mode || {}),
        punches: Object.assign({}, w.punches || {}),
      };
    }
    return weeks;
  }

  /** ZEITSTEMPEL: "8:00 h" – die Normalzeit in Klammern nur bei Industrie-Anzeige. */
  function zsWithNormal(minutes) {
    return C.centihoursToDisplay(minutes) + ' h' +
      (C.getDisplayMode() === 'industrie' ? ' (' + C.minutesToHHMM(minutes) + ' Std.)' : '');
  }

  function fmtSignedIndustrial(centihours) {
    if (centihours === 0) return '±' + C.centihoursToDisplay(0);
    const sign = centihours > 0 ? '+' : '-';
    return sign + C.centihoursToDisplay(Math.abs(centihours));
  }

  function fmtSignedNormal(totalMinutes) {
    if (totalMinutes === 0) return '±' + C.minutesToHHMM(0);
    const sign = totalMinutes > 0 ? '+' : '-';
    return sign + C.minutesToHHMM(Math.abs(totalMinutes));
  }

  /**
   * Wertet die vier Stempeluhr-Rohzeiten eines Tages aus.
   * Gibt { text, cls } zurück: cls ist '' (unvollständig), 'is-ok' oder 'is-error'.
   */
  /**
   * Liest die Pausenangabe eines Tages: leer/ungültig = automatisch.
   * Alt-Einträge aus der früheren Vier-Felder-Erfassung (Pause-Beginn und
   * Pause-Ende) werden dabei weiterhin verstanden und in Minuten umgerechnet.
   */
  function pauseOverrideFor(punches) {
    const raw = String((punches && punches.pause) || '').trim();
    if (raw) {
      const minutes = parseInt(raw, 10);
      if (!isNaN(minutes) && minutes >= 0) return minutes;
    }
    if (punches && punches.breakStart && punches.breakEnd) {
      try {
        const diff = C.clockToMinutes(punches.breakEnd) - C.clockToMinutes(punches.breakStart);
        if (diff >= 0) return diff;
      } catch (e) {
        // unbrauchbare Altdaten einfach ignorieren
      }
    }
    return null;
  }

  /**
   * Wertet Kommen/Gehen eines Tages aus. Die Pause kommt automatisch aus der
   * eingestellten Pausenregel, sofern nichts Eigenes eingetragen ist.
   */
  function describePunches(punches) {
    const p = punches || {};
    if (!p.start || !p.end) return { text: 'Kommen und Gehen eintragen – die Pause rechnet die App.', cls: '' };
    try {
      const override = pauseOverrideFor(p);
      const r = C.calculateFromSpan(p.start, p.end, override === null ? undefined : override, state.breakRuleId || 'legal');
      return {
        text: '= ' + C.minutesToHHMM(r.netMinutes) + ' Netto (' + C.centihoursToDisplay(r.industrialCentihours) + ' h) · ' +
          r.pauseMinutes + ' Min. Pause' + (r.automatic ? ' (automatisch)' : ' (selbst eingetragen)'),
        cls: 'is-ok',
      };
    } catch (e) {
      return { text: e.message, cls: 'is-error' };
    }
  }

  /** Baut die 7 Tages-Zeilen für die aktuell angezeigte Woche neu auf. */
  function renderWeekDays() {
    const weekKey = weekKeyForCurrent();
    const week = getWeek(weekKey);
    const todayStr = new Date().toDateString();

    weekDaysEl.innerHTML = '';
    O.DAY_KEYS.forEach((key, idx) => {
      const date = O.addDays(currentWeekMonday, idx);
      const dateKeyStr = P.dateKey(date);
      const workDay = state.workDays && state.workDays[dateKeyStr];
      const dayMode = (week.mode && week.mode[key]) || 'manual';
      const punches = (week.punches && week.punches[key]) || {};
      const dayValue = (week.days && week.days[key]) || '';

      const row = document.createElement('div');
      row.className = 'week-day-row' + (date.toDateString() === todayStr ? ' is-today' : '');
      row.dataset.day = key;

      let html = '<div class="week-day-top">';
      html +=
        '<div class="week-day-label">' +
          '<span class="week-day-name">' + O.DAY_LABELS_SHORT[key] + '</span>' +
          '<span class="week-day-date">' + O.formatDateShort(date) + '</span>' +
        '</div>';

      // Version 2.1: Tagestyp-Chip. Immer vorhanden und zugleich der Einstieg
      // in die Tagesdetails – dadurch sind auch Tage OHNE Stempelungen
      // erreichbar, was für Urlaub, Krank oder Feiertag nötig ist.
      const dayType = dayTypeById(dayTypeIdFor(dateKeyStr));
      const isDefaultType = dayType.id === dayTypeList()[0].id;
      html +=
        '<button type="button" class="week-day-type' + (isDefaultType ? '' : ' is-special') + '" ' +
          'data-date-key="' + dateKeyStr + '" aria-label="Tagestyp und Details für ' + O.DAY_LABELS[key] + '">' +
          escapeHtml(dayType.icon) +
          (isDefaultType ? '' : '<span>' + escapeHtml(dayType.label) + '</span>') +
        '</button>';

      // Fester Tagestyp (Urlaub, Krank, Feiertag …): Es zählt die eingestellte
      // Gutschrift, erfasste Zeiten spielen an diesem Tag keine Rolle.
      if (dayType.mode === 'fixed') {
        const credit = dayTypeCreditCentihours(dayType);
        html +=
          '<button type="button" class="week-day-real" data-date-key="' + dateKeyStr + '">' +
            '<span class="week-day-real-times">' +
              '<span class="week-day-real-clock">' + escapeHtml(dayType.label) +
                (dayTypeUsesDefault(dayType) ? ' · Standard' : '') +
              '</span>' +
              '<span class="week-day-real-net">' + C.centihoursToDisplay(credit) + ' h</span>' +
            '</span>' +
          '</button>';
        row.innerHTML = html + '</div>';
        weekDaysEl.appendChild(row);
        return;
      }

      // Version 2.0: Tage mit echten Stempeluhr-Events zeigen Kommen/Gehen/Pause/
      // Netto/Saldo statt der reinen Dezimalzahl (Abschnitt 9), und die alte
      // manuelle/Punch-Eingabe (unverändert) bleibt für Tage ohne Events erhalten.
      if (workDay && workDay.events && workDay.events.length) {
        const targetNetMinutes = C.centihoursToNormalMinutes(lastValidCentihours);
        const breakRule = C.getBreakRule(state.breakRuleId || 'legal');
        const stats = dayStatsFor(dateKeyStr, workDay.events, Date.now());
        const sorted = P.sortEvents(workDay.events);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const clockRange = first ? clockOf(first.timestamp) + (last && last !== first ? '–' + clockOf(last.timestamp) : '') : '–';
        const balanceCls = stats.status !== 'done' ? '' : (stats.dailyBalanceMinutes > 0 ? 'is-positive' : stats.dailyBalanceMinutes < 0 ? 'is-negative' : 'is-zero');
        const balanceText = stats.status === 'done'
          ? (stats.dailyBalanceMinutes >= 0 ? '+' : '-') + C.minutesToHHMM(Math.abs(stats.dailyBalanceMinutes))
          : '●';

        html +=
          '<button type="button" class="week-day-real" data-date-key="' + dateKeyStr + '">' +
            '<span class="week-day-real-times">' +
              '<span class="week-day-real-clock">' + escapeHtml(clockRange) + (stats.status !== 'done' ? ' · <span class="week-day-real-open">' + P.statusLabel(stats.status) + '</span>' : '') + '</span>' +
              '<span class="week-day-real-net">' + C.minutesToHHMM(stats.totalNetMinutes) + ' h</span>' +
            '</span>' +
            '<span class="week-day-real-balance ' + balanceCls + '">' + escapeHtml(balanceText) + '</span>' +
          '</button>';
        row.innerHTML = html + '</div>';
        weekDaysEl.appendChild(row);
        return;
      }

      if (dayMode === 'punch') {
        html += '<span class="week-day-result">' + (dayValue ? escapeHtml(dayValue) + ' h' : '–') + '</span>';
      } else {
        html +=
          '<div class="week-day-manual">' +
            '<input type="text" inputmode="decimal" class="week-day-input" data-day="' + key + '" ' +
              'placeholder="–" value="' + escapeHtml(dayValue) + '" ' +
              'aria-label="' + O.DAY_LABELS[key] + ' Industriestunden" />' +
            '<span class="week-day-unit">h</span>' +
          '</div>';
      }

      html +=
        '<button type="button" class="week-day-mode-btn" data-day="' + key + '" ' +
          'aria-label="Eingabeart für ' + O.DAY_LABELS[key] + ' wechseln" ' +
          'title="' + (dayMode === 'punch' ? 'Direkt als Zahl eintragen' : 'Über Kommen/Gehen erfassen') + '">' +
          (dayMode === 'punch' ? '🔢' : '🕐') +
        '</button>';
      html += '</div>'; // .week-day-top

      if (dayMode === 'punch') {
        const desc = describePunches(punches);
        html += '<div class="week-day-punch">';
        html += '<div class="punch-grid">';
        PUNCH_FIELDS.forEach((f) => {
          const isNumber = f.type === 'number';
          html +=
            '<label class="punch-field' + (isNumber ? ' punch-field--wide' : '') + '">' +
              '<span>' + f.label + '</span>' +
              '<input type="' + (isNumber ? 'text' : 'time') + '" ' +
                (isNumber ? 'inputmode="numeric" placeholder="automatisch" ' : '') +
                'class="punch-input" data-day="' + key + '" data-field="' + f.key + '" ' +
                'value="' + escapeHtml(punches[f.key] || '') + '" ' +
                'aria-label="' + f.label + ' (' + O.DAY_LABELS[key] + ')" />' +
            '</label>';
        });
        html += '</div>'; // .punch-grid
        html += '<p class="week-day-punch-result' + (desc.cls ? ' ' + desc.cls : '') + '" data-day="' + key + '">' +
          escapeHtml(desc.text) + '</p>';
        html += '</div>'; // .week-day-punch
      }

      row.innerHTML = html;
      weekDaysEl.appendChild(row);
    });
  }

  /** Ersetzt in week.days die Tage, für die echte Stempeluhr-Events existieren,
   *  durch den daraus abgeleiteten Netto-Wert (als Dezimalstring, exakt im
   *  Format, das C.toCentihours ohnehin erwartet) - dadurch bleiben
   *  overtime.js/weekSumCentihours/runningBalanceCentihours komplett
   *  unverändert und kennen die neue Event-Struktur gar nicht (Abschnitt 12:
   *  Plus/Minus-Stunden aus echten Zeiten, ohne Doppel-Speicherung). */
  /**
   * Ist der Tag fertig – also darf er ins Zeitkonto einfließen?
   * Genau darum geht es: Das Konto soll sich erst am Feierabend bewegen und
   * nicht schon den ganzen Tag über im Minus stehen, nur weil der Tag läuft.
   * Fertig ist ein Tag, wenn "Gehen" gestempelt wurde, wenn es ein fester
   * Tagestyp ist (Urlaub, Krank …) oder wenn der Wert von Hand eingetragen
   * wurde. Offen ist nur der gerade laufende Arbeitstag.
   */
  function dayIsClosed(dateStr) {
    const type = dayTypeById(dayTypeIdFor(dateStr));
    if (type.mode === 'fixed') return true;
    const wd = state.workDays && state.workDays[dateStr];
    if (wd && wd.events && wd.events.length) {
      return P.statusForEvents(wd.events) === P.STATUS.DONE;
    }
    return true; // manuell eingetragen oder gar nichts erfasst
  }

  /**
   * opts.closedOnly     – offene (laufende) Tage nicht mitzählen
   * opts.excludeToday   – heutigen Tag komplett aussparen (für den Übertrag)
   */
  function effectiveWeekDays(week, monday, opts) {
    const options = opts || {};
    const todayStr = P.todayKey();
    const days = Object.assign({}, week.days);
    O.DAY_KEYS.forEach((dayKey, idx) => {
      const dateStr = P.dateKey(O.addDays(monday, idx));
      if (options.excludeToday && dateStr === todayStr) {
        days[dayKey] = '';
        return;
      }
      if (options.closedOnly && !dayIsClosed(dateStr)) {
        days[dayKey] = '';
        return;
      }
      days[dayKey] = effectiveDayValue(dateStr, days[dayKey]);
    });
    return Object.assign({}, week, { days });
  }

  // ---- Tagestypen (Version 2.1) ---------------------------------------------
  function dayTypeList() {
    const list = state.dayTypes;
    return (Array.isArray(list) && list.length) ? list : S.DEFAULT_STATE.dayTypes;
  }

  function dayTypeById(id) {
    const list = dayTypeList();
    const type = list.filter((t) => t.id === id)[0] || list[0];
    // ZEITSTEMPEL: Einstellung "Mittwoch zählt pauschal" -> der Mischtag
    // verhält sich wie ein fester Tag mit der Standard-Nettoarbeitszeit.
    if (type && type.mixed && state.mixedDayMode === 'flat') {
      return Object.assign({}, type, { mode: 'fixed', creditIndustrial: '' });
    }
    return type;
  }

  /**
   * Gesetzter Tagestyp eines Datums; ohne Angabe gilt der erste Typ (Arbeit).
   *
   * Version 3.0: Greift für den Tag eine Berufsschul-Regel (fester Wochentag
   * oder Blockwoche), gilt Berufsschule - ABER nur, wenn nichts von Hand
   * gesetzt wurde. Eine ausdrückliche Eingabe schlägt die Automatik immer,
   * sonst könnte man einen einzelnen Schultag nie als Urlaub oder Krank
   * eintragen.
   */
  function dayTypeIdFor(dateStr) {
    const wd = state.workDays && state.workDays[dateStr];
    if (wd && wd.dayType) return wd.dayType;

    const rule = O.schoolRuleFor(dateStr, schoolRuleList(), allSchoolBreaks());

    // WICHTIG: Echte Stempelzeiten schlagen die Automatik ebenfalls.
    // Sonst würde das nachträgliche Einschalten von "jeden Mittwoch
    // Berufsschule" alle vergangenen Mittwoche zu Schultagen erklären und
    // die dort tatsächlich erfassten Zeiten durch eine pauschale Gutschrift
    // ersetzen - erfasste Arbeit darf eine Regel niemals überschreiben.
    //
    // ZEITSTEMPEL-Ausnahme: Am Mischtag "Schule + Betrieb" GEHÖREN die
    // Stempelzeiten zum Tag (Betrieb nach der Schule). Nur wenn "Kommen"
    // schon vor Schulende liegt, war sie offenbar gar nicht in der Schule
    // -> normaler Arbeitstag, damit nichts doppelt zählt.
    if (wd && wd.events && wd.events.length) {
      if (rule && rule.dayType === 'schule-betrieb') {
        const first = P.sortEvents(wd.events)[0];
        const times = mixedTimesFor(dateStr);
        if (first && P.minutesOfDay(first.timestamp) >= times.toMinutes) return 'schule-betrieb';
      }
      return dayTypeList()[0].id;
    }

    if (rule) return rule.dayType || 'berufsschule';
    return dayTypeList()[0].id;
  }

  /** Nur die Automatik, ohne den von Hand gesetzten Typ. */
  function isAutoSchoolDay(dateStr) {
    return O.isSchoolDay(dateStr, schoolRuleList(), allSchoolBreaks());
  }

  function schoolRuleList() {
    return Array.isArray(state.schoolRules) ? state.schoolRules : [];
  }

  /** Eigene Ferien plus die mitgelieferten des gewählten Bundeslands. */
  function allSchoolBreaks() {
    const own = Array.isArray(state.schoolBreaks) ? state.schoolBreaks : [];
    const stateId = state.schoolState || '';
    return stateId ? own.concat(F.breaksFor(stateId)) : own;
  }

  function schoolRulesActive() {
    return schoolRuleList().length > 0;
  }

  /**
   * Version 3.1: Die alten Felder schoolWeekdays/schoolBlocks in die neue
   * Regelliste überführen. Läuft genau einmal - danach ist schoolRules
   * gefüllt und die Migration greift nicht mehr. Die alten Felder bleiben
   * bewusst stehen: falls hier etwas schiefgeht, sind die Ausgangsdaten
   * noch da und nicht unwiederbringlich weg.
   */
  function migrateSchoolRules() {
    if (schoolRuleList().length) return;

    const rules = [];
    const flags = state.schoolWeekdays || {};
    if (O.DAY_KEYS.some((key) => flags[key])) {
      rules.push({
        id: 'rule-migrated-weekly',
        label: 'Feste Schultage',
        kind: 'weekly',
        weekdays: Object.assign({}, flags),
        interval: 1,
        anchor: '',
        from: '',
        to: '',
      });
    }
    (state.schoolBlocks || []).forEach((block, i) => {
      if (!block || !block.from || !block.to) return;
      rules.push({
        id: 'rule-migrated-block-' + i,
        label: 'Blockwoche',
        kind: 'block',
        from: block.from,
        to: block.to,
      });
    });

    if (rules.length) {
      state = S.update({ schoolRules: rules });
    }
  }

  function setDayTypeFor(dateStr, typeId) {
    const wd = getWorkDay(dateStr);
    wd.dayType = typeId;
    saveWorkDay(dateStr, wd);
  }

  /**
   * Gutschrift eines festen Tagestyps in Centihours.
   * Leer bedeutet bewusst NICHT 0, sondern "deine Standard-Nettoarbeitszeit" –
   * genau so wird es im Alltag gebraucht: Berufsschule, Urlaub und Krank zählen
   * als normaler Arbeitstag, ohne dass man irgendwo etwas einstellen muss.
   * Wer einen abweichenden Wert braucht, trägt ihn in den Einstellungen ein;
   * "Frei" steht ab Werk ausdrücklich auf 0,00.
   */
  function dayTypeCreditCentihours(type) {
    const raw = String((type && type.creditIndustrial) || '').trim();
    if (!raw) return lastValidCentihours;
    return safeToCentihours(raw, lastValidCentihours);
  }

  /** Fester Typ ohne eigene Angabe – zählt dann die Standard-Arbeitszeit. */
  function dayTypeUsesDefault(type) {
    return type.mode === 'fixed' && String(type.creditIndustrial || '').trim() === '';
  }

  function targetNetMinutes() {
    return C.centihoursToNormalMinutes(lastValidCentihours);
  }

  function breakRuleFn() {
    return C.getBreakRule(state.breakRuleId || 'legal').fn;
  }

  /** Alter, manuell eingetragener Wert eines Datums (kann leer sein). */
  function legacyDayValue(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const dayKey = O.DAY_KEYS[(date.getDay() + 6) % 7];
    const week = getWeek(O.weekKeyFor(O.getMonday(date)));
    return (week.days && week.days[dayKey]) || '';
  }

  /**
   * Der Wert, der für einen Tag gelten soll – als Industriestunden-String,
   * also genau im Format, das C.toCentihours ohnehin erwartet.
   * Rangfolge: fester Tagestyp (Urlaub, Krank …) schlägt alles, danach echte
   * Stempelzeiten, zuletzt der alte manuell eingetragene Wert.
   * WICHTIG: Ein leerer Altwert bleibt leer und wird NICHT zu 0 – sonst würde
   * eine gar nicht ausgefüllte Woche als erfasst gelten und Minusstunden
   * erzeugen.
   */
  function effectiveDayValue(dateStr, legacyValue) {
    const type = dayTypeById(dayTypeIdFor(dateStr));
    if (type.mode === 'fixed') {
      // ZEITSTEMPEL: intern immer H:MM, unabhängig von der Anzeige-Einheit
      return C.minutesToHHMM(dayTypeCreditCentihours(type));
    }
    const wd = state.workDays && state.workDays[dateStr];
    if (wd && wd.events && wd.events.length) {
      const stats = dayStatsFor(dateStr, wd.events, Date.now());
      return C.minutesToHHMM(stats.totalNetMinutes);
    }
    return legacyValue;
  }

  // ---- ZEITSTEMPEL: Mischtag "Schule + Betrieb" und Mindestpause ----------
  //
  // § 15 Abs. 2 Nr. 1 BBiG: angerechnet werden die Unterrichtszeit
  // einschließlich der Pausen und die notwendige Wegezeit zwischen
  // Berufsschule und Ausbildungsstätte. Am Mittwoch zählt also
  //   (Schulende - Schulbeginn) + Weg + Zeit im Betrieb.
  // Keine Rechtsberatung - die Einstellung "pauschal" deckt den Fall ab,
  // dass der Betrieb den Tag anders zählt.

  function mixedRuleTemplate() {
    const rule = schoolRuleList().filter((r) => r.dayType === 'schule-betrieb')[0];
    return rule || { schoolFrom: '07:55', schoolTo: '13:10', travelMinutes: '45' };
  }

  /** Schulzeiten eines Mischtags: Abweichung am Tag > Regel > Standard. */
  function mixedTimesFor(dateStr) {
    const wd = state.workDays && state.workDays[dateStr];
    const rule = O.schoolRuleFor(dateStr, schoolRuleList(), allSchoolBreaks());
    const base = (rule && rule.dayType === 'schule-betrieb') ? rule : mixedRuleTemplate();
    const own = (wd && wd.school) || {};
    const clock = (v, fb) => { try { return C.clockToMinutes(v); } catch (e) { return fb; } };
    const fromMinutes = clock(own.from || base.schoolFrom, 475);
    const toMinutes = Math.max(fromMinutes, clock(own.to || base.schoolTo, 790));
    const rawTravel = (own.travel !== undefined && own.travel !== '') ? own.travel : base.travelMinutes;
    const travelMinutes = Math.max(0, parseInt(rawTravel, 10) || 0);
    const schoolMinutes = toMinutes - fromMinutes;
    return {
      fromMinutes, toMinutes, schoolMinutes, travelMinutes,
      creditMinutes: schoolMinutes + travelMinutes,
      suggestedClockInMinutes: toMinutes + travelMinutes,
      customized: !!(own.from || own.to || (own.travel !== undefined && own.travel !== '')),
    };
  }

  /** ZEITSTEMPEL: bezahlte Pause an diesem Tag in Minuten (0 = keine). */
  function zsPaidBreakFor(dateStr) {
    const days = state.paidBreakDays || {};
    const key = O.DAY_KEYS[(new Date(dateStr + 'T00:00:00').getDay() + 6) % 7];
    if (!days[key]) return 0;
    const n = parseInt(state.paidBreakMinutes, 10);
    return Number.isNaN(n) ? 30 : Math.max(0, n);
  }

  function isMixedType(type) {
    return !!(type && type.mixed && type.mode !== 'fixed');
  }

  /**
   * Zentrale Auswertung eines Tages aus seinen Stempelzeiten.
   * - normaler Tag: abgezogene Pause = größer von (gestempelt, Pflichtpause)
   * - Mischtag: Betriebszeit + Schulgutschrift; Pflichtpause im Betrieb nur,
   *   wenn "Pause im Betrieb abziehen" an ist (dann nach der GESAMTzeit).
   * Liefert die Werte aus PunchClock.deriveStats plus totalNetMinutes.
   */
  function dayStatsFor(dateStr, events, nowMs) {
    // Vergessenes Gehen an einem vergangenen Tag: nicht bis "jetzt" (also bis
    // heute früh) durchrechnen – das ergäbe 20+ Stunden. Stattdessen den
    // Stand zum voraussichtlichen Feierabend zeigen. Gezählt wird der Tag
    // ohnehin erst, wenn Gehen nachgetragen ist.
    if (events && events.length && dateStr < P.todayKey()) {
      const status = P.statusForEvents(events);
      if (status === P.STATUS.WORKING || status === P.STATUS.ON_BREAK) {
        const sorted = P.sortEvents(events);
        const probe = dayStatsRaw(dateStr, events, sorted[sorted.length - 1].timestamp);
        if (probe.projectedFeierabendMinutes !== null) {
          const d = new Date(dateStr + 'T00:00:00');
          const end = d.getTime() + probe.projectedFeierabendMinutes * 60000;
          nowMs = Math.max(sorted[sorted.length - 1].timestamp, Math.min(nowMs, end));
        }
      }
    }
    return dayStatsRaw(dateStr, events, nowMs);
  }

  function dayStatsRaw(dateStr, events, nowMs) {
    const type = dayTypeById(dayTypeIdFor(dateStr));
    const dayTarget = targetNetMinutes();
    const rule = breakRuleFn();
    if (isMixedType(type)) {
      const mx = mixedTimesFor(dateStr);
      const betriebTarget = Math.max(0, dayTarget - mx.creditMinutes);
      const mixedRule = (net) => (state.mixedBreakInBetrieb ? rule(net + mx.creditMinutes) : 0);
      const s = P.deriveStats(events || [], betriebTarget, mixedRule, nowMs, { autoBreak: state.autoBreak !== false });
      s.mixed = mx;
      s.totalNetMinutes = mx.creditMinutes + s.netMinutes;
      s.dailyBalanceMinutes = s.clockInEvent ? s.totalNetMinutes - dayTarget : null;
      return s;
    }
    const s = P.deriveStats(events || [], dayTarget, rule, nowMs, {
      autoBreak: state.autoBreak !== false,
      paidBreakMinutes: zsPaidBreakFor(dateStr),
    });
    s.totalNetMinutes = s.netMinutes;
    return s;
  }

  /** Tageswert inklusive Rückgriff auf den Altbestand; '' = keine Daten. */
  function dayValueFor(dateStr) {
    return effectiveDayValue(dateStr, legacyDayValue(dateStr));
  }

  /**
   * Alle Wochen mit den aus Events/Tagestypen abgeleiteten Werten.
   * Nur Wochen, in denen überhaupt ein workDay-Eintrag existiert, werden neu
   * berechnet – alle übrigen Wochen bleiben unverändert der Altbestand.
   */
  function effectiveWeeksMap(opts) {
    const weeks = Object.assign({}, state.weeks || {});
    const touched = {};

    // Wochen mit echten Arbeitstagen neu berechnen …
    Object.keys(state.workDays || {}).forEach((dateStr) => {
      const monday = O.getMonday(new Date(dateStr + 'T00:00:00'));
      const weekKey = O.weekKeyFor(monday);
      if (touched[weekKey]) return;
      touched[weekKey] = true;
      weeks[weekKey] = effectiveWeekDays(weeks[weekKey] || O.emptyWeek(), monday, opts);
    });

    // … und zusätzlich die aktuelle Woche, damit der heutige Tag auch dann
    // korrekt aus- bzw. eingeblendet wird, wenn es für ihn noch gar keinen
    // Eintrag gibt.
    const todayMonday = O.getMonday(new Date());
    const todayWeekKey = O.weekKeyFor(todayMonday);
    if (!touched[todayWeekKey]) {
      weeks[todayWeekKey] = effectiveWeekDays(weeks[todayWeekKey] || O.emptyWeek(), todayMonday, opts);
    }

    return weeks;
  }

  function weekTargetCentihours() {
    return safeToCentihours(state.weeklyTargetIndustrial, 2400); // ZEITSTEMPEL: Minuten
  }

  // ---- Zeitkonto auf Tagesbasis (Version 2.8) ------------------------------
  // Früher wurde je Woche pauschal das volle Wochensoll abgezogen, sobald die
  // Woche irgendeinen Eintrag hatte. Am Montagmorgen stand die Woche dadurch
  // sofort mit -36,00 h da, obwohl erst ein Tag lief. Jetzt gilt:
  // Ein Tag zählt nur, wenn er (a) Daten hat, (b) abgeschlossen ist und
  // (c) nicht in der Zukunft liegt. Sein Soll ist das Tagessoll, nicht die
  // ganze Woche. Vorausgeplante Tage (z. B. Berufsschule nächste Woche)
  // erscheinen im Verlauf, zählen aber erst, wenn ihr Datum erreicht ist.

  function workdayFlags() {
    const flags = state.workdays;
    if (flags && typeof flags === 'object') return flags;
    return { mo: true, di: true, mi: true, do: true, fr: true, sa: false, so: false };
  }

  function workdayCount() {
    const flags = workdayFlags();
    return O.DAY_KEYS.filter((key) => flags[key]).length || 5;
  }

  /** Tagessoll = Wochensoll geteilt durch die Zahl der Arbeitstage. */
  function dailyTargetCentihours() {
    return Math.round(weekTargetCentihours() / workdayCount());
  }

  function isWorkdayDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return !!workdayFlags()[O.DAY_KEYS[(date.getDay() + 6) % 7]];
  }

  /** Zählt dieser Tagestyp als Arbeitstag (hat also ein Soll)? */
  function typeCountsAsWorkday(type) {
    if (type && typeof type.countsAsWorkday === 'boolean') return type.countsAsWorkday;
    return !type || type.id !== 'frei'; // "Frei" ist ein freier Tag ohne Soll
  }

  /**
   * Ist/Soll/Saldo eines einzelnen Tages – oder null, wenn er nicht zählt.
   */
  function dayBalance(dateStr) {
    if (dateStr > P.todayKey()) return null;   // Zukunft zählt nie mit
    if (!dayIsClosed(dateStr)) return null;    // laufender Tag erst nach Feierabend
    const value = dayValueFor(dateStr);
    if (!String(value).trim()) return null;    // ohne Eintrag kein Soll und kein Ist

    const type = dayTypeById(dayTypeIdFor(dateStr));
    const ist = safeToCentihours(value, 0);
    const soll = (isWorkdayDate(dateStr) && typeCountsAsWorkday(type)) ? dailyTargetCentihours() : 0;
    return { ist, soll, diff: ist - soll };
  }

  /** Summiert alle zählenden Tage, optional gefiltert nach Datum. */
  function sumBalance(filterFn) {
    let ist = 0;
    let soll = 0;
    let days = 0;
    allDataDates().forEach((dateStr) => {
      if (filterFn && !filterFn(dateStr)) return;
      const balance = dayBalance(dateStr);
      if (!balance) return;
      ist += balance.ist;
      soll += balance.soll;
      days += 1;
    });
    return { ist, soll, diff: ist - soll, days };
  }

  function weekRangeKeys(monday) {
    return { from: P.dateKey(monday), to: P.dateKey(O.addDays(monday, 6)) };
  }

  /** Monatsauswertung: Zeilen je Kalenderwoche plus Summen. */
  function monthSummaryFor(date) {
    const rows = [];
    let ist = 0;
    let soll = 0;

    O.mondaysInMonth(date).forEach((monday) => {
      const range = weekRangeKeys(monday);
      const week = sumBalance((dateStr) => dateStr >= range.from && dateStr <= range.to);
      rows.push({
        monday: monday,
        weekKey: O.weekKeyFor(monday),
        sum: week.ist,
        soll: week.soll,
        diff: week.diff,
        counts: week.days > 0,
        days: week.days,
      });
      ist += week.ist;
      soll += week.soll;
    });

    return { rows, ist, soll, diff: ist - soll };
  }

  /** Aktualisiert nur die Summenzeilen (Wochensoll/-Ist/Differenz + Zeitkonto), ohne die Inputs neu zu bauen. */
  function renderWeekSummary() {
    const range = weekRangeKeys(currentWeekMonday);
    const week = sumBalance((dateStr) => dateStr >= range.from && dateStr <= range.to);

    weekRangeLabelEl.textContent = O.weekRangeLabel(currentWeekMonday);
    // Soll ist jetzt das AUFGELAUFENE Soll der gezählten Tage, nicht mehr
    // pauschal das ganze Wochensoll - sonst steht die Woche am Montag sofort
    // mit einem vollen Wochensoll im Minus.
    weekTargetEl.textContent = C.centihoursToDisplay(week.soll) + ' h' +
      ' (von ' + C.centihoursToDisplay(weekTargetCentihours()) + ' h)';
    weekSumEl.textContent = C.centihoursToDisplay(week.ist) + ' h';
    weekDiffEl.textContent = week.days ? fmtSignedIndustrial(week.diff) + ' h' : '–';
    weekDiffEl.classList.toggle('is-positive', week.days > 0 && week.diff > 0);
    weekDiffEl.classList.toggle('is-negative', week.days > 0 && week.diff < 0);

    renderZeitkonto();
  }

  /** Eine Kachel des Zeitkontos füllen. */
  function setZeitkontoTile(valueEl, normalEl, centihours, opts) {
    const options = opts || {};
    if (options.empty) {
      valueEl.textContent = '–';
      normalEl.textContent = '';
      valueEl.classList.remove('is-positive', 'is-negative');
      return;
    }
    const signed = options.signed !== false;
    const normalMinutes = C.centihoursToNormalMinutes(Math.abs(centihours)) * (centihours < 0 ? -1 : 1);
    valueEl.textContent = (signed ? fmtSignedIndustrial(centihours) : C.centihoursToDisplay(centihours)) + ' h';
    normalEl.textContent = '= ' + (signed ? fmtSignedNormal(normalMinutes) : C.minutesToHHMM(Math.abs(normalMinutes))) + ' Std.';
    valueEl.classList.toggle('is-positive', signed && centihours > 0);
    valueEl.classList.toggle('is-negative', signed && centihours < 0);
  }

  /**
   * Zeitkonto-Kacheln: Heute / Diese Woche / Dieser Monat / Gesamt.
   * Bewusst immer am HEUTIGEN Datum ausgerichtet, unabhängig davon, welche
   * Woche oder welcher Monat gerade durchgeblättert wird – die Durchsicht
   * vergangener Zeiträume hat ihre eigenen Summenzeilen.
   */
  function renderZeitkonto() {
    const todayStr = P.todayKey();
    const todayMonday = O.getMonday(new Date());
    const weekRange = weekRangeKeys(todayMonday);
    const monthKey = O.monthKeyFor(new Date());

    // --- Heute ---
    // Solange der Tag läuft, gibt es bewusst KEIN Saldo: Um 08:37 "-7,12 Std."
    // anzuzeigen, nur weil der Tag noch nicht fertig ist, ist irreführend.
    // Stattdessen steht dort die bisher gearbeitete Zeit.
    const todayType = dayTypeById(dayTypeIdFor(todayStr));
    const todayRaw = dayValueFor(todayStr);
    const todayBalance = dayBalance(todayStr);

    if (!String(todayRaw).trim()) {
      setZeitkontoTile(zkTodayValue, zkTodayNormal, 0, { empty: true });
      zkTodayNote.textContent = 'noch nichts erfasst';
    } else if (!dayIsClosed(todayStr)) {
      setZeitkontoTile(zkTodayValue, zkTodayNormal, safeToCentihours(todayRaw, 0), { signed: false });
      zkTodayNote.textContent = 'läuft · Soll ' + C.centihoursToDisplay(dailyTargetCentihours()) + ' h';
    } else if (todayType.mode === 'fixed') {
      setZeitkontoTile(zkTodayValue, zkTodayNormal, safeToCentihours(todayRaw, 0), { signed: false });
      zkTodayNote.textContent = todayType.icon + ' ' + todayType.label;
    } else {
      setZeitkontoTile(zkTodayValue, zkTodayNormal, todayBalance ? todayBalance.diff : 0);
      zkTodayNote.textContent = 'abgeschlossen · Soll ' + C.centihoursToDisplay(dailyTargetCentihours()) + ' h';
    }

    // --- Diese Woche / Dieser Monat / Gesamt / Übertrag (alles tagesbasiert) ---
    const week = sumBalance((dateStr) => dateStr >= weekRange.from && dateStr <= weekRange.to);
    setZeitkontoTile(zkWeekValue, zkWeekNormal, week.diff, { empty: week.days === 0 });

    const month = sumBalance((dateStr) => dateStr.slice(0, 7) === monthKey);
    setZeitkontoTile(zkMonthValue, zkMonthNormal, month.diff, { empty: month.days === 0 });

    const total = sumBalance(null);
    setZeitkontoTile(zeitkontoValueEl, zeitkontoNormalEl, total.diff, { empty: total.days === 0 });

    const carry = sumBalance((dateStr) => dateStr < todayStr);
    const carryNormal = C.centihoursToNormalMinutes(Math.abs(carry.diff)) * (carry.diff < 0 ? -1 : 1);
    const todayCounted = !!todayBalance;
    zeitkontoCarry.textContent = 'Übertrag bis gestern: ' + fmtSignedIndustrial(carry.diff) + ' h' +
      (C.getDisplayMode() === 'industrie' ? ' (' + fmtSignedNormal(carryNormal) + ' Std.)' : '') +
      ' aus ' + carry.days + ' gezählten Tagen' +
      (todayCounted
        ? ' · heute ist abgeschlossen und im Gesamtstand enthalten'
        : ' · der heutige Tag kommt erst nach dem Feierabend dazu');
    zeitkontoCarry.classList.toggle('is-positive', carry.diff > 0);
    zeitkontoCarry.classList.toggle('is-negative', carry.diff < 0);

    applyZeitkontoUnitVisibility();
  }

  /** Monatsübersicht: eine Zeile je Kalenderwoche plus Summen. */
  function renderMonth() {
    const summary = monthSummaryFor(currentMonthDate);
    monthRangeLabelEl.textContent = O.monthLabel(currentMonthDate);

    monthWeeksEl.innerHTML = '';
    summary.rows.forEach((row) => {
      const item = document.createElement('div');
      item.className = 'month-week-row' + (row.counts ? '' : ' is-empty');
      item.dataset.monday = P.dateKey(row.monday);
      const diffCls = !row.counts ? 'is-zero'
        : (row.diff > 0 ? 'is-positive' : (row.diff < 0 ? 'is-negative' : 'is-zero'));
      item.innerHTML =
        '<span class="month-week-label">KW ' + escapeHtml(row.weekKey.slice(-2)) +
          '<span class="month-week-range">' + escapeHtml(O.weekRangeLabel(row.monday)) +
            (row.counts ? ' · ' + row.days + (row.days === 1 ? ' Tag' : ' Tage') : ' · noch keine gezählten Tage') +
          '</span>' +
        '</span>' +
        '<span class="month-week-sum">' + (row.counts ? C.centihoursToDisplay(row.sum) + ' h' : '–') + '</span>' +
        '<span class="month-week-diff ' + diffCls + '">' +
          (row.counts ? escapeHtml(fmtSignedIndustrial(row.diff)) + ' h' : '–') +
        '</span>';
      monthWeeksEl.appendChild(item);
    });

    renderMonthCalendar();

    monthTargetEl.textContent = C.centihoursToDisplay(summary.soll) + ' h';
    monthSumEl.textContent = C.centihoursToDisplay(summary.ist) + ' h';
    monthDiffEl.textContent = fmtSignedIndustrial(summary.diff) + ' h';
    monthDiffEl.classList.toggle('is-positive', summary.diff > 0);
    monthDiffEl.classList.toggle('is-negative', summary.diff < 0);
  }

  /**
   * Kalenderdarstellung des Monats: ein Kästchen je Tag, farblich nach Status.
   * Bewusst schlicht gehalten – es geht um den schnellen Überblick, welche
   * Tage im Plus, im Minus oder gar nicht erfasst sind.
   */
  function renderMonthCalendar() {
    const base = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const leading = (base.getDay() + 6) % 7; // Montag = 0
    const todayStr = P.todayKey();

    let html = '<div class="calendar-head">' +
      O.DAY_KEYS.map((key) => '<span>' + O.DAY_LABELS_SHORT[key] + '</span>').join('') +
      '</div><div class="calendar-grid">';

    for (let i = 0; i < leading; i += 1) html += '<span class="calendar-cell is-empty"></span>';

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(base.getFullYear(), base.getMonth(), day);
      const dateStr = P.dateKey(date);
      const type = dayTypeById(dayTypeIdFor(dateStr));
      const value = dayValueFor(dateStr);
      const hasValue = String(value).trim() !== '';

      let cls = 'calendar-cell';
      let title = '';
      if (!hasValue) {
        cls += ' is-none';
        title = 'kein Eintrag';
      } else if (!dayIsClosed(dateStr)) {
        cls += ' is-open';
        title = 'läuft noch';
      } else if (type.mode === 'fixed') {
        cls += ' is-type';
        title = type.label + ' · ' + value + ' h';
      } else {
        const balance = dayBalance(dateStr);
        const diff = balance ? balance.diff : 0;
        cls += diff > 0 ? ' is-positive' : (diff < 0 ? ' is-negative' : ' is-zero');
        title = value + ' h · ' + fmtSignedIndustrial(diff) + ' h';
      }
      if (dateStr === todayStr) cls += ' is-today';

      html += '<button type="button" class="' + cls + '" data-date-key="' + dateStr + '" title="' + escapeHtml(title) + '">' +
        '<span class="calendar-day">' + day + '</span>' +
        (type.mode === 'fixed' && hasValue ? '<span class="calendar-icon">' + escapeHtml(type.icon) + '</span>' : '') +
      '</button>';
    }

    html += '</div>';
    monthCalendarEl.innerHTML = html;
  }

  // ---- Kern: berechnen + rendern --------------------------------------------
  function render() {
    const netMinutes = C.centihoursToNormalMinutes(lastValidCentihours);
    const breakRuleId = state.breakRuleId || 'legal';

    industrialHint.textContent = '= ' + C.minutesToHHMM(netMinutes) + ' normale Arbeitszeit';

    let startMinutes, endMinutes, pauseMinutes, totalMinutes, primaryLabel, endRowLabel, endRowValueMinutes;

    if (mode === 'forward') {
      startMinutes = C.clockToMinutes(startTimeInput.value || '07:00');
      const r = C.calculateFeierabend(startMinutes, lastValidCentihours, breakRuleId);
      endMinutes = r.endMinutes;
      pauseMinutes = r.pauseMinutes;
      totalMinutes = r.totalMinutes;
      primaryLabel = 'DEIN FEIERABEND';
      endRowLabel = 'Feierabend';
      endRowValueMinutes = endMinutes;
    } else {
      const desiredEnd = C.clockToMinutes(desiredEndInput.value || '16:00');
      const r = C.calculateArbeitsbeginn(desiredEnd, lastValidCentihours, breakRuleId);
      startMinutes = r.startMinutes;
      endMinutes = desiredEnd;
      pauseMinutes = r.pauseMinutes;
      totalMinutes = r.totalMinutes;
      primaryLabel = 'DEIN ARBEITSBEGINN';
      endRowLabel = 'Gewünschter Feierabend';
      endRowValueMinutes = desiredEnd;
    }

    heroLabel.textContent = primaryLabel;
    heroTime.textContent = mode === 'forward' ? C.minutesToClock(endMinutes) : C.minutesToClock(startMinutes);
    lastPlannedEndMinutes = endMinutes;

    // Aufschlüsselung
    bdStart.textContent = C.minutesToClock(startMinutes);
    bdIndustrial.textContent = C.centihoursToDisplay(lastValidCentihours) + ' h Industrie';
    bdNormal.textContent = C.minutesToHHMM(netMinutes) + ' h';
    bdPause.textContent = pauseMinutes + ' Min.';
    bdTotal.textContent = C.minutesToHHMM(totalMinutes) + ' h';
    bdEndLabel.textContent = endRowLabel;
    bdEnd.textContent = C.minutesToClock(endRowValueMinutes);

    // Arbeitsweg: Losfahrzeit.
    // Version 3.1: Die Zeile sagt jetzt auch, WOHER losgefahren wird. Ist für
    // heute etwas vor der Arbeit eingeplant, startet der Weg zur Arbeit nicht
    // zuhause, sondern dort - und die Uhrzeit ist eine völlig andere.
    const commuteToWork = parseCommuteMinutes(state.commuteToWorkMinutes);
    const beforeActivity = effectiveActivity('before');
    if (beforeActivity) {
      bdCommuteRow.classList.remove('is-hidden');
      bdCommuteLabel.textContent = 'Losfahrt ab ' + beforeActivity.label;
      bdCommute.textContent = C.minutesToClock(
        startMinutes - (parseCommuteMinutes(state.morningBufferMinutes) || 0) -
        (beforeActivity.travelWorkMinutes || 0));
    } else if (commuteToWork) {
      bdCommuteRow.classList.remove('is-hidden');
      bdCommuteLabel.textContent = 'Losfahrt von zuhause';
      bdCommute.textContent = C.minutesToClock(startMinutes - commuteToWork);
    } else {
      bdCommuteRow.classList.add('is-hidden');
    }

    // Zuhause: automatisch aus Feierabend + Rückweg berechnet.
    // Ist für heute eine Aktivität nach der Arbeit gewählt (z. B. Gym), führt
    // der Rückweg über diesen Ort - dann zählt dessen Strecke, nicht der
    // direkte Rückweg.
    const commuteFromWork = parseCommuteMinutes(state.commuteFromWorkMinutes);
    const afterActivity = activityById(state.activityAfterId);
    if (afterActivity) {
      const evening = C.planEvening(endMinutes, { activity: afterActivity });
      homeArrivalAuto.textContent = C.minutesToClock(evening.homeMinutes);
      homeHint.textContent = 'Über „' + afterActivity.label + '": Feierabend + ' +
        afterActivity.travelWorkMinutes + ' Min. Weg + ' +
        C.minutesToHHMM(afterActivity.durationMinutes) + ' Std. + ' +
        afterActivity.travelHomeMinutes + ' Min. nach Hause.';
    } else if (commuteFromWork) {
      homeArrivalAuto.textContent = C.minutesToClock(endMinutes + commuteFromWork);
      homeHint.textContent = 'Automatisch berechnet: Feierabend + Rückweg (' + commuteFromWork + ' Min.).';
    } else {
      homeArrivalAuto.textContent = '–';
      homeHint.textContent = 'Trag unter Einstellungen → Arbeitsweg deinen Rückweg ein, damit die Ankunft automatisch berechnet wird.';
    }

    // Zuhause: Reverse-Berechnung ("ich möchte um X zuhause sein" -> Losfahrzeit/Puffer)
    const desiredArrivalRaw = desiredHomeArrivalInput.value;
    homeReverseResult.classList.remove('is-warning', 'is-ok');
    if (desiredArrivalRaw && commuteFromWork) {
      const desiredArrivalMinutes = C.clockToMinutes(desiredArrivalRaw);
      const departureNeeded = desiredArrivalMinutes - commuteFromWork;
      const bufferToDeparture = departureNeeded - endMinutes;
      if (bufferToDeparture >= 0) {
        homeReverseResult.textContent = 'Losfahren bis ' + C.minutesToClock(departureNeeded) + ' Uhr – Puffer: +' + bufferToDeparture + ' Min. nach Feierabend.';
        homeReverseResult.classList.add('is-ok');
      } else {
        homeReverseResult.textContent = 'Das reicht zeitlich nicht: Losfahrzeit wäre ' + C.minutesToClock(departureNeeded) + ' Uhr – ' + Math.abs(bufferToDeparture) + ' Min. vor Feierabend.';
        homeReverseResult.classList.add('is-warning');
      }
    } else if (desiredArrivalRaw && !commuteFromWork) {
      homeReverseResult.textContent = 'Trag zuerst deinen Rückweg unter Einstellungen → Arbeitsweg ein.';
      homeReverseResult.classList.add('is-warning');
    } else {
      homeReverseResult.textContent = '';
    }

    // Puffer: informative Zeile "Bereit zum Losgehen" (kein Teil der Arbeitszeit)
    const bufferMinutesVal = parseCommuteMinutes(state.bufferMinutes);
    if (bufferMinutesVal) {
      bdBufferRow.classList.remove('is-hidden');
      bdBuffer.textContent = C.minutesToClock(endMinutes + bufferMinutesVal);
    } else {
      bdBufferRow.classList.add('is-hidden');
    }

    // Termine: Zeit bis zum nächsten Termin nach Feierabend (nur heute, beide Modi möglich)
    const upcomingAppointments = (state.appointments || [])
      .map(function (a) { return { id: a.id, time: a.time, label: a.label, minutes: C.clockToMinutes(a.time) }; })
      .filter(function (a) { return a.minutes >= endMinutes; })
      .sort(function (a, b) { return a.minutes - b.minutes; });
    if (upcomingAppointments.length > 0) {
      const nextApt = upcomingAppointments[0];
      const gap = nextApt.minutes - endMinutes;
      appointmentNextGap.textContent = 'Noch ' + C.minutesToHHMM(gap) + ' bis „' + nextApt.label + '" um ' + nextApt.time + ' Uhr.';
      appointmentNextGap.classList.remove('is-hidden');
    } else {
      appointmentNextGap.classList.add('is-hidden');
    }

    // Pausenstatus
    const status = C.pauseStatus(netMinutes, breakRuleId);
    pauseStatusDot.className = 'status-dot' + (status.level !== 'green' ? ' ' + status.level : '');
    pauseStatusText.textContent = status.label;

    // Countdown + Fortschritt nur im Vorwärts-Modus sinnvoll
    if (mode === 'forward') {
      progressCard.classList.remove('is-hidden');
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const reached = isReached(nowMinutes, startMinutes, endMinutes);

      if (nowMinutes < startMinutes) {
        countdownText.textContent = 'Beginnt um ' + C.minutesToClock(startMinutes) + ' Uhr';
        countdownPill.classList.remove('is-complete');
      } else if (reached) {
        // Feierabend erreicht/überschritten: nie einen negativen oder weiterlaufenden
        // "Noch..."-Countdown zeigen, stattdessen einen abgeschlossenen Zustand.
        const elapsedSince = C.minutesUntil(endMinutes, nowMinutes); // nie negativ
        countdownText.textContent = elapsedSince > 0
          ? 'Feierabend 🎉 · Seit ' + C.minutesToHHMM(elapsedSince)
          : 'Feierabend 🎉';
        countdownPill.classList.add('is-complete');
      } else {
        const remaining = C.minutesUntil(nowMinutes, endMinutes);
        const h = Math.floor(remaining / 60);
        const m = remaining % 60;
        countdownText.textContent = 'Noch ' + String(h).padStart(2, '0') + ' Std. ' + String(m).padStart(2, '0') + ' Min.';
        countdownPill.classList.remove('is-complete');
      }

      const progress = reached ? 100 : C.computeProgress(nowMinutes, startMinutes, netMinutes, pauseMinutes);
      progressFill.style.width = Math.max(0, Math.min(100, progress)) + '%';
      progressPercent.textContent = Math.round(progress) + ' %';
      const workedMinutes = reached ? netMinutes : Math.round((progress / 100) * netMinutes);
      progressDetail.textContent =
        'Nettoarbeitszeit: ' + C.minutesToHHMM(workedMinutes) + ' von ' + C.minutesToHHMM(netMinutes) + ' Std.';

      // Die alte, rein planungsbasierte Erinnerung greift nur noch, wenn für
      // heute gar nicht gestempelt wurde (reiner Planungs-Einsatz). Sobald ein
      // echter Arbeitstag läuft, übernimmt checkReminders() mit den echten
      // Zeiten – sonst kämen zwei widersprüchliche Meldungen.
      const liveStatus = P.statusForEvents(getWorkDay(activeWorkDayKey()).events);
      if (liveStatus === P.STATUS.IDLE) {
        maybeNotify(nowMinutes, endMinutes, startMinutes);
      }
    } else {
      progressCard.classList.add('is-hidden');
      countdownPill.classList.remove('is-complete');
      countdownText.textContent = 'Anwesenheitszeit gesamt: ' + C.minutesToHHMM(totalMinutes);
    }

    renderWwenn();
    renderActivityPlans(); // hängt am gerade berechneten Feierabend
  }

  /** true wenn "jetzt" innerhalb [start, end) oder danach liegt (Feierabend erreicht) */
  function isReached(nowMinutes, startMinutes, endMinutes) {
    if (endMinutes >= startMinutes) {
      return nowMinutes >= endMinutes;
    }
    // Schicht geht über Mitternacht
    return nowMinutes >= endMinutes && nowMinutes < startMinutes;
  }

  function maybeNotify(nowMinutes, endMinutes, startMinutes) {
    if (!state.notificationsEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const remaining = C.minutesUntil(nowMinutes, endMinutes);
    const todayKey = new Date().toDateString();

    if (remaining === 30 && notifiedSoon !== todayKey && nowMinutes >= startMinutes) {
      new Notification('Feierabend-Rechner', { body: 'Dein Feierabend ist in 30 Minuten.' });
      notifiedSoon = todayKey;
    }
    if (isReached(nowMinutes, startMinutes, endMinutes) && notifiedEnd !== todayKey) {
      new Notification('Feierabend-Rechner', { body: 'Feierabend 🎉' });
      notifiedEnd = todayKey;
    }
  }

  // ==========================================================================
  // ZEITSTEMPEL: Startseite, Tagesplan, Nachtragen, Bus, Backup teilen
  // ==========================================================================
  const zs = {
    today: el('zsToday'),
    todayLabel: el('zsTodayLabel'),
    todayTime: el('zsTodayTime'),
    todaySub: el('zsTodaySub'),
    todayBus: el('zsTodayBus'),
    todayKonto: el('zsTodayKonto'),
    fixCard: el('zsFixCard'),
    fixText: el('zsFixText'),
    fixBtn: el('zsFixBtn'),
    btnSuggest: el('zsBtnSuggest'),
    planFor: el('zsPlanFor'),
    planList: el('zsPlanList'),
    planHint: el('zsPlanHint'),
    dateLine: el('zsDateLine'),
    updateBanner: el('updateBanner'),
  };
  let zsFixDate = null;
  let zsKontoCache = { stateRef: null, minute: -1, text: '' };

  function zsInt(raw, fallback) {
    const n = parseInt(String(raw == null ? '' : raw).trim(), 10);
    return Number.isNaN(n) ? fallback : n;
  }

  function zsTransit() {
    return Object.assign({}, S.DEFAULT_STATE.transit, state.transit || {});
  }

  function zsConnections(key) {
    return T.parseConnections(zsTransit()[key] || []).connections;
  }

  function zsWeekdayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return O.DAY_LABELS[O.DAY_KEYS[(d.getDay() + 6) % 7]] || '';
  }

  function zsShortDay(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return (O.DAY_LABELS_SHORT ? O.DAY_LABELS_SHORT[O.DAY_KEYS[(d.getDay() + 6) % 7]] + ' ' : '') + O.formatDateShort(d);
  }

  /** Was für ein Tag ist das? 'work' | 'mixed' | 'school' | 'off' */
  function zsDayKind(dateStr) {
    const type = dayTypeById(dayTypeIdFor(dateStr));
    if (isMixedType(type)) return 'mixed';
    if (type.id === 'berufsschule') return 'school';
    if (type.mode === 'fixed') return 'off';
    return isWorkdayDate(dateStr) ? 'work' : 'off';
  }

  /** Konto über alle abgeschlossenen Tage, einmal pro Minute bzw. Änderung. */
  function zsKontoText() {
    const minute = Math.floor(Date.now() / 60000);
    if (zsKontoCache.stateRef === state && zsKontoCache.minute === minute) return zsKontoCache.text;
    const total = sumBalance();
    const text = total.days ? 'Konto ' + fmtSignedIndustrial(total.diff) : 'Konto ±0:00 · noch keine Tage';
    zsKontoCache = { stateRef: state, minute, text };
    return text;
  }

  /**
   * Geplanter Tag ohne Stempel: so tun, als käme sie zur üblichen Zeit
   * (bzw. am Mittwoch zum vorgeschlagenen Zeitpunkt) - dieselbe Rechnung
   * wie beim echten Stempeln, damit Plan und Wirklichkeit nie auseinanderlaufen.
   */
  function zsPlannedStart(dateStr) {
    const kind = zsDayKind(dateStr);
    if (kind === 'mixed') return mixedTimesFor(dateStr).suggestedClockInMinutes;
    const tr = zsTransit();
    let start;
    try { start = C.clockToMinutes(state.startClock || '07:45'); } catch (e) { start = 465; }
    // Gleitzeit: Die übliche Anfangszeit ist kein harter Termin. Genommen
    // wird die späteste Verbindung, die bis dahin ANKOMMT; angefangen wird,
    // sobald sie nach dem Fußweg im Betrieb ist.
    const ride = T.planMorningRide(zsConnections('toWork'), start, zsInt(tr.walkHomeMinutes, 0), 0);
    return ride ? ride.arr + zsInt(tr.walkWorkMinutes, 0) : start;
  }

  function zsProjectedEnd(dateStr, clockInMinutes) {
    const d = new Date(dateStr + 'T00:00:00');
    const ts0 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime() + clockInMinutes * 60000;
    const s = dayStatsFor(dateStr, [{ id: 'plan', type: 'clockIn', timestamp: ts0 }], ts0);
    return s.projectedFeierabendMinutes;
  }

  function zsBusLine(endMinutes) {
    const tr = zsTransit();
    const conns = zsConnections('fromWork');
    if (!conns.length) return '';
    const ride = T.planEveningRide(conns, endMinutes, zsInt(tr.walkWorkMinutes, 0), zsInt(tr.walkHomeMinutes, 0), 60);
    if (!ride) return 'Nach ' + C.minutesToClock(endMinutes) + ' fährt laut deiner Liste nichts mehr.';
    if (ride.next.waitMinutes >= 10) {
      // Lange Wartezeit: mit Gleitzeit lieber weiterarbeiten als warten.
      return '🚌 nächster Bus ' + C.minutesToClock(ride.next.dep) + ' · bis ' +
        C.minutesToClock(endMinutes + ride.next.waitMinutes) + ' bleiben → +' +
        C.minutesToHHMM(ride.next.waitMinutes) + ' aufs Konto statt Warten';
    }
    let t = '🚌 nächster Bus ' + C.minutesToClock(ride.next.dep);
    if (ride.later) {
      t += ' · oder bis ' + C.minutesToClock(ride.later.stayUntilMinutes) + ' bleiben → Bus ' +
        C.minutesToClock(ride.later.dep) + ', +' + C.minutesToHHMM(ride.later.extraMinutes) + ' aufs Konto';
    }
    return t;
  }

  function renderToday() {
    if (!zs.today) return;
    const todayStr = P.todayKey();
    const activeKey = activeWorkDayKey();
    const wd = getWorkDay(activeKey);
    const stats = dayStatsFor(activeKey, wd.events, Date.now());
    const kind = zsDayKind(todayStr);
    const type = dayTypeById(dayTypeIdFor(todayStr));
    let label = 'Feierabend';
    let time = '–';
    let sub = '';
    let bus = '';

    zs.dateLine.textContent = zsWeekdayLabel(todayStr) + ', ' + O.formatDateShort(new Date(todayStr + 'T00:00:00'));

    if (stats.status === 'done') {
      label = 'Feierabend ✓';
      time = clockOf(stats.clockOutEvent.timestamp);
      sub = 'zählt ' + C.minutesToHHMM(stats.totalNetMinutes) + ' · Tag ' + fmtSignedNormal(stats.dailyBalanceMinutes || 0);
    } else if (stats.clockInEvent) {
      label = 'Feierabend';
      time = C.minutesToClock(stats.projectedFeierabendMinutes);
      sub = 'seit ' + clockOf(stats.clockInEvent.timestamp) + ' · bisher ' + C.minutesToHHMM(stats.totalNetMinutes);
      bus = zsBusLine(stats.projectedFeierabendMinutes);
    } else if (kind === 'school') {
      label = 'Heute Schule 🎓';
      time = C.minutesToHHMM(dayTypeCreditCentihours(type));
      sub = 'zählt automatisch, ohne Stempeln';
    } else if (kind === 'off') {
      label = (type.mode === 'fixed' ? type.icon + ' ' + type.label : 'Frei');
      time = '–';
      sub = type.mode === 'fixed' && dayTypeCreditCentihours(type) > 0 ? 'zählt ' + C.minutesToHHMM(dayTypeCreditCentihours(type)) : 'genieß den Tag';
    } else {
      const start = zsPlannedStart(todayStr);
      const end = zsProjectedEnd(todayStr, start);
      label = kind === 'mixed' ? 'Feierabend (nach der Schule)' : 'Feierabend';
      time = C.minutesToClock(end);
      sub = (kind === 'mixed' ? 'wenn du um ' : 'wenn du um ') + C.minutesToClock(start) + ' anfängst';
      bus = zsBusLine(end);
    }

    if (stats.totalNetMinutes > 600) sub += ' · über 10 Std. (§ 3 ArbZG)';

    zs.todayLabel.textContent = label;
    zs.todayTime.textContent = time;
    zs.todaySub.textContent = sub;
    zs.todayBus.textContent = bus;
    zs.todayBus.classList.toggle('is-hidden', !bus);
    zs.todayKonto.textContent = zsKontoText();

    // Mittwoch: Vorschlag "Im Betrieb ab 13:55" (nur ohne Stempel, ab 15 Min. vorher)
    let showSuggest = false;
    if (zs.btnSuggest && kind === 'mixed' && stats.status === 'idle' && activeKey === todayStr) {
      const mx = mixedTimesFor(todayStr);
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= mx.suggestedClockInMinutes - 15) {
        zs.btnSuggest.textContent = 'Im Betrieb ab ' + C.minutesToClock(mx.suggestedClockInMinutes);
        showSuggest = true;
      }
    }
    if (zs.btnSuggest) zs.btnSuggest.classList.toggle('is-hidden', !showSuggest);
  }

  /** Tage, die nachgetragen werden müssen (neueste zuerst). */
  function zsProblemDays() {
    const todayStr = P.todayKey();
    const startStr = state.zsStartDate || todayStr;
    const out = [];
    for (let i = 1; i <= 14; i += 1) {
      const dateStr = P.dateKey(O.addDays(new Date(todayStr + 'T00:00:00'), -i));
      if (dateStr < startStr) break;
      const wd = state.workDays && state.workDays[dateStr];
      const events = (wd && wd.events) || [];
      if (events.length) {
        const status = P.statusForEvents(events);
        if (status === P.STATUS.WORKING || status === P.STATUS.ON_BREAK) {
          out.push({ date: dateStr, kind: 'open' });
        }
        continue;
      }
      const k = zsDayKind(dateStr);
      if (k === 'work' || k === 'mixed') out.push({ date: dateStr, kind: 'empty' });
    }
    return out;
  }

  function renderFixCard() {
    if (!zs.fixCard) return;
    const list = zsProblemDays();
    if (!list.length) {
      zs.fixCard.classList.add('is-hidden');
      zsFixDate = null;
      return;
    }
    const first = list[0];
    const yesterday = P.dateKey(O.addDays(new Date(P.todayKey() + 'T00:00:00'), -1));
    const when = first.date === yesterday ? 'Gestern' : zsShortDay(first.date);
    zs.fixText.textContent = (first.kind === 'open'
      ? when + ' kein Gehen gestempelt.'
      : when + ' nichts erfasst.') + (list.length > 1 ? ' (+' + (list.length - 1) + ' weitere)' : '');
    zsFixDate = first.date;
    zs.fixCard.classList.remove('is-hidden');
  }

  /** Nächster Tag, für den sich ein Plan lohnt (heute, solange er noch vor einem liegt). */
  function zsPlanDate() {
    const todayStr = P.todayKey();
    const wd = state.workDays && state.workDays[todayStr];
    const startedToday = !!(wd && wd.events && wd.events.length);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < 10; i += 1) {
      const dateStr = P.dateKey(O.addDays(new Date(todayStr + 'T00:00:00'), i));
      const k = zsDayKind(dateStr);
      if (k === 'off') continue;
      if (i === 0 && (startedToday || nowMin > 10 * 60)) continue;
      return dateStr;
    }
    return null;
  }

  function renderPlan() {
    if (!zs.planList) return;
    const dateStr = zsPlanDate();
    const rows = [];
    const hints = [];
    if (!dateStr) {
      zs.planFor.textContent = '';
      zs.planList.innerHTML = '';
      zs.planHint.textContent = 'In den nächsten Tagen ist nichts geplant.';
      return;
    }
    const isToday = dateStr === P.todayKey();
    zs.planFor.textContent = '· ' + (isToday ? 'heute' : zsShortDay(dateStr));

    const tr = zsTransit();
    const kind = zsDayKind(dateStr);
    const walkHome = zsInt(tr.walkHomeMinutes, 0);
    let target;
    let conns;
    let walkTo;
    let targetLabel;
    if (kind === 'work') {
      try { target = C.clockToMinutes(state.startClock || '07:45'); } catch (e) { target = 465; }
      conns = zsConnections('toWork');
      walkTo = 0; // Gleitzeit, siehe zsPlannedStart
      targetLabel = 'Arbeit ab';
    } else {
      // Schultag: Schulbeginn aus der Regel des Tages
      const rule = O.schoolRuleFor(dateStr, schoolRuleList(), allSchoolBreaks());
      const from = kind === 'mixed' ? C.minutesToClock(mixedTimesFor(dateStr).fromMinutes) : (rule && rule.schoolFrom);
      if (!from) {
        zs.planList.innerHTML = '';
        zs.planHint.textContent = 'Für ' + zsWeekdayLabel(dateStr) + ' fehlen noch Schulbeginn und Verbindung (Mehr → Einstellungen).';
        return;
      }
      target = C.clockToMinutes(from);
      conns = zsConnections('toSchool');
      walkTo = 0;
      targetLabel = 'Schule ab';
    }

    let leave = null;
    const ride = T.planMorningRide(conns, target, walkHome, walkTo);
    if (ride) {
      leave = ride.leaveMinutes;
    } else {
      const fallback = zsInt(state.commuteToWorkMinutes, null);
      if (fallback !== null && kind === 'work') leave = target - fallback - walkHome;
    }
    if (leave === null) {
      zs.planList.innerHTML = '';
      zs.planHint.textContent = (kind === 'work' ? 'Trag deine Verbindung zum Betrieb ein' : 'Trag deine Verbindung zur Schule ein') + ' (Mehr → Einstellungen → Bus und Bahn).';
      return;
    }
    const prep = zsInt(state.morningPrepMinutes, 90);
    let sleep;
    try { sleep = C.toCentihours(state.sleepNeed || '8:00'); } catch (e) { sleep = 480; }
    const wake = leave - prep;
    const bed = wake - sleep;
    rows.push(['Bett (am Abend davor)', C.minutesToClock(bed)]);
    rows.push(['Aufstehen', C.minutesToClock(wake)]);
    rows.push(['Los', C.minutesToClock(leave)]);
    if (ride) rows.push(['Bus', C.minutesToClock(ride.dep) + ' → ' + C.minutesToClock(ride.arr)]);
    rows.push([targetLabel, C.minutesToClock(kind === 'work' ? zsPlannedStart(dateStr) : target)]);
    if (kind === 'work' || kind === 'mixed') {
      const start = zsPlannedStart(dateStr);
      const end = zsProjectedEnd(dateStr, start);
      rows.push(['Feierabend', C.minutesToClock(end)]);
      const back = T.planEveningRide(zsConnections('fromWork'), end, zsInt(tr.walkWorkMinutes, 0), walkHome, 60);
      if (back) rows.push(['Zuhause', C.minutesToClock(back.next.homeMinutes) + ' (Bus ' + C.minutesToClock(back.next.dep) + ')']);
      else hints.push('Rückfahrten fehlen noch – dann steht hier auch, wann du zuhause bist.');
    }
    if (!ride) hints.push('Ohne passende Verbindung gerechnet.');
    if (String(tr.walkHomeMinutes || '') === String(S.DEFAULT_STATE.transit.walkHomeMinutes)) {
      hints.push('Fußweg zur Haltestelle ist noch ein Platzhalter (' + walkHome + ' Min.).');
    }
    zs.planList.innerHTML = rows.map((r) =>
      '<div class="breakdown-row"><dt>' + escapeHtml(r[0]) + '</dt><dd>' + escapeHtml(r[1]) + '</dd></div>').join('');
    zs.planHint.textContent = hints.join(' ');
  }

  function renderZeitstempel() {
    renderToday();
    renderFixCard();
  }

  function zsRefreshAll() {
    render();
    renderStatus();
    renderWeekDays();
    renderWeekSummary();
    renderMonth();
    renderVacation();
    renderForecast();
    renderCalendarTab();
    renderPlan();
  }

  // ---- Einstellungen (ZEITSTEMPEL) -----------------------------------------
  function zsMixedRule() {
    return schoolRuleList().filter((r) => r.dayType === 'schule-betrieb')[0] || null;
  }

  function zsFillSettings() {
    const set = (id, v) => { const n = el(id); if (n) { if (n.type === 'checkbox') n.checked = !!v; else n.value = v == null ? '' : v; } };
    const rule = zsMixedRule() || mixedRuleTemplate();
    set('zsAutoBreak', state.autoBreak !== false);
    ['mo', 'di', 'mi', 'do', 'fr'].forEach((k) => set('zsPaid_' + k, !!(state.paidBreakDays || {})[k]));
    set('zsPaidMinutes', state.paidBreakMinutes || '30');
    set('zsMiFrom', rule.schoolFrom || '');
    set('zsMiTo', rule.schoolTo || '');
    set('zsMiTravel', rule.travelMinutes || '');
    set('zsMixedMode', state.mixedDayMode || 'sum');
    set('zsMixedBreak', !!state.mixedBreakInBetrieb);
    const tr = zsTransit();
    set('zsToWork', T.formatConnections(zsConnections('toWork')));
    set('zsFromWork', T.formatConnections(zsConnections('fromWork')));
    set('zsToSchool', T.formatConnections(zsConnections('toSchool')));
    set('zsWalkHome', tr.walkHomeMinutes);
    set('zsWalkWork', tr.walkWorkMinutes);
    set('zsDisplayUnit', state.displayUnit || 'hm');
    const info = el('zsIndustrieInfo');
    if (info) info.hidden = (state.displayUnit || 'hm') !== 'industrie';
  }

  function zsSaveMixedRule(patch) {
    const rules = schoolRuleList().slice();
    const idx = rules.findIndex((r) => r.dayType === 'schule-betrieb');
    if (idx === -1) {
      rules.push(Object.assign({ id: 'rule-mi', label: 'Schule + Betrieb Mittwoch', kind: 'weekly', weekdays: { mi: true },
        interval: 1, anchor: '', from: '', to: '', dayType: 'schule-betrieb' }, mixedRuleTemplate(), patch));
    } else {
      rules[idx] = Object.assign({}, rules[idx], patch);
    }
    persist({ schoolRules: rules });
  }

  function zsSaveTransit(key, raw) {
    const status = el('zsTransitStatus');
    const tr = zsTransit();
    if (key === 'walkHomeMinutes' || key === 'walkWorkMinutes') {
      tr[key] = String(raw || '').replace(/[^0-9]/g, '');
    } else {
      const parsed = T.parseConnections(raw);
      tr[key] = parsed.connections.map((c) => ({ dep: C.minutesToClock(c.dep), arr: C.minutesToClock(c.arr) }));
      if (status) {
        status.textContent = parsed.invalid.length ? 'Nicht verstanden: ' + parsed.invalid.join(', ') + ' (Format 16:22-16:56)' : 'Gespeichert ✓';
      }
    }
    persist({ transit: tr });
    zsFillSettings();
  }

  function zsBindSettings() {
    const on = (id, ev, fn) => { const n = el(id); if (n) n.addEventListener(ev, () => fn(n)); };
    on('zsAutoBreak', 'change', (n) => { persist({ autoBreak: n.checked }); zsRefreshAll(); });
    on('zsMixedMode', 'change', (n) => { persist({ mixedDayMode: n.value }); zsRefreshAll(); });
    ['mo', 'di', 'mi', 'do', 'fr'].forEach((k) => on('zsPaid_' + k, 'change', (n) => {
      const days = Object.assign({}, state.paidBreakDays || {});
      days[k] = n.checked;
      persist({ paidBreakDays: days });
      zsRefreshAll();
    }));
    on('zsPaidMinutes', 'change', (n) => { persist({ paidBreakMinutes: String(zsInt(n.value, 30)) }); zsFillSettings(); zsRefreshAll(); });
    on('zsMixedBreak', 'change', (n) => { persist({ mixedBreakInBetrieb: n.checked }); zsRefreshAll(); });
    on('zsMiFrom', 'change', (n) => { if (n.value) { zsSaveMixedRule({ schoolFrom: n.value }); zsRefreshAll(); } });
    on('zsMiTo', 'change', (n) => { if (n.value) { zsSaveMixedRule({ schoolTo: n.value }); zsRefreshAll(); } });
    on('zsMiTravel', 'change', (n) => { zsSaveMixedRule({ travelMinutes: String(zsInt(n.value, 0)) }); zsFillSettings(); zsRefreshAll(); });
    on('zsToWork', 'change', (n) => { zsSaveTransit('toWork', n.value); zsRefreshAll(); });
    on('zsFromWork', 'change', (n) => { zsSaveTransit('fromWork', n.value); zsRefreshAll(); });
    on('zsToSchool', 'change', (n) => { zsSaveTransit('toSchool', n.value); zsRefreshAll(); });
    on('zsWalkHome', 'change', (n) => { zsSaveTransit('walkHomeMinutes', n.value); zsRefreshAll(); });
    on('zsWalkWork', 'change', (n) => { zsSaveTransit('walkWorkMinutes', n.value); zsRefreshAll(); });
    on('zsDisplayUnit', 'change', (n) => {
      persist({ displayUnit: n.value });
      C.setDisplayMode(n.value);
      zsFillSettings();
      zsRefreshAll();
    });
    on('zsOpenSettings', 'click', () => { zsFillSettings(); settingsDialog.showModal(); });
    on('zsShareBackup', 'click', () => zsShareBackup(el('zsBackupStatus')));
    on('zsShareBackup2', 'click', () => zsShareBackup(backupStatus));
    on('zsFixBtn', 'click', () => { if (zsFixDate) openDayDetail(zsFixDate); });
    on('zsQfSave', 'click', zsSaveQuickFill);
    on('zsRestoreFile', 'click', () => backupFileInput.click());
    const snapBox = el('zsSnapList');
    if (snapBox) snapBox.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-snap-id]');
      if (btn) zsRestoreSnapshot(Number(btn.getAttribute('data-snap-id')));
    });
    navBtns.forEach((b) => b.addEventListener('click', () => { if (b.dataset.target === 'infos') renderSnapshots(); }));
    on('zsBtnSuggest', 'click', () => {
      const todayStr = P.todayKey();
      const mx = mixedTimesFor(todayStr);
      const d = new Date();
      const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime() + mx.suggestedClockInMinutes * 60000;
      const wd = getWorkDay(todayStr);
      const check = P.validateStamp(wd.events, P.TYPES.CLOCK_IN, Math.min(at, Date.now()));
      if (!check.ok) return;
      saveWorkDay(todayStr, P.addEvent(wd, P.TYPES.CLOCK_IN, at));
      renderStatus();
      renderWeekDays();
      renderWeekSummary();
      renderMonth();
    });
    settingsBtn.addEventListener('click', zsFillSettings);
  }

  // ---- Backup teilen (iPhone: Downloads aus Home-Bildschirm-Apps unzuverlässig)
  async function zsShareBackup(statusEl) {
    const json = JSON.stringify({
      format: BACKUP_FORMAT,
      appVersion: 'zeitstempel-1.0',
      schemaVersion: state.schemaVersion || 2,
      exportedAt: new Date().toISOString(),
      state: state,
    }, null, 2);
    const name = 'Zeitstempel_Backup_' + P.todayKey() + '.json';
    backupTextarea.value = json;
    const say = (t, err) => {
      if (!statusEl) return;
      statusEl.textContent = t;
      statusEl.classList.remove('is-hidden');
      statusEl.classList.toggle('is-error', !!err);
    };
    try {
      if (typeof window.File === 'function' && navigator.canShare) {
        const file = new File([json], name, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Zeitstempel Backup' });
          persist({ zsLastBackup: P.todayKey() });
          say('Gesichert ✓');
          renderSnapshots();
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: 'Zeitstempel Backup ' + P.todayKey(), text: json });
        persist({ zsLastBackup: P.todayKey() });
        say('Backup geteilt ✓');
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') { say('Abgebrochen.'); return; }
    }
    // Rückfall: Text zum Kopieren anbieten
    backupTextBlock.open = true;
    say('Teilen geht hier nicht – unter Einstellungen → Daten steht das Backup als Text zum Kopieren.', true);
  }


  // ---- ZEITSTEMPEL: Nachtragen im Tagesdetail -------------------------------
  function zsRenderQuickFill(dateStr, wd, type, stats) {
    const box = el('zsQuickFill');
    if (!box) return;
    const status = P.statusForEvents(wd.events || []);
    const show = type.mode !== 'fixed' && dateStr <= P.todayKey() && status !== P.STATUS.DONE && status !== P.STATUS.ON_BREAK;
    box.classList.toggle('is-hidden', !show);
    if (!show) return;
    const hasIn = !!stats.clockInEvent;
    el('zsQfInWrap').classList.toggle('is-hidden', hasIn);
    const start = hasIn ? P.minutesOfDay(stats.clockInEvent.timestamp) : zsPlannedStart(dateStr);
    el('zsQfIn').value = C.minutesToClock(start);
    el('zsQfOut').value = C.minutesToClock(zsProjectedEnd(dateStr, start));
  }

  function zsSaveQuickFill() {
    const dateStr = dayDetailDateKey;
    if (!dateStr) return;
    let wd = getWorkDay(dateStr);
    const outClock = el('zsQfOut').value;
    if (!outClock) return;
    if (!wd.events.some((e) => e.type === P.TYPES.CLOCK_IN)) {
      const inClock = el('zsQfIn').value;
      if (!inClock) return;
      wd = P.addEvent(wd, P.TYPES.CLOCK_IN, combineDateAndClock(dateStr, inClock, Date.now()));
    }
    wd = P.addEvent(wd, P.TYPES.CLOCK_OUT, combineDateAndClock(dateStr, outClock, Date.now()));
    saveWorkDayIfValid(dateStr, wd, null);
    renderZeitstempel();
  }

  // ---- ZEITSTEMPEL: Sicherungen, die NUR auf diesem iPhone liegen ----------
  //
  // Automatisch: einmal pro Tag beim Öffnen, vor jedem Update, vor jedem
  // Wiederherstellen und vor "Alle Daten zurücksetzen". Abgelegt in IndexedDB
  // (eigene Datenbank derselben Web-App) – nichts verlässt das Gerät.
  // Schützt vor: verbuggtem Update, versehentlichem Überschreiben, falsch
  // eingespieltem Backup. Schützt NICHT davor, dass das Symbol gelöscht wird
  // (dann ist auch IndexedDB weg) – dafür gibt es "Backup in Dateien sichern".
  const ZS_DB = 'zeitstempel-sicherungen';
  const ZS_KEEP = 20;

  function zsDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('kein IndexedDB')); return; }
      const req = indexedDB.open(ZS_DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('snapshots', { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function zsSnapList() {
    return zsDb().then((db) => new Promise((resolve) => {
      const out = [];
      const tx = db.transaction('snapshots', 'readonly');
      tx.objectStore('snapshots').openCursor().onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { out.push(cur.value); cur.continue(); } else resolve(out.sort((a, b) => b.id - a.id));
      };
      tx.onerror = () => resolve(out);
    })).catch(() => []);
  }

  /** Legt eine Sicherung an. Gleicher Inhalt wie die letzte -> nichts tun. */
  function zsSnapshot(reason) {
    const json = JSON.stringify(state);
    return zsSnapList().then((list) => {
      if (list[0] && list[0].json === json) return list;
      return zsDb().then((db) => new Promise((resolve) => {
        const tx = db.transaction('snapshots', 'readwrite');
        const store = tx.objectStore('snapshots');
        const now = Date.now();
        store.put({ id: now, reason: reason, days: Object.keys(state.workDays || {}).length, json: json });
        // Aufräumen: die 5 neuesten immer behalten, ältere nur eine pro Tag,
        // insgesamt höchstens ZS_KEEP.
        const seenDays = {};
        let kept = 1;
        list.forEach((old, i) => {
          const dayKey = P.dateKey(new Date(old.id));
          const keep = kept < ZS_KEEP && (i < 4 || !seenDays[dayKey]);
          seenDays[dayKey] = true;
          if (keep) kept += 1; else store.delete(old.id);
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      }));
    }).catch(() => {});
  }

  function zsDailySnapshot() {
    const today = P.todayKey();
    if (state.zsLastSnapshotDay === today) return Promise.resolve();
    return zsSnapshot('täglich').then(() => {
      state = S.update({ zsLastSnapshotDay: today });
    });
  }

  function zsRestoreSnapshot(id) {
    zsSnapList().then((list) => {
      const snap = list.filter((s) => s.id === id)[0];
      if (!snap) return;
      const d = new Date(snap.id);
      if (!confirm('Stand vom ' + O.formatDateShort(d) + ' ' + clockOf(snap.id) + ' zurückholen?\n\n' +
        'Der jetzige Stand wird vorher selbst gesichert – du kannst also wieder zurück.')) return;
      zsSnapshot('vor Zurückholen').then(() => {
        try { S.save(Object.assign({}, S.DEFAULT_STATE, JSON.parse(snap.json))); } catch (e) { return; }
        location.reload();
      });
    });
  }

  function renderSnapshots() {
    const box = el('zsSnapList');
    if (!box) return;
    zsSnapList().then((list) => {
      if (!list.length) {
        box.innerHTML = '<p class="settings-hint">Noch keine Sicherung – die erste entsteht automatisch.</p>';
        return;
      }
      box.innerHTML = list.map((s) => {
        const d = new Date(s.id);
        return '<div class="activity-item">' +
          '<div class="activity-item-text as-static"><strong>' + escapeHtml(O.formatDateShort(d) + ' ' + clockOf(s.id)) + '</strong>' +
          '<span>' + escapeHtml(s.reason + ' · ' + s.days + (s.days === 1 ? ' Tag' : ' Tage')) + '</span></div>' +
          '<button type="button" class="chip-btn" data-snap-id="' + escapeHtml(String(s.id)) + '">Zurückholen</button>' +
        '</div>';
      }).join('');
    });
    const last = state.zsLastBackup;
    const hint = el('zsBackupHint');
    if (hint) {
      const age = last ? Math.round((new Date(P.todayKey()) - new Date(last)) / 86400000) : null;
      hint.textContent = last
        ? 'Letzte Sicherung in Dateien: ' + formatDateDe(last) + (age > 30 ? ' – mal wieder sichern!' : '')
        : 'Noch nie in Dateien gesichert. Einmal im Monat reicht.';
      hint.classList.toggle('is-warning', !last || age > 30);
    }
  }

  // ---- Update-Hinweis vom Service Worker (siehe pwa.js) --------------------
  function zsBindUpdateBanner() {
    if (!zs.updateBanner) return;
    window.addEventListener('zeitstempel:update', () => zs.updateBanner.classList.remove('is-hidden'));
    zs.updateBanner.addEventListener('click', () => {
      const apply = () => {
        if (typeof window.__zeitstempelApplyUpdate === 'function') window.__zeitstempelApplyUpdate();
        else location.reload();
      };
      zsSnapshot('vor Update').then(apply, apply);
    });
  }

  function zsInit() {
    C.setDisplayMode(state.displayUnit || 'hm');
    if (!state.zsStartDate) state = S.update({ zsStartDate: P.todayKey() });
    // Speicher als "dauerhaft" anfragen - schützt vor Aufräumen bei Platzmangel.
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    } catch (e) { /* egal */ }
    zsFillSettings();
    zsBindSettings();
    zsBindUpdateBanner();
    renderPlan();
    renderZeitstempel();
    zsDailySnapshot().then(renderSnapshots);
    // Beim Verlassen der App (Home-Taste, App-Wechsel) den Stand sichern –
    // höchstens alle 30 Minuten, gleicher Inhalt wird ohnehin übersprungen.
    let lastAutoSnap = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'hidden' || Date.now() - lastAutoSnap < 30 * 60000) return;
      lastAutoSnap = Date.now();
      zsSnapshot('automatisch');
    });
  }

  // ZEITSTEMPEL: Einblick für den Regressionstest (tests/regressionstest.js).
  // Nur lesende Hilfsfunktionen, die Oberfläche nutzt sie nicht.
  window.__zeitstempelTest = {
    dayTypeIdFor: (d) => dayTypeIdFor(d),
    dayStatsFor: (d) => dayStatsFor(d, ((state.workDays || {})[d] || {}).events || [], Date.now()),
    dayValueFor: (d) => dayValueFor(d),
    dayBalance: (d) => dayBalance(d),
    sumBalance: (f) => sumBalance(f),
    targetNetMinutes: () => targetNetMinutes(),
    weekTarget: () => weekTargetCentihours(),
    vacationYearSettings: (y) => vacationYearSettings(y),
    mixedTimesFor: (d) => mixedTimesFor(d),
    state: () => state,
  };

  document.addEventListener('DOMContentLoaded', init);
})();
