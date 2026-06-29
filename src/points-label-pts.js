function formatExercisePointLabels() {
  var arabic = document.body.classList.contains('arabic-mode');
  document.querySelectorAll('.exam-exercise:not(.blank-exercise) .exercise-title-controls strong').forEach(function (node) {
    var text = node.textContent || '';
    var match = text.match(/([0-9]+(?:[,.][0-9]+)?)/);
    if (!match) return;
    var value = Number(match[1].replace(',', '.'));
    var numberText = match[1].replace('.', ',');
    var next = arabic ? numberText + ' \u0646' : numberText + ' ' + (value === 1 ? 'Pt' : 'Pts');
    if (node.textContent !== next) node.textContent = next;
  });
}

formatExercisePointLabels();
setTimeout(formatExercisePointLabels, 100);
setTimeout(formatExercisePointLabels, 400);
setInterval(formatExercisePointLabels, 250);

new MutationObserver(function () {
  formatExercisePointLabels();
}).observe(document.body, { childList: true, subtree: true, characterData: true });
