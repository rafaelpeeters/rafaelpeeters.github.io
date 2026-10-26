let currentLanguage = 'fr';

document.addEventListener('DOMContentLoaded', () => {
  const languageButtons = {
    fr: document.getElementById('language-fr'),
    en: document.getElementById('language-en'),
  };
  const translatableElements = document.querySelectorAll('[data-en]');
  const translatableImages = document.querySelectorAll('[data-alt-en]');
  const toggleBtn = document.getElementById('toggle-projects-btn');
  const btnText = document.getElementById('toggle-projects-text');
  const btnIcon = document.getElementById('toggle-projects-icon');
  const extraProjects = document.querySelectorAll('.extra-project');
  const pageTitles = document.querySelectorAll('main h1, main h2, main h3, header a[href="#about"]');
  const contactForm = document.getElementById('contact-form');
  let isExpanded = false;

  translatableElements.forEach((element) => {
    element.dataset.fr = element.innerHTML;
  });

  translatableImages.forEach((image) => {
    image.dataset.altFr = image.alt;
  });

  const updateProjectToggle = () => {
    if (btnText) {
      btnText.textContent = currentLanguage === 'en'
        ? (isExpanded ? 'Show fewer projects' : 'Show more projects')
        : (isExpanded ? 'Afficher moins de projets' : 'Afficher plus de projets');
    }
    if (btnIcon) btnIcon.textContent = isExpanded ? '↑' : '↓';
  };

  const animatePageTitles = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    pageTitles.forEach((title) => title.classList.remove('language-title-reveal'));
    void document.body.offsetWidth;
    pageTitles.forEach((title) => {
      title.style.setProperty('--title-reveal-delay', '0ms');
      title.classList.add('language-title-reveal');
    });
  };

  const setLanguage = (language) => {
    currentLanguage = language;
    document.documentElement.lang = language;

    translatableElements.forEach((element) => {
      element.innerHTML = language === 'en' ? element.dataset.en : element.dataset.fr;
    });
    translatableImages.forEach((image) => {
      image.alt = language === 'en' ? image.dataset.altEn : image.dataset.altFr;
    });

    document.title = 'Rafael Peeters — Portfolio';
    document.querySelector('meta[name="description"]').content = language === 'en'
      ? 'Software engineering and systems portfolio.'
      : "Portfolio d'ingénierie logicielle et systèmes.";

    Object.entries(languageButtons).forEach(([buttonLanguage, button]) => {
      if (!button) return;
      const isActive = buttonLanguage === language;
      button.setAttribute('aria-pressed', String(isActive));
      button.classList.toggle('bg-[#5c78b0]', isActive);
      button.classList.toggle('text-white', isActive);
      button.classList.toggle('bg-transparent', !isActive);
      button.classList.toggle('text-zinc-500', !isActive);
      button.classList.toggle('hover:text-zinc-200', !isActive);
    });
    updateProjectToggle();
    animatePageTitles();
  };

  Object.entries(languageButtons).forEach(([language, button]) => {
    button?.addEventListener('click', () => {
      if (language !== currentLanguage) setLanguage(language);
    });
  });

  const revealItems = document.querySelectorAll('.reveal-on-scroll');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const initiallyVisibleItems = Array.from(revealItems).filter((item) => {
      const bounds = item.getBoundingClientRect();
      return bounds.top < window.innerHeight && bounds.bottom > 0;
    });
    initiallyVisibleItems.forEach((item, index) => {
      item.classList.add('page-load-reveal');
      item.style.setProperty('--reveal-delay', `${Math.min(index * 60, 700)}ms`);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      const enteringItems = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);

      enteringItems.forEach((entry, index) => {
        entry.target.style.setProperty('--reveal-delay', `${index * 70}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
    document.body.classList.add('motion-ready');
  }

  toggleBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    isExpanded = !isExpanded;

    extraProjects.forEach((project) => {
      if (isExpanded) {
        project.classList.remove('hidden');
        requestAnimationFrame(() => project.classList.add('is-visible'));
      } else {
        project.classList.add('hidden');
        project.classList.remove('is-visible');
      }
    });

    updateProjectToggle();
  });

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const btnText = document.getElementById('send-btn-text');
    const name = document.getElementById('form-name')?.value ?? '';

    if (btnText) btnText.textContent = currentLanguage === 'en' ? 'Sending...' : 'Envoi en cours...';

    setTimeout(() => {
      if (btnText) btnText.textContent = currentLanguage === 'en' ? 'Message sent ✓' : 'Message envoyé ✓';
      showToast(currentLanguage === 'en'
        ? `Thank you ${name}, your message has been sent!`
        : `Merci ${name}, votre message a bien été transmis !`);
      contactForm.reset();

      setTimeout(() => {
        if (btnText) btnText.textContent = currentLanguage === 'en' ? 'Send message' : 'Envoyer le message';
      }, 3000);
    }, 500);
  });
});

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('flex');

  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 3000);
}
