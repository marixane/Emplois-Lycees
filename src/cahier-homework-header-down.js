const moveHomeworkHeaders = () => {
  document.querySelectorAll('.homework-page').forEach((page) => {
    const header = page.firstElementChild;
    if (!(header instanceof HTMLElement)) return;

    header.style.removeProperty('transform');
    header.style.setProperty('position', 'absolute', 'important');
    header.style.setProperty('top', '100px', 'important');
  });
};

let frame = 0;
const scheduleHomeworkHeaderMove = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    moveHomeworkHeaders();
    setTimeout(moveHomeworkHeaders, 100);
    setTimeout(moveHomeworkHeaders, 300);
    setTimeout(moveHomeworkHeaders, 700);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleHomeworkHeaderMove, { once: true });
} else {
  scheduleHomeworkHeaderMove();
}

new MutationObserver(scheduleHomeworkHeaderMove).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
