const TWO_PAGE_VIEW_KEY = 'exam-two-page-view';

function hasMultiplePages() {
  return document.querySelectorAll('.preview-zone .a4-page').length > 1;
}

function isTwoPageViewEnabled() {
  return localStorage.getItem(TWO_PAGE_VIEW_KEY) === 'true';
}

function setTwoPageView(enabled) {
  localStorage.setItem(TWO_PAGE_VIEW_KEY, enabled ? 'true' : 'false');
  syncTwoPageView();
}

function syncTwoPageView() {
  const multiple = hasMultiplePages();
  const enabled = isTwoPageViewEnabled() && multiple;
  document.body.classList.toggle('two-page-view', enabled);

  const button = document.querySelector('.two-page-view-toggle');
  if (!button) return;
  button.classList.toggle('on', enabled);
  button.classList.toggle('off', !enabled);
  button.disabled = !multiple;
  button.textContent = enabled ? '2 feuilles côte à côte' : 'Affichage normal';
  button.title = multiple ? 'Afficher ou masquer les feuilles côte à côte' : 'Ajoute une 2e feuille pour activer cet affichage';
}

function ensureTwoPageViewButton() {
  const panel = document.querySelector('.panel');
  if (!panel || panel.querySelector('.two-page-view-toggle')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'two-page-view-toggle off';
  button.addEventListener('click', function () {
    if (!hasMultiplePages()) return;
    setTwoPageView(!isTwoPageViewEnabled());
  });

  const barButton = panel.querySelector('.bar-ribbon-toggle');
  if (barButton && barButton.nextSibling) panel.insertBefore(button, barButton.nextSibling);
  else panel.appendChild(button);

  syncTwoPageView();
}

function initTwoPageView() {
  ensureTwoPageViewButton();
  syncTwoPageView();
}

initTwoPageView();
setTimeout(initTwoPageView, 200);
setTimeout(initTwoPageView, 700);
setInterval(initTwoPageView, 500);

window.syncTwoPageView = syncTwoPageView;
