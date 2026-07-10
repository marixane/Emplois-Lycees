import { useEffect, useLayoutEffect } from 'react';
import CoverPage from './CoverPage.jsx';
import TabWithFullDates from './TabWithFullDates.jsx';
import { scheduleFullDates } from './force-full-cahier-dates.js';

const removeOldFirstPages = () => {
  document.querySelectorAll('.holidays-page').forEach((page) => page.remove());

  document.querySelectorAll('.a4-page').forEach((page) => {
    const text = String(page.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const isOldCover = text.includes('mon cahier') || text.includes("classes remplies dans l'emploi du temps");
    if (isOldCover) page.remove();
  });
};

export default function App() {
  useEffect(() => {
    document.body.classList.add('cahier-tab-active');
    document.body.classList.remove('devoir-tab-active');

    const observer = new MutationObserver(removeOldFirstPages);
    observer.observe(document.body, { childList: true, subtree: true });
    removeOldFirstPages();

    return () => {
      observer.disconnect();
      document.body.classList.remove('cahier-tab-active');
    };
  }, []);

  useLayoutEffect(() => {
    scheduleFullDates();
    removeOldFirstPages();
  });

  return <>
    <CoverPage />
    <TabWithFullDates />
  </>;
}
