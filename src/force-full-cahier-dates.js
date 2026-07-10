const DATE_PATTERN = /\b(\d{2})\/(\d{2})(?!\/\d{4})\b/g;
const FULL_DATE_PATTERN = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;

const OFFICIAL_EVENTS = [
  { key: 'Vacances intermédiaires 1', date: 'DIMANCHE 18/10/2026 - DIMANCHE 25/10/2026' },
  { key: 'Fête de l’Unité', date: 'SAMEDI 31/10/2026', label: 'Nationale', text: 'Fête nationale : Fête de l’Unité' },
  { key: 'Marche Verte', date: 'VENDREDI 06/11/2026' },
  { key: 'Fête de l’Indépendance', date: 'MERCREDI 18/11/2026' },
  { key: 'Vacances intermédiaires 2', date: 'DIMANCHE 06/12/2026 - DIMANCHE 13/12/2026' },
  { key: 'Nouvel An', date: 'VENDREDI 01/01/2027' },
  { key: 'Manifeste de l’Indépendance', date: 'LUNDI 11/01/2027' },
  { key: 'Nouvel An Amazigh', date: 'JEUDI 14/01/2027' },
  { key: 'Vacances de mi-année', date: 'DIMANCHE 24/01/2027 - DIMANCHE 31/01/2027' },
  { key: 'Vacances intermédiaires 3', date: 'DIMANCHE 21/03/2027 - DIMANCHE 28/03/2027' },
  { key: 'Fête du Travail', date: 'SAMEDI 01/05/2027' },
  { key: 'Vacances intermédiaires 4', date: 'DIMANCHE 09/05/2027 - DIMANCHE 16/05/2027' }
];

const addYear = (text) => String(text || '').replace(DATE_PATTERN, (_, day, month) => {
  const year = Number(month) >= 9 ? 2026 : 2027;
  return `${day}/${month}/${year}`;
});

const entryText = (entry) => entry.querySelector('.homework-text')?.textContent || '';
const entryDate = (entry) => entry.querySelector('.homework-date')?.textContent.match(FULL_DATE_PATTERN)?.[0] || '';

const hasSaturdayClass = () => {
  const saturdayRow = [...document.querySelectorAll('.timetable-table tbody tr')].find((row) => {
    const dayField = row.querySelector('.day-cell textarea');
    return String(dayField?.value || '').trim().toUpperCase() === 'SAMEDI';
  });

  if (!saturdayRow) return false;

  return [...saturdayRow.querySelectorAll('td:not(.day-cell) textarea')]
    .some((textarea) => String(textarea.value || '').trim() !== '');
};

const setEventVisual = (entry, event) => {
  const dateElement = entry.querySelector('.homework-date');
  const textElement = entry.querySelector('.homework-text');
  const subjectElement = entry.querySelector('.homework-subject');

  if (dateElement) dateElement.textContent = event.date;
  if (event.text && textElement) textElement.textContent = event.text;

  if (event.label && subjectElement && !subjectElement.textContent.includes(event.label)) {
    const badge = subjectElement.querySelector('span');
    if (badge) badge.textContent = event.label;
  }
};

const restoreMawlidAsNormalSaturday = () => {
  const entries = [...document.querySelectorAll('.homework-entry')];
  const target = entries.find((entry) => {
    const date = entryDate(entry);
    return date === '05/09/2026' || /Aïd Al Mawlid|Mawlid Annabaoui/i.test(entryText(entry));
  });
  const source = entries.find((entry) => entryDate(entry) === '12/09/2026');

  if (!target) return;

  if (!hasSaturdayClass()) {
    target.remove();
    return;
  }

  const dateElement = target.querySelector('.homework-date');
  const textElement = target.querySelector('.homework-text');
  const subjectElement = target.querySelector('.homework-subject');

  if (dateElement) dateElement.textContent = 'SAMEDI 05/09/2026';

  if (source) {
    const sourceText = source.querySelector('.homework-text');
    const sourceSubject = source.querySelector('.homework-subject');

    if (textElement && sourceText) {
      textElement.innerHTML = sourceText.innerHTML;
      textElement.setAttribute('style', sourceText.getAttribute('style') || '');
    }

    if (subjectElement && sourceSubject) {
      subjectElement.innerHTML = sourceSubject.innerHTML;
      subjectElement.setAttribute('style', sourceSubject.getAttribute('style') || '');
    }
  } else {
    if (textElement) {
      textElement.textContent = `${'.'.repeat(63)}\n${'.'.repeat(63)}\n${'.'.repeat(63)}`;
      textElement.style.background = 'transparent';
      textElement.style.border = 'none';
      textElement.style.borderRadius = '0';
      textElement.style.margin = '0';
      textElement.style.padding = '8px 10px';
      textElement.style.color = 'rgba(63, 64, 80, 0.28)';
      textElement.style.textAlign = 'left';
      textElement.style.justifyContent = 'initial';
    }
    if (subjectElement) subjectElement.innerHTML = '';
  }

  target.classList.remove('cahier-extra-holiday-entry', 'cahier-exam-entry');
};

const removeNormalExitEntry = () => {
  const entries = [...document.querySelectorAll('.homework-entry')];
  const exitEventExists = entries.some((entry) => {
    return entryDate(entry) === '10/07/2027' && /Procès-verbal de sortie/i.test(entryText(entry));
  });

  if (!exitEventExists) return;

  entries.forEach((entry) => {
    const isSameDate = entryDate(entry) === '10/07/2027';
    const isExitEvent = /Procès-verbal de sortie/i.test(entryText(entry));
    if (isSameDate && !isExitEvent) entry.remove();
  });
};

const applyOfficialEvents = () => {
  const entries = [...document.querySelectorAll('.homework-entry')];

  OFFICIAL_EVENTS.forEach((event) => {
    let entry = entries.find((item) => entryText(item).includes(event.key));

    if (!entry && event.key === 'Fête de l’Unité') {
      entry = entries.find((item) => entryDate(item) === '31/10/2026');
    }

    if (entry) setEventVisual(entry, event);
  });

  restoreMawlidAsNormalSaturday();
  removeNormalExitEntry();
};

const applyFullDates = () => {
  document.querySelectorAll('.homework-date').forEach((element) => {
    const next = addYear(element.textContent);
    if (element.textContent !== next) element.textContent = next;
  });

  document.querySelectorAll('.cahier-exams-list tbody tr').forEach((row) => {
    Array.from(row.cells).slice(0, 2).forEach((cell) => {
      const next = addYear(cell.textContent);
      if (cell.textContent !== next) cell.textContent = next;
    });
  });

  document.querySelectorAll('.holidays-page td').forEach((cell) => {
    const next = addYear(cell.textContent);
    if (cell.textContent !== next) cell.textContent = next;
  });

  applyOfficialEvents();
};

const scheduleApply = () => {
  requestAnimationFrame(applyFullDates);
  window.setTimeout(applyFullDates, 50);
  window.setTimeout(applyFullDates, 150);
};

export const scheduleFullDates = () => {
  applyFullDates();
  scheduleApply();

  const events = ['click', 'input', 'change', 'keyup', 'drop'];
  events.forEach((eventName) => document.addEventListener(eventName, scheduleApply, true));

  const interval = window.setInterval(applyFullDates, 500);

  return () => {
    events.forEach((eventName) => document.removeEventListener(eventName, scheduleApply, true));
    window.clearInterval(interval);
  };
};
