const PDF_BUTTON_ID = 'cahier-pdf-export-button';

const ensureCahierPdfButton = () => {
  let button = document.getElementById(PDF_BUTTON_ID);
  if (!button) {
    button = document.createElement('button');
    button.id = PDF_BUTTON_ID;
    button.type = 'button';
    button.className = 'cahier-pdf-export-button';
    button.textContent = 'Télécharger PDF';
    button.title = 'Télécharger les pages A4 en PDF';
    button.setAttribute('aria-label', 'Télécharger les pages A4 en PDF');
    button.addEventListener('click', () => {
      document.body.classList.add('cahier-print-exporting');
      const previousTitle = document.title;
      document.title = 'Cahier-de-texte-2026-2027';
      window.setTimeout(() => {
        window.print();
        window.setTimeout(() => {
          document.body.classList.remove('cahier-print-exporting');
          document.title = previousTitle;
        }, 500);
      }, 80);
    });
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

window.addEventListener('beforeprint', () => document.body.classList.add('cahier-print-exporting'));
window.addEventListener('afterprint', () => document.body.classList.remove('cahier-print-exporting'));
