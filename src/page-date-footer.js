window.__showPageDate = window.__showPageDate !== false;
window.__pageDateValue = window.__pageDateValue || new Date().toISOString().slice(0, 10);

function formatDateValue(value) {
  if (!value) return new Date().toLocaleDateString('fr-FR');
  var parts = String(value).split('-');
  if (parts.length !== 3) return value;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function updateDateInput() {
  var input = document.querySelector('.page-date-input');
  if (!input) return;
  if (input.value !== window.__pageDateValue) input.value = window.__pageDateValue;
}

function togglePageDate() {
  window.__showPageDate = !window.__showPageDate;
  syncPageDates();
}

function syncPageDates() {
  var text = formatDateValue(window.__pageDateValue);
  document.body.classList.toggle('hide-page-date', !window.__showPageDate);

  document.querySelectorAll('.page-date-toggle').forEach(function (oldButton) {
    oldButton.remove();
  });

  document.querySelectorAll('.page-date-control').forEach(function (control) {
    control.classList.toggle('off', !window.__showPageDate);
    control.classList.toggle('on', window.__showPageDate);
  });

  document.querySelectorAll('.exam-page').forEach(function (page) {
    var date = page.querySelector('.page-date');
    if (!date) {
      date = document.createElement('div');
      date.className = 'page-date';
      page.appendChild(date);
    }
    date.textContent = text;
  });

  updateDateInput();
}

function ensureDateControls() {
  var panel = document.querySelector('.panel');
  if (!panel) return;

  document.querySelectorAll('.page-date-toggle').forEach(function (oldButton) {
    oldButton.remove();
  });

  var existingLabel = document.querySelector('label.page-date-control');
  if (existingLabel) existingLabel.remove();

  if (!document.querySelector('.page-date-control')) {
    var wrap = document.createElement('div');
    wrap.className = window.__showPageDate ? 'page-date-control on' : 'page-date-control off';
    wrap.setAttribute('role', 'button');
    wrap.tabIndex = 0;
    wrap.title = 'Cliquer sur le cadre pour afficher/masquer la date. Cliquer sur le calendrier pour choisir la date.';

    var title = document.createElement('span');
    title.className = 'page-date-title';
    title.textContent = 'Date :';

    var input = document.createElement('input');
    input.type = 'date';
    input.className = 'page-date-input';
    input.value = window.__pageDateValue;

    input.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    input.addEventListener('mousedown', function (event) {
      event.stopPropagation();
    });

    input.addEventListener('change', function () {
      window.__pageDateValue = input.value || new Date().toISOString().slice(0, 10);
      window.__showPageDate = true;
      syncPageDates();
    });

    wrap.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('.page-date-input')) return;
      togglePageDate();
    });

    wrap.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        togglePageDate();
      }
    });

    wrap.appendChild(title);
    wrap.appendChild(input);

    var barButton = panel.querySelector('.bar-ribbon-toggle');
    if (barButton && barButton.parentNode) {
      barButton.parentNode.insertBefore(wrap, barButton.nextSibling);
    } else {
      panel.appendChild(wrap);
    }
  }
}

function syncDateFeature() {
  ensureDateControls();
  syncPageDates();
}

syncDateFeature();
setTimeout(syncDateFeature, 100);
setTimeout(syncDateFeature, 400);

new MutationObserver(function () {
  syncDateFeature();
}).observe(document.body, { childList: true, subtree: true });
