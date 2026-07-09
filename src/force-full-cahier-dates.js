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

const applyOfficialEvents = () => {
  const entries = [...document.querySelectorAll('.homework-entry')];

  OFFICIAL_EVENTS.forEach((event) => {
    let entry = entries.find((item) => entryText(item).includes(event.key));

    if (!entry && event.key === 'Fête de l’Unité') {
      entry = entries.find((item) => entryDate(item) === '31/10/2026');
    }

    if (entry) setEventVisual(entry, event);
  });
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
