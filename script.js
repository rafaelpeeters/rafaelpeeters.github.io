let currentLanguage = 'fr';

document.addEventListener('DOMContentLoaded', () => {
  const languageButtons = {
    fr: document.getElementById('language-fr'),
    en: document.getElementById('language-en'),
  };
  const translatableElements = document.querySelectorAll('[data-en]');
  const translatableImages = document.querySelectorAll('[data-alt-en]');
  const pageTitles = document.querySelectorAll('main h1, main h2, main h3, header a[href="#about"]');
  const sectionIndex = document.getElementById('section-index');
  const sectionLinks = sectionIndex?.querySelectorAll('a[href^="#"]') ?? [];
  const sections = Array.from(sectionLinks, (link) => document.querySelector(link.getAttribute('href')));
  const contactForm = document.getElementById('contact-form');

  translatableElements.forEach((element) => {
    element.dataset.fr = element.innerHTML;
  });

  translatableImages.forEach((image) => {
    image.dataset.altFr = image.alt;
  });

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
    sectionIndex?.setAttribute('aria-label', language === 'en' ? 'Section navigation' : 'Navigation des sections');

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
      button.classList.toggle('hover:bg-zinc-800', !isActive);
      button.classList.toggle('hover:text-zinc-100', !isActive);
    });
    animatePageTitles();
  };

  Object.entries(languageButtons).forEach(([language, button]) => {
    button?.addEventListener('click', () => {
      if (language !== currentLanguage) setLanguage(language);
    });
  });

  const updateSectionIndex = () => {
    if (!sectionLinks.length) return;

    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const activeLine = window.innerHeight * 0.45;
    const scrollProgress = scrollableHeight > 0
      ? Math.min(window.scrollY / scrollableHeight, 1)
      : 0;
    const projectsSection = sections.find((section) => section?.id === 'projects');
    const projectsStart = projectsSection && scrollableHeight > 0
      ? Math.max(0, Math.min(
        (projectsSection.getBoundingClientRect().top + window.scrollY - activeLine) / scrollableHeight,
        1,
      ))
      : 0.5;
    const progress = projectsStart > 0 && projectsStart < 1
      ? scrollProgress <= projectsStart
        ? (scrollProgress / projectsStart) * 0.5
        : 0.5 + ((scrollProgress - projectsStart) / (1 - projectsStart)) * 0.5
      : scrollProgress;
    sectionIndex.style.setProperty('--section-progress', String(progress));

    let activeIndex = 0;

    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= activeLine) {
        activeIndex = index;
      }
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      activeIndex = sections.length - 1;
    }

    sectionLinks.forEach((link, index) => {
      link.classList.toggle('is-visited', index <= activeIndex);
      if (index === activeIndex) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if (sectionIndex) {
    updateSectionIndex();
    window.addEventListener('scroll', updateSectionIndex, { passive: true });
    window.addEventListener('resize', updateSectionIndex);
  }

  const revealItems = document.querySelectorAll('.reveal-on-scroll');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const initiallyVisibleItems = Array.from(revealItems)
      .filter((item) => {
        const bounds = item.getBoundingClientRect();
        return bounds.top < window.innerHeight && bounds.bottom > 0;
      })
      .sort((first, second) => first.getBoundingClientRect().top - second.getBoundingClientRect().top);
    initiallyVisibleItems.forEach((item, index) => {
      item.classList.add('page-load-reveal');
      item.style.setProperty('--reveal-delay', `${Math.min(index * 45, 360)}ms`);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      const enteringItems = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);

      enteringItems.forEach((entry, index) => {
        entry.target.style.setProperty('--reveal-delay', `${Math.min(index * 55, 360)}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
    document.body.classList.add('motion-ready');
  }

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
