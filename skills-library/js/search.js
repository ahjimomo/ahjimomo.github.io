/* ============================================================
   search.js — Skills Library search and filter logic
   ============================================================

   How it works:
   1. Fetches skills.json and renders all skill cards on load
   2. Typing in the search box filters cards by title, description,
      useCase, and implementation fields
   3. Clicking a tag label filters by that tag
   4. Active filters (text + tag) combine — both must match
   5. "Show more" reveals additional cards beyond the default limit
   ============================================================ */

(function () {

  /* ---- Config ---- */
  const MOBILE_LIMIT  = 6;   /* cards shown by default on mobile */
  const DESKTOP_LIMIT = 9;   /* cards shown by default on desktop */
  const DESKTOP_BREAKPOINT = 900; /* px */

  /* ---- State ---- */
  let allSkills       = [];   /* full dataset from JSON */
  let filteredSkills  = [];   /* current filtered result */
  let activeTag       = null; /* currently selected tag (string or null) */
  let searchQuery     = '';   /* current search string */
  let showingAll      = false;/* whether "show more" has been clicked */


  /* ---- DOM refs ---- */
  const searchInput   = document.getElementById('skill-search');
  const tagButtons    = document.querySelectorAll('.tag-filter');
  const grid          = document.getElementById('skills-grid');
  const showMoreBtn   = document.getElementById('show-more');
  const resultsCount  = document.getElementById('results-count');


  /* ---- Fetch data and initialise ---- */
  fetch('../data/skills.json')
    .then(function (response) {
      if (!response.ok) throw new Error('Failed to load skills data');
      return response.json();
    })
    .then(function (data) {
      allSkills = data;
      applyFilters();
    })
    .catch(function (error) {
      grid.innerHTML = '<p class="skills-error">Could not load skills. Please try again later.</p>';
      console.error('Skills load error:', error);
    });


  /* ---- Search input handler ---- */
  searchInput.addEventListener('input', function () {
    searchQuery = this.value.trim().toLowerCase();
    showingAll  = false;
    applyFilters();
  });


  /* ---- Tag filter button handlers ---- */
  tagButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var clicked = this.dataset.tag;

      /* Toggle off if same tag clicked again */
      if (activeTag === clicked) {
        activeTag = null;
        this.classList.remove('is-active');
      } else {
        /* Deactivate all, activate clicked */
        tagButtons.forEach(function (btn) { btn.classList.remove('is-active'); });
        activeTag = clicked;
        this.classList.add('is-active');
      }

      showingAll = false;
      applyFilters();
    });
  });


  /* ---- Show more handler ---- */
  showMoreBtn.addEventListener('click', function () {
    showingAll = true;
    renderCards(filteredSkills);
  });


  /* ---- Core filter logic ---- */
  function applyFilters() {
    filteredSkills = allSkills.filter(function (skill) {

      /* Text search — checks title, description, useCase, implementation */
      var matchesSearch = true;
      if (searchQuery) {
        var haystack = [
          skill.title,
          skill.description,
          skill.useCase,
          skill.implementation
        ].join(' ').toLowerCase();

        matchesSearch = haystack.includes(searchQuery);
      }

      /* Tag filter — checks both useCase and implementation */
      var matchesTag = true;
      if (activeTag) {
        matchesTag = skill.useCase === activeTag || skill.implementation === activeTag;
      }

      return matchesSearch && matchesTag;
    });

    renderCards(filteredSkills);
    updateResultsCount(filteredSkills.length);
  }


  /* ---- Render cards into the grid ---- */
  function renderCards(skills) {
    var limit   = getLimit();
    var visible = showingAll ? skills : skills.slice(0, limit);

    if (skills.length === 0) {
      grid.innerHTML = '<p class="skills-empty">No skills match your search. Try different keywords or clear the filters.</p>';
      showMoreBtn.hidden = true;
      return;
    }

    grid.innerHTML = visible.map(function (skill) {
      return renderCard(skill);
    }).join('');

    /* Show/hide "show more" button */
    showMoreBtn.hidden = showingAll || skills.length <= limit;
  }


  /* ---- Build a single card's HTML ---- */
  function renderCard(skill) {
    return [
      '<article class="skill-card">',
      '  <div class="skill-card-tags">',
      '    <span class="skill-tag tag-use-case">' + escapeHtml(skill.useCase) + '</span>',
      '    <span class="skill-tag tag-implementation">' + escapeHtml(skill.implementation) + '</span>',
      '  </div>',
      '  <h3 class="skill-card-title">' + escapeHtml(skill.title) + '</h3>',
      '  <p class="skill-card-description">' + escapeHtml(skill.description) + '</p>',
      '  <a href="pages/' + escapeHtml(skill.slug) + '.html" class="skill-card-link">View skill →</a>',
      '</article>'
    ].join('\n');
  }


  /* ---- Update visible results count ---- */
  function updateResultsCount(count) {
    if (searchQuery || activeTag) {
      resultsCount.textContent = count === 1
        ? '1 skill found'
        : count + ' skills found';
      resultsCount.hidden = false;
    } else {
      resultsCount.hidden = true;
    }
  }


  /* ---- Get default visible limit based on screen width ---- */
  function getLimit() {
    return window.innerWidth >= DESKTOP_BREAKPOINT ? DESKTOP_LIMIT : MOBILE_LIMIT;
  }


  /* ---- Sanitise strings before inserting into HTML ---- */
  /* This prevents XSS — never insert raw user/external data into innerHTML */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

}());