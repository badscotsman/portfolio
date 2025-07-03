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

  window.addEventListener('DOMContentLoaded', () => {
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
            contactMsg.textContent = result.message || 'Thank you for your message! I will get back to you soon.';
            contactMsg.className = 'mt-3 text-center text-success';
            form.reset();
            form.classList.remove('was-validated');
          } else {
            console.error('Form submission error:', result);
            contactMsg.textContent = result.message || 'An error occurred. Please try again.';
            contactMsg.className = 'mt-3 text-center text-danger';
          }
        } catch (error) {
          console.error('Fetch error:', error);
          contactMsg.textContent = 'A network error occurred. Please check your connection and try again.';
          contactMsg.className = 'mt-3 text-center text-danger';
        } finally {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      });
    }

    // --- Scroll-triggered fade-in animation ---
    const observerOptions = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));

    // --- Lightbox for project images ---
    document.querySelectorAll('.project-image-link, .project-video-link').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();

        const imageLink = trigger.closest('.project-image-link');
        const videoLink = trigger.closest('.project-video-link');

        if (imageLink) {
          const imageSrc = imageLink.getAttribute('href');
          const imageAlt = imageLink.querySelector('img').getAttribute('alt');
          basicLightbox.create(`<img src="${imageSrc}" alt="${imageAlt}">`).show();
        } else if (videoLink) {
          const videoSrc = videoLink.dataset.videoSrc;
          basicLightbox.create(`
            <video controls autoplay style="max-width: 90vw; max-height: 90vh;">
              <source src="${videoSrc}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          `).show();
        }
      });
    });

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
      handleScrollEffects(); // Run on page load
    }

    // --- tsParticles Fireflies Effect ---
    if (typeof tsParticles !== 'undefined') {
      tsParticles.load({
        id: "particles-hero",
        options: {
          fullScreen: {
            enable: false // This is the crucial fix
          },
          particles: {
            number: {
              value: 100,
              density: {
                enable: true,
              }
            },
            color: {
              value: "#ffd700"
            },
            shape: {
              type: "circle"
            },
            opacity: {
              value: { min: 0.1, max: 0.5 },
              animation: {
                enable: true,
                speed: 1.5,
                sync: false
              }
            },
            size: {
              value: { min: 1, max: 3 }
            },
            move: {
              enable: true,
              speed: 0.6,
              direction: "none",
              random: true,
              straight: false,
              outModes: "out"
            }
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse"
              }
            },
            modes: {
              repulse: {
                distance: 50,
                duration: 0.4
              }
            }
          },
          background: {
            color: "transparent"
          }
        }
      });
    }
  })
})()