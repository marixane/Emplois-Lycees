const resizeClassLabels = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;

  document.querySelectorAll('.homework-subject > div').forEach((line) => {
    const label = line.querySelector('span:nth-child(2)');
    if (!label) return;

    const count = line.parentElement?.children?.length || 1;
    const startSize = count >= 4 ? 18 : count === 3 ? 22 : 26;
    const minSize = 4;

    label.style.removeProperty('width');
    label.style.removeProperty('max-width');
    label.style.setProperty('min-width', '0', 'important');
    label.style.setProperty('font-weight', '900', 'important');
    label.style.setProperty('transform', 'none', 'important');
    label.style.setProperty('overflow', 'hidden', 'important');
    label.style.setProperty('contain', 'paint', 'important');
    label.style.setProperty('clip-path', 'inset(0)', 'important');
    label.style.setProperty('text-overflow', 'clip', 'important');
    label.style.setProperty('white-space', 'nowrap', 'important');

    const styles = getComputedStyle(label);
    const padding = parseFloat(styles.paddingLeft || 0) + parseFloat(styles.paddingRight || 0);
    const availableWidth = Math.max(label.clientWidth - padding - 6, 0);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    let size = startSize;
    label.style.setProperty('font-size', `${size}px`, 'important');

    if (context && availableWidth > 0) {
      const family = styles.fontFamily || 'sans-serif';
      const weight = styles.fontWeight || '900';
      const text = label.textContent || '';

      context.font = `${weight} ${size}px ${family}`;
      while (size > minSize && context.measureText(text).width > availableWidth) {
        size = Math.max(minSize, size - 2);
        context.font = `${weight} ${size}px ${family}`;
      }

      label.style.setProperty('font-size', `${size}px`, 'important');
    }
  });

  document.querySelectorAll('.cahier-page').forEach((page) => {
    Array.from(page.querySelectorAll('div')).forEach((container) => {
      const groups = Array.from(container.children);
      if (groups.length !== 3) return;

      const titles = groups.map((group) => String(group.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase());
      const isTargetGroups = titles[0].startsWith('TRONC COMMUN')
        && titles[1].startsWith('1ÈRES BAC')
        && titles[2].startsWith('2ÈME BAC');
      if (!isTargetGroups) return;

      groups.forEach((group) => {
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

let classLabelFrame = 0;
const scheduleClassLabelResize = () => {
  cancelAnimationFrame(classLabelFrame);
  classLabelFrame = requestAnimationFrame(() => {
    resizeClassLabels();
    setTimeout(resizeClassLabels, 100);
    setTimeout(resizeClassLabels, 220);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleClassLabelResize, { once: true });
} else {
  scheduleClassLabelResize();
}

document.addEventListener('input', scheduleClassLabelResize, true);
document.addEventListener('focusout', scheduleClassLabelResize, true);
document.addEventListener('drop', scheduleClassLabelResize, true);
document.addEventListener('click', scheduleClassLabelResize, true);
new MutationObserver(scheduleClassLabelResize).observe(document.documentElement, { childList: true, subtree: true, characterData: true });