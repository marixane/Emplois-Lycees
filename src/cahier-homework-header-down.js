const isHomeworkHeader = (element) => {
  if (!(element instanceof HTMLElement)) return false;

  const text = String(element.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  if (!(
    text.startsWith('TRONC COMMUN') ||
    text.startsWith('1ÈRES BAC') ||
    text.startsWith('2ÈME BAC')
  )) return false;

  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return style.position === 'absolute' && rect.width > 500 && rect.height >= 35 && rect.height <= 60;
};

const moveHomeworkHeaders = () => {
  document.querySelectorAll('div').forEach((element) => {
    if (!isHomeworkHeader(element)) return;

    element.style.setProperty('top', '100px', 'important');
    element.style.setProperty('transform', 'none', 'important');
    element.dataset.homeworkHeaderMoved = 'true';
  });
};

let frame = 0;
const scheduleHomeworkHeaderMove = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(moveHomeworkHeaders);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleHomeworkHeaderMove, { once: true });
} else {
  scheduleHomeworkHeaderMove();
}

window.addEventListener('load', scheduleHomeworkHeaderMove);
document.addEventListener('click', scheduleHomeworkHeaderMove, true);
document.addEventListener('input', scheduleHomeworkHeaderMove, true);

new MutationObserver(scheduleHomeworkHeaderMove).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
