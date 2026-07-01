import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

let pdfBusy = false;

function isPdfButton(target) {
  const button = target && target.closest && target.closest('button');
  if (!button || button.disabled) return null;
  const text = String(button.textContent || '').trim().toLowerCase();
  if (text.includes('voir pdf')) return { button, mode: 'preview' };
  if (text.includes('exporter pdf')) return { button, mode: 'download' };
  return null;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function lockOriginalA4ForPdf() {
  if (window.enableOriginalPdfSizeNow) window.enableOriginalPdfSizeNow();
  document.body.classList.add('pdf-original-size-now');
  document.documentElement.style.setProperty('--sheet-scale', '1');
  document.documentElement.style.setProperty('--sheet-columns', '1');

  document.querySelectorAll('.a4-page, .exam-page').forEach((page) => {
    page.classList.add('is-exporting');
    page.style.setProperty('width', '794px', 'important');
    page.style.setProperty('height', '1123px', 'important');
    page.style.setProperty('min-width', '794px', 'important');
    page.style.setProperty('min-height', '1123px', 'important');
    page.style.setProperty('max-width', '794px', 'important');
    page.style.setProperty('max-height', '1123px', 'important');
    page.style.setProperty('transform', 'none', 'important');
    page.style.setProperty('scale', '1', 'important');
    page.style.setProperty('translate', '0 0', 'important');
    page.style.setProperty('margin', '0', 'important');
  });

  const linesToggle = document.querySelector('.pdf-lines-toggle');
  const hideLines = linesToggle && String(linesToggle.textContent || '').toLowerCase().includes('masquées');
  document.querySelectorAll('.a4-page, .exam-page').forEach((page) => {
    page.classList.toggle('no-pdf-lines', !!hideLines);
  });
}

function unlockOriginalA4ForPdf() {
  document.body.classList.remove('pdf-original-size-now');
  document.querySelectorAll('.a4-page, .exam-page').forEach((page) => {
    page.classList.remove('is-exporting');
    page.classList.remove('no-pdf-lines');
    page.style.removeProperty('width');
    page.style.removeProperty('height');
    page.style.removeProperty('min-width');
    page.style.removeProperty('min-height');
    page.style.removeProperty('max-width');
    page.style.removeProperty('max-height');
    page.style.removeProperty('transform');
    page.style.removeProperty('scale');
    page.style.removeProperty('translate');
    page.style.removeProperty('margin');
  });
  if (window.syncTwoPageView) window.syncTwoPageView();
}

async function makeOriginalA4Pdf() {
  lockOriginalA4ForPdf();
  await wait(260);

  const pages = Array.from(document.querySelectorAll('.preview-zone .a4-page'));
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let index = 0; index < pages.length; index += 1) {
    const node = pages[index];
    node.querySelectorAll('textarea').forEach((field) => field.blur());
    const canvas = await html2canvas(node, {
      scale: 2,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#fff',
      ignoreElements: (el) => el.classList?.contains('photo-overlay-tools') || el.classList?.contains('mask-delete-button') || el.classList?.contains('mask-resize-handle') || el.classList?.contains('bar-buttons')
    });

    if (index) pdf.addPage('a4', 'portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', 0, 0, 210, 297);
  }

  return pdf;
}

async function runDirectPdf(button, mode, previewWindow) {
  if (pdfBusy) return;
  pdfBusy = true;
  const previousText = button.textContent;
  button.textContent = mode === 'preview' ? 'Préparation...' : 'Export en cours...';
  button.disabled = true;

  try {
    const pdf = await makeOriginalA4Pdf();
    if (mode === 'preview') {
      const url = pdf.output('bloburl');
      if (previewWindow) previewWindow.location.href = url;
      else window.open(url, '_blank');
    } else {
      pdf.save('devoir-a4.pdf');
    }
  } finally {
    unlockOriginalA4ForPdf();
    button.disabled = false;
    button.textContent = previousText;
    pdfBusy = false;
  }
}

document.addEventListener('click', (event) => {
  const action = isPdfButton(event.target);
  if (!action) return;

  event.preventDefault();
  event.stopPropagation();
  if (event.stopImmediatePropagation) event.stopImmediatePropagation();

  const previewWindow = action.mode === 'preview' ? window.open('', '_blank') : null;
  runDirectPdf(action.button, action.mode, previewWindow);
}, true);
