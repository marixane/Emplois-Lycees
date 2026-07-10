const moveHomeworkHeaders = () => {
  document.querySelectorAll('.homework-page').forEach((page) => {
    const header = Array.from(page.children).find((element) => {
      if (!(element instanceof HTMLElement)) return false;
      const text = String(element.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
      const hasProgress = element.querySelector('[style*="border-radius: 999px"]');
      return hasProgress && (text.startsWith('TRONC COMMUN') || text.startsWith('1ÈRES BAC') || text.startsWith('2ÈME BAC'));
    });

    if (!header) return;
    header.style.setProperty('top', '20px', 'important');
  });
};

let frame = 0;
const scheduleHomeworkHeaderMove = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    moveHomeworkHeaders();
    setTimeout(moveHomeworkHeaders, 100);
    setTimeout(moveHomeworkHeaders, 300);
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
