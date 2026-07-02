function ensureBarRibbonPageStyle() {
  if (document.getElementById('bar-ribbon-page-position-style')) return;

  var style = document.createElement('style');
  style.id = 'bar-ribbon-page-position-style';
  style.textContent = '.a4-page{position:relative!important}.bar-ribbon-toggle.on-a4-page,.pdf-lines-toggle.on-a4-page-lines{position:absolute!important;top:calc(var(--exam-header-height, 104px) + 5px)!important;transform:translateX(-50%)!important;z-index:1000!important;pointer-events:auto!important;margin:0!important;width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;padding:0!important;border-radius:6px!important;font-size:0!important;line-height:1!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;white-space:nowrap!important;overflow:hidden!important}.bar-ribbon-toggle.on-a4-page{left:calc(50% - 20px)!important}.pdf-lines-toggle.on-a4-page-lines{left:calc(50% + 20px)!important}.bar-ribbon-toggle.on-a4-page::after{content:""!important;width:15px!important;height:18px!important;display:block!important;border-left:5px solid currentColor!important;border-right:5px solid currentColor!important;border-top:3px solid currentColor!important;border-bottom:3px solid currentColor!important;box-sizing:border-box!important;opacity:.95!important}.pdf-lines-toggle.on-a4-page-lines::after{content:""!important;width:18px!important;height:16px!important;display:block!important;background:repeating-linear-gradient(to bottom,currentColor 0,currentColor 2px,transparent 2px,transparent 5px)!important;border-top:2px solid currentColor!important;border-bottom:2px solid currentColor!important;box-sizing:border-box!important;opacity:.95!important}.exam-page.is-exporting .bar-ribbon-toggle.on-a4-page,.exam-page.is-exporting .pdf-lines-toggle.on-a4-page-lines{display:none!important}@media print{.bar-ribbon-toggle.on-a4-page,.pdf-lines-toggle.on-a4-page-lines{display:none!important}}';
  document.head.appendChild(style);
}

function moveBarRibbonToggleToPage() {
  ensureBarRibbonPageStyle();

  var barButton = document.querySelector('.bar-ribbon-toggle');
  var linesButton = document.querySelector('.pdf-lines-toggle');
  var firstPage = document.querySelector('.a4-page');
  if (!firstPage) return;

  if (barButton) {
    barButton.classList.add('on-a4-page');
    if (barButton.parentElement !== firstPage) firstPage.appendChild(barButton);
  }

  if (linesButton) {
    linesButton.classList.add('on-a4-page-lines');
    if (linesButton.parentElement !== firstPage) firstPage.appendChild(linesButton);
  }
}

moveBarRibbonToggleToPage();
setTimeout(moveBarRibbonToggleToPage, 100);
setTimeout(moveBarRibbonToggleToPage, 300);
setTimeout(moveBarRibbonToggleToPage, 700);
setInterval(moveBarRibbonToggleToPage, 800);
window.addEventListener('resize', moveBarRibbonToggleToPage);
window.moveBarRibbonToggleToPage = moveBarRibbonToggleToPage;
