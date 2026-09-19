// Alexis Huffman, site interactions
// Scroll reveals, sticky-nav state, mobile menu, interests accordion.

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- nav scroll state + mobile toggle ---- */
  const nav = document.getElementById('siteNav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('is-open', !open);
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      });
    });
  }

  /* ---- active link highlight ---- */
  const sections = document.querySelectorAll('main [id]');
  const navAnchors = document.querySelectorAll('.site-nav__links a[href^="#"]');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navAnchors.forEach((a) => {
            a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---- scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (revealEls.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---- hero name letter-in reveal ---- */
  document.querySelectorAll('.hero__name .line span').forEach((span, i) => {
    if (prefersReduced) {
      span.style.transform = 'translateY(0)';
      return;
    }
    span.style.transition = `transform 0.9s cubic-bezier(.2,.9,.25,1) ${0.15 + i * 0.12}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      span.style.transform = 'translateY(0)';
    }));
  });

  /* ---- hero photo: soft scale-in reveal on load ---- */
  const heroFigure = document.getElementById('heroFigure');
  if (heroFigure) {
    if (prefersReduced) {
      heroFigure.classList.add('is-revealed');
    } else {
      setTimeout(() => heroFigure.classList.add('is-revealed'), 200);
    }
  }

  /* ---- hero photo: gentle parallax on scroll ---- */
  if (heroFigure && !prefersReduced) {
    let ticking = false;
    const onScrollParallax = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroFigure.style.transform = `rotate(1.4deg) translateY(${y * 0.08}px)`;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });
  }

  /* ---- magnetic buttons ---- */
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.style.transition = 'transform 0.25s ' + 'cubic-bezier(.16,1,.3,1)' + ', background 0.35s ease, color 0.35s ease, box-shadow 0.35s ease';
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---- draggable hero stickers ---- */
  document.querySelectorAll('.sticker').forEach((el) => {
    setTimeout(() => el.classList.add('is-in'), prefersReduced ? 0 : 900);
    let sx = 0, sy = 0, ox = 0, oy = 0, moved = false, active = false;
    el.addEventListener('pointerdown', (e) => {
      active = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.getPropertyValue('--dx')) || 0;
      oy = parseFloat(el.style.getPropertyValue('--dy')) || 0;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 5) { moved = true; el.classList.add('is-dragging'); }
      if (moved) {
        el.style.setProperty('--dx', ox + dx + 'px');
        el.style.setProperty('--dy', oy + dy + 'px');
      }
    });
    const end = () => { active = false; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } });
  });

  /* ---- page transitions ---- */
  if (!prefersReduced) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || /\.pdf$/i.test(url.pathname)) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => { location.href = url.href; }, 280);
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) document.body.classList.remove('is-leaving'); });
  }

  /* ---- cursor ring ---- */
  if (!prefersReduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const ring = document.createElement('div');
    ring.className = 'cursor-flower';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    let tx = 0, ty = 0, x = 0, y = 0, s = 1, ts = 1, rot = 0, started = false;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!started) { x = tx; y = ty; started = true; document.documentElement.classList.add('has-flower-cursor'); }
      ring.classList.add('is-visible');
      ts = (e.target.closest && e.target.closest('a, button, .sticker, .beyond__item')) ? 1.4 : 1;
    }, { passive: true });
    document.addEventListener('mouseleave', () => ring.classList.remove('is-visible'));
    const tick = () => {
      const px = x;
      x += (tx - x) * 0.35; y += (ty - y) * 0.35; s += (ts - s) * 0.2;
      rot = rot * 0.92 + (x - px) * 1.4;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale(${s})`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ---- certificate lightbox ---- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Certificate');
  lb.innerHTML = '<button class="lightbox__close" aria-label="Close certificate">×</button><img alt="">';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('img');
  const lbClose = lb.querySelector('.lightbox__close');
  let lbOpener = null;
  const closeLb = () => { lb.classList.remove('is-open'); if (lbOpener) lbOpener.focus(); };
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-lightbox]');
    if (t) {
      lbOpener = t;
      lbImg.src = t.getAttribute('data-lightbox');
      lbImg.alt = t.getAttribute('data-alt') || '';
      lb.classList.add('is-open');
      lbClose.focus();
    } else if (e.target === lb || e.target === lbClose) {
      closeLb();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
    if (e.key === 'Tab' && lb.classList.contains('is-open')) { e.preventDefault(); lbClose.focus(); }
  });

  /* ---- music player (tap the record) ---- */
  const music = document.createElement('div');
  music.className = 'music';
  music.innerHTML =
    '<div class="music__card" id="musicCard" hidden>' +
      '<button class="music__close" aria-label="Close player">×</button>' +
      '<button class="music__min" aria-label="Make video smaller" aria-pressed="false">–</button>' +
      '<p class="music__now">now playing</p>' +
      '<p class="music__title">Banana Pancakes, Jack Johnson</p>' +
      '<div class="music__frame"></div>' +
      '<a class="music__link" href="https://www.youtube.com/watch?v=m-v-LGOfaKo" target="_blank" rel="noopener">open on YouTube</a>' +
    '</div>' +
    '<button class="music__btn" aria-controls="musicCard" aria-expanded="false" aria-label="Play Banana Pancakes by Jack Johnson">' +
      '<img src="assets/images/music-vinyl.png" alt="" draggable="false">' +
      '<span class="music__tip">tap for music</span>' +
    '</button>';
  document.body.appendChild(music);
  const mBtn = music.querySelector('.music__btn');
  const mCard = music.querySelector('.music__card');
  const mFrame = music.querySelector('.music__frame');
  const mMin = music.querySelector('.music__min');
  const setMini = (mini) => {
    mCard.classList.toggle('is-mini', mini);
    mMin.textContent = mini ? '+' : '–';
    mMin.setAttribute('aria-pressed', String(mini));
    mMin.setAttribute('aria-label', mini ? 'Make video bigger' : 'Make video smaller');
  };
  mMin.addEventListener('click', () => setMini(!mCard.classList.contains('is-mini')));
  const setMusic = (open) => {
    if (open && mCard.hidden) setMini(true);
    mCard.hidden = !open;
    mBtn.setAttribute('aria-expanded', String(open));
    music.classList.toggle('is-playing', open);
    mFrame.innerHTML = open
      ? '<iframe src="https://www.youtube-nocookie.com/embed/m-v-LGOfaKo?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Banana Pancakes by Jack Johnson" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
      : '';
  };
  mBtn.addEventListener('click', () => setMusic(mCard.hidden));
  music.querySelector('.music__close').addEventListener('click', () => { setMusic(false); mBtn.focus(); });

  /* ---- index rows (experience / projects) ---- */
  document.querySelectorAll('.index-row').forEach((row) => {
    const trigger = row.querySelector('.index-row__trigger');
    if (!trigger || row.classList.contains('index-row--empty')) return;
    trigger.addEventListener('click', () => {
      const open = row.getAttribute('data-open') === 'true';
      row.closest('.index-list').querySelectorAll('.index-row').forEach((r) => {
        if (r !== row) {
          r.setAttribute('data-open', 'false');
          const t = r.querySelector('.index-row__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      row.setAttribute('data-open', String(!open));
      trigger.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ---- flip cards ---- */
  document.querySelectorAll('.flip').forEach((card) => {
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
      card.setAttribute('aria-label', flipped
        ? 'Senior jeans I decorated. Showing the back. Tap to flip to the front.'
        : 'Senior jeans I decorated. Showing the front. Tap to flip to the back.');
      const hint = card.querySelector('.flip__hint');
      if (hint) hint.style.opacity = '0';
    });
  });

  /* ---- interests accordion ---- */
  document.querySelectorAll('.interest').forEach((item) => {
    const trigger = item.querySelector('.interest__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      // close siblings for a single-open accordion feel
      item.closest('.interests').querySelectorAll('.interest').forEach((sib) => {
        if (sib !== item) {
          sib.setAttribute('data-open', 'false');
          sib.querySelector('.interest__trigger').setAttribute('aria-expanded', 'false');
        }
      });
      item.setAttribute('data-open', String(!isOpen));
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });
});
