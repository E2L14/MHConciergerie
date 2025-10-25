(function () {
  'use strict';

  // Utilitaires simples
  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $all(selector, scope) { return Array.from((scope || document).querySelectorAll(selector)); }

  function setYear() { const yearEl = $('#year'); if (yearEl) yearEl.textContent = String(new Date().getFullYear()); }

  // Stockage local de façon sûre
  const storage = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }
  };

  // Modal de réservation injecté une seule fois
  function injectBookingModal() {
    if ($('.modal-backdrop')) return; // déjà injecté
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">',
      '  <div class="modal-header">',
      '    <h3 id="booking-title" class="modal-title">Prendre rendez-vous</h3>',
      '    <button class="modal-close" aria-label="Fermer">×</button>',
      '  </div>',
      '  <div class="modal-body">',
      '    <form id="booking-form" class="form" novalidate>',
      '      <div class="form-row">',
      '        <label for="booking-name">Nom complet</label>',
      '        <input id="booking-name" name="name" type="text" placeholder="Votre nom" required />',
      '        <small class="error" data-error-for="booking-name"></small>',
      '      </div>',
      '      <div class="form-row">',
      '        <label for="booking-email">Email</label>',
      '        <input id="booking-email" name="email" type="email" placeholder="vous@exemple.com" required />',
      '        <small class="error" data-error-for="booking-email"></small>',
      '      </div>',
      '      <div class="form-row">',
      '        <label for="booking-date">Date</label>',
      '        <input id="booking-date" name="date" type="date" required />',
      '        <small class="error" data-error-for="booking-date"></small>',
      '      </div>',
      '      <div class="form-row">',
      '        <label for="booking-time">Heure</label>',
      '        <input id="booking-time" name="time" type="time" required />',
      '        <small class="error" data-error-for="booking-time"></small>',
      '      </div>',
      '      <div class="form-row">',
      '        <label for="booking-message">Message</label>',
      '        <textarea id="booking-message" name="message" rows="4" placeholder="Votre message"></textarea>',
      '      </div>',
      '      <button type="submit" class="btn btn-primary">Confirmer</button>',
      '      <p class="form-feedback" id="booking-feedback" role="status" aria-live="polite"></p>',
      '    </form>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(backdrop);

    function open() { backdrop.style.display = 'flex'; $('#booking-name')?.focus(); }
    function close() { backdrop.style.display = 'none'; }

    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    $('.modal-close', backdrop).addEventListener('click', close);

    $all('[data-open-booking]').forEach(function (btn) { btn.addEventListener('click', open); });

    // Validation et sauvegarde locale
    $('#booking-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const name = $('#booking-name').value.trim();
      const email = $('#booking-email').value.trim();
      const date = $('#booking-date').value;
      const time = $('#booking-time').value;
      const message = $('#booking-message').value.trim();

      let valid = true;
      function setError(id, msg) { const el = $('[data-error-for="' + id + '"]'); if (el) el.textContent = msg || ''; }
      setError('booking-name');
      setError('booking-email');
      setError('booking-date');
      setError('booking-time');

      if (!name) { setError('booking-name', 'Le nom est requis.'); valid = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('booking-email', 'Email invalide.'); valid = false; }
      if (!date) { setError('booking-date', 'La date est requise.'); valid = false; }
      if (!time) { setError('booking-time', "L'heure est requise."); valid = false; }

      if (!valid) return;

      const bookings = storage.get('bookings', []);
      bookings.push({ id: Date.now(), name, email, date, time, message });
      storage.set('bookings', bookings);

      const feedback = $('#booking-feedback');
      feedback.textContent = 'Merci, votre demande a été enregistrée. Nous vous recontactons rapidement.';
      // Réinitialise le formulaire
      this.reset();
      // Ferme après un court délai
      setTimeout(close, 900);
    });
  }

  // Rendu des témoignages si la section est présente
  function renderTestimonials() {
    const container = $('#testimonials');
    if (!container) return;
    /**
     * Gestion simple: tableau statique + possibilité de charger depuis localStorage
     * Ajoutez de nouveaux avis via localStorage.setItem('testimonials', JSON.stringify([...])) dans la console
     */
    const defaultTestimonials = [
      { text: 'Service impeccable, rapidité et professionnalisme. Je recommande !', author: 'Camille D.' },
      { text: "Une vraie tranquillité d'esprit au quotidien, merci à l'équipe.", author: 'Mehdi K.' },
      { text: "Organisation parfaite pour notre événement d'entreprise.", author: 'Sophie L.' }
    ];
    const userTestimonials = storage.get('testimonials', null);
    const list = Array.isArray(userTestimonials) && userTestimonials.length ? userTestimonials : defaultTestimonials;
    container.innerHTML = list.map(function (t) {
      return [
        '<div class="testimonial">',
        '  <div class="text">“' + String(t.text).replace(/</g, '&lt;') + '”</div>',
        '  <div class="author">' + (t.author || 'Client') + '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  // Formulaire de contact (stockage en localStorage pour démo)
  function bindContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = $('#contact-name').value.trim();
      const email = $('#contact-email').value.trim();
      const message = $('#contact-message').value.trim();

      function setError(id, msg) { const el = $('[data-error-for="' + id + '"]'); if (el) el.textContent = msg || ''; }
      setError('contact-name');
      setError('contact-email');
      setError('contact-message');

      let valid = true;
      if (!name) { setError('contact-name', 'Le nom est requis.'); valid = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('contact-email', 'Email invalide.'); valid = false; }
      if (!message) { setError('contact-message', 'Merci de saisir un message.'); valid = false; }
      if (!valid) return;

      const messages = storage.get('contactMessages', []);
      messages.push({ id: Date.now(), name, email, message });
      storage.set('contactMessages', messages);

      const feedback = $('#contact-feedback');
      feedback.textContent = 'Message envoyé. Nous vous répondrons sous 24h.';
      form.reset();
    });
  }

  // Navigation mobile
  function bindNav() {
    const toggle = $('.nav-toggle');
    const list = $('#primary-menu');
    if (!toggle || !list) return;
    toggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      list.classList.toggle('show');
    });
  }

  // Animations et fonctionnalités additionnelles
  const animations = {
    fadeIn: function(element) {
        element.style.opacity = 0;
        let opacity = 0;
        const timer = setInterval(function() {
            if (opacity >= 1) {
                clearInterval(timer);
            }
            element.style.opacity = opacity;
            opacity += 0.1;
        }, 50);
    },

    scrollToSection: function(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    setYear();
    bindNav();
    injectBookingModal();
    renderTestimonials();
    bindContactForm();
  });
})();