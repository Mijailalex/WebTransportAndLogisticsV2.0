/* ===================================
   PERU LOGISTICS - NAVEGACIÓN
   Sistema de navegación completo y responsivo
   =================================== */

'use strict';

const NavigationSystem = (() => {
  // Referencias DOM
  let elements = {};
  
  // Estado del sistema
  let state = {
    isMenuOpen: false,
    lastScrollY: 0,
    isScrollingUp: false,
    activeDropdown: null,
    scrollThreshold: 100
  };

  /* ===================================
     INICIALIZACIÓN
     =================================== */

  const init = () => {
    cacheElements();
    bindEvents();
    setupScrollEffects();
    setupDropdowns();
    setupActiveNavigation();
    setupBackToTop();
    
    console.log('✅ Sistema de navegación inicializado');
  };

  const cacheElements = () => {
    elements = {
      header: window.PeruLogistics.Utils.$('.header'),
      nav: window.PeruLogistics.Utils.$('.nav'),
      navToggle: window.PeruLogistics.Utils.$('.nav-toggle'),
      navMenu: window.PeruLogistics.Utils.$('.nav-menu'),
      navOverlay: window.PeruLogistics.Utils.$('.nav-overlay'),
      navLinks: window.PeruLogistics.Utils.$$('.nav-link'),
      dropdownItems: window.PeruLogistics.Utils.$$('.nav-item.dropdown'),
      backToTop: window.PeruLogistics.Utils.$('.back-to-top'),
      pageNavLinks: window.PeruLogistics.Utils.$$('.page-nav-link'),
      breadcrumbLinks: window.PeruLogistics.Utils.$$('.breadcrumb-link'),
      skipToContent: window.PeruLogistics.Utils.$('.skip-to-content')
    };

    // Crear overlay si no existe
    if (!elements.navOverlay) {
      elements.navOverlay = window.PeruLogistics.Utils.createElement('div', {
        className: 'nav-overlay'
      });
      document.body.appendChild(elements.navOverlay);
    }
  };

  /* ===================================
     EVENTOS PRINCIPALES
     =================================== */

  const bindEvents = () => {
    // Toggle menú móvil
    if (elements.navToggle) {
      elements.navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Cerrar menú con overlay
    if (elements.navOverlay) {
      elements.navOverlay.addEventListener('click', closeMobileMenu);
    }

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', handleEscapeKey);

    // Links de navegación
    elements.navLinks.forEach(link => {
      link.addEventListener('click', handleNavLinkClick);
    });

    // Page navigation links
    elements.pageNavLinks.forEach(link => {
      link.addEventListener('click', handlePageNavClick);
    });

    // Breadcrumb links
    elements.breadcrumbLinks.forEach(link => {
      link.addEventListener('click', handleBreadcrumbClick);
    });

    // Skip to content
    if (elements.skipToContent) {
      elements.skipToContent.addEventListener('click', handleSkipToContent);
    }

    // Scroll events
    window.addEventListener('scroll', window.PeruLogistics.EventUtils.throttle(handleScroll, 16));
    window.addEventListener('resize', window.PeruLogistics.EventUtils.debounce(handleResize, 250));

    // Back to top
    if (elements.backToTop) {
      elements.backToTop.addEventListener('click', scrollToTop);
    }

    // Popstate para navegación del navegador
    window.addEventListener('popstate', handlePopState);
  };

  /* ===================================
     MENÚ MÓVIL
     =================================== */

  const toggleMobileMenu = (e) => {
    e.preventDefault();
    state.isMenuOpen ? closeMobileMenu() : openMobileMenu();
  };

  const openMobileMenu = () => {
    state.isMenuOpen = true;
    
    // Actualizar elementos
    elements.navToggle.setAttribute('aria-expanded', 'true');
    elements.navMenu.classList.add('open');
    elements.navOverlay.classList.add('active');
    document.body.classList.add('nav-open');

    // Enfocar primer link
    const firstLink = window.PeruLogistics.Utils.$('.nav-link', elements.navMenu);
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }

    // Disparar evento personalizado
    window.PeruLogistics.EventUtils.trigger(elements.nav, 'mobileMenuOpen');
  };

  const closeMobileMenu = () => {
    state.isMenuOpen = false;
    
    // Actualizar elementos
    elements.navToggle.setAttribute('aria-expanded', 'false');
    elements.navMenu.classList.remove('open');
    elements.navOverlay.classList.remove('active');
    document.body.classList.remove('nav-open');

    // Cerrar dropdowns abiertos
    closeAllDropdowns();

    // Disparar evento personalizado
    window.PeruLogistics.EventUtils.trigger(elements.nav, 'mobileMenuClose');
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      if (state.isMenuOpen) {
        closeMobileMenu();
        elements.navToggle.focus();
      } else if (state.activeDropdown) {
        closeAllDropdowns();
      }
    }
  };

  /* ===================================
     DROPDOWNS
     =================================== */

  const setupDropdowns = () => {
    elements.dropdownItems.forEach(item => {
      const link = window.PeruLogistics.Utils.$('.nav-link', item);
      const menu = window.PeruLogistics.Utils.$('.dropdown-menu', item);

      if (!link || !menu) return;

      // Eventos desktop (hover)
      if (!window.PeruLogistics.DeviceUtils.isTouchDevice()) {
        item.addEventListener('mouseenter', () => openDropdown(item));
        item.addEventListener('mouseleave', () => closeDropdown(item));
      }

      // Eventos móviles y teclado
      link.addEventListener('click', (e) => {
        if (window.PeruLogistics.DeviceUtils.isMobile()) {
          e.preventDefault();
          toggleDropdown(item);
        }
      });

      link.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          openDropdown(item);
          focusFirstDropdownItem(item);
        }
      });

      // Navegación con teclado dentro del dropdown
      setupDropdownKeyboardNavigation(item);
    });

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item.dropdown')) {
        closeAllDropdowns();
      }
    });
  };

  const openDropdown = (item) => {
    closeAllDropdowns();
    state.activeDropdown = item;
    item.classList.add('open');
    
    const link = window.PeruLogistics.Utils.$('.nav-link', item);
    link.setAttribute('aria-expanded', 'true');
  };

  const closeDropdown = (item) => {
    item.classList.remove('open');
    
    const link = window.PeruLogistics.Utils.$('.nav-link', item);
    link.setAttribute('aria-expanded', 'false');
    
    if (state.activeDropdown === item) {
      state.activeDropdown = null;
    }
  };

  const toggleDropdown = (item) => {
    if (item.classList.contains('open')) {
      closeDropdown(item);
    } else {
      openDropdown(item);
    }
  };

  const closeAllDropdowns = () => {
    elements.dropdownItems.forEach(item => {
      closeDropdown(item);
    });
  };

  const focusFirstDropdownItem = (item) => {
    const firstItem = window.PeruLogistics.Utils.$('.dropdown-menu a', item);
    if (firstItem) {
      firstItem.focus();
    }
  };

  const setupDropdownKeyboardNavigation = (item) => {
    const menu = window.PeruLogistics.Utils.$('.dropdown-menu', item);
    const items = window.PeruLogistics.Utils.$$('a', menu);

    items.forEach((menuItem, index) => {
      menuItem.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (index + 1) % items.length;
            items[nextIndex].focus();
            break;

          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = (index - 1 + items.length) % items.length;
            items[prevIndex].focus();
            break;

          case 'Escape':
            e.preventDefault();
            closeDropdown(item);
            window.PeruLogistics.Utils.$('.nav-link', item).focus();
            break;

          case 'Tab':
            if (e.shiftKey && index === 0) {
              closeDropdown(item);
            } else if (!e.shiftKey && index === items.length - 1) {
              closeDropdown(item);
            }
            break;
        }
      });
    });
  };

  /* ===================================
     EFECTOS DE SCROLL
     =================================== */

  const setupScrollEffects = () => {
    // Estado inicial
    updateHeaderScrollState();
  };

  const handleScroll = () => {
    const currentScrollY = window.pageYOffset;
    state.isScrollingUp = currentScrollY < state.lastScrollY;
    
    updateHeaderScrollState();
    updateBackToTopVisibility();
    updateActiveNavigation();
    
    state.lastScrollY = currentScrollY;
  };

  const updateHeaderScrollState = () => {
    const scrollY = window.pageYOffset;
    
    if (scrollY > state.scrollThreshold) {
      elements.header.classList.add('scrolled');
    } else {
      elements.header.classList.remove('scrolled');
    }

    // Header hide/show en móvil
    if (window.PeruLogistics.DeviceUtils.isMobile() && !state.isMenuOpen) {
      if (state.isScrollingUp || scrollY < state.scrollThreshold) {
        elements.header.classList.remove('header-hidden');
      } else {
        elements.header.classList.add('header-hidden');
      }
    }
  };

  /* ===================================
     NAVEGACIÓN ACTIVA
     =================================== */

  const setupActiveNavigation = () => {
    updateActiveNavigation();
    
    // Observer para secciones en la página actual
    if ('IntersectionObserver' in window) {
      const sections = window.PeruLogistics.Utils.$$('section[id]');
      if (sections.length > 0) {
        setupSectionObserver(sections);
      }
    }
  };

  const updateActiveNavigation = () => {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    // Actualizar navegación principal
    elements.navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      const linkHash = new URL(link.href).hash;
      
      if (linkPath === currentPath && (!linkHash || linkHash === currentHash)) {
        link.classList.add('active');
        link.closest('.nav-item').classList.add('active');
      } else {
        link.classList.remove('active');
        link.closest('.nav-item').classList.remove('active');
      }
    });

    // Actualizar navegación de página
    elements.pageNavLinks.forEach(link => {
      const linkHash = new URL(link.href).hash;
      if (linkHash === currentHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  const setupSectionObserver = (sections) => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          updateActiveSection(sectionId);
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  };

  const updateActiveSection = (sectionId) => {
    // Actualizar URL sin recargar
    const newHash = `#${sectionId}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, null, newHash);
      updateActiveNavigation();
    }
  };

  /* ===================================
     NAVEGACIÓN CON ENLACES
     =================================== */

  const handleNavLinkClick = (e) => {
    const link = e.currentTarget;
    const href = link.getAttribute('href');

    // Si es un enlace ancla en la misma página
    if (href && href.startsWith('#')) {
      e.preventDefault();
      navigateToSection(href.substring(1));
      
      // Cerrar menú móvil si está abierto
      if (state.isMenuOpen) {
        closeMobileMenu();
      }
    }
    // Si es enlace interno pero a otra página
    else if (href && !window.PeruLogistics.URLUtils.isExternalURL(href)) {
      // Cerrar menú móvil
      if (state.isMenuOpen) {
        closeMobileMenu();
      }
    }
  };

  const handlePageNavClick = (e) => {
    const link = e.currentTarget;
    const href = link.getAttribute('href');

    if (href && href.startsWith('#')) {
      e.preventDefault();
      navigateToSection(href.substring(1));
    }
  };

  const handleBreadcrumbClick = (e) => {
    const link = e.currentTarget;
    const href = link.getAttribute('href');

    if (href && href.startsWith('#')) {
      e.preventDefault();
      navigateToSection(href.substring(1));
    }
  };

  const handleSkipToContent = (e) => {
    e.preventDefault();
    const mainContent = window.PeruLogistics.Utils.$('#main-content, main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToSection = (sectionId) => {
    const targetElement = window.PeruLogistics.Utils.$(`#${sectionId}`);
    if (!targetElement) return;

    const headerHeight = elements.header.offsetHeight;
    const offset = headerHeight + 20;

    window.PeruLogistics.Utils.smoothScrollTo(targetElement, 800, offset);
  };

  /* ===================================
     BACK TO TOP
     =================================== */

  const setupBackToTop = () => {
    updateBackToTopVisibility();
  };

  const updateBackToTopVisibility = () => {
    if (!elements.backToTop) return;

    const scrollY = window.pageYOffset;
    const showThreshold = window.innerHeight;

    if (scrollY > showThreshold) {
      elements.backToTop.classList.add('visible');
    } else {
      elements.backToTop.classList.remove('visible');
    }
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.PeruLogistics.Utils.smoothScrollTo(0, 800);
  };

  /* ===================================
     EVENTOS DE NAVEGADOR
     =================================== */

  const handlePopState = (e) => {
    updateActiveNavigation();
    
    // Si hay un hash, navegar a la sección
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        navigateToSection(hash.substring(1));
      }, 100);
    }
  };

  const handleResize = () => {
    // Cerrar menú móvil si se cambia a desktop
    if (window.PeruLogistics.DeviceUtils.isDesktop() && state.isMenuOpen) {
      closeMobileMenu();
    }

    // Recalcular elementos
    updateHeaderScrollState();
    updateBackToTopVisibility();
  };

  /* ===================================
     MÉTODOS PÚBLICOS
     =================================== */

  const publicAPI = {
    init,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
    navigateToSection,
    updateActiveNavigation,
    
    // Getters
    get isMenuOpen() { return state.isMenuOpen; },
    get activeDropdown() { return state.activeDropdown; },
    
    // Configuración
    setScrollThreshold: (threshold) => {
      state.scrollThreshold = threshold;
    }
  };

  return publicAPI;
})();

/* ===================================
   INICIALIZACIÓN AUTOMÁTICA
   =================================== */

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', NavigationSystem.init);
} else {
  NavigationSystem.init();
}

// Exportar al namespace global
window.PeruLogistics.Navigation = NavigationSystem;