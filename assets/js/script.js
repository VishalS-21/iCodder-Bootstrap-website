/* iCodder site enhancements. This is a static frontend: no passwords or messages are sent to a server. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const safeRead = (key, fallback = []) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
    catch { return fallback; }
  };
  const safeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be disabled */ } };

  document.addEventListener('DOMContentLoaded', () => {
    // Safer external links.
    $$('a[target="_blank"]').forEach(link => {
      const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener'); rel.add('noreferrer'); link.setAttribute('rel', [...rel].join(' '));
    });

    // Theme preference, shared by every page and saved only in this browser.
    const storedTheme = (() => { try { return localStorage.getItem('icodder-theme'); } catch { return null; } })();
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const setTheme = theme => {
      document.documentElement.dataset.theme = theme;
      const button = $('#themeToggle');
      if (button) { button.textContent = theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'; button.setAttribute('aria-pressed', String(theme === 'dark')); }
    };
    setTheme(storedTheme || (systemDark ? 'dark' : 'light'));
    const nav = $('.navbar .navbar-collapse');
    if (nav && !$('#themeToggle')) {
      const button = document.createElement('button');
      button.type = 'button'; button.id = 'themeToggle'; button.className = 'btn btn-sm btn-outline-light theme-toggle ms-lg-3 my-2 my-lg-0';
      button.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(next); try { localStorage.setItem('icodder-theme', next); } catch { /* storage may be disabled */ }
      });
      nav.append(button); setTheme(document.documentElement.dataset.theme || 'light');
    }

    // Highlight the current page in existing navigation menus.
    const current = location.pathname.split('/').pop() || 'index.html';
    $$('.navbar a.nav-link').forEach(link => {
      const target = (link.getAttribute('href') || '').split('?')[0];
      if (target === current) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); }
      else if (target && target.endsWith('.html')) { link.classList.remove('active'); link.removeAttribute('aria-current'); }
    });

    // Any navbar search sends the user to the tutorial library with their query.
    $$('.site-search, .navbar form[role="search"]').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const input = $('input[type="search"]', form);
        const query = input ? input.value.trim() : '';
        if (current === 'tutorial.html' && $('#tutorialSearch')) {
          $('#tutorialSearch').value = query; $('#tutorialSearch').dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          location.href = `tutorial.html${query ? `?q=${encodeURIComponent(query)}` : ''}`;
        }
      });
    });

    // Tutorial library: live search, category filtering, saved tutorials, completion tracking.
    const grid = $('#tutorialGrid');
    if (grid) {
      const cards = $$('.tutorial-item', grid);
      const search = $('#tutorialSearch');
      let activeCategory = 'all'; let savedOnly = false;
      const saved = new Set(safeRead('icodder-saved-tutorials'));
      const completed = new Set(safeRead('icodder-completed-tutorials'));
      const updateProgress = () => {
        const count = completed.size; const total = cards.length;
        const label = $('#progressLabel'); const bar = $('#learningProgress'); const progress = $('.progress');
        if (label) label.textContent = `${count} of ${total} completed`;
        if (bar) bar.style.width = `${total ? Math.min(100, count / total * 100) : 0}%`;
        if (progress) progress.setAttribute('aria-valuenow', String(count));
      };
      const updateButtons = () => {
        cards.forEach(card => {
          const key = card.dataset.category;
          const save = $(`[data-save="${key}"]`, card); const done = $(`[data-complete="${key}"]`, card);
          if (save) { const isSaved = saved.has(key); save.textContent = isSaved ? '♥' : '♡'; save.classList.toggle('btn-danger', isSaved); save.classList.toggle('btn-outline-secondary', !isSaved); save.setAttribute('aria-pressed', String(isSaved)); }
          if (done) { const isDone = completed.has(key); done.textContent = isDone ? 'Completed ✓' : 'Mark done'; done.classList.toggle('btn-success', isDone); done.classList.toggle('btn-outline-success', !isDone); done.setAttribute('aria-pressed', String(isDone)); }
        });
      };
      const filterCards = () => {
        const query = (search?.value || '').trim().toLowerCase(); let visible = 0;
        cards.forEach(card => {
          const key = card.dataset.category; const content = `${card.dataset.search} ${card.textContent}`.toLowerCase();
          const show = (activeCategory === 'all' || key === activeCategory) && (!query || content.includes(query)) && (!savedOnly || saved.has(key));
          card.classList.toggle('d-none', !show); if (show) visible++;
        });
        $('#emptyState')?.classList.toggle('d-none', visible !== 0);
      };
      $$('.filter-row [data-filter]').forEach(button => button.addEventListener('click', () => {
        activeCategory = button.dataset.filter; savedOnly = false;
        $$('.filter-row [data-filter]').forEach(b => { const active = b === button; b.classList.toggle('btn-primary', active); b.classList.toggle('active', active); b.classList.toggle('btn-outline-primary', !active); });
        $('#showSaved')?.classList.remove('btn-danger'); $('#showSaved')?.classList.add('btn-outline-secondary'); filterCards();
      }));
      $('#showSaved')?.addEventListener('click', () => { savedOnly = !savedOnly; $('#showSaved').classList.toggle('btn-danger', savedOnly); $('#showSaved').classList.toggle('btn-outline-secondary', !savedOnly); filterCards(); });
      search?.addEventListener('input', filterCards);
      $('#resetFilters')?.addEventListener('click', () => { if (search) search.value = ''; activeCategory = 'all'; savedOnly = false; const all = $('[data-filter="all"]'); all?.click(); filterCards(); });
      grid.addEventListener('click', event => {
        const saveButton = event.target.closest('[data-save]'); const doneButton = event.target.closest('[data-complete]');
        if (saveButton) { const key = saveButton.dataset.save; saved.has(key) ? saved.delete(key) : saved.add(key); safeWrite('icodder-saved-tutorials', [...saved]); updateButtons(); filterCards(); }
        if (doneButton) { const key = doneButton.dataset.complete; completed.has(key) ? completed.delete(key) : completed.add(key); safeWrite('icodder-completed-tutorials', [...completed]); updateButtons(); updateProgress(); }
      });
      const initialQuery = new URLSearchParams(location.search).get('q');
      if (initialQuery && search) search.value = initialQuery;
      updateButtons(); updateProgress(); filterCards();
    }

    // Contact form: real client-side validation and clear demo-only confirmation.
    const contactForm = $$('form').find(form => $('textarea', form) && $('input[type="email"]', form));
    if (contactForm) {
      const email = $('input[type="email"]', contactForm); const message = $('textarea', contactForm);
      email.required = true; email.setAttribute('autocomplete', 'email'); message.required = true; message.minLength = 10;
      const nameInput = $('input[type="text"]', contactForm);
      if (nameInput) nameInput.required = true;
      contactForm.noValidate = false;
      contactForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!contactForm.reportValidity()) return;
        let status = $('.form-status', contactForm);
        if (!status) { status = document.createElement('div'); status.className = 'alert alert-success form-status mt-3'; status.setAttribute('role', 'status'); contactForm.append(status); }
        status.textContent = 'Thanks! Your form passed validation. This demo does not send or store messages; connect a form service or backend to receive submissions.';
        contactForm.reset();
      });
    }

    // Demo authentication modals: never pretend to authenticate or store credentials.
    $$('#loginModal form, #signupModal form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      let status = $('.demo-auth-status', form);
      if (!status) { status = document.createElement('div'); status.className = 'alert alert-warning demo-auth-status mt-3'; status.setAttribute('role', 'status'); form.append(status); }
      status.textContent = 'Demo interface only: authentication is not connected to a server. Do not enter a real password.';
    }));

    // Accessible back-to-top control.
    const topButton = document.createElement('button'); topButton.id = 'backToTop'; topButton.type = 'button'; topButton.className = 'btn btn-primary'; topButton.textContent = '↑'; topButton.setAttribute('aria-label', 'Back to top');
    document.body.append(topButton);
    const checkScroll = () => topButton.classList.toggle('is-visible', window.scrollY > 350);
    window.addEventListener('scroll', checkScroll, { passive: true }); checkScroll();
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });
})();
