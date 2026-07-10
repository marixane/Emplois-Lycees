const EXAMS_PAGE_ID = 'cahier-exams-groups-page';
const TEMP_PAGE_ID = 'cahier-exams-groups-page-pdf-last';

const reorderPdfHtml = (html) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(html || ''), 'text/html');
    const zone = doc.querySelector('.cahier-preview-zone');
    if (!zone) return html;

    const pages = Array.from(zone.querySelectorAll(`#${EXAMS_PAGE_ID}, #${TEMP_PAGE_ID}, .cahier-exams-groups-page`));
    if (!pages.length) return html;

    const source = pages[pages.length - 1];
    const finalPage = source.cloneNode(true);
    finalPage.id = EXAMS_PAGE_ID;
    finalPage.classList.remove('cahier-exams-groups-page-pdf-last');
    finalPage.style.removeProperty('display');
    finalPage.style.removeProperty('visibility');
    finalPage.style.removeProperty('opacity');

    pages.forEach((page) => page.remove());
    zone.append(finalPage);

    const style = doc.querySelector('style')?.outerHTML || '';
    return `${style}${zone.outerHTML}`;
  } catch {
    return html;
  }
};

const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  if (url.includes('/api/cahier-pdf') && typeof init.body === 'string') {
    try {
      const payload = JSON.parse(init.body);
      if (payload?.html) {
        payload.html = reorderPdfHtml(payload.html);
        init = { ...init, body: JSON.stringify(payload) };
      }
    } catch {
      // Laisser la requête originale inchangée.
    }
  }
  return nativeFetch(input, init);
};

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (!String(form.action || '').includes('/api/cahier-pdf')) return;

  const htmlField = form.querySelector('textarea[name="html"]');
  if (htmlField) htmlField.value = reorderPdfHtml(htmlField.value);
}, true);
