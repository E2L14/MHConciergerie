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
      if (!time) { setError('booking-time', 'L\'heure est requise.'); valid = false; }

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
      { text: 'Une vraie tranquillité d\'esprit au quotidien, merci à l\'équipe.', author: 'Mehdi K.' },
      { text: 'Organisation parfaite pour notre événement d\'entreprise.', author: 'Sophie L.' }
    ];
    const userTestimonials = storage.get('testimonials', null);
    const list = Array.isArray(userTestimonials) && userTestimonials.length ? userTestimonials : defaultTestimonials;
    container.innerHTML = list.map(function (t) {
      return [
        '<div class="testimonial">',
        '  <div class="text">“' + t.text.replace(/</g, '&lt;') + '”</div>',
        '  <div class="author">' + (t.author || 'Client') + '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  // Formulaire de contact
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

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    setYear();
    bindNav();
    renderTestimonials();
    bindContactForm();

    // Gestion du header au scroll
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Menu mobile
    const menuButton = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    if (menuButton) {
        menuButton.addEventListener('click', function () {
            navList.classList.toggle('active');
            menuButton.setAttribute('aria-expanded',
                menuButton.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
            );
        });
    }

    // Gestion de l'affichage des champs de rendez-vous
    const requestAppointment = document.getElementById('request-appointment');
    const appointmentFields = document.getElementById('appointment-fields');
    const appointmentDate = document.getElementById('appointment-date');
    const timeSlots = document.querySelectorAll('input[name="timeSlot"]');

    if (requestAppointment && appointmentFields) {
      // Définir la date minimale à aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      if (appointmentDate) {
        appointmentDate.setAttribute('min', today);
      }

      requestAppointment.addEventListener('change', function() {
        if (this.checked) {
          // Afficher les champs
          appointmentFields.classList.add('show');
          // Rendre les champs requis
          if (appointmentDate) appointmentDate.setAttribute('required', 'required');
          timeSlots.forEach(slot => slot.setAttribute('required', 'required'));
        } else {
          // Masquer les champs
          appointmentFields.classList.remove('show');
          // Retirer l'obligation
          if (appointmentDate) appointmentDate.removeAttribute('required');
          timeSlots.forEach(slot => slot.removeAttribute('required'));
          // Réinitialiser les valeurs
          if (appointmentDate) appointmentDate.value = '';
          timeSlots.forEach(slot => slot.checked = false);
        }
      });
    }

    // Gestion de l'option rendez-vous
    const rdvCheckbox = document.getElementById('request-rdv');
    const rdvSection = document.getElementById('rdv-section');
    const timeButtons = document.querySelectorAll('.time-btn');
    const selectedTimeInput = document.getElementById('selected-time');

    if (rdvCheckbox && rdvSection) {
        rdvCheckbox.addEventListener('change', function() {
            rdvSection.style.display = this.checked ? 'block' : 'none';
        });
    }

    timeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            timeButtons.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedTimeInput.value = this.dataset.time;
        });
    });

    const askRdv = document.getElementById('ask-rdv');
    const rdvFields = document.getElementById('rdv-fields');
    const rdvDate = document.getElementById('rdv-date');
    const timeRadios = () => document.querySelectorAll('input[name="creneau"]');
    const tz = document.getElementById('tz');
    const pageUrl = document.getElementById('page_url');

    // Min date = aujourd'hui
    if (rdvDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      rdvDate.min = `${yyyy}-${mm}-${dd}`;
    }

    // Contexte email
    if (tz) tz.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (pageUrl) pageUrl.value = window.location.href;

    function toggleRdvFields(checked) {
      rdvFields.classList.toggle('show', checked);
      rdvFields.setAttribute('aria-hidden', String(!checked));
      askRdv.setAttribute('aria-expanded', String(checked));

      // Champs requis dynamiques
      if (rdvDate) rdvDate.required = checked;
      timeRadios().forEach(r => (r.required = checked));

      // Reset si décoché
      if (!checked) {
        if (rdvDate) rdvDate.value = '';
        timeRadios().forEach(r => (r.checked = false));
      }
    }

    if (askRdv && rdvFields) {
      toggleRdvFields(askRdv.checked);
      askRdv.addEventListener('change', () => toggleRdvFields(askRdv.checked));
    }

    // Gestion du rendez-vous dans le formulaire de contact
    const checkbox = document.getElementById('request-appointment');
    const fields = document.getElementById('appointment-fields');
    
    if (checkbox && fields) {
      console.log('Checkbox et fields trouvés'); // Pour debug
      
      checkbox.addEventListener('change', function() {
        console.log('Checkbox cliqué, checked:', this.checked); // Pour debug
        
        if (this.checked) {
          fields.style.display = 'flex';
          fields.style.flexDirection = 'column';
          fields.style.gap = '1.5rem';
          
          // Rendre les champs requis
          const dateInput = document.getElementById('appointment-date');
          const radios = document.querySelectorAll('input[name="timeSlot"]');
          
          if (dateInput) dateInput.required = true;
          radios.forEach(r => r.required = true);
          
        } else {
          fields.style.display = 'none';
          
          // Retirer required et reset
          const dateInput = document.getElementById('appointment-date');
          const radios = document.querySelectorAll('input[name="timeSlot"]');
          
          if (dateInput) {
            dateInput.required = false;
            dateInput.value = '';
          }
          radios.forEach(r => {
            r.required = false;
            r.checked = false;
          });
        }
      });
      
      // Date minimale = aujourd'hui
      const dateInput = document.getElementById('appointment-date');
      if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
      }
    } else {
      console.log('Checkbox ou fields non trouvés'); // Pour debug
    }
  });
})();


