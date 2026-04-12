// ── NAVBAR scroll effect
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 60
    ? 'rgba(8,8,16,.92)'
    : 'rgba(8,8,16,.6)';
});

// ── REVEAL on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
reveals.forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  observer.observe(el);
});

// ── FORM submit mock
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = '✓ Заявка отправлена!';
  btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Отправить заявку →';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3500);
}

// ── Smooth active nav links (desktop only)
const sections = document.querySelectorAll('section[id], #hero');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? '#f0f0ff' : '';
  });
}, { passive: true });

// ═══════════════════════════════════════════
//  MOBILE APP NAVIGATION
// ═══════════════════════════════════════════
(function () {
  if (window.innerWidth > 768) return;

  const pages   = Array.from(document.querySelectorAll('.app-page'));
  const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  const dots    = Array.from(document.querySelectorAll('.pdot'));
  let current   = 0;

  // Touch tracking
  let txStart = 0, tyStart = 0;
  let dir     = null;   // null | 'h' | 'v'
  let tStart  = 0;

  /* ── Set initial state ── */
  pages.forEach((p, i) => {
    p.classList.remove('is-active', 'is-prev', 'no-anim');
    if (i === 0) p.classList.add('is-active');
    // rest stay at translateX(100%) from CSS default
  });

  /* ── Navigate to a page ── */
  function goTo(index, instant) {
    if (index < 0 || index >= pages.length) return;
    current = index;

    pages.forEach((p, i) => {
      if (instant) p.classList.add('no-anim');
      p.classList.remove('is-active', 'is-prev');
      p.style.transform = '';
      if (i === index)       p.classList.add('is-active');
      else if (i < index)    p.classList.add('is-prev');
      // i > index → translateX(100%) via CSS default

      if (instant) {
        // re-enable transitions next frame
        requestAnimationFrame(() => p.classList.remove('no-anim'));
      }
    });

    // Tab buttons
    tabBtns.forEach((btn, i) => btn.classList.toggle('active', i === index));

    // Dots
    dots.forEach((d, i) => d.classList.toggle('active', i === index));

    // Scroll active page to top after anim
    setTimeout(() => { pages[index].scrollTop = 0; }, 60);
  }

  /* ── Tab button clicks ── */
  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      goTo(i);
      // Press pop
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => { btn.style.transform = ''; }, 180);
    });
  });

  /* ── Swipe gestures ── */
  document.addEventListener('touchstart', e => {
    txStart = e.touches[0].clientX;
    tyStart = e.touches[0].clientY;
    tStart  = Date.now();
    dir     = null;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - txStart;
    const dy = e.touches[0].clientY - tyStart;

    // Determine axis on first decisive move
    if (!dir) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        dir = 'h';
      } else if (Math.abs(dy) > 8) {
        dir = 'v';
        return;
      } else {
        return;
      }
    }
    if (dir === 'v') return;

    e.preventDefault(); // block scroll while swiping horizontally

    const activePage = pages[current];
    activePage.classList.add('no-anim');
    activePage.style.transform = `translateX(${dx}px)`;

    if (dx < 0 && current < pages.length - 1) {
      // Pull in next page from right
      const next = pages[current + 1];
      next.classList.add('no-anim');
      next.style.transform = `translateX(calc(100% + ${dx}px))`;
    } else if (dx > 0 && current > 0) {
      // Pull in prev page from left
      const prev = pages[current - 1];
      prev.classList.add('no-anim');
      prev.style.transform = `translateX(calc(-100% + ${dx}px))`;
    } else {
      // Edge rubber-band
      activePage.style.transform = `translateX(${dx * 0.22}px)`;
    }
  }, { passive: false });

  document.addEventListener('touchend', e => {
    if (dir !== 'h') return;

    const dx       = e.changedTouches[0].clientX - txStart;
    const elapsed  = Date.now() - tStart;
    const velocity = Math.abs(dx) / elapsed; // px/ms

    // Reset inline transforms (goTo will re-apply via class)
    pages.forEach(p => {
      p.classList.remove('no-anim');
      p.style.transform = '';
    });

    const threshold = velocity > 0.4 ? 30 : 70; // fast flick needs less distance

    if (dx < -threshold)     goTo(current + 1);
    else if (dx > threshold) goTo(current - 1);
    else                     goTo(current, true); // snap back instantly

    dir = null;
  }, { passive: true });

  /* ── Remove swipe hint after animation ── */
  const hint = document.getElementById('swipe-hint');
  if (hint) setTimeout(() => hint.remove(), 3600);

  /* ── Reveal elements on active page ── */
  function revealPage(pageEl) {
    pageEl.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 0.07 + 's';
      setTimeout(() => el.classList.add('visible'), 50);
    });
  }
  // Reveal first page immediately
  revealPage(pages[0]);

  // Reveal on page change
  // Wrap tab clicks and swipe to trigger reveal
  document.addEventListener('touchend', () => {
    setTimeout(() => revealPage(pages[current]), 200);
  }, { passive: true });
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => revealPage(pages[current]), 250);
    });
  });
})();
