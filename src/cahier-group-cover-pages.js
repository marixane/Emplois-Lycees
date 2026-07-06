const GROUP_COVER_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

const getGroupCoverTitleFromPage = (page) => String(
  page?.firstElementChild?.firstElementChild?.textContent ||
  page?.querySelector?.('.homework-page > div:first-child > div:first-child')?.textContent ||
  ''
).trim();

const getFilledGroupBoxes = () => {
  const timetablePage = Array.from(document.querySelectorAll('.cahier-page')).find((page) => page.querySelector('.timetable-table'));
  const groupsWrap = Array.from(timetablePage?.children || []).find((child) => String(child.getAttribute('style') || '').includes('grid-template-columns: repeat(5'));

  return Array.from(groupsWrap?.children || []).map((box, index) => ({
    title: String(box.children?.[0]?.textContent || '').trim(),
    color: GROUP_COVER_COLORS[index % GROUP_COVER_COLORS.length],
    classes: Array.from(box.children?.[1]?.querySelectorAll('span') || []).map((span) => String(span.textContent || '').trim()).filter(Boolean)
  })).filter((group) => group.title && group.classes.length);
};

const buildGroupCoverClassesPanel = (classes) => {
  const panel = document.createElement('div');
  panel.className = 'cahier-group-cover-classes-panel';

  classes.forEach((className, index) => {
    const badge = document.createElement('div');
    badge.className = 'cahier-group-cover-class-badge';
    badge.style.setProperty('--class-index', String(index));
    badge.textContent = className;
    panel.append(badge);
  });

  return panel;
};

const buildGroupCoverPage = (group) => {
  const page = document.createElement('div');
  page.className = 'a4-page cahier-page cahier-group-cover-page';
  page.style.setProperty('--group-cover-color', group.color);

  const card = document.createElement('div');
  card.className = 'cahier-group-cover-card';

  const title = document.createElement('div');
  title.className = 'cahier-group-cover-title';
  title.textContent = group.title;

  const subtitle = document.createElement('div');
  subtitle.className = 'cahier-group-cover-subtitle';
  subtitle.textContent = 'Suivi pédagogique annuel 2025-2026';

  const icons = document.createElement('div');
  icons.className = 'cahier-group-cover-icons';
  ['✏️', '📖', '📐', '🧮', '🎓'].forEach((icon) => {
    const span = document.createElement('span');
    span.textContent = icon;
    icons.append(span);
  });

  card.append(title, buildGroupCoverClassesPanel(group.classes), subtitle, icons);
  page.append(card);
  return page;
};

const applyCleanGroupCoverPages = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;

  document.querySelectorAll('.cahier-group-cover-page').forEach((page) => page.remove());

  const groups = getFilledGroupBoxes();
  const homeworkPages = Array.from(document.querySelectorAll('.homework-page'));
  const usedPages = new Set();

  groups.forEach((group) => {
    const targetPage = homeworkPages.find((page) => !usedPages.has(page) && getGroupCoverTitleFromPage(page) === group.title);
    if (!targetPage) return;
    usedPages.add(targetPage);
    targetPage.before(buildGroupCoverPage(group));
  });
};

let groupCoverRaf = 0;
const scheduleCleanGroupCoverPages = () => {
  if (groupCoverRaf) return;
  groupCoverRaf = window.requestAnimationFrame(() => {
    groupCoverRaf = 0;
    applyCleanGroupCoverPages();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCleanGroupCoverPages, { once: true });
} else {
  scheduleCleanGroupCoverPages();
}

window.setTimeout(scheduleCleanGroupCoverPages, 300);
window.setTimeout(scheduleCleanGroupCoverPages, 1000);
window.setTimeout(scheduleCleanGroupCoverPages, 2500);

document.addEventListener('input', (event) => {
  if (event.target?.closest?.('.timetable-table')) window.setTimeout(scheduleCleanGroupCoverPages, 180);
}, { passive: true });
document.addEventListener('drop', () => window.setTimeout(scheduleCleanGroupCoverPages, 220), { passive: true });
document.addEventListener('mouseup', () => window.setTimeout(scheduleCleanGroupCoverPages, 220), { passive: true });
