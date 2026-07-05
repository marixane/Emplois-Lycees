const EXAM_ROWS = [
  ['Primaire', 'Examen normalisé local', '....................', '....................'],
  ['Primaire', 'Examen normalisé provincial', '....................', '....................'],
  ['Collège', 'Examen régional', '....................', '....................'],
  ['Lycée', 'Examen régional 1ère Bac', '....................', '....................'],
  ['Lycée', 'Examen national 2ème Bac', '....................', '....................']
];

const makeExamCell = (text, header = false) => {
  const cell = document.createElement(header ? 'th' : 'td');
  cell.textContent = text;
  if (!header) {
    cell.contentEditable = 'true';
    cell.setAttribute('suppresscontenteditablewarning', 'true');
    cell.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        cell.blur();
      }
    });
  }
  return cell;
};

const buildExamTable = () => {
  const wrap = document.createElement('div');
  wrap.className = 'cahier-exams-footer';

  const title = document.createElement('div');
  title.className = 'cahier-exams-title';
  title.textContent = 'Tableau des examens';

  const table = document.createElement('table');
  table.className = 'cahier-exams-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Cycle', 'Examen', 'Date', 'Observation'].forEach((text) => headerRow.append(makeExamCell(text, true)));
  thead.append(headerRow);

  const tbody = document.createElement('tbody');
  EXAM_ROWS.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((text) => tr.append(makeExamCell(text)));
    tbody.append(tr);
  });

  table.append(thead, tbody);
  wrap.append(title, table);
  return wrap;
};

const getTimetablePage = () => Array.from(document.querySelectorAll('.cahier-page'))
  .find((page) => page.querySelector('.timetable-table'));

const applyCahierExamsFooter = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;
  const page = getTimetablePage();
  if (!page) return;

  page.querySelectorAll('.cahier-footer').forEach((footer) => footer.remove());

  if (!page.querySelector('.cahier-exams-footer')) page.append(buildExamTable());
};

const scheduleCahierExamsFooter = () => window.requestAnimationFrame(applyCahierExamsFooter);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCahierExamsFooter, { once: true });
} else {
  scheduleCahierExamsFooter();
}

new MutationObserver(scheduleCahierExamsFooter).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});
