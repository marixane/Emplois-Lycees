const EXAM_EVENTS = [
  { start: '20/01', end: '24/01', cycle: 'Primaire', text: 'Examen : Examen normalisé local' },
  { start: '23/06', end: '24/06', cycle: 'Primaire', text: 'Examen : Examen normalisé provincial' },
  { start: '16/06', end: '17/06', cycle: 'Collège', text: 'Examen : Examen régional du collège' },
  { start: '29/05', end: '30/05', cycle: 'Lycée', text: 'Examen : Examen régional 1ère Bac' },
  { start: '01/06', end: '04/06', cycle: 'Lycée', text: 'Examen : Examen national 2ème Bac' }
];

const EXTRA_HOLIDAY_EVENTS = [
  { start: '20/03', end: '22/03', text: 'Vacance : Aïd Al-Fitr' },
  { start: '27/05', end: '30/05', text: 'Vacance : Aïd Al-Adha' },
  { start: '16/06', end: '16/06', text: 'Vacance : 1er Moharram' }
];

const EXAM_DAYS = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

const getExamSchoolStartYear = () => new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1;

const getExamDateObject = (monthDate) => {
  const [day, month] = String(monthDate).split('/').map(Number);
  const startYear = getExamSchoolStartYear();
  return new Date(month >= 9 ? startYear : startYear + 1, month - 1, day);
};

const getExamTime = (monthDate) => getExamDateObject(monthDate).getTime();
const getExamDisplayDay = (monthDate) => EXAM_DAYS[getExamDateObject(monthDate).getDay()];

const getExamRangeDates = ({ start, end }) => {
  const dates = [];
  const current = getExamDateObject(start);
  const last = getExamDateObject(end);
  while (current <= last) {
    dates.push(`${String(current.getDate()).padStart(2, '0')}/${String(current.getMonth() + 1).padStart(2, '0')}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const getEntryDateText = (entry) => String(entry.querySelector('.homework-date')?.textContent || '');
const entryHasMonthDate = (entry, monthDate) => getEntryDateText(entry).includes(monthDate);
const getEntryMonthDate = (entry) => {
  const match = getEntryDateText(entry).match(/\b\d{2}\/\d{2}\b/);
  return match?.[0] || '';
};

const getPageGroupKey = (page) => String(page.firstElementChild?.firstElementChild?.textContent || 'Groupe').trim();

const getBaseEntries = (page) => Array.from(page.querySelectorAll('.homework-entry:not(.cahier-event-inserted)'));

const getPageBounds = (page) => {
  const times = getBaseEntries(page)
    .map(getEntryMonthDate)
    .filter(Boolean)
    .map(getExamTime)
    .filter((time) => Number.isFinite(time));
  if (!times.length) return null;
  return { min: Math.min(...times), max: Math.max(...times) };
};

const getTargetPageForEvent = (groupPages, event) => {
  const eventStart = getExamTime(event.start);
  const eventEnd = getExamTime(event.end);

  const pageWithExactDate = groupPages.find((page) => {
    const entries = getBaseEntries(page);
    const rangeDates = getExamRangeDates(event);
    return entries.some((entry) => rangeDates.some((date) => entryHasMonthDate(entry, date)));
  });
  if (pageWithExactDate) return pageWithExactDate;

  const pageCoveringEvent = groupPages.find((page) => {
    const bounds = getPageBounds(page);
    return bounds && eventStart <= bounds.max && eventEnd >= bounds.min;
  });
  if (pageCoveringEvent) return pageCoveringEvent;

  return groupPages.find((page) => {
    const bounds = getPageBounds(page);
    return bounds && bounds.max >= eventStart;
  }) || groupPages[groupPages.length - 1];
};

const getTemplateEntry = (page, event) => {
  const entries = getBaseEntries(page);
  const eventStart = getExamTime(event.start);
  return entries.find((entry) => {
    const entryMonthDate = getEntryMonthDate(entry);
    return entryMonthDate && getExamTime(entryMonthDate) >= eventStart;
  }) || entries[entries.length - 1];
};

const cloneEntryForEvent = (template, event, eventClass) => {
  if (!template) return null;
  const clone = template.cloneNode(true);
  clone.classList.remove('cahier-exam-hidden');
  clone.classList.add(eventClass, 'cahier-event-inserted');
  clone.dataset.eventStart = event.start;
  return clone;
};

const setDateRange = (entry, event) => {
  const dateNode = entry.querySelector('.homework-date');
  if (!dateNode) return;
  dateNode.textContent = event.start === event.end
    ? `${getExamDisplayDay(event.start)} ${event.start}`
    : `${getExamDisplayDay(event.start)} ${event.start} - ${getExamDisplayDay(event.end)} ${event.end}`;
};

const setExamEntryContent = (entry, event) => {
  const textNode = entry.querySelector('.homework-text');
  const subjectNode = entry.querySelector('.homework-subject');

  entry.classList.add('cahier-exam-entry');
  entry.dataset.examStart = event.start;
  setDateRange(entry, event);
  if (textNode) textNode.textContent = event.text;
  if (subjectNode) subjectNode.innerHTML = `<div class="cahier-exam-cycle-pill">${event.cycle}</div>`;
};

const setHolidayEntryContent = (entry, event) => {
  const textNode = entry.querySelector('.homework-text');
  const subjectNode = entry.querySelector('.homework-subject');

  entry.classList.add('cahier-extra-holiday-entry');
  entry.dataset.holidayStart = event.start;
  setDateRange(entry, event);
  if (textNode) textNode.textContent = event.text;
  if (subjectNode) subjectNode.innerHTML = '';
};

const placeEventEntry = (page, event, eventEntry) => {
  const entries = getBaseEntries(page);
  const eventStart = getExamTime(event.start);
  const nextEntry = entries.find((entry) => {
    const entryMonthDate = getEntryMonthDate(entry);
    return entryMonthDate && getExamTime(entryMonthDate) > eventStart;
  });
  if (nextEntry) nextEntry.before(eventEntry);
  else entries[entries.length - 1]?.after(eventEntry);
};

const hideCoveredNormalEntries = (page, event) => {
  const rangeDates = getExamRangeDates(event);
  getBaseEntries(page).forEach((entry) => {
    if (rangeDates.some((date) => entryHasMonthDate(entry, date))) entry.classList.add('cahier-exam-hidden');
  });
};

const insertEventsOncePerGroup = (pages, events, eventClass, setter) => {
  const groups = pages.reduce((map, page) => {
    const key = getPageGroupKey(page);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(page);
    return map;
  }, new Map());

  groups.forEach((groupPages) => {
    events.forEach((event) => {
      const targetPage = getTargetPageForEvent(groupPages, event);
      if (!targetPage) return;

      const eventEntry = cloneEntryForEvent(getTemplateEntry(targetPage, event), event, eventClass);
      if (!eventEntry) return;

      setter(eventEntry, event);
      placeEventEntry(targetPage, event, eventEntry);
      hideCoveredNormalEntries(targetPage, event);
    });
  });
};

const applyCahierExamEvents = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return false;
  const pages = Array.from(document.querySelectorAll('.homework-page'));
  if (!pages.length) return false;

  pages.forEach((page) => {
    page.querySelectorAll('.cahier-event-inserted').forEach((entry) => entry.remove());
    page.querySelectorAll('.homework-entry.cahier-exam-entry').forEach((entry) => entry.classList.remove('cahier-exam-entry'));
    page.querySelectorAll('.homework-entry.cahier-extra-holiday-entry').forEach((entry) => entry.classList.remove('cahier-extra-holiday-entry'));
    page.querySelectorAll('.homework-entry.cahier-exam-hidden').forEach((entry) => entry.classList.remove('cahier-exam-hidden'));
  });

  insertEventsOncePerGroup(pages, EXTRA_HOLIDAY_EVENTS, 'cahier-extra-holiday-entry', setHolidayEntryContent);
  insertEventsOncePerGroup(pages, EXAM_EVENTS, 'cahier-exam-entry', setExamEntryContent);

  return true;
};

let examEventsRetryCount = 0;
const scheduleCahierExamEvents = () => window.requestAnimationFrame(() => {
  const done = applyCahierExamEvents();
  if (!done && examEventsRetryCount < 24) {
    examEventsRetryCount += 1;
    window.setTimeout(scheduleCahierExamEvents, 250);
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCahierExamEvents, { once: true });
} else {
  scheduleCahierExamEvents();
}

document.addEventListener('input', (event) => {
  if (event.target?.closest?.('.timetable-table')) window.setTimeout(scheduleCahierExamEvents, 160);
}, { passive: true });
document.addEventListener('drop', () => window.setTimeout(scheduleCahierExamEvents, 180), { passive: true });
