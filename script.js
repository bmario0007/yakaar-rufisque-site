// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Navigation mobile et section active ----------
const header = document.querySelector('.site-header');
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('main-nav');
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];

function setMenuState(isOpen) {
  header.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
}

navToggle.addEventListener('click', () => {
  setMenuState(!header.classList.contains('is-open'));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    setMenuState(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('is-open')) {
    setMenuState(false);
    navToggle.focus();
  }
});

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  const visibleSection = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visibleSection) return;

  navLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${visibleSection.target.id}`;
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}, { rootMargin: '-25% 0px -65% 0px', threshold: [0, 0.1, 0.5] });

sections.forEach((section) => observer.observe(section));

// ---------- Chiffres clés ----------
const statObserver = new IntersectionObserver((entries, observerInstance) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const stat = entry.target;
    const target = Number(stat.dataset.count);
    const prefix = stat.dataset.prefix || '';
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / 900, 1);
      stat.textContent = `${prefix}${Math.round(target * progress)}`;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
    observerInstance.unobserve(stat);
  });
}, { threshold: 0.65 });

document.querySelectorAll('[data-count]').forEach((stat) => statObserver.observe(stat));

// ---------- Galerie ----------
const galleryFilters = document.querySelectorAll('.gallery-filter');
const galleryTiles = document.querySelectorAll('.gallery-tile');
const lightbox = document.getElementById('galleryLightbox');
const lightboxImage = lightbox.querySelector('img');

galleryFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    galleryFilters.forEach((button) => {
      const isActive = button === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    galleryTiles.forEach((tile) => tile.classList.toggle('is-hidden', category !== 'all' && tile.dataset.category !== category));
  });
});

galleryTiles.forEach((tile) => tile.addEventListener('click', () => {
  lightboxImage.src = tile.dataset.image;
  lightboxImage.alt = tile.dataset.alt;
  lightbox.showModal();
}));

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

// ---------- Contact form ----------
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

function setFieldError(name, message) {
  const errorEl = form.querySelector(`.field-error[data-for="${name}"]`);
  const field = form.elements[name];
  if (errorEl) errorEl.textContent = message || '';
  if (field) field.setAttribute('aria-invalid', String(Boolean(message)));
}

function validate(data) {
  let isValid = true;

  if (!data.fullname.trim()) {
    setFieldError('fullname', 'Merci d\u2019indiquer votre nom complet.');
    isValid = false;
  } else {
    setFieldError('fullname', '');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(data.email.trim())) {
    setFieldError('email', 'Merci d\u2019indiquer une adresse email valide.');
    isValid = false;
  } else {
    setFieldError('email', '');
  }

  if (!data.subject) {
    setFieldError('subject', 'Merci de choisir un sujet.');
    isValid = false;
  } else {
    setFieldError('subject', '');
  }

  if (!data.message.trim() || data.message.trim().length < 10) {
    setFieldError('message', 'Votre message doit contenir au moins 10 caract\u00e8res.');
    isValid = false;
  } else {
    setFieldError('message', '');
  }

  return isValid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = {
    fullname: form.fullname.value,
    email: form.email.value,
    phone: form.phone.value,
    subject: form.subject.value,
    message: form.message.value,
  };

  if (!validate(data)) {
    note.textContent = 'Merci de corriger les champs indiqu\u00e9s avant d\u2019envoyer.';
    note.dataset.state = 'error';
    return;
  }

  const endpoint = form.dataset.formEndpoint;
  const submitButton = form.querySelector('button[type="submit"]');

  if (!endpoint) {
    note.textContent = 'Le formulaire est prêt à être connecté. Contactez-nous par WhatsApp pour une réponse immédiate.';
    note.dataset.state = 'success';
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Envoi en cours…';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Envoi impossible');
    note.textContent = 'Merci, votre message a bien été envoyé.';
    note.dataset.state = 'success';
    form.reset();
  } catch {
    note.textContent = 'L’envoi a échoué. Réessayez dans quelques instants ou contactez-nous par WhatsApp.';
    note.dataset.state = 'error';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Envoyer le message';
  }
});
