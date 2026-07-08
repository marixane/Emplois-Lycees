const RANGE_START = new Date(2026, 8, 1);
const RANGE_END = new Date(2027, 6, 10);

const FLAGS = [
  { title: 'Vacances intermédiaires 1', date: new Date(2026, 9, 18) },
  { title: 'Vacances intermédiaires 2', date: new Date(2026, 11, 6) },
  { title: 'Vacances intermédiaires 3', date: new Date(2027, 2, 15) },
  { title: 'Vacances intermédiaires 4', date: new Date(2027, 4, 9) }
];

const clampPercent = (date) => {
  const total = RANGE_END - RANGE_START;
  const value = ((date - RANGE_START) / total) * 100;
  return Math.min(100, Math.max(0, value));
};

const parseEntryDate = (text) => {
  const match = String(text || '').match(/(\d{1,2})\/(\d{1,2})/);
  if (!match) return RANGE_START;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = month >= 9 ? 2026 : 2027;
  return new Date(year, month - 1, day);
};

const applyProgressFix = () => {
  document.querySelectorAll('.homework-page').forEach((page) => {
    const firstDateText = page.querySelector('.homework-date')?.textContent || '';
    const percent = Math.round(clampPercent(parseEntryDate(firstDateText)));

    const flagNodes = Array.from(page.querySelectorAll('span')).filter((node) =>
      FLAGS.some((flag) => flag.title === node.title)
    );

    if (!flagNodes.length) return;
    const bar = flagNodes[0].parentElement;
    if (!bar) return;

    const fill = Array.from(bar.children).find((node) => node.tagName === 'DIV');
    if (fill) fill.style.width = `${percent}%`;

    FLAGS.forEach((flag) => {
      const node = flagNodes.find((item) => item.title === flag.title);
      if (!node) return;
      node.style.left = `${clampPercent(flag.date)}%`;
      node.title = flag.title;
      node.setAttribute('aria-label', flag.title);
    });

    const percentNode = bar.parentElement?.lastElementChild;
    if (percentNode) percentNode.textContent = `${percent}%`;
  });
};

let scheduled = false;
const scheduleProgressFix = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyProgressFix();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleProgressFix, { once: true });
} else {
  scheduleProgressFix();
}

new MutationObserver(scheduleProgressFix).observe(document.documentElement, {
  childList: true,
  subtree: true
});
