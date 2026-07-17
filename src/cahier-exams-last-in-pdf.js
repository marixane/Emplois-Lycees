const EXAMS_PAGE_ID = 'cahier-exams-groups-page';
const TEMP_PAGE_ID = 'cahier-exams-groups-page-pdf-last';
const HOLIDAYS_PAGE_ID = 'cahier-holidays-page';
const LEGACY_COVER_SELECTOR = '#cahier-main-cover-page, .cahier-main-cover-page, [data-force-first-page="true"]';

const reorderPdfHtml = (html) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(html || ''), 'text/html');
    const zone = doc.querySelector('.cahier-preview-zone');
    if (!zone) return html;

    const legacyCoverPages = Array.from(zone.querySelectorAll(LEGACY_COVER_SELECTOR));
    legacyCoverPages.forEach((page) => page.remove());

    const examsPages = Array.from(zone.querySelectorAll(`#${EXAMS_PAGE_ID}, #${TEMP_PAGE_ID}, .cahier-exams-groups-page`));
    const holidaysPages = Array.from(zone.querySelectorAll(`#${HOLIDAYS_PAGE_ID}, .holidays-page`));
    if (!legacyCoverPages.length && !examsPages.length && !holidaysPages.length) return html;

    const examsSource = examsPages[examsPages.length - 1];
    const holidaysSource = holidaysPages[holidaysPages.length - 1];
    const finalExamsPage = examsSource?.cloneNode(true);
    const finalHolidaysPage = holidaysSource?.cloneNode(true);

    if (finalExamsPage) {
      finalExamsPage.id = EXAMS_PAGE_ID;
      finalExamsPage.classList.remove('cahier-exams-groups-page-pdf-last');
    }
    if (finalHolidaysPage) finalHolidaysPage.id = HOLIDAYS_PAGE_ID;

    [finalExamsPage, finalHolidaysPage].filter(Boolean).forEach((page) => {
      page.style.removeProperty('display');
      page.style.removeProperty('visibility');
      page.style.removeProperty('opacity');
    });

    examsPages.forEach((page) => page.remove());
    holidaysPages.forEach((page) => page.remove());
    if (finalExamsPage) zone.append(finalExamsPage);
    if (finalHolidaysPage) zone.append(finalHolidaysPage);

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
