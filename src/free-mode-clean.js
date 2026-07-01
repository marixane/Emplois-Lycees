function isFreeModeActive() {
  var notes = document.querySelector('.note-scale-control:not(.homework-disabled-note)');
  if (!notes) return false;
  return !notes.querySelector('.note-scale-button.active');
}

function updateDisplay(node, hidden) {
  if (!node) return;
  if (hidden) node.style.display = 'none';
  else node.style.display = '';
}

function syncFreeModeBodyClass() {
  if (!document.body) return;
  document.body.classList.toggle('no-title-points', isFreeModeActive());
}

function cleanFreeModeExerciseTitles() {
  var freeMode = isFreeModeActive();
  syncFreeModeBodyClass();

  document.querySelectorAll('.exam-exercise:not(.blank-exercise) .exercise-title-controls').forEach(function (title) {
    var span = title.querySelector('span:first-child');
    var text = (span && span.textContent) || '';
    var match = text.match(/(Exercice|\u062a\u0645\u0631\u064a\u0646)\s*(\d+)/i);

    if (freeMode && span && match) span.textContent = match[1] + ' ' + match[2] + ' :';

    title.querySelectorAll('button, strong, .points-decoration').forEach(function (node) {
      updateDisplay(node, freeMode);
    });
  });
}

function syncFreeModeClean() {
  cleanFreeModeExerciseTitles();
}

syncFreeModeClean();
setTimeout(syncFreeModeClean, 100);
setTimeout(syncFreeModeClean, 300);
setTimeout(syncFreeModeClean, 700);

window.setInterval(syncFreeModeClean, 400);

document.addEventListener('click', function () {
  setTimeout(syncFreeModeClean, 20);
  setTimeout(syncFreeModeClean, 80);
  setTimeout(syncFreeModeClean, 250);
});

document.addEventListener('input', function () {
  setTimeout(syncFreeModeClean, 80);
});

window.cleanFreeModeExerciseTitles = cleanFreeModeExerciseTitles;
window.syncFreeModeBodyClass = syncFreeModeBodyClass;
