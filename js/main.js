/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = theme => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = theme => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  setTheme(getPreferredTheme())

  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#bd-theme')

    if (!themeSwitcher) {
      return
    }

    const themeSwitcherText = document.querySelector('#bd-theme-text')
    const activeThemeIcon = themeSwitcher.querySelector('i')
    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    const svgOfActiveBtn = btnToActive.querySelector('i').className

    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active')
      element.setAttribute('aria-pressed', 'false')
    })

    btnToActive.classList.add('active')
    btnToActive.setAttribute('aria-pressed', 'true')
    activeThemeIcon.className = svgOfActiveBtn

    if (focus) {
      themeSwitcher.focus()
    }
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme())
    }
  })

  // Using DOMContentLoaded is appropriate because the 'defer' attribute on the <script> tag
  // in index.html guarantees that the DOM is fully parsed before this script executes.
  document.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme())

    document.querySelectorAll('[data-bs-theme-value]')
      .forEach(toggle => {
        toggle.addEventListener('click', () => {
          const theme = toggle.getAttribute('data-bs-theme-value')
          setStoredTheme(theme)
          setTheme(theme)
          showActiveTheme(theme, true)
        })
      })

    // --- Contact form ---
    const contactForm = document.getElementById('contact-form')
    const contactMsg = document.getElementById('contact-msg')

    const displayContactMessage = (message, isSuccess) => {
      contactMsg.textContent = message;
      contactMsg.className = `mt-3 text-center ${isSuccess ? 'text-success' : 'text-danger'}`;
    };

    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;

        if (!form.checkValidity()) {
          e.stopPropagation();
          form.classList.add('was-validated');
          return;
        }

        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;
        contactMsg.textContent = '';

        try {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (result.success) {
            displayContactMessage(result.message || 'Thank you for your message! I will get back to you soon.', true);
            form.reset();
            form.classList.remove('was-validated');
          } else {
            console.error('Form submission error:', result);
            displayContactMessage(result.message || 'An error occurred. Please try again.', false);
          }
        } catch (error) {
          console.error('Fetch error:', error);
          displayContactMessage('A network error occurred. Please check your connection and try again.', false);
        } finally {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      });
    }

    // --- Scroll-triggered fade-in animation ---
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));

    // --- Lightbox (Event Delegation) ---
    // This single listener handles clicks on any current or future project/gallery links.
    document.body.addEventListener('click', (e) => {
      const trigger = e.target.closest('.project-image-link, .project-video-link, .play-game-btn');
      if (!trigger) return;

      e.preventDefault();

      if (trigger.matches('.project-image-link, .project-video-link')) {
        let contentHtml = '';
        if (trigger.matches('.project-image-link')) {
          const imageSrc = trigger.getAttribute('href');
          const imageAlt = trigger.querySelector('img')?.getAttribute('alt') || 'Project image';
          contentHtml = `<img src="${imageSrc}" alt="${imageAlt}">`;
        } else if (trigger.matches('.project-video-link')) {
          const videoSrc = trigger.dataset.videoSrc;
          contentHtml = `
            <video controls autoplay style="max-width: 90vw; max-height: 90vh;">
              <source src="${videoSrc}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          `;
        }
        if (contentHtml) {
          basicLightbox.create(contentHtml).show();
        }
      } else if (trigger.matches('.play-game-btn')) {
        const embedUrl = trigger.dataset.embedUrl;
        if (!embedUrl) return;

        const contentHtml = `<div class="game-embed-container"><iframe src="${embedUrl}" allowfullscreen></iframe></div>`;

        const lightbox = basicLightbox.create(contentHtml, {
          className: 'game-lightbox', // Custom class for styling
          onShow: (instance) => {
            const container = instance.element().querySelector('.game-embed-container');
            const iframe = container.querySelector('iframe');

            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'game-fullscreen-btn';
            fullscreenBtn.title = 'Toggle Fullscreen';
            fullscreenBtn.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';

            fullscreenBtn.addEventListener('click', () => {
              if (iframe.requestFullscreen) iframe.requestFullscreen();
              else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen(); /* Safari */
            });
            container.appendChild(fullscreenBtn);
          }
        });
        lightbox.show();
      }
    });

    // --- Dynamic Projects ---
    const loadProjects = async () => {
      const container = document.getElementById('projects-container');
      if (!container) return;

      try {
        const response = await fetch('data/projects.json');
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const projects = await response.json();

        if (projects.length === 0) {
          container.innerHTML = '<p class="text-center col-12">More projects coming soon!</p>';
          return;
        }

        const projectsHtml = projects.map(project => {
          // Generate HTML for both primary and secondary tags, applying the correct classes
          const primaryTagsHtml = (project.primaryTags || []).map(tag => `<span class="badge text-bg-primary me-1">${tag}</span>`).join('');
          const secondaryTagsHtml = (project.secondaryTags || []).map(tag => `<span class="badge text-bg-secondary me-1">${tag}</span>`).join('');
          const tagsHtml = `${primaryTagsHtml} ${secondaryTagsHtml}`.trim();

          // Conditionally create the project link button HTML.
          const projectLinkHtml = project.projectUrl ?
            `<div class="mt-auto pt-3">
              <a href="${project.projectUrl}" class="btn btn-outline-primary" target="_blank" rel="noopener noreferrer">${project.projectUrlText || 'View Project'} <i class="bi bi-box-arrow-up-right"></i></a>
            </div>`
            : '';

          const mediaHtml = project.video ?
            `
            <div class="project-video-link" data-video-src="${project.video}">
              <video src="${project.video}" class="card-img-top" autoplay loop muted playsinline alt="${project.title} gameplay video"></video>
            </div>
            ` :
            `
            <a href="${project.image}" class="project-image-link">
              <img src="${project.image}" class="card-img-top" alt="${project.title} screenshot">
            </a>
            `;

          return `
          <div class="col-md-6">
            <div class="card h-100">
              ${mediaHtml}
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${project.title}</h5>
                <div class="mb-3">${tagsHtml}</div>
                <p class="card-text">${project.description}</p>
                ${projectLinkHtml}
              </div>
            </div>
          </div>
          `;
        }).join('');

        container.innerHTML = projectsHtml;
      } catch (error) {
        console.error('Failed to load projects:', error);
        container.innerHTML = '<p class="text-center text-danger col-12">Could not load projects at this time.</p>';
      }
    };

    loadProjects();

    // --- Dynamic Games ---
    async function loadGames() {
      const container = document.getElementById('games-container');
      if (!container) {
        console.error('Games container not found.');
        return;
      }

      try {
        const response = await fetch('data/games.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const games = await response.json();

        let gamesHTML = '';
        games.forEach(game => {
          const tagsHTML = game.tags.map(tag => `<span class="badge rounded-pill text-bg-primary me-1">${tag}</span>`).join('');
          
          // Conditionally add the "Play Now" button if the game is embeddable
          const playButtonHTML = game.embeddable
            ? `<button class="btn btn-sm btn-primary play-game-btn" data-embed-url="${game.embedUrl}">Play Now <i class="bi bi-play-fill"></i></button>`
            : '';
          
          // Check for the 'featured' flag and create the badge HTML
          const featuredBadgeHTML = game.featured
            ? `<div class="featured-badge"><i class="bi bi-star-fill"></i> Featured</div>`
            : '';

          gamesHTML += `
            <div class="col-lg-4 col-md-6">
              <div class="card h-100 shadow-sm">
                ${featuredBadgeHTML}
                <img src="${game.image}" class="card-img-top" alt="${game.title}">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${game.title}</h5>
                  <h6 class="card-subtitle mb-2 text-body-secondary">${game.jam}</h6>
                  <p class="card-text">${game.description}</p>
                  <div class="mt-auto pt-3">
                    <div class="mb-3">${tagsHTML}</div>
                    <a href="${game.itchioUrl}" class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener noreferrer">View on Itch.io <i class="bi bi-box-arrow-up-right"></i></a>
                    ${playButtonHTML}
                  </div>
                </div>
              </div>
            </div>`;
        });
        container.innerHTML = gamesHTML;
      } catch (error) {
        console.error('Could not load game jam data:', error);
        container.innerHTML = '<p class="text-center">Could not load game projects at this time. Please try again later.</p>';
      }
    }

    loadGames();

    // --- Scroll-based effects (Navbar & Back to Top) ---
    const navbar = document.querySelector('.navbar');
    const backToTopButton = document.querySelector('.back-to-top');

    if (navbar || backToTopButton) {
      const handleScrollEffects = () => {
        if (navbar) {
          window.scrollY > 50 ? navbar.classList.add('navbar-scrolled') : navbar.classList.remove('navbar-scrolled');
        }
        if (backToTopButton) {
          window.scrollY > 200 ? backToTopButton.classList.add('active') : backToTopButton.classList.remove('active');
        }
      };
      window.addEventListener('scroll', handleScrollEffects);
      handleScrollEffects();
    }

    // --- tsParticles Hero Section ---
    // Check if the required functions from the preset bundle are available
    if (typeof tsParticles !== 'undefined' && typeof loadFireflyPreset !== 'undefined') {
      (async () => {
        // Load the firefly preset into the engine
        await loadFireflyPreset(tsParticles);

        // Load the particles into the #particles-hero container
        // We merge the "firefly" preset with our own options to constrain it
        await tsParticles.load({
          id: "particles-hero",
          options: {
            preset: "firefly",
            fullScreen: { enable: false },
            background: { color: { value: "transparent" } }
          }
        });
      })();
    }
  })
})()