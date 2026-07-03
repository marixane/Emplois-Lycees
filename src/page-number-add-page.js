function normalizeDigits(text) {
  return String(text || '').replace(/[٠-٩]/g, function (digit) {
    return String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
  }).replace(/[۰-۹]/g, function (digit) {
    return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit));
  });
}

function getTotalPages() {
  return Math.max(1, document.querySelectorAll('.a4-page').length || 1);
}

function getCountCards() {
  return Array.from(document.querySelectorAll('.page-count-card'));
}

function getCardCount(card) {
  var strong = card && card.querySelector('strong');
  var match = String((strong && strong.textContent) || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function pressCardButton(card, wanted) {
  if (!card) return false;
  var buttons = Array.from(card.querySelectorAll('.compact-control button'));
  var button = buttons.find(function (b) {
    var text = String(b.textContent || '').trim();
    return !b.disabled && (text === wanted || (wanted === '-' && text === '−'));
  });
  if (!button) return false;
  button.click();
  setTimeout(syncPageNumberControls, 60);
  setTimeout(syncPageNumberControls, 180);
  setTimeout(syncPageNumberControls, 420);
  return true;
}

function addPage(total) {
  pressCardButton(getCountCards()[total], '+');
}

function removeLastPage(total) {
  if (total <= 1) return;
  var index = total - 1;

  function removeOneExercise() {
    var card = getCountCards()[index];
    if (!card || getCardCount(card) <= 0) {
      setTimeout(syncPageNumberControls, 120);
      return;
    }
    if (!pressCardButton(card, '-')) return;
    setTimeout(removeOneExercise, 90);
  }

  removeOneExercise();
}

function ensurePageControlStyle() {
  var style = document.getElementById('safe-page-controls-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'safe-page-controls-style';
    document.head.appendChild(style);
  }

  style.textContent = '.a4-page{position:relative!important}.page-number{pointer-events:auto!important;z-index:90!important}.page-number-safe-controls{position:absolute!important;left:calc(50% + 195px)!important;right:auto!important;bottom:8px!important;width:auto!important;height:22px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;pointer-events:auto!important;z-index:100000!important;transform:translateX(-50%)!important;opacity:.22!important;transition:opacity .12s ease!important}.page-number-safe-controls:hover{opacity:1!important}.page-number-safe-controls button{width:42px!important;min-width:42px!important;height:22px!important;min-height:22px!important;border-radius:6px!important;border:1px solid rgba(100,116,139,.35)!important;background:rgba(255,255,255,.32)!important;color:rgba(15,23,42,.45)!important;font-size:16px!important;font-weight:900!important;line-height:1!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;box-sizing:border-box!important;box-shadow:none!important;-webkit-tap-highlight-color:transparent!important}.page-number-safe-controls:hover button{background:#ffffff!important;border-color:#64748b!important;color:#0f172a!important;box-shadow:0 1px 3px rgba(15,23,42,.18)!important}.page-number-safe-controls button:hover{background:#e0f2fe!important;border-color:#2563eb!important;color:#1d4ed8!important}.page-number-safe-controls button.minus:hover{background:#fee2e2!important;border-color:#dc2626!important;color:#b91c1c!important}.page-number-safe-controls button:disabled{opacity:.18!important;cursor:not-allowed!important}@media(max-width:1200px){.page-number-safe-controls{gap:8px!important;opacity:.28!important}.page-number-safe-controls:hover{opacity:1!important}.page-number-safe-controls button{width:42px!important;min-width:42px!important;height:22px!important;min-height:22px!important;font-size:16px!important;border-radius:6px!important;touch-action:none!important}}@media print{.page-number-safe-controls{display:none!important}}';
}

function runPageButton(event, action) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  var now = Date.now();
  if (runPageButton.last && now - runPageButton.last < 180) return;
  runPageButton.last = now;
  var total = getTotalPages();
  if (action === 'add') addPage(total);
  if (action === 'remove') removeLastPage(total);
}

function makeControls() {
  var controls = document.createElement('div');
  controls.className = 'page-number-safe-controls';
  controls.setAttribute('data-page-index', '0');

  var minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'minus';
  minus.textContent = '−';
  minus.title = 'Supprimer la dernière page';

  var plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'plus';
  plus.textContent = '+';
  plus.title = 'Ajouter une page';

  minus.addEventListener('pointerdown', function (event) { runPageButton(event, 'remove'); });
  plus.addEventListener('pointerdown', function (event) { runPageButton(event, 'add'); });
  minus.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); });
  plus.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); });

  controls.appendChild(minus);
  controls.appendChild(plus);
  return controls;
}

function syncPageNumberControls() {
  ensurePageControlStyle();

  var pageNode = document.querySelector('.a4-page');
  if (!pageNode) {
    document.querySelectorAll('.page-number-safe-controls').forEach(function (controls) { controls.remove(); });
    return;
  }

  var controls = pageNode.querySelector('.page-number-safe-controls');
  if (!controls) {
    controls = makeControls();
    pageNode.appendChild(controls);
  }

  var minus = controls.querySelector('.minus');
  if (minus) minus.disabled = getTotalPages() <= 1;

  document.querySelectorAll('.page-number-safe-controls').forEach(function (extraControls) {
    if (extraControls !== controls) extraControls.remove();
  });
}

syncPageNumberControls();
setTimeout(syncPageNumberControls, 200);
setTimeout(syncPageNumberControls, 700);
setTimeout(syncPageNumberControls, 1200);
window.addEventListener('resize', syncPageNumberControls);
window.syncPageNumberControls = syncPageNumberControls;
