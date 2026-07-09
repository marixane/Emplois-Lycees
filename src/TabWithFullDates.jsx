import { useEffect, useLayoutEffect } from 'react';
import Tab from './Tab.jsx';

const SCHOOL_START_YEAR = 2026;
const SCHOOL_END_YEAR = 2027;
const SCHOOL_END_DATE = new Date(2027, 6, 10);
const DATE_PATTERN = /\b(\d{2})\/(\d{2})(?!\/\d{4})\b/g;
const FULL_DATE_PATTERN = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;

const getYearForMonth = (month) => Number(month) >= 9 ? SCHOOL_START_YEAR : SCHOOL_END_YEAR;

const addSchoolYearToDates = (text) => String(text ?? '').replace(DATE_PATTERN, (_, day, month) => {
  return `${day}/${month}/${getYearForMonth(month)}`;
});

const getFirstDisplayedDate = (text) => {
  const match = String(text ?? '').match(FULL_DATE_PATTERN);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const updateDisplayedDates = (root = document) => {
  root.querySelectorAll?.('.cahier-header input[aria-label="Année scolaire automatique"]').forEach((input) => {
    if (input.value !== 'Année scolaire : 2026 / 2027') input.value = 'Année scolaire : 2026 / 2027';
  });

  root.querySelectorAll?.('.homework-date').forEach((element) => {
    const nextText = addSchoolYearToDates(element.textContent);
    if (element.textContent !== nextText) element.textContent = nextText;

    const entryDate = getFirstDisplayedDate(nextText);
    const entry = element.closest('.homework-entry');
    if (entry && entryDate && entryDate > SCHOOL_END_DATE) entry.remove();
  });

  root.querySelectorAll?.('.cahier-exams-list tbody tr').forEach((row) => {
    Array.from(row.cells).slice(0, 2).forEach((cell) => {
      const nextText = addSchoolYearToDates(cell.textContent);
      if (cell.textContent !== nextText) cell.textContent = nextText;
    });
  });

  root.querySelectorAll?.('.holidays-page td').forEach((cell) => {
    const nextText = addSchoolYearToDates(cell.textContent);
    if (cell.textContent !== nextText) cell.textContent = nextText;
  });

  root.querySelectorAll?.('.homework-page').forEach((page) => {
    if (!page.querySelector('.homework-entry')) page.remove();
  });
};

export default function TabWithFullDates() {
  useLayoutEffect(() => {
    updateDisplayedDates();
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) updateDisplayedDates(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <>
    <style>{`
      .homework-date {
        border-bottom: 2px dotted rgba(63, 64, 80, 0.5) !important;
        padding-bottom: 8px !important;
      }
    `}</style>
    <Tab />
  </>;
}
