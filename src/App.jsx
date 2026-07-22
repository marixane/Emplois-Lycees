import { useEffect, useLayoutEffect, useState } from 'react';
import CoverPage from './CoverPage.jsx';
import TabWithFullDates from './TabWithFullDates.jsx';
import { scheduleFullDates } from './force-full-cahier-dates.js';

const removeOldFirstPages = () => {
  document.querySelectorAll('.a4-page').forEach((page) => {
    const text = String(page.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const isOldCover = text.includes('mon cahier') || text.includes("classes remplies dans l'emploi du temps");
    if (isOldCover) page.remove();
  });
};

const moveTimetableExtras = () => {
  const timetable = document.querySelector('.timetable-table');
  const timetablePage = timetable?.closest('.a4-page.cahier-page');
  if (!timetable || !timetablePage) return;

  timetablePage.classList.add('timetable-page-shifted');

  const totalHours = timetablePage.querySelector('.total-hours-control');
  if (totalHours) {
    totalHours.classList.add('total-hours-under-timetable');
    if (timetable.nextElementSibling !== totalHours) timetable.insertAdjacentElement('afterend', totalHours);
  }

  const groupsContainer = [...timetablePage.children].find((element) => element.dataset.cahierClassGroups === 'true')
    || [...timetablePage.children].find((element) => {
      const children = [...element.children];
      if (children.length !== 3) return false;

      const titles = children.map((child) => String(child.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase());
      return titles[0].startsWith('TRONC COMMUN')
        && titles[1].startsWith('1ÈRES BAC')
        && titles[2].startsWith('2ÈME BAC');
    });

  if (!groupsContainer) return;

  groupsContainer.classList.add('groups-under-timetable');
  if (totalHours && totalHours.nextElementSibling !== groupsContainer) totalHours.insertAdjacentElement('afterend', groupsContainer);
  else if (!totalHours && timetable.nextElementSibling !== groupsContainer) timetable.insertAdjacentElement('afterend', groupsContainer);
};

const refreshLayout = () => {
  removeOldFirstPages();
  moveTimetableExtras();
};

export default function App() {
  const [coverClassGroups, setCoverClassGroups] = useState([]);

  useEffect(() => {
    document.body.classList.add('cahier-tab-active');
    document.body.classList.remove('devoir-tab-active');

    let scheduled = false;
    const scheduleRefresh = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        refreshLayout();
      });
    };

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleRefresh();

    return () => {
      observer.disconnect();
      document.body.classList.remove('cahier-tab-active');
    };
  }, []);

  useLayoutEffect(() => {
    const cleanupFullDates = scheduleFullDates();
    refreshLayout();

    return cleanupFullDates;
  }, []);

  return <>
    <style>{`
      .timetable-page-shifted > .cahier-header {
        position: relative;
        top: 30px;
      }

      .timetable-page-shifted > .timetable-table,
      .timetable-page-shifted > .cahier-footer {
        position: relative;
        top: 90px;
      }

      .timetable-page-shifted > .groups-under-timetable {
        position: relative;
        top: 70px;
      }

      .total-hours-under-timetable {
        position: relative !important;
        top: 60px !important;
        transform: none !important;
        width: fit-content !important;
        margin: 36px 66px 0 auto !important;
        padding: 10px 19px !important;
        font-size: 22px !important;
        line-height: 1.2 !important;
        z-index: auto !important;
      }

      .total-hours-under-timetable span,
      .total-hours-under-timetable strong {
        font-size: inherit !important;
      }

      .groups-under-timetable {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 18px !important;
        width: calc(100% - 132px) !important;
        margin: 28px auto 0 !important;
      }

      .groups-under-timetable > div {
        min-height: 190px !important;
      }

      .groups-under-timetable [aria-label^="Classes du groupe"] {
        display: flex !important;
        flex-direction: column !important;
        align-content: stretch !important;
        align-items: stretch !important;
        justify-content: flex-start !important;
        gap: 4px !important;
        height: 150px !important;
        min-height: 150px !important;
        max-height: 150px !important;
        overflow: hidden !important;
      }

      .groups-under-timetable .cahier-class-group-chip {
        flex: 0 0 32px !important;
        min-height: 32px !important;
        height: auto !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        padding: 2px 36px 2px 8px !important;
        font-size: 15px !important;
        line-height: 1 !important;
        overflow: hidden !important;
      }

      .groups-under-timetable .cahier-class-group-name {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .groups-under-timetable .cahier-class-color-picker {
        width: 22px !important;
        height: 22px !important;
        right: 5px !important;
      }

      .groups-under-timetable [aria-label^="Classes du groupe"]:has(> .cahier-class-group-chip:nth-child(4)) .cahier-class-group-chip {
        flex: 1 1 0 !important;
        min-height: 0 !important;
        padding-left: 6px !important;
        padding-right: 30px !important;
        font-size: 12px !important;
      }

      .groups-under-timetable [aria-label^="Classes du groupe"]:has(> .cahier-class-group-chip:nth-child(7)) .cahier-class-group-chip {
        padding-left: 5px !important;
        padding-right: 26px !important;
        font-size: 10px !important;
      }

      .groups-under-timetable [aria-label^="Classes du groupe"]:has(> .cahier-class-group-chip:nth-child(10)) .cahier-class-group-chip {
        padding-left: 4px !important;
        padding-right: 23px !important;
        font-size: 8px !important;
      }

      .groups-under-timetable [aria-label^="Classes du groupe"]:has(> .cahier-class-group-chip:nth-child(7)) .cahier-class-color-picker {
        width: 18px !important;
        height: 18px !important;
        right: 4px !important;
      }

      .timetable-table .timetable-cell-content.colored-cell .timetable-class-input {
        display: block !important;
        justify-self: stretch !important;
        min-width: 0 !important;
        width: 100% !important;
        height: 26px !important;
        min-height: 26px !important;
        max-height: 26px !important;
        margin: 0 !important;
        padding: 0 2px !important;
        font-size: var(--timetable-class-font-size, 15px) !important;
        font-weight: 900 !important;
        line-height: 26px !important;
        text-align: center !important;
        text-indent: 0 !important;
        direction: ltr !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        resize: none !important;
      }

      .timetable-table .timetable-cell-content.colored-cell {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .span-tools {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        justify-self: stretch !important;
        min-width: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 1px !important;
        gap: 2px !important;
        transform: none !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .span-tools button {
        flex: 0 1 16px !important;
        width: 16px !important;
        min-width: 0 !important;
        max-width: 16px !important;
        padding: 0 !important;
        font-size: 10px !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .room-control {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        justify-self: stretch !important;
        min-width: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 2px 0 !important;
        gap: 4px !important;
        transform: none !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .room-control input {
        flex: 0 0 24px !important;
        width: 24px !important;
        min-width: 24px !important;
        max-width: 24px !important;
        margin: 0 !important;
        padding: 0 !important;
        text-align: center !important;
      }

      .homework-date[data-assignment-week-label] {
        position: relative;
        white-space: nowrap !important;
      }

      .homework-date[data-assignment-week-label]::after {
        content: attr(data-assignment-week-label);
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        color: inherit;
        font-family: inherit;
        font-size: var(--last-assignment-label-size, 1em);
        font-weight: inherit;
        line-height: inherit;
        letter-spacing: inherit;
        text-transform: none;
        white-space: nowrap;
      }

      .homework-cover-page .cahier-group-cover-class-chip {
        min-height: 50px !important;
        padding: 10px 14px !important;
        font-size: clamp(20px, 2.8vw, 24px) !important;
        line-height: 1.05 !important;
      }
    `}</style>
    <CoverPage classGroups={coverClassGroups} />
    <TabWithFullDates onClassGroupsChange={setCoverClassGroups} />
  </>;
}
