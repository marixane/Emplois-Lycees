import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PDF_BUTTON_ID = 'cahier-pdf-export-button';
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_BATCH_DELAY = 90;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

const waitForFonts = async () => {
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
};

const getCahierPages = () => Array.from(document.querySelectorAll('.cahier-preview-zone .a4-page, .cahier-preview-zone .cahier-page'))
  .filter((page, index, pages) => page.offsetParent !== null && pages.indexOf(page) === index);

const setButtonStatus = (button, text) => {
  button.textContent = text;
  button.setAttribute('aria-label', text);
};

const preparePageForCanvas = (page) => {
  const rect = page.getBoundingClientRect();
  return {
    width: Math.ceil(rect.width || page.offsetWidth || 794),
    height: Math.ceil(rect.height || page.offsetHeight || 1123)
  };
};

const capturePage = async (page, index) => {
  page.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
  await nextFrame();
  await wait(PAGE_BATCH_DELAY);

  const { width, height } = preparePageForCanvas(page);
  return html2canvas(page, {
    backgroundColor: '#ffffff',
    scale: 1.55,
    useCORS: true,
    allowTaint: false,
    logging: false,
    imageTimeout: 30000,
    removeContainer: true,
    foreignObjectRendering: false,
    width,
    height,
    windowWidth: Math.max(document.documentElement.scrollWidth, width),
    windowHeight: Math.max(document.documentElement.scrollHeight, height),
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    onclone: (clonedDoc) => {
      clonedDoc.body.classList.add('cahier-pdf-clone');
      const clonedButton = clonedDoc.getElementById(PDF_BUTTON_ID);
      if (clonedButton) clonedButton.remove();
      clonedDoc.querySelectorAll('textarea').forEach((textarea) => {
        textarea.textContent = textarea.value;
        textarea.setAttribute('value', textarea.value);
      });
      clonedDoc.querySelectorAll('input').forEach((input) => input.setAttribute('value', input.value));
      clonedDoc.querySelectorAll('.a4-page, .cahier-page').forEach((node) => {
        node.style.webkitPrintColorAdjust = 'exact';
        node.style.printColorAdjust = 'exact';
      });
      const clonedPages = Array.from(clonedDoc.querySelectorAll('.cahier-preview-zone .a4-page, .cahier-preview-zone .cahier-page'));
      clonedPages.forEach((node, nodeIndex) => {
        if (nodeIndex !== index) node.style.visibility = 'hidden';
      });
    }
  });
};

const downloadCahierPdf = async (button) => {
  const pages = getCahierPages();
  if (!pages.length) return;

  const originalText = button.textContent;
  const originalScrollX = window.scrollX;
  const originalScrollY = window.scrollY;

  button.disabled = true;
  document.body.classList.add('cahier-pdf-exporting');

  try {
    setButtonStatus(button, 'Préparation 0%');
    await waitForFonts();
    await nextFrame();
    await wait(250);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      hotfixes: ['px_scaling']
    });

    for (let index = 0; index < pages.length; index += 1) {
      const percent = Math.round((index / pages.length) * 100);
      setButtonStatus(button, `Préparation ${percent}%`);
      const canvas = await capturePage(pages[index], index);
      const image = canvas.toDataURL('image/png');
      if (index > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(image, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
      canvas.width = 1;
      canvas.height = 1;
      await wait(80);
    }

    setButtonStatus(button, 'Téléchargement...');
    await wait(180);
    pdf.save('Cahier-de-texte-2026-2027.pdf');
    setButtonStatus(button, 'PDF téléchargé');
    await wait(700);
  } catch (error) {
    console.error('Erreur export PDF cahier:', error);
    alert('Erreur pendant la préparation du PDF. Réessaie avec moins de pages affichées ou après rechargement.');
  } finally {
    window.scrollTo(originalScrollX, originalScrollY);
    document.body.classList.remove('cahier-pdf-exporting');
    button.disabled = false;
    button.textContent = originalText;
    button.setAttribute('aria-label', 'Télécharger directement les pages A4 en PDF couleur');
  }
};

const ensureCahierPdfButton = () => {
  let button = document.getElementById(PDF_BUTTON_ID);
  if (!button) {
    button = document.createElement('button');
    button.id = PDF_BUTTON_ID;
    button.type = 'button';
    button.className = 'cahier-pdf-export-button';
    button.textContent = 'Télécharger PDF';
    button.title = 'Préparer puis télécharger les pages A4 en PDF couleur';
    button.setAttribute('aria-label', 'Télécharger directement les pages A4 en PDF couleur');
    button.addEventListener('click', () => downloadCahierPdf(button));
    document.body.append(button);
  }
  button.hidden = !document.body.classList.contains('cahier-tab-active');
};

const scheduleCahierPdfButton = () => window.requestAnimationFrame(ensureCahierPdfButton);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCahierPdfButton, { once: true });
} else {
  scheduleCahierPdfButton();
}

new MutationObserver(scheduleCahierPdfButton).observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
  childList: true,
  subtree: false
});
