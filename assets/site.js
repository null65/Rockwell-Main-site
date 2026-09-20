(function () {
  /* ------------------------------------------------------------------
     Site config — brand by host, cookies, forms
     ------------------------------------------------------------------ */
  const ROCKWELL = {
    brands: {
      inkjet: {
        id: 'inkjet',
        company: 'Inkjet Service',
        legal: 'Rockwell Hitec Limited (trading as Inkjet Service)',
        primaryEmail: 'info@inkjetservice.co.uk',
        homeTitle: 'Epson Printer Repair & Servicing | Inkjet Service',
        homeDescription:
          'Nationwide Epson large format printer maintenance and repair. Inkjet Service is part of Rockwell Hitec Ltd — Epson-trained engineers, next-day breakdown cover.'
      },
      hitec: {
        id: 'hitec',
        company: 'Rockwell Hitec',
        legal: 'Rockwell Hitec Limited',
        primaryEmail: 'info@rockwellhitec.co.uk',
        homeTitle: 'Rockwell Hitec | Epson Printer & Projector Service',
        homeDescription:
          'Rockwell Hitec Ltd — established 1982. Nationwide Epson printer service and projector workshop repair through Inkjet Service.'
      }
    },
    cookieConsent: {
      // Banner is off on localhost / file:// until live. Preview: ?cookies=preview
      liveHosts: [
        'inkjetservice.co.uk',
        'www.inkjetservice.co.uk',
        'rockwellhitec.co.uk',
        'www.rockwellhitec.co.uk',
        'rockwellhitec.com',
        'www.rockwellhitec.com'
      ],
      forceEnable: false,
      storageKey: 'rockwell_cookie_consent',
      onAccept: function () {},
      onReject: function () {}
    }
  };

  /* Brand from hostname (or ?brand=inkjet|hitec for local preview) */
  const brand = resolveBrand();
  document.documentElement.setAttribute('data-brand', brand.id);
  applyBrandChrome(brand);

  function resolveBrand() {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('brand');
    if (override === 'hitec' || override === 'inkjet') {
      return ROCKWELL.brands[override];
    }

    const host = (window.location.hostname || '').replace(/^www\./, '').toLowerCase();
    if (host === 'rockwellhitec.co.uk' || host === 'rockwellhitec.com') {
      return ROCKWELL.brands.hitec;
    }
    if (host === 'inkjetservice.co.uk') {
      return ROCKWELL.brands.inkjet;
    }
    /* Local / preview default: Inkjet Service (primary day-to-day work) */
    return ROCKWELL.brands.inkjet;
  }

  function applyBrandChrome(b) {
    document.querySelectorAll('[data-brand-title]').forEach(function (el) {
      const key = el.getAttribute('data-brand-title');
      if (key === 'home') {
        document.title = b.homeTitle;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', b.homeDescription);
      }
    });

    document.querySelectorAll('[data-brand-label]').forEach(function (el) {
      el.textContent = b.company;
    });

    document.querySelectorAll('a[data-brand-email]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + b.primaryEmail);
      el.textContent = b.primaryEmail;
    });

    document.querySelectorAll('[data-brand-home-label]').forEach(function (el) {
      el.setAttribute('aria-label', b.company + ' home');
    });
  }

  /* Mark current area in footer when on a known live host */
  (function markFooterAreas() {
    const host = (window.location.hostname || '').replace(/^www\./, '').toLowerCase();
    document.querySelectorAll('.footer-areas a').forEach(function (a) {
      try {
        const href = a.getAttribute('href') || '';
        if (href.indexOf('mixers.html') !== -1 && /mixers\.html$/i.test(location.pathname)) {
          a.classList.add('is-current');
          return;
        }
        if (host && href.indexOf(host) !== -1) {
          a.classList.add('is-current');
        }
      } catch (e) {
        /* ignore */
      }
    });
  })();

  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* Contact form */
  const form = document.getElementById('contactForm');
  if (form) {
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('formStatus');
    const fallbackEmail = brand.primaryEmail;

    form.addEventListener('submit', async function (e) {
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
        message: document.getElementById('message').value,
        brand: brand.id,
        siteHost: window.location.hostname || ''
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
            status.textContent =
              'Thanks — your message has been sent. An engineer will respond shortly.';
            status.className = 'form-status is-success';
          } else {
            alert('Thanks — your message has been sent.');
          }
        } else {
          const msg =
            'Something went wrong. Please email ' +
            fallbackEmail +
            ' or call 01707 269086.';
          if (status) {
            status.textContent = msg;
            status.className = 'form-status is-error';
          } else {
            alert(msg);
          }
        }
      } catch (err) {
        const msg =
          'Network error. Please email ' + fallbackEmail + ' or call 01707 269086.';
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

  initCookieConsent(ROCKWELL.cookieConsent);

  function initCookieConsent(cfg) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cookies') === 'reset') {
      try {
        localStorage.removeItem(cfg.storageKey);
      } catch (e) {
        /* ignore */
      }
    }

    const host = window.location.hostname;
    const isLive = cfg.liveHosts.indexOf(host) !== -1;
    const preview = params.get('cookies') === 'preview';
    const enabled = cfg.forceEnable || isLive || preview;
    if (!enabled) return;

    let choice = null;
    try {
      choice = localStorage.getItem(cfg.storageKey);
    } catch (e) {
      choice = null;
    }

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
      try {
        localStorage.setItem(cfg.storageKey, value);
      } catch (e) {
        /* ignore */
      }
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
