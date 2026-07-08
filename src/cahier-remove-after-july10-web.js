const JULY_CUTOFF_DAY = 10;

const getJulyDay = (text) => {
  const match = String(text || '').match(/(\d{1,2})\/07(?:\/\d{4})?/);
  return match ? Number(match[1]) : null;
};

const removeEntriesAfterJuly10 = () => {
  document.querySelectorAll('.homework-entry').forEach((entry) => {
    const dateText = entry.querySelector('.homework-date')?.textContent || '';
    const day = getJulyDay(dateText);
    if (day !== null && day > JULY_CUTOFF_DAY) entry.remove();
  });

  document.querySelectorAll('.homework-page').forEach((page) => {
    if (!page.querySelector('.homework-entry')) page.remove();
  });
};

let scheduled = false;
const scheduleCleanup = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    removeEntriesAfterJuly10();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCleanup, { once: true });
} else {
  scheduleCleanup();
}

new MutationObserver(scheduleCleanup).observe(document.documentElement, {
  childList: true,
  subtree: true
});
