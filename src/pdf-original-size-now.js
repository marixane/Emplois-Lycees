function enableOriginalPdfSizeNow() {
  document.body.classList.add('pdf-original-size-now');
  document.documentElement.style.setProperty('--pdf-sheet-scale-before-export', document.documentElement.style.getPropertyValue('--sheet-scale') || '1');
  document.documentElement.style.setProperty('--sheet-scale', '1');

  clearTimeout(window.__pdfOriginalSizeTimer);
  window.__pdfOriginalSizeTimer = setTimeout(function () {
    document.body.classList.remove('pdf-original-size-now');
    if (window.syncTwoPageView) window.syncTwoPageView();
  }, 12000);
}

function isPdfAction(target) {
  const button = target && target.closest && target.closest('button');
  if (!button) return false;
  const text = String(button.textContent || '').trim().toLowerCase();
  return text.includes('voir pdf') || text.includes('exporter pdf') || text.includes('préparation') || text.includes('export en cours');
}

document.addEventListener('pointerdown', function (event) {
  if (isPdfAction(event.target)) enableOriginalPdfSizeNow();
}, true);

document.addEventListener('mousedown', function (event) {
  if (isPdfAction(event.target)) enableOriginalPdfSizeNow();
}, true);

document.addEventListener('click', function (event) {
  if (isPdfAction(event.target)) enableOriginalPdfSizeNow();
}, true);

window.enableOriginalPdfSizeNow = enableOriginalPdfSizeNow;
