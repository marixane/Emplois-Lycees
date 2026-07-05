const createMosaic = (position) => {
  const mosaic = document.createElement('div');
  Object.assign(mosaic.style, {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '28px',
    background: 'repeating-conic-gradient(from 45deg, #0f766e 0 8deg, #f59e0b 8deg 16deg, #f8fafc 16deg 24deg, #1d4ed8 24deg 32deg, #7c2d12 32deg 40deg)',
    opacity: '0.9',
    boxShadow: '0 0 0 14px rgba(255,255,255,0.55)'
  });
  if (position === 'top') {
    mosaic.style.top = '-54px';
    mosaic.style.right = '-42px';
  } else {
    mosaic.style.bottom = '-54px';
    mosaic.style.left = '-42px';
  }
  return mosaic;
};

const createCoverPage = () => {
  const page = document.createElement('div');
  page.id = 'cahier-cover-page';
  page.className = 'a4-page cahier-page cahier-cover-page';
  Object.assign(page.style, {
    position: 'relative',
    overflow: 'hidden',
    background: '#eadccd',
    color: '#111827',
    fontFamily: 'Arial, sans-serif'
  });

  const pattern = document.createElement('div');
  Object.assign(pattern.style, {
    position: 'absolute',
    inset: '0',
    opacity: '0.18',
    backgroundImage: 'radial-gradient(circle at 22px 22px, rgba(255,255,255,0.65) 1px, transparent 2px), linear-gradient(45deg, rgba(255,255,255,0.35) 12%, transparent 12%, transparent 88%, rgba(255,255,255,0.35) 88%)',
    backgroundSize: '44px 44px, 52px 52px'
  });

  const logo = document.createElement('div');
  Object.assign(logo.style, {
    position: 'absolute',
    top: '56px',
    left: '0',
    right: '0',
    textAlign: 'center',
    fontSize: '11px',
    lineHeight: '1.45',
    fontWeight: '700',
    color: '#313131'
  });
  logo.innerHTML = '<div>Royaume du Maroc</div><div style="font-size:22px;line-height:1;margin:6px 0">☸</div><div>Ministère de l’Éducation Nationale</div><div>du Préscolaire et des Sports</div>';

  const titleBlock = document.createElement('div');
  Object.assign(titleBlock.style, {
    position: 'absolute',
    left: '70px',
    top: '250px'
  });
  titleBlock.innerHTML = '<h1 style="margin:0;font-size:56px;font-weight:900;letter-spacing:-1px;color:#0b0b0b;text-shadow:0 9px 7px rgba(0,0,0,0.22)">Cahier de textes</h1><div style="margin-top:22px;font-size:20px;font-weight:700;color:#222">Langue française</div>';

  const cycle = document.createElement('div');
  Object.assign(cycle.style, {
    position: 'absolute',
    left: '70px',
    top: '470px',
    fontSize: '16px',
    lineHeight: '1.6',
    fontWeight: '700',
    color: '#222'
  });
  cycle.innerHTML = '<div>Enseignement – Apprentissage du</div><div>Français au cycle secondaire</div>';

  const year = document.createElement('div');
  Object.assign(year.style, {
    position: 'absolute',
    right: '76px',
    bottom: '82px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#222'
  });
  year.textContent = 'Année Scolaire : 2025/2026';

  page.append(pattern, createMosaic('top'), createMosaic('bottom'), logo, titleBlock, cycle, year);
  return page;
};

const ensureCahierCoverPage = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;
  const zone = document.querySelector('.cahier-preview-zone');
  if (!zone) return;

  let cover = document.getElementById('cahier-cover-page');
  if (!cover) cover = createCoverPage();
  if (zone.firstElementChild !== cover) zone.prepend(cover);
};

const scheduleCoverPage = () => window.requestAnimationFrame(ensureCahierCoverPage);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCoverPage, { once: true });
} else {
  scheduleCoverPage();
}

new MutationObserver(scheduleCoverPage).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});
