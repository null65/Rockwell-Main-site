(function () {
  /* ------------------------------------------------------------------
     Site config — flip when going live / adding analytics
     ------------------------------------------------------------------ */
  const ROCKWELL = {
    cookieConsent: {
      // Banner is off on localhost / file:// until live. Add production hosts below.
      // Preview anytime with ?cookies=preview  ·  reset with ?cookies=reset
      liveHosts: [
        'inkjetservice.co.uk',
        'www.inkjetservice.co.uk',
        'rockwellhitec.co.uk',
        'www.rockwellhitec.co.uk'
      ],
      forceEnable: false,
      storageKey: 'rockwell_cookie_consent',
      // When you add analytics, put the loader here — only runs after Accept.
      onAccept: function () {
        // Example (Umami / Matomo / Plausible): load script here after consent.
      },
      onReject: function () {
        // Optional: clear non-essential cookies / stop tracking.
      }
    }
  };

  /* Scroll reveal */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* Contact form */
  const form = document.getElementById('contactForm');
  if (form) {
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }

      const payload = {
        fname: document.getElementById('fname').value,
        lname: document.getElementById('lname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };

      try {
        const res = await fetch('https://amt.driverjack.co.uk/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          form.reset();
          if (status) {
            status.textContent = 'Thanks — your message has been sent. An engineer will respond shortly.';
            status.className = 'form-status is-success';
          } else {
            alert('Thanks — your message has been sent.');
          }
        } else {
          const msg = 'Something went wrong. Please email info@inkjetservice.co.uk or call 01707 269086.';
          if (status) {
            status.textContent = msg;
            status.className = 'form-status is-error';
          } else {
            alert(msg);
          }
        }
      } catch (err) {
        const msg = 'Network error. Please email info@inkjetservice.co.uk or call 01707 269086.';
        if (status) {
          status.textContent = msg;
          status.className = 'form-status is-error';
        } else {
          alert(msg);
        }
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  /* Cookie consent — wired for live hosts; dormant until then */
  initCookieConsent(ROCKWELL.cookieConsent);

  function initCookieConsent(cfg) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cookies') === 'reset') {
      try { localStorage.removeItem(cfg.storageKey); } catch (e) { /* ignore */ }
    }

    const host = window.location.hostname;
    const isLive = cfg.liveHosts.indexOf(host) !== -1;
    const preview = params.get('cookies') === 'preview';
    const enabled = cfg.forceEnable || isLive || preview;
    if (!enabled) return;

    let choice = null;
    try { choice = localStorage.getItem(cfg.storageKey); } catch (e) { choice = null; }

    if (choice === 'accepted') {
      if (typeof cfg.onAccept === 'function') cfg.onAccept();
      return;
    }
    if (choice === 'rejected') {
      if (typeof cfg.onReject === 'function') cfg.onReject();
      return;
    }

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    banner.setAttribute('aria-describedby', 'cookie-banner-desc');
    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<div class="cookie-banner-copy">' +
          '<p id="cookie-banner-title" class="cookie-banner-title">Cookies</p>' +
          '<p id="cookie-banner-desc">We use essential cookies to make this site work. If we add optional analytics later, we’ll only use them if you accept. See our <a href="privacy.html">privacy policy</a>.</p>' +
        '</div>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-outline cookie-btn-reject">Essential only</button>' +
          '<button type="button" class="btn btn-dark cookie-btn-accept">Accept</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });

    function save(value) {
      try { localStorage.setItem(cfg.storageKey, value); } catch (e) { /* ignore */ }
      banner.classList.remove('is-visible');
      window.setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 320);
      if (value === 'accepted' && typeof cfg.onAccept === 'function') cfg.onAccept();
      if (value === 'rejected' && typeof cfg.onReject === 'function') cfg.onReject();
    }

    banner.querySelector('.cookie-btn-accept').addEventListener('click', function () {
      save('accepted');
    });
    banner.querySelector('.cookie-btn-reject').addEventListener('click', function () {
      save('rejected');
    });
  }
})();
