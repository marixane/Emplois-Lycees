const durationText = (span) => `${Math.max(Number(span) || 1, 1)}h`;

const clean = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
const isHourText = (value) => /^\d{1,2}:\d{2}$/.test(String(value || '').trim());

const getTimetableDurations = () => {
  const rows = Array.from(document.querySelectorAll('.timetable-table tbody tr'));
  const map = new Map();

  rows.forEach((row) => {
    const day = clean(row.querySelector('.day-cell textarea')?.value || row.querySelector('.day-cell')?.textContent);
    let hourIndex = 0;

    Array.from(row.children).slice(1).forEach((cell) => {
      const text = clean(cell.querySelector('textarea')?.value || cell.textContent);
      if (!text) {
        hourIndex += Number(cell.colSpan) || 1;
        return;
      }

      const header = document.querySelector(`.timetable-table thead th:nth-child(${hourIndex + 2}) textarea`);
      const hour = clean((header?.value || header?.textContent || '').split('-')[0]);
      const span = Number(cell.colSpan) || 1;
      map.set(`${day}|${hour}|${text}`, durationText(span));
      hourIndex += span;
    });
  });

  return map;
};

const getEntryDay = (entry) => clean((entry.querySelector('.homework-date')?.textContent || '').split(' ')[0]);

const fitNonHourLabel = (node) => {
  const isEventLabel = Boolean(node.closest('.cahier-extra-holiday-entry, .cahier-exam-entry'));
  if (isEventLabel) {
    node.style.removeProperty('transform');
    node.style.removeProperty('transform-origin');
    node.style.setProperty('white-space', 'nowrap', 'important');
    node.style.setProperty('overflow', 'hidden', 'important');

    let size = 18;
    node.style.setProperty('font-size', `${size}px`, 'important');
    const availableWidth = Math.max(node.clientWidth, 0);
    while (size > 20 && availableWidth > 0 && node.scrollWidth > availableWidth) {
      size -= 1;
      node.style.setProperty('font-size', `${size}px`, 'important');
    }
    return;
  }

  node.style.removeProperty('font-size');
  node.style.setProperty('font-size', '12px', 'important');

  let size = 12;
  const availableWidth = Math.max(node.clientWidth - 2, 0);
  while (size > 10 && node.scrollWidth > availableWidth) {
    size -= 1;
    node.style.setProperty('font-size', `${size}px`, 'important');
  }
};

const fitClassLabel = (node) => {
  node.style.setProperty('text-overflow', 'clip', 'important');
  node.style.setProperty('white-space', 'nowrap', 'important');
  node.style.setProperty('overflow', 'visible', 'important');
  node.style.removeProperty('transform');
  node.style.removeProperty('transform-origin');

  const line = node.parentElement;
  const classCount = line?.parentElement?.children?.length || 1;
  const maxSize = classCount >= 4 ? 20 : classCount === 3 ? 24 : 28;
  const minSize = 8;
  const availableWidth = Math.max(node.clientWidth - 2, 0);

  let size = maxSize;
  node.style.setProperty('font-size', `${size}px`, 'important');

  while (size > minSize && node.scrollWidth > availableWidth) {
    size -= 1;
    node.style.setProperty('font-size', `${size}px`, 'important');
  }

  if (availableWidth > 0 && node.scrollWidth > 0) {
    const rawScale = availableWidth / node.scrollWidth;
    const scale = Math.min(1.8, Math.max(0.78, rawScale));
    node.style.setProperty('transform', `scaleX(${scale})`, 'important');
    node.style.setProperty('transform-origin', 'center center', 'important');
  }
};

const markAndFitLabels = () => {
  document.querySelectorAll('.homework-subject > div').forEach((line) => {
    const hourNode = line.querySelector('span:first-child');
    const classNode = line.querySelector('span:nth-child(2)');

    if (hourNode) {
      const nonHour = !isHourText(hourNode.textContent);
      hourNode.classList.toggle('cahier-session-non-hour', nonHour);
      if (nonHour) fitNonHourLabel(hourNode);
      else hourNode.style.removeProperty('font-size');
    }

    if (classNode) fitClassLabel(classNode);
  });
};

const applySessionDurations = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;

  const durations = getTimetableDurations();
  document.querySelectorAll('.homework-entry:not(.cahier-extra-holiday-entry):not(.cahier-exam-entry)').forEach((entry) => {
    const day = getEntryDay(entry);

    entry.querySelectorAll('.homework-subject > div').forEach((line) => {
      const spans = line.querySelectorAll('span');
      const hour = clean(spans[0]?.textContent);
      const className = clean(spans[1]?.textContent);
      const duration = durations.get(`${day}|${hour}|${className}`) || '1h';

      let durationNode = line.querySelector('.cahier-session-duration');
      if (!durationNode) {
        durationNode = document.createElement('span');
        durationNode.className = 'cahier-session-duration';
        line.append(durationNode);
      }
      durationNode.textContent = duration;
    });
  });

  markAndFitLabels();
};

let sessionFrame = 0;
const scheduleSessionDurations = () => {
  cancelAnimationFrame(sessionFrame);
  sessionFrame = requestAnimationFrame(() => {
    applySessionDurations();
    setTimeout(applySessionDurations, 60);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleSessionDurations, { once: true });
} else {
  scheduleSessionDurations();
}

document.addEventListener('input', scheduleSessionDurations, true);
document.addEventListener('focusout', scheduleSessionDurations, true);
document.addEventListener('drop', scheduleSessionDurations, true);
document.addEventListener('click', (event) => {
  if (event.target?.closest?.('.span-tools, .timetable-table, .cahier-preview-zone')) scheduleSessionDurations();
}, true);
