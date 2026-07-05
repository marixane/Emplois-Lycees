const ensureEmptyGroupPageStyle = () => {
  if (document.getElementById('cahier-empty-group-page-style')) return;
  const style = document.createElement('style');
  style.id = 'cahier-empty-group-page-style';
  style.textContent = 'body.cahier-tab-active .homework-page:not(.cahier-visible-group-page){display:none!important;} body.cahier-tab-active .homework-page.cahier-visible-group-page{display:block!important;}';
  document.head.appendChild(style);
};

const getHomeworkPageTitle = (page) => String(
  page.querySelector('.homework-page > div:first-child > div:first-child')?.textContent ||
  page.firstElementChild?.firstElementChild?.textContent ||
  ''
).trim();

const getPageFirstDateValue = (page) => {
  const dateText = String(page.querySelector('.homework-date')?.textContent || '');
  const match = dateText.match(/\b(\d{2})\/(\d{2})\b/);
  if (!match) return 99999;
  const day = Number(match[1]);
  const month = Number(match[2]);
  return (month >= 9 ? 0 : 10000) + month * 100 + day;
};

const getClassGroupStates = () => {
  const timetablePage = Array.from(document.querySelectorAll('.cahier-page'))
    .find((page) => page.querySelector('.timetable-table'));

  const groupsWrap = Array.from(timetablePage?.children || []).find((child) => {
    const style = String(child.getAttribute('style') || '');
    return style.includes('grid-template-columns: repeat(5');
  });

  return Array.from(groupsWrap?.children || []).map((group) => ({
    title: String(group.children?.[0]?.textContent || '').trim(),
    hasClass: Boolean(group.children?.[1]?.querySelector('span'))
  })).filter((group) => group.title);
};

const splitHomeworkPagesIntoBlocks = (pages) => {
  const blocks = [];
  let currentBlock = null;

  pages.forEach((page) => {
    const title = getHomeworkPageTitle(page);
    const firstDateValue = getPageFirstDateValue(page);
    const startsNewBlock = !currentBlock || firstDateValue < currentBlock.lastDateValue || (title !== currentBlock.title && firstDateValue <= currentBlock.lastDateValue);

    if (startsNewBlock) {
      currentBlock = { title, pages: [], lastDateValue: -1 };
      blocks.push(currentBlock);
    }

    currentBlock.pages.push(page);
    currentBlock.lastDateValue = firstDateValue;
  });

  return blocks;
};

const applyEmptyGroupPageVisibility = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;
  ensureEmptyGroupPageStyle();

  const groupStates = getClassGroupStates();
  const homeworkPages = Array.from(document.querySelectorAll('.homework-page'));
  const blocks = splitHomeworkPagesIntoBlocks(homeworkPages);

  homeworkPages.forEach((page) => page.classList.remove('cahier-visible-group-page'));

  blocks.forEach((block, index) => {
    const group = groupStates[index];
    const shouldShow = Boolean(group?.hasClass);
    block.pages.forEach((page) => {
      page.classList.toggle('cahier-visible-group-page', shouldShow);
    });
  });
};

let emptyGroupPagesRaf = 0;
const scheduleEmptyGroupPageVisibility = () => {
  if (emptyGroupPagesRaf) return;
  emptyGroupPagesRaf = window.requestAnimationFrame(() => {
    emptyGroupPagesRaf = 0;
    applyEmptyGroupPageVisibility();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleEmptyGroupPageVisibility, { once: true });
} else {
  scheduleEmptyGroupPageVisibility();
}

window.setTimeout(scheduleEmptyGroupPageVisibility, 150);
window.setTimeout(scheduleEmptyGroupPageVisibility, 500);
window.setTimeout(scheduleEmptyGroupPageVisibility, 1200);
window.setTimeout(scheduleEmptyGroupPageVisibility, 2200);

document.addEventListener('input', (event) => {
  if (event.target?.closest?.('.timetable-table')) window.setTimeout(scheduleEmptyGroupPageVisibility, 120);
}, { passive: true });
document.addEventListener('drop', () => window.setTimeout(scheduleEmptyGroupPageVisibility, 150), { passive: true });
document.addEventListener('mouseup', () => window.setTimeout(scheduleEmptyGroupPageVisibility, 150), { passive: true });

new MutationObserver(scheduleEmptyGroupPageVisibility).observe(document.body, {
  childList: true,
  subtree: true
});
