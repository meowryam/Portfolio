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