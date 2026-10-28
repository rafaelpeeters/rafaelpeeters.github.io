let currentLanguage = 'fr';

document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTS DE LA PAGE
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
  const contactLinks = document.getElementById('contact-links');
  const showMoreProjectsButton = document.getElementById('show-more-projects');
  const showMoreProjectsLabel = document.getElementById('show-more-projects-label');
  const showLessProjectsLabel = document.getElementById('show-less-projects-label');
  const showProjectsIcon = document.getElementById('show-projects-icon');
  const projectCards = Array.from(document.querySelectorAll('#projects-grid article'));
  const initialVisibleProjectCount = 6;
  const hiddenProjectCards = projectCards.slice(initialVisibleProjectCount);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  projectCards.forEach((card, index) => {
    card.hidden = index >= initialVisibleProjectCount;
  });

  // TRADUCTIONS
  translatableElements.forEach((element) => {
    element.dataset.fr = element.innerHTML;
  });

  translatableImages.forEach((image) => {
    image.dataset.altFr = image.alt;
  });

  // ANIMATION DES TITRES LORS DU CHANGEMENT DE LANGUE
  const animatePageTitles = () => {
    if (prefersReducedMotion) return;
    pageTitles.forEach((title) => title.classList.remove('language-title-reveal'));
    void document.body.offsetWidth;
    pageTitles.forEach((title) => title.classList.add('language-title-reveal'));
  };

  const setLanguage = (language) => {
    currentLanguage = language;
    document.documentElement.lang = language;
    sectionIndex?.setAttribute('aria-label', language === 'en' ? 'Section navigation' : 'Navigation des sections');
    contactLinks?.setAttribute('aria-label', language === 'en' ? 'Contact links' : 'Liens de contact');

    translatableElements.forEach((element) => {
      element.innerHTML = language === 'en' ? element.dataset.en : element.dataset.fr;
    });
    translatableImages.forEach((image) => {
      image.alt = language === 'en' ? image.dataset.altEn : image.dataset.altFr;
    });

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = language === 'en'
        ? 'Software engineering and systems portfolio.'
        : "Portfolio d'ingénierie logicielle et systèmes.";
    }

    Object.entries(languageButtons).forEach(([buttonLanguage, button]) => {
      if (!button) return;
      const isActive = buttonLanguage === language;
      button.setAttribute('aria-pressed', String(isActive));
      ['bg-[#5c78b0]', 'text-white'].forEach((className) => button.classList.toggle(className, isActive));
      ['bg-transparent', 'text-zinc-500', 'hover:bg-zinc-800', 'hover:text-zinc-100']
        .forEach((className) => button.classList.toggle(className, !isActive));
    });

    animatePageTitles();
  };

  // CHANGEMENT DE LANGUE
  Object.entries(languageButtons).forEach(([language, button]) => {
    button?.addEventListener('click', () => {
      if (language !== currentLanguage) setLanguage(language);
    });
  });

  // FIL D'ARIANE ET PROGRESSION DES SECTIONS
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

  // AFFICHAGE ET MASQUAGE DES PROJETS
  showMoreProjectsButton?.addEventListener('click', async () => {
    const showAllProjects = showMoreProjectsButton.getAttribute('aria-expanded') !== 'true';
    showMoreProjectsButton.disabled = true;
    const animations = [];
    hiddenProjectCards.forEach((card, index) => {
      card.hidden = false;
      card.classList.toggle('is-visible', showAllProjects);
      if (prefersReducedMotion) return;
      const frames = showAllProjects
        ? [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }]
        : [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }];
      animations.push(card.animate(frames, {
        duration: showAllProjects ? 550 : 250,
        delay: showAllProjects ? index * 100 : 0,
        easing: showAllProjects ? 'cubic-bezier(0.2, 0.7, 0.2, 1)' : 'cubic-bezier(0.4, 0, 1, 1)',
        fill: 'both',
      }).finished);
    });
    await Promise.all(animations);
    hiddenProjectCards.forEach((card) => {
      card.hidden = !showAllProjects;
      card.getAnimations().forEach((animation) => animation.cancel());
      if (!showAllProjects) card.classList.remove('is-visible');
    });
    showMoreProjectsButton.setAttribute('aria-expanded', String(showAllProjects));
    if (showMoreProjectsLabel) showMoreProjectsLabel.hidden = showAllProjects;
    if (showLessProjectsLabel) showLessProjectsLabel.hidden = !showAllProjects;
    if (showProjectsIcon) showProjectsIcon.textContent = showAllProjects ? '↑' : '↓';
    showMoreProjectsButton.disabled = false;
    updateSectionIndex();
  });

  // APPARITION DES ELEMENTS AU DEFILEMENT
  const revealItems = document.querySelectorAll('.reveal-on-scroll');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const visibleItems = Array.from(revealItems).filter((item) => {
      const { top, bottom } = item.getBoundingClientRect();
      return top < window.innerHeight && bottom > 0;
    });
    visibleItems.forEach((item, index) => {
      item.classList.add('page-load-reveal');
      item.style.setProperty('--reveal-delay', `${Math.min(index * 45, 360)}ms`);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)
        .forEach((entry, index) => {
          entry.target.style.setProperty('--reveal-delay', `${Math.min(index * 55, 360)}ms`);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
    document.body.classList.add('motion-ready');
  }
});
