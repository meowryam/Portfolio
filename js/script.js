/* =====================
   TYPEWRITER EFFECT
   ===================== */
const typeWords = [
  'games.',
  'interfaces.',
  'ideas.',
  'things that bring fun.',
];

const typeEl = document.getElementById('typewriter');
let wordIndex = 0;
let charIndex = 0;
let deleting = false;
let typePause = false;

function type() {
  const current = typeWords[wordIndex];

  if (!deleting) {
    typeEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      // pause at full word
      typePause = true;
      setTimeout(() => { typePause = false; deleting = true; type(); }, 1800);
      return;
    }
  } else {
    typeEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % typeWords.length;
    }
  }

  const speed = deleting ? 45 : 80;
  setTimeout(type, speed);
}

// start after hero animates in
setTimeout(type, 1200);


/* =====================
   CURSOR TRAIL — sparkle stars follow the mouse
   ===================== */
const starChars = ['✦', '✧', '⋆', '✶', '˖', '✿'];
const starColors = ['#C8B8E8', '#A48CC9', '#EDE6F7', '#B39DDB', '#D4C5F0'];

document.addEventListener('mousemove', (e) => {
  if (Math.random() > 0.35) return;

  const star = document.createElement('div');
  star.className = 'star';
  star.textContent = starChars[Math.floor(Math.random() * starChars.length)];
  star.style.left = e.clientX + 'px';
  star.style.top = e.clientY + 'px';
  star.style.color = starColors[Math.floor(Math.random() * starColors.length)];
  star.style.fontSize = (10 + Math.random() * 8) + 'px';

  document.body.appendChild(star);
  setTimeout(() => star.remove(), 850);
});


/* =====================
   SCROLL PROGRESS BAR
   ===================== */
const progressBar = document.getElementById('progress-bar');

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}

/* =====================
   NAV — transparent hero, scroll-hide/show, pill, mobile
   ===================== */
const navbar  = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const navPill   = document.getElementById('navPill');
const navAnchors = document.querySelectorAll('.nav-links a');

/* hero height threshold — below this the nav goes opaque */
const heroEl = document.getElementById('hero');

let lastScrollY = 0;
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const heroBottom = heroEl ? heroEl.offsetHeight : 0;

  /* 1. opaque vs transparent */
  if (y > heroBottom * 0.6) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  /* 2. hide on scroll down, show on scroll up
        (only after we've left the hero) */
  if (y > heroBottom) {
    if (y > lastScrollY + 6) {
      navbar.classList.add('hide');
    } else if (y < lastScrollY - 4) {
      navbar.classList.remove('hide');
    }
  } else {
    navbar.classList.remove('hide');
  }

  lastScrollY = y;

  /* 3. progress bar */
  updateProgress();

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

/* mobile hamburger */
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* =====================
   ACTIVE PILL — slides under the active nav link
   ===================== */
function movePill(anchor) {
  if (!anchor || !navPill) return;
  const ulRect     = navLinks.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  navPill.style.opacity = '1';
  navPill.style.left    = (anchorRect.left - ulRect.left) + 'px';
  navPill.style.width   = anchorRect.width + 'px';
}

function hidePill() {
  if (navPill) navPill.style.opacity = '0';
}

/* hover: pill follows mouse */
navAnchors.forEach(a => {
  a.addEventListener('mouseenter', () => movePill(a));
});
navLinks.addEventListener('mouseleave', () => {
  /* return pill to active section link, or hide */
  const active = navLinks.querySelector('a.active');
  active ? movePill(active) : hidePill();
});

/* =====================
   ACTIVE NAV LINK — highlight current section via IntersectionObserver
   ===================== */
const sections = document.querySelectorAll('section[id]');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const match = navLinks.querySelector(`a[href="#${entry.target.id}"]`);
      if (match) {
        match.classList.add('active');
        /* only move pill if mouse isn't hovering */
        if (!navLinks.matches(':hover')) movePill(match);
      }
    }
  });
}, { threshold: 0.45 });

sections.forEach(s => activeObserver.observe(s));


/* =====================
   SCROLL REVEAL — fade up on scroll into view
   ===================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling reveals slightly
      const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
      let delay = 0;
      siblings.forEach((sib) => {
        if (sib === entry.target) {
          entry.target.style.transitionDelay = delay + 's';
        }
        delay += 0.07;
      });

      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* =====================
   SMOOTH SCROLL — override for nav links (cross-browser)
   ===================== */
navAnchors.forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* =====================
   UI/UX PROJECT SLIDESHOW MODAL
   Opens via the "Open Project" buttons on the
   Interactive Web Prototype card. Auto-advances on
   a timer; any manual interaction (arrow, dot, swipe-
   like click) pauses autoplay so it stops fighting
   the user, then resumes after a short idle period.
   ===================== */

const uiuxModal        = document.getElementById('uiuxModal');
const uiuxModalBackdrop= document.getElementById('uiuxModalBackdrop');
const uiuxModalClose   = document.getElementById('uiuxModalClose');
const uiuxSlides       = document.querySelectorAll('#uiuxSlides .uiux-slide');
const uiuxDotBtns      = document.querySelectorAll('#uiuxDots .uiux-dot-btn');
const uiuxPrevBtn      = document.getElementById('uiuxPrev');
const uiuxNextBtn      = document.getElementById('uiuxNext');

const UIUX_AUTOPLAY_MS = 2000;   // time between auto-advances
const UIUX_RESUME_MS   = 6000;   // how long to wait after manual input before autoplay resumes

let uiuxCurrent       = 0;
let uiuxAutoplayTimer = null;
let uiuxResumeTimer   = null;

function uiuxShowSlide(index) {
  uiuxCurrent = (index + uiuxSlides.length) % uiuxSlides.length;

  uiuxSlides.forEach((slide, i) => slide.classList.toggle('active', i === uiuxCurrent));
  uiuxDotBtns.forEach((dot, i) => dot.classList.toggle('active', i === uiuxCurrent));
}

function uiuxNextSlide() {
  uiuxShowSlide(uiuxCurrent + 1);
}

function uiuxStartAutoplay() {
  uiuxStopAutoplay();
  uiuxAutoplayTimer = setInterval(uiuxNextSlide, UIUX_AUTOPLAY_MS);
}

function uiuxStopAutoplay() {
  if (uiuxAutoplayTimer) {
    clearInterval(uiuxAutoplayTimer);
    uiuxAutoplayTimer = null;
  }
}

/* called whenever the user manually navigates —
   pause autoplay briefly so it doesn't yank the
   slide away right after they picked one */
function uiuxPauseThenResume() {
  uiuxStopAutoplay();
  if (uiuxResumeTimer) clearTimeout(uiuxResumeTimer);
  uiuxResumeTimer = setTimeout(uiuxStartAutoplay, UIUX_RESUME_MS);
}

function openUiuxSlideshow() {
  uiuxShowSlide(0);
  uiuxModal.classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent background scroll while modal is open
  uiuxStartAutoplay();
}

function closeUiuxSlideshow() {
  uiuxModal.classList.remove('open');
  document.body.style.overflow = '';
  uiuxStopAutoplay();
  if (uiuxResumeTimer) clearTimeout(uiuxResumeTimer);
}

uiuxModalClose.addEventListener('click', closeUiuxSlideshow);
uiuxModalBackdrop.addEventListener('click', closeUiuxSlideshow);

uiuxPrevBtn.addEventListener('click', () => {
  uiuxShowSlide(uiuxCurrent - 1);
  uiuxPauseThenResume();
});

uiuxNextBtn.addEventListener('click', () => {
  uiuxShowSlide(uiuxCurrent + 1);
  uiuxPauseThenResume();
});

uiuxDotBtns.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    uiuxShowSlide(i);
    uiuxPauseThenResume();
  });
});

/* close on Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && uiuxModal.classList.contains('open')) {
    closeUiuxSlideshow();
  }
});