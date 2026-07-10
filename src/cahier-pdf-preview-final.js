const PREVIEW_BUTTON_ID = 'cahier-pdf-preview-stable';
const DOWNLOAD_BUTTON_ID = 'cahier-pdf-button-stable';

const writeLoadingPage = (previewWindow) => {
  previewWindow.document.open();
  previewWindow.document.write(`<!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Préparation du PDF…</title>
      </head>
      <body style="margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
        <div style="text-align:center;padding:32px">
          <h2 style="margin:0 0 12px">Préparation du PDF…</h2>
          <p style="margin:0">Veuillez patienter pendant la génération complète.</p>
        </div>
      </body>
    </html>`);
  previewWindow.document.close();
};

const replacePreviewBehavior = () => {
  const previewButton = document.getElementById(PREVIEW_BUTTON_ID);
  const downloadButton = document.getElementById(DOWNLOAD_BUTTON_ID);

  if (!previewButton || !downloadButton || previewButton.dataset.pdfPreviewFixed === 'exact-blob') return;

  const replacement = previewButton.cloneNode(true);
  replacement.dataset.pdfPreviewFixed = 'exact-blob';
  previewButton.replaceWith(replacement);

  replacement.addEventListener('click', () => {
    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) {
      alert('Autorisez les fenêtres surgissantes pour voir le PDF.');
      return;
    }

    writeLoadingPage(previewWindow);

    const originalText = replacement.textContent;
    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);

    let completed = false;
    let restored = false;
    let pdfUrl = '';

    replacement.disabled = true;
    replacement.textContent = 'Préparation PDF...';

    const stopPdfDownload = (event) => {
      const link = event.target?.closest?.('a[download]');
      if (!link) return;

      const filename = String(link.download || '').toLowerCase();
      if (!filename.endsWith('.pdf')) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const restoreHooks = () => {
      if (restored) return;
      restored = true;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      document.removeEventListener('click', stopPdfDownload, true);
      replacement.disabled = false;
      window.setTimeout(() => {
        replacement.textContent = originalText;
      }, 900);
    };

    const fail = (error) => {
      restoreHooks();
      if (!previewWindow.closed) previewWindow.close();
      alert(`Erreur PDF : ${error?.message || 'aperçu impossible'}`);
    };

    document.addEventListener('click', stopPdfDownload, true);

    URL.createObjectURL = (blob) => {
      const url = originalCreateObjectURL(blob);

      if (!completed && blob instanceof Blob && String(blob.type || '').toLowerCase().includes('pdf')) {
        completed = true;
        pdfUrl = url;
        replacement.textContent = 'Ouverture PDF...';
        previewWindow.location.replace(pdfUrl);
        replacement.textContent = 'PDF ouvert';

        window.setTimeout(() => {
          restoreHooks();
        }, 3000);

        window.setTimeout(() => {
          if (pdfUrl) originalRevokeObjectURL(pdfUrl);
        }, 60 * 60 * 1000);
      }

      return url;
    };

    URL.revokeObjectURL = (url) => {
      if (url === pdfUrl) return;
      originalRevokeObjectURL(url);
    };

    downloadButton.click();

    window.setTimeout(() => {
      if (completed) return;
      fail(new Error('Le PDF n’a pas été généré dans le délai prévu.'));
    }, 120000);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', replacePreviewBehavior, { once: true });
} else {
  replacePreviewBehavior();
}

window.setTimeout(replacePreviewBehavior, 500);
