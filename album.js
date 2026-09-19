// Camera + photo album. Tap the camera to open the album; tap a photo to view it larger.
document.addEventListener('DOMContentLoaded', () => {
  const camera = document.getElementById('cameraBtn');
  const album = document.getElementById('album');
  if (!camera || !album) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const thumbs = [...album.querySelectorAll('.album__thumb')];
  const closeBtn = album.querySelector('.album__close');
  const viewer = album.querySelector('.album__viewer');
  const vImg = viewer.querySelector('img');
  const vCount = viewer.querySelector('.album__count');
  const vCap = viewer.querySelector('.album__caption');
  const vClose = viewer.querySelector('.album__vclose');
  const vPrev = viewer.querySelector('.album__prev');
  const vNext = viewer.querySelector('.album__next');
  const total = thumbs.length;
  album.querySelector('.album__total').textContent = total + ' photos';

  let current = 0;
  let viewerOpen = false;

  const flash = document.createElement('div');
  flash.className = 'album-flash';
  flash.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flash);

  const openAlbum = () => {
    album.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => album.classList.add('is-open'));
    closeBtn.focus();
  };
  const closeAlbum = () => {
    album.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { album.hidden = true; }, 300);
    camera.focus();
  };

  camera.addEventListener('click', () => {
    if (prefersReduced) { openAlbum(); return; }
    camera.classList.add('is-snap');
    flash.classList.add('is-on');
    setTimeout(openAlbum, 260);
    setTimeout(() => { camera.classList.remove('is-snap'); flash.classList.remove('is-on'); }, 700);
  });
  closeBtn.addEventListener('click', closeAlbum);

  const show = (i) => {
    current = (i + total) % total;
    const t = thumbs[current];
    vImg.classList.add('is-loading');
    vImg.onload = () => vImg.classList.remove('is-loading');
    vImg.src = t.dataset.full;
    vImg.alt = t.dataset.alt || '';
    vCap.textContent = t.dataset.alt || '';
    vCount.textContent = (current + 1) + ' / ' + total;
    [current + 1, current - 1].forEach((n) => { const p = thumbs[(n + total) % total]; if (p) new Image().src = p.dataset.full; });
  };
  const openViewer = (i) => { viewerOpen = true; viewer.hidden = false; show(i); vClose.focus(); };
  const closeViewer = () => { viewerOpen = false; viewer.hidden = true; thumbs[current].focus(); };

  thumbs.forEach((t, i) => t.addEventListener('click', () => openViewer(i)));
  vClose.addEventListener('click', closeViewer);
  vPrev.addEventListener('click', () => show(current - 1));
  vNext.addEventListener('click', () => show(current + 1));
  viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });

  let sx = null;
  viewer.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  viewer.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
  });

  document.addEventListener('keydown', (e) => {
    if (album.hidden) return;
    if (e.key === 'Escape') { viewerOpen ? closeViewer() : closeAlbum(); return; }
    if (viewerOpen && e.key === 'ArrowRight') show(current + 1);
    if (viewerOpen && e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'Tab') {
      const scope = viewerOpen ? viewer : album;
      const f = [...scope.querySelectorAll('button:not([hidden])')].filter((b) => b.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!scope.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
});
