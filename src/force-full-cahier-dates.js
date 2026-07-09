const DATE_PATTERN = /\b(\d{2})\/(\d{2})(?!\/\d{4})\b/g;

const addYear = (text) => String(text || '').replace(DATE_PATTERN, (_, day, month) => {
  const year = Number(month) >= 9 ? 2026 : 2027;
  return `${day}/${month}/${year}`;
});

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
