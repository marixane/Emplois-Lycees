const applyGroupClassTextSize = () => {
  document.querySelectorAll('.cahier-page').forEach((page) => {
    const containers = Array.from(page.querySelectorAll('div')).filter((element) => {
      const children = Array.from(element.children);
      if (children.length !== 3) return false;
      const titles = children.map((child) => String(child.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase());
      return titles[0].startsWith('TRONC COMMUN')
        && titles[1].startsWith('1ÈRES BAC')
        && titles[2].startsWith('2ÈME BAC');
    });

    containers.forEach((container) => {
      Array.from(container.children).forEach((group) => {
        const classesArea = group.children[1];
        if (!classesArea) return;
        Array.from(classesArea.children).forEach((chip) => {
          chip.style.setProperty('font-size', '20px', 'important');
          chip.style.setProperty('line-height', '1.15', 'important');
          chip.style.setProperty('min-height', '36px', 'important');
        });
      });
    });
  });
};

let frame = 0;
const scheduleGroupClassTextSize = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    applyGroupClassTextSize();
    setTimeout(applyGroupClassTextSize, 100);
    setTimeout(applyGroupClassTextSize, 300);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleGroupClassTextSize, { once: true });
} else {
  scheduleGroupClassTextSize();
}

new MutationObserver(scheduleGroupClassTextSize).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

document.addEventListener('input', scheduleGroupClassTextSize, true);
document.addEventListener('drop', scheduleGroupClassTextSize, true);
document.addEventListener('click', scheduleGroupClassTextSize, true);
