const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
revealItems.forEach(item => revealObserver.observe(item));

const staggerGroups = document.querySelectorAll('.stagger-group');
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
staggerGroups.forEach(group => staggerObserver.observe(group));

const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const progress = document.querySelector('.scroll-progress span');
const header = document.querySelector('.site-header');
const navLinks = [...document.querySelectorAll('.nav-menu a')];
const sections = [...document.querySelectorAll('main section[id]')];
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? (scrollY / max) * 100 : 0;
  if (progress) progress.style.width = `${pct}%`;
  header?.classList.toggle('scrolled', scrollY > 18);

  let active = '';
  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 180) active = section.id;
  });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
  document.body.classList.add('has-pointer');
  const cursor = document.querySelector('.cursor-orb');
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const loop = () => {
    cx += (tx - cx) * .09; cy += (ty - cy) * .09;
    if (cursor) cursor.style.transform = `translate(${cx - 140}px, ${cy - 140}px)`;
    requestAnimationFrame(loop);
  };
  loop();

  const stage = document.querySelector('.hero-stage');
  const portrait = document.querySelector('.portrait-card');
  if (stage && portrait) {
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      portrait.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 7}deg) translate3d(${x * 7}px,${y * 5}px,0)`;
    });
    stage.addEventListener('pointerleave', () => portrait.style.transform = '');
  }

  document.querySelectorAll('.tool-card, .project-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * 3.5}deg) rotateY(${x * 4}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

// Services slider
const serviceSlider = document.querySelector('[data-service-slider]');
if (serviceSlider) {
  const slides = [...serviceSlider.querySelectorAll('.service-slide')];
  const dots = [...serviceSlider.querySelectorAll('.slider-dots button')];
  const prev = serviceSlider.querySelector('.slider-arrow.prev');
  const next = serviceSlider.querySelector('.slider-arrow.next');
  let serviceIndex = 0;
  let serviceTimer;
  const showService = (index) => {
    serviceIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === serviceIndex));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === serviceIndex));
  };
  const restartServiceTimer = () => {
    if (reduceMotion) return;
    clearInterval(serviceTimer);
    serviceTimer = setInterval(() => showService(serviceIndex + 1), 6500);
  };
  prev?.addEventListener('click', () => { showService(serviceIndex - 1); restartServiceTimer(); });
  next?.addEventListener('click', () => { showService(serviceIndex + 1); restartServiceTimer(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { showService(i); restartServiceTimer(); }));
  serviceSlider.addEventListener('mouseenter', () => clearInterval(serviceTimer));
  serviceSlider.addEventListener('mouseleave', restartServiceTimer);
  showService(0);
  restartServiceTimer();
}

// Project screenshot showcases — stacked device deck
for (const showcase of document.querySelectorAll('[data-showcase]')) {
  const stage = showcase.querySelector('.showcase-stage');
  const slides = [...showcase.querySelectorAll('.screen-shot')];
  const dots = [...showcase.querySelectorAll('.showcase-dots button')];
  const prev = showcase.querySelector('[data-prev]');
  const next = showcase.querySelector('[data-next]');
  let index = 0;
  let touchStartX = null;

  const render = () => {
    slides.forEach((slide, i) => {
      slide.classList.remove('is-active','is-left','is-right');
      const delta = (i - index + slides.length) % slides.length;
      if (delta === 0) slide.classList.add('is-active');
      else if (delta === 1) slide.classList.add('is-right');
      else slide.classList.add('is-left');
      slide.setAttribute('aria-current', delta === 0 ? 'true' : 'false');
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const go = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    render();
  };

  const openLightbox = (slide) => {
    const img = slide.querySelector('img');
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = lightbox?.querySelector('img');
    if (img && lightbox && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    }
  };

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));

  slides.forEach((slide, i) => slide.addEventListener('click', () => {
    if (i === index) openLightbox(slide);
    else go(i);
  }));

  stage?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'Enter') openLightbox(slides[index]);
  });

  stage?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  stage?.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const dx = endX - touchStartX;
    if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  render();
}

const imageLightbox = document.getElementById('imageLightbox');
const closeLightbox = () => {
  imageLightbox?.classList.remove('open');
  imageLightbox?.setAttribute('aria-hidden', 'true');
};
imageLightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
imageLightbox?.addEventListener('click', (event) => { if (event.target === imageLightbox) closeLightbox(); });
addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

// Reliable back-to-top behavior
const backToTop = document.getElementById('backToTop');
backToTop?.addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

// Theme toggle — dark is the default unless the visitor explicitly switches themes.
const themeToggle = document.getElementById('themeToggle');
const rootElement = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem('portfolio-theme');
const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
const applyTheme = (theme) => {
  rootElement.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  if (themeToggle) {
    const next = theme === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
    themeToggle.title = `Switch to ${next} mode`;
  }
  themeMeta?.setAttribute('content', theme === 'dark' ? '#06111d' : '#f4f8fc');
};
applyTheme(initialTheme);
themeToggle?.addEventListener('click', () => {
  applyTheme(rootElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});
