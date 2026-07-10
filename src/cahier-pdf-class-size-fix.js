const PDF_BUTTON_ID = 'cahier-pdf-button-stable';
const PDF_PREVIEW_BUTTON_ID = 'cahier-pdf-preview-stable';

const preparePdfClassSizes = () => {
  const labels = Array.from(document.querySelectorAll('.cahier-preview-zone .homework-subject > div > span:nth-child(2)'));
  const previousStyles = labels.map((label) => label.getAttribute('style'));

  labels.forEach((label) => {
    label.style.setProperty('font-size', '12px', 'important');
    label.style.setProperty('transform', 'none', 'important');
    label.style.setProperty('transform-origin', 'left center', 'important');
    label.style.setProperty('overflow', 'hidden', 'important');
    label.style.setProperty('white-space', 'nowrap', 'important');
    label.style.setProperty('text-overflow', 'clip', 'important');
  });

  window.setTimeout(() => {
    labels.forEach((label, index) => {
      const previous = previousStyles[index];
      if (previous === null) label.removeAttribute('style');
      else label.setAttribute('style', previous);
    });
  }, 10000);
};

const protectCahierPreviewButton = () => {
  const button = document.getElementById(PDF_PREVIEW_BUTTON_ID);
  if (!button) return;

  // pdf-original-size-now.js intercepte globalement tout bouton intitulé « Voir PDF ».
  // Un libellé distinct laisse ce clic au générateur PDF propre au cahier.
  if (button.textContent?.trim() === 'Voir PDF') button.textContent = 'Aperçu PDF';
  button.title = 'Générer et afficher le PDF complet du cahier de texte';
};

document.addEventListener('click', (event) => {
  if (event.target?.closest?.(`#${PDF_BUTTON_ID}`)) preparePdfClassSizes();
}, true);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', protectCahierPreviewButton, { once: true });
} else {
  protectCahierPreviewButton();
}

window.setTimeout(protectCahierPreviewButton, 100);
window.setTimeout(protectCahierPreviewButton, 500);
window.setTimeout(protectCahierPreviewButton, 1500);
