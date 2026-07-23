// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Mobile nav toggle ----------
const header = document.querySelector('.site-header');
const navToggle = document.getElementById('navToggle');

navToggle.addEventListener('click', () => {
  const isOpen = header.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Contact form ----------
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

const RECIPIENT_EMAIL = 'contact@yakaar-rufisque.sn';

function setFieldError(name, message) {
  const errorEl = form.querySelector(`.field-error[data-for="${name}"]`);
  if (errorEl) errorEl.textContent = message || '';
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

form.addEventListener('submit', (event) => {
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

  // Pas de backend connecte pour l'instant : on ouvre le client mail
  // de l'utilisateur avec le message pre-rempli. A remplacer par un
  // vrai envoi (API / formulaire serveur) lors du deploiement.
  const subjectLine = `[Site Yakaar] ${data.subject} \u2014 ${data.fullname}`;
  const bodyLines = [
    `Nom : ${data.fullname}`,
    `Email : ${data.email}`,
    `T\u00e9l\u00e9phone : ${data.phone || 'non renseign\u00e9'}`,
    `Sujet : ${data.subject}`,
    '',
    data.message,
  ];
  const mailtoUrl = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

  window.location.href = mailtoUrl;

  note.textContent = 'Votre messagerie va s\u2019ouvrir avec le message pr\u00e9-rempli. Il ne reste qu\u2019\u00e0 l\u2019envoyer.';
  note.dataset.state = 'success';
  form.reset();
});
