const PDF_BUTTON_ID = 'cahier-pdf-button-stable';
const PDF_PREVIEW_BUTTON_ID = 'cahier-pdf-preview-stable';
const A4_WIDTH = '210mm';
const A4_HEIGHT = '297mm';
const EXIT_TEXT = 'Signature du Procès-verbal de sortie';
const EXIT_DATE = 'SAMEDI 10/07/2027';

const EXPORT_CSS = `
  @page { size: ${A4_WIDTH} ${A4_HEIGHT}; margin: 0; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }
  html, body { margin: 0 !important; padding: 0 !important; background: white !important; overflow: visible !important; }
  .cahier-preview-zone { display: block !important; width: ${A4_WIDTH} !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; transform: none !important; zoom: 1 !important; }
  .a4-page, .cahier-page {
    display: block !important;
    position: relative !important;
    width: ${A4_WIDTH} !important;
    min-width: ${A4_WIDTH} !important;
    max-width: ${A4_WIDTH} !important;
    height: ${A4_HEIGHT} !important;
    min-height: ${A4_HEIGHT} !important;
    max-height: ${A4_HEIGHT} !important;
    margin: 0 !important;
    transform: none !important;
    scale: 1 !important;
    zoom: 1 !important;
    overflow: hidden !important;
    box-shadow: none !important;
    break-after: page !important;
    page-break-after: always !important;
  }
  .a4-page:last-child, .cahier-page:last-child { break-after: auto !important; page-break-after: auto !important; }
  #${PDF_BUTTON_ID}, #${PDF_PREVIEW_BUTTON_ID}, .app-tabs, .no-print, button { display: none !important; }
  .homework-date { font-size: 28px !important; border-bottom: 2px dotted rgba(63,64,80,.5) !important; padding-bottom: 8px !important; }
  .homework-subject > div { grid-template-columns: 52px 1fr 34px !important; }
  .cahier-session-duration { display: inline-block !important; visibility: visible !important; opacity: 1 !important; color: rgba(55,65,81,.9) !important; font-size: 10px !important; font-weight: 900 !important; text-align: right !important; white-space: nowrap !important; }
`;

const clean = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
const durationText = (span) => `${Math.max(Number(span) || 1, 1)}h`;

const addSchoolYear = (text) => String(text || '').replace(/\b(\d{2})\/(\d{2})(?!\/\d{4})\b/g, (_, day, month) => {
  const year = Number(month) >= 9 ? 2026 : 2027;
  return `${day}/${month}/${year}`;
});

const applyFullYearsForPdf = (zone) => {
  zone.querySelectorAll('.homework-date').forEach((element) => {
    element.textContent = addSchoolYear(element.textContent);
  });

  zone.querySelectorAll('.cahier-exams-list tbody tr').forEach((row) => {
    Array.from(row.cells).slice(0, 2).forEach((cell) => {
      cell.textContent = addSchoolYear(cell.textContent);
    });
  });
};

const getCss = () => Array.from(document.styleSheets).map((sheet) => {
  try { return Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n'); }
  catch { return ''; }
}).filter(Boolean).join('\n');

const getTimetableDurationsForPdf = () => {
  const map = new Map();
  const rows = Array.from(document.querySelectorAll('.timetable-table tbody tr'));

  rows.forEach((row) => {
    const day = clean(row.querySelector('.day-cell textarea')?.value || row.querySelector('.day-cell')?.textContent);
    let hourIndex = 0;

    Array.from(row.children).slice(1).forEach((cell) => {
      const text = clean(cell.querySelector('textarea')?.value || cell.textContent);
      const span = Number(cell.colSpan) || 1;
      if (!text) {
        hourIndex += span;
        return;
      }

      const header = document.querySelector(`.timetable-table thead th:nth-child(${hourIndex + 2}) textarea`);
      const hour = clean((header?.value || header?.textContent || '').split('-')[0]);
      map.set(`${day}|${hour}|${text}`, durationText(span));
      hourIndex += span;
    });
  });

  return map;
};

const getEntryDayForPdf = (entry) => clean((entry.querySelector('.homework-date')?.textContent || '').split(' ')[0]);

const applySessionDurationsForPdf = (zone) => {
  const durations = getTimetableDurationsForPdf();

  zone.querySelectorAll('.homework-entry:not(.cahier-extra-holiday-entry):not(.cahier-exam-entry)').forEach((entry) => {
    const day = getEntryDayForPdf(entry);

    entry.querySelectorAll('.homework-subject > div').forEach((line) => {
      const spans = line.querySelectorAll('span');
      const hour = clean(spans[0]?.textContent);
      const className = clean(spans[1]?.textContent);
      if (!hour || !className) return;

      let durationNode = line.querySelector('.cahier-session-duration');
      if (!durationNode) {
        durationNode = document.createElement('span');
        durationNode.className = 'cahier-session-duration';
        line.append(durationNode);
      }
      durationNode.textContent = durations.get(`${day}|${hour}|${className}`) || '1h';
    });
  });
};

const firstDateInfo = (text) => {
  const match = String(text || '').match(/(\d{2})\/(\d{2})/);
  return match ? { day: Number(match[1]), month: Number(match[2]) } : null;
};

const isAfterJuly10 = (text) => {
  const date = firstDateInfo(text);
  return date?.month === 7 && date.day > 10;
};

const prepareClone = (clone) => {
  clone.querySelectorAll(`#${PDF_BUTTON_ID}, #${PDF_PREVIEW_BUTTON_ID}, script, style, link`).forEach((node) => node.remove());
  clone.querySelectorAll('textarea').forEach((textarea) => {
    textarea.textContent = textarea.value;
    textarea.setAttribute('value', textarea.value);
  });
  clone.querySelectorAll('input').forEach((input) => input.setAttribute('value', input.value));
  clone.style.setProperty('width', A4_WIDTH, 'important');
  clone.style.setProperty('height', A4_HEIGHT, 'important');
  clone.style.setProperty('margin', '0', 'important');
  clone.style.setProperty('transform', 'none', 'important');
  clone.style.setProperty('zoom', '1', 'important');
  clone.style.setProperty('overflow', 'hidden', 'important');
};

const removeAfterJuly10 = (zone) => {
  zone.querySelectorAll('.homework-entry').forEach((entry) => {
    const dateText = entry.querySelector('.homework-date')?.textContent || entry.textContent;
    if (isAfterJuly10(dateText)) entry.remove();
  });

  zone.querySelectorAll('.homework-page').forEach((page) => {
    if (!page.querySelector('.homework-entry')) page.remove();
  });
};

const getGroupKey = (page) => {
  const color = page.style.getPropertyValue('--group-color').trim();
  const title = page.firstElementChild?.textContent?.trim() || '';
  return color || title;
};

const makeExitPage = (sourcePage) => {
  const color = sourcePage?.style?.getPropertyValue('--group-color')?.trim() || '#fef3c7';
  const page = document.createElement('div');
  page.className = 'a4-page cahier-page homework-page cahier-pdf-exit-page';
  page.style.cssText = `position:relative;padding-top:60px;--group-color:${color};`;

  const header = sourcePage?.firstElementChild?.cloneNode(true) || document.createElement('div');
  if (!header.textContent?.trim()) header.textContent = 'Lycée';
  page.append(header);

  const section = document.createElement('section');
  section.className = 'homework-entry cahier-extra-holiday-entry';
  section.dataset.sort = '20270710';
  section.style.setProperty('--homework-color', '#38bdf8');
  section.innerHTML = '<div class="homework-date">' + EXIT_DATE + '</div><div class="homework-content"><div class="homework-subject"><div><span>Lycée</span></div></div><div class="homework-text" style="color:#1e3a8a;font-size:21px;font-weight:900;text-align:center;background:linear-gradient(90deg,rgba(191,219,254,.45),rgba(219,234,254,.82));border:1px solid rgba(37,99,235,.28);border-radius:12px;margin:8px 18px;padding:10px 16px">' + EXIT_TEXT + '</div></div>';
  page.append(section);
  return page;
};

const appendExitPageForEachGroup = (zone) => {
  const groups = [];
  Array.from(zone.querySelectorAll('.homework-page:not(.cahier-pdf-exit-page)')).forEach((page) => {
    const key = getGroupKey(page);
    if (!key) return;
    let group = groups.find((item) => item.key === key);
    if (!group) {
      group = { key, pages: [] };
      groups.push(group);
    }
    group.pages.push(page);
  });

  groups.forEach((group) => {
    if (group.pages.some((page) => String(page.textContent || '').includes(EXIT_TEXT))) return;
    const lastPage = group.pages[group.pages.length - 1];
    if (lastPage) lastPage.after(makeExitPage(lastPage));
  });
};

const ensurePdfIncludesJuly10 = (zone) => {
  const text = String(zone.textContent || '');
  if (text.includes(EXIT_DATE) && text.includes(EXIT_TEXT)) return;

  const lastHomeworkPage = Array.from(zone.querySelectorAll('.homework-page')).pop();
  zone.append(makeExitPage(lastHomeworkPage));
};

const buildExportHtml = () => {
  const pages = Array.from(document.querySelectorAll('.cahier-preview-zone .a4-page, .cahier-preview-zone .cahier-page')).filter((page) => {
    const rect = page.getBoundingClientRect();
    const style = window.getComputedStyle(page);
    return rect.width > 50 && rect.height > 50 && style.display !== 'none' && style.visibility !== 'hidden';
  });

  if (!pages.length) throw new Error('Aucune page A4 trouvée');

  const zone = document.createElement('div');
  zone.className = 'cahier-preview-zone';
  zone.style.setProperty('width', A4_WIDTH, 'important');
  zone.style.setProperty('display', 'block', 'important');
  zone.style.setProperty('margin', '0', 'important');
  zone.style.setProperty('padding', '0', 'important');

  pages.forEach((page) => {
    const clone = page.cloneNode(true);
    prepareClone(clone);
    zone.append(clone);
  });

  applySessionDurationsForPdf(zone);
  removeAfterJuly10(zone);
  appendExitPageForEachGroup(zone);
  ensurePdfIncludesJuly10(zone);
  applyFullYearsForPdf(zone);

  return `<style>${getCss()}\n${EXPORT_CSS}</style>${zone.outerHTML}`;
};

const downloadBlob = (blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Cahier-de-texte-2026-2027.pdf';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const previewHtml = (html, previewWindow) => {
  const previewPage = `<!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <base href="${window.location.origin}/">
        <title>Aperçu PDF — Cahier de texte</title>
        <style>
          html,body{margin:0;background:#475569;font-family:Arial,sans-serif}
          body{padding:64px 20px 28px}
          .pdf-toolbar{position:fixed;inset:0 0 auto 0;z-index:999999;height:48px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:#0f172a;color:#fff;font-weight:900;box-shadow:0 3px 12px rgba(0,0,0,.35)}
          .pdf-toolbar a{padding:8px 14px;border-radius:9px;background:#16a34a;color:#fff;font-weight:900;text-decoration:none;cursor:pointer;box-shadow:0 3px 0 #14532d}
          .cahier-preview-zone{margin:0 auto!important}
          .a4-page,.cahier-page{margin:0 auto 24px!important;box-shadow:0 8px 28px rgba(0,0,0,.32)!important}
          @media print{body{padding:0;background:#fff}.pdf-toolbar{display:none!important}.a4-page,.cahier-page{margin:0!important;box-shadow:none!important}}
        </style>
      </head>
      <body>
        <div class="pdf-toolbar"><span>Aperçu PDF du cahier de texte</span><a href="#" onclick="window.print();return false">Imprimer / Enregistrer en PDF</a></div>
        ${html}
      </body>
    </html>`;
  const previewDocument = previewWindow.document;
  previewDocument.open('text/html', 'replace');
  previewDocument.write(previewPage);
  previewDocument.close();
  previewWindow.focus();
};

const exportPdf = async (button, mode = 'download') => {
  const original = button.textContent;
  const previewWindow = mode === 'preview' ? window.open('about:blank', '_blank') : null;
  if (mode === 'preview' && !previewWindow) {
    alert('Autorisez les fenêtres surgissantes pour voir le PDF.');
    return;
  }
  if (previewWindow) {
    previewWindow.document.title = 'Génération de l’aperçu PDF…';
    previewWindow.document.body.innerHTML = '<p style="font:700 18px Arial,sans-serif;padding:32px;color:#0f172a">Génération du PDF en cours…</p>';
    previewWindow.focus();
  }
  button.disabled = true;
  button.textContent = 'Préparation PDF...';

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const html = buildExportHtml();

    if (mode === 'preview') {
      button.textContent = 'Ouverture PDF...';
      previewHtml(html, previewWindow);
      button.textContent = 'PDF ouvert';
      window.setTimeout(() => { button.textContent = original; }, 900);
      return;
    }

    button.textContent = 'Génération PDF...';

    const response = await fetch('/api/cahier-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, baseUrl: window.location.origin })
    });

    if (!response.ok) {
      let message = 'Erreur génération PDF';
      try { message = (await response.json()).error || message; } catch { /* ignore */ }
      throw new Error(message);
    }

    const blob = await response.blob();
    button.textContent = 'Téléchargement...';
    downloadBlob(blob);
    button.textContent = 'PDF téléchargé';
    window.setTimeout(() => { button.textContent = original; }, 900);
  } catch (error) {
    if (previewWindow && !previewWindow.closed) previewWindow.close();
    alert(`Erreur PDF : ${error?.message || 'export impossible'}`);
    button.textContent = original;
  } finally {
    button.disabled = false;
  }
};

const styleButton = (button, side) => {
  button.hidden = false;
  const horizontalPosition = side === 'left' ? 'left:8px!important;right:auto!important;' : 'right:8px!important;left:auto!important;';
  button.style.cssText = `position:fixed!important;${horizontalPosition}bottom:18px!important;z-index:2147483647!important;display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;box-sizing:border-box!important;border:1px solid #15803d!important;border-bottom:3px solid #14532d!important;border-radius:12px!important;padding:9px 15px!important;width:417px!important;height:62px!important;max-width:calc(50vw - 12px)!important;min-width:0!important;background:linear-gradient(180deg,#4ade80 0%,#16a34a 52%,#15803d 100%)!important;color:white!important;font:900 13px Arial,sans-serif!important;text-shadow:0 1px 1px rgba(0,0,0,.38)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 5px 0 #14532d,0 9px 16px rgba(0,0,0,.3)!important;transform:translateY(-2px)!important;cursor:pointer!important;transition:transform .12s ease,box-shadow .12s ease!important;`;
};

const createButtons = () => {
  if (!document.getElementById(PDF_BUTTON_ID)) {
    const downloadButton = document.createElement('button');
    downloadButton.id = PDF_BUTTON_ID;
    downloadButton.type = 'button';
    downloadButton.textContent = 'Télécharger PDF';
    downloadButton.title = 'Télécharger toutes les pages A4 en PDF';
    styleButton(downloadButton, 'right');
    downloadButton.addEventListener('click', () => exportPdf(downloadButton, 'download'));
    document.body.append(downloadButton);
  }

  if (!document.getElementById(PDF_PREVIEW_BUTTON_ID)) {
    const previewButton = document.createElement('button');
    previewButton.id = PDF_PREVIEW_BUTTON_ID;
    previewButton.type = 'button';
    previewButton.textContent = 'Voir PDF';
    previewButton.title = 'Générer et ouvrir toutes les pages A4 dans un nouvel onglet';
    styleButton(previewButton, 'left');
    previewButton.addEventListener('click', () => exportPdf(previewButton, 'preview'));
    document.body.append(previewButton);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createButtons, { once: true });
} else {
  createButtons();
}
