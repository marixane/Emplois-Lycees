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

export const scheduleFullDates = () => {
  applyFullDates();
  const frame = requestAnimationFrame(applyFullDates);
  const timer = window.setTimeout(applyFullDates, 80);
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
  };
};
