function ensureFixedButtonPositionStyle() {
  var style = document.getElementById('fixed-button-positions-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'fixed-button-positions-style';
    document.head.appendChild(style);
  }

  style.textContent = '.a4-bar-proxy,body.arabic-mode .a4-bar-proxy{left:calc(50% - 94px)!important;right:auto!important}.a4-lines-proxy,body.arabic-mode .a4-lines-proxy{left:calc(50% - 47px)!important;right:auto!important}.a4-lang-proxy,body.arabic-mode .a4-lang-proxy{left:50%!important;right:auto!important}.a4-free-proxy,body.arabic-mode .a4-free-proxy{left:calc(50% + 47px)!important;right:auto!important}.a4-note-toggle-proxy,body.arabic-mode .a4-note-toggle-proxy{left:calc(50% + 94px)!important;right:auto!important}.a4-footer-preview,body.arabic-mode .a4-footer-preview{left:calc(50% + 54px)!important;right:auto!important}.a4-footer-export,body.arabic-mode .a4-footer-export{left:calc(50% - 100px)!important;right:auto!important}.a4-footer-two-page,body.arabic-mode .a4-footer-two-page{left:calc(50% + 104px)!important;right:auto!important}';
}

function syncFixedButtonPositions() {
  ensureFixedButtonPositionStyle();
}

syncFixedButtonPositions();
setTimeout(syncFixedButtonPositions, 100);
setTimeout(syncFixedButtonPositions, 300);
setTimeout(syncFixedButtonPositions, 800);
setInterval(syncFixedButtonPositions, 500);
window.addEventListener('resize', syncFixedButtonPositions);
window.syncFixedButtonPositions = syncFixedButtonPositions;
