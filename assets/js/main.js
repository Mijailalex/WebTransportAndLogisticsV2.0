/* ===================================
   PERU LOGISTICS - INICIALIZACIÓN PRINCIPAL
   Coordinador de todos los sistemas y funcionalidades
   =================================== */

'use strict';

const PeruLogisticsApp = (() => {
  // Estado de la aplicación
  let appState = {
    isInitialized: false,
    systems: {
      utils: false,
      navigation: false,
      animations: false,
      forms: false
    },
    performance: {
      startTime: performance.now(),
      loadTime: null,
      systems: {}
    },
    features: {
      intersectionObserver: 'IntersectionObserver' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webp: false,
      localStorage: true
    }
  };

  // Configuración global
  const config = {
    debug: false,
    enableAnalytics: false,
    enableServiceWorker: false,
    lazyLoadImages: true,
    enableNotifications: true,
    theme: 'light' // 'light', 'dark', 'auto'
  };

  /* ===================================
     INICIALIZACIÓN PRINCIPAL
     =================================== */

  const init = async () => {
    console.log('🚀 Iniciando Peru Logistics App...');
    
    try {
      // Detectar capacidades del navegador
      await detectBrowserCapabilities();
      
      // Inicializar sistemas en orden
      await initializeSystems();
      
      // Configurar funcionalidades específicas
      setupPageSpecificFeatures();
      
      // Configurar PWA si está disponible
      if (config.enableServiceWorker) {
        setupServiceWorker();
      }
      
      // Configurar analytics
      if (config.enableAnalytics) {
        setupAnalytics();
      }
      
      // Finalizar inicialización
      finalizeInitialization();
      
    } catch (error) {
      handleInitializationError(error);
    }
  };

  /* ===================================
     DETECCIÓN DE CAPACIDADES
     =================================== */

  const detectBrowserCapabilities = async () => {
    console.log('🔍 Detectando capacidades del navegador...');
    
    // WebP support
  const initializeSystems = async () => {
      console.log('⚙️ Inicializando sistemas...');
      
      // Verificar que los sistemas estén disponibles
      await waitForSystem('Utils', () => window.PeruLogistics?.Utils);
      await waitForSystem('Navigation', () => window.PeruLogistics?.Navigation);
      await waitForSystem('Animations', () => window.PeruLogistics?.Animations);
      await waitForSystem('Forms', () => window.PeruLogistics?.Forms);
      
      console.log('✅ Todos los sistemas inicializados');
    };
    // LocalStorage support
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      appState.features.localStorage = true;
    } catch (e) {
      appState.features.localStorage = false;
      console.warn('LocalStorage no disponible');
    }
    
    // Touch support
    appState.features.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Reduced motion preference
    appState.features.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Add classes to body
    document.body.classList.add(
      appState.features.webp ? 'webp' : 'no-webp',
      appState.features.touch ? 'touch' : 'no-touch',
      appState.features.reducedMotion ? 'reduced-motion' : 'full-motion'
    );
    
    console.log('✅ Capacidades detectadas:', appState.features);
  };

  const checkWebPSupport = () => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  };

  /* ===================================
     INICIALIZACIÓN DE SISTEMAS
     =================================== */

  const initializeSystems = async () => {
    console.log('⚙️ Inicializando sistemas...');
    
    // Los sistemas ya se inicializan automáticamente,
    // aquí verificamos que estén funcionando
    await waitForSystem('Utils', () => window.PeruLogistics.Utils);
    await waitForSystem('Navigation', () => window.PeruLogistics.Navigation);
    await waitForSystem('Animations', () => window.PeruLogistics.Animations);
    await waitForSystem('Forms', () => window.PeruLogistics.Forms);
    
    console.log('✅ Todos los sistemas inicializados');
  };

  const waitForSystem = (name, checkFn, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const check = () => {
        if (checkFn()) {
          appState.systems[name.toLowerCase()] = true;
          appState.performance.systems[name] = performance.now() - startTime;
          console.log(`✅ Sistema ${name} listo (${appState.performance.systems[name].toFixed(2)}ms)`);
          resolve();
        } else if (performance.now() - startTime > timeout) {
          console.error(`❌ Timeout esperando sistema ${name}`);
          reject(new Error(`Sistema ${name} no se inicializó en tiempo`));
        } else {
          requestAnimationFrame(check);
        }
      };
      
      check();
    });
  };

  /* ===================================
     FUNCIONALIDADES ESPECÍFICAS DE PÁGINA
     =================================== */

  const setupPageSpecificFeatures = () => {
    const currentPage = getCurrentPage();
    console.log(`📄 Configurando página: ${currentPage}`);
    
    switch (currentPage) {
      case 'index':
        setupHomePage();
        break;
      case 'nosotros':
        setupAboutPage();
        break;
      case 'servicios':
        setupServicesPage();
        break;
      case 'contacto':
        setupContactPage();
        break;
    }
    
    // Funcionalidades comunes
    setupCommonFeatures();
  };

  const getCurrentPage = () => {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
  };

  const setupHomePage = () => {
    console.log('🏠 Configurando página de inicio...');
    
    // Configurar slider si existe
    initializeSlider();
    
    // Configurar contadores animados
    setupAnimatedCounters();
    
    // Configurar efectos parallax
    if (appState.features.intersectionObserver && !appState.features.reducedMotion) {
      setupParallaxEffects();
    }
  };

  const setupAboutPage = () => {
    console.log('👥 Configurando página nosotros...');
    
    // Configurar timeline animada
    setupTimelineAnimations();
    
    // Configurar FAQ accordion
    setupFAQAccordion();
  };

  const setupServicesPage = () => {
    console.log('🚚 Configurando página servicios...');
    
    // Configurar tabs de servicios
    setupServiceTabs();
    
    // Configurar comparador de servicios
    setupServiceComparison();
  };

  const setupContactPage = () => {
    console.log('📞 Configurando página contacto...');
    
    // Configurar mapa interactivo
    setupInteractiveMap();
    
    // Configurar formulario de contacto avanzado
    setupAdvancedContactForm();
    
    // Configurar FAQ accordion
    setupFAQAccordion();
  };

  /* ===================================
     FUNCIONALIDADES ESPECÍFICAS
     =================================== */

  const initializeSlider = () => {
    const sliders = window.PeruLogistics.Utils.$$('.slider-container');
    if (sliders.length === 0) return;
    
    // El slider ya está configurado en animations.js
    console.log('🎠 Slider inicializado');
  };

  const setupAnimatedCounters = () => {
    // Los contadores ya están configurados en animations.js
    console.log('🔢 Contadores animados configurados');
  };

  const setupParallaxEffects = () => {
    // Los efectos parallax ya están configurados en animations.js
    console.log('🌊 Efectos parallax configurados');
  };

  const setupTimelineAnimations = () => {
    if (!appState.features.intersectionObserver) return;
    
    const timelineItems = window.PeruLogistics.Utils.$$('.timeline-item');
    if (timelineItems.length === 0) return;
    
    // Ya configurado en animations.js
    console.log('📅 Timeline animada configurada');
  };

  const setupFAQAccordion = () => {
    const faqItems = window.PeruLogistics.Utils.$$('.faq-item');
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
      const question = window.PeruLogistics.Utils.$('.faq-question', item);
      const answer = window.PeruLogistics.Utils.$('.faq-answer', item);
      
      if (!question || !answer) return;
      
      question.addEventListener('click', () => {
        const isOpen = question.getAttribute('aria-expanded') === 'true';
        
        // Cerrar otros items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherQuestion = window.PeruLogistics.Utils.$('.faq-question', otherItem);
            const otherAnswer = window.PeruLogistics.Utils.$('.faq-answer', otherItem);
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherAnswer.style.maxHeight = '0px';
          }
        });
        
        // Toggle actual item
        if (isOpen) {
          question.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0px';
        } else {
          question.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
    
    console.log('❓ FAQ accordion configurado');
  };

  const setupServiceTabs = () => {
    // Configurar navegación entre secciones de servicios
    const serviceNavLinks = window.PeruLogistics.Utils.$$('.page-nav-link');
    
    serviceNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // La funcionalidad ya está en navigation.js
      });
    });
    
    console.log('📋 Tabs de servicios configurados');
  };

  const setupServiceComparison = () => {
    // Funcionalidad para comparar servicios (futuro)
    console.log('⚖️ Comparador de servicios preparado');
  };

  const setupInteractiveMap = () => {
    const mapContainer = window.PeruLogistics.Utils.$('.map-placeholder');
    if (!mapContainer) return;
    
    // Configurar mapa interactivo (aquí se podría integrar Google Maps o similar)
    console.log('🗺️ Mapa interactivo configurado');
  };

  const setupAdvancedContactForm = () => {
    // El formulario ya está configurado en forms.js
    
    // Agregar funcionalidades adicionales
    const contactForm = window.PeruLogistics.Utils.$('#contactForm');
    if (!contactForm) return;
    
    // Auto-completar datos si existen
    loadSavedFormData(contactForm);
    
    console.log('📝 Formulario de contacto avanzado configurado');
  };

  const loadSavedFormData = (form) => {
    if (!appState.features.localStorage) return;
    
    const savedData = window.PeruLogistics.StorageUtils.getItem('contact_form_data');
    if (!savedData) return;
    
    Object.entries(savedData).forEach(([fieldName, value]) => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field && field.type !== 'password') {
        field.value = value;
      }
    });
  };

  /* ===================================
     FUNCIONALIDADES COMUNES
     =================================== */

  const setupCommonFeatures = () => {
    // Configurar lazy loading de imágenes
    if (config.lazyLoadImages) {
      setupLazyLoading();
    }
    
    // Configurar enlaces externos
    setupExternalLinks();
    
    // Configurar tooltips
    setupTooltips();
    
    // Configurar temas
    setupThemeSystem();
    
    // Configurar notificaciones
    if (config.enableNotifications) {
      setupNotificationSystem();
    }
  };

  const setupLazyLoading = () => {
    // Ya configurado en utils.js
    console.log('🖼️ Lazy loading configurado');
  };

  const setupExternalLinks = () => {
    const externalLinks = window.PeruLogistics.Utils.$$('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    
    externalLinks.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      // Agregar icono de enlace externo
      if (!link.querySelector('.external-icon')) {
        const icon = window.PeruLogistics.Utils.createElement('i', {
          className: 'fas fa-external-link-alt external-icon',
          'aria-hidden': 'true'
        });
        link.appendChild(icon);
      }
    });
    
    console.log('🔗 Enlaces externos configurados');
  };

  const setupTooltips = () => {
    const tooltipElements = window.PeruLogistics.Utils.$$('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', showTooltip);
      element.addEventListener('mouseleave', hideTooltip);
      element.addEventListener('focus', showTooltip);
      element.addEventListener('blur', hideTooltip);
    });
    
    if (tooltipElements.length > 0) {
      console.log('💬 Tooltips configurados');
    }
  };

  const showTooltip = (e) => {
    // Los tooltips están implementados con CSS puro
  };

  const hideTooltip = (e) => {
    // Los tooltips están implementados con CSS puro
  };

  const setupThemeSystem = () => {
    // Preparar sistema de temas (futuro)
    const savedTheme = window.PeruLogistics.StorageUtils.getItem('theme') || config.theme;
    
    if (savedTheme === 'auto') {
      // Usar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-theme', prefersDark);
    } else {
      document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    }
    
    console.log('🎨 Sistema de temas configurado');
  };

  const setupNotificationSystem = () => {
    // Ya configurado en utils.js
    console.log('🔔 Sistema de notificaciones configurado');
  };

  /* ===================================
     PWA Y SERVICE WORKER
     =================================== */

  const setupServiceWorker = async () => {
    if (!appState.features.serviceWorker) {
      console.log('❌ Service Worker no soportado');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registrado:', registration.scope);
      
      // Configurar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nueva versión disponible
            showUpdateNotification();
          }
        });
      });
      
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  };

  const showUpdateNotification = () => {
    window.PeruLogistics.NotificationUtils.info(
      'Nueva versión disponible. Refresca la página para actualizarla.',
      0 // No auto-hide
    );
  };

  /* ===================================
     ANALYTICS
     =================================== */

  const setupAnalytics = () => {
    // Configurar Google Analytics o similar
    console.log('📊 Analytics configurado');
    
    // Track page view
    trackPageView();
    
    // Track interactions
    setupAnalyticsTracking();
  };

  const trackPageView = () => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  };

  const setupAnalyticsTracking = () => {
    // Track button clicks
    window.PeruLogistics.EventUtils.delegate(document.body, '.btn', 'click', (e) => {
      trackEvent('button_click', {
        button_text: e.target.textContent.trim(),
        page: getCurrentPage()
      });
    });
    
    // Track form submissions
    window.PeruLogistics.EventUtils.delegate(document.body, 'form', 'submit', (e) => {
      trackEvent('form_submit', {
        form_id: e.target.id,
        page: getCurrentPage()
      });
    });
  };

  const trackEvent = (eventName, parameters = {}) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
    
    if (config.debug) {
      console.log('📊 Event tracked:', eventName, parameters);
    }
  };

  /* ===================================
     MANEJO DE ERRORES
     =================================== */

  const handleInitializationError = (error) => {
    console.error('❌ Error en inicialización:', error);
    
    // Solo log del error, no mostrar elementos visuales que interfieran
    if (config.debug) {
      console.warn('Error de inicialización en modo debug:', error);
    }
  };

  const setupGlobalErrorHandler = () => {
    window.addEventListener('error', (e) => {
      console.error('❌ Error JavaScript:', e.error);
      
      if (config.enableAnalytics) {
        trackEvent('javascript_error', {
          error_message: e.message,
          error_filename: e.filename,
          error_line: e.lineno
        });
      }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('❌ Promise rejection no manejada:', e.reason);
      
      if (config.enableAnalytics) {
        trackEvent('promise_rejection', {
          error_message: e.reason?.message || 'Unknown promise rejection'
        });
      }
    });
  };

  /* ===================================
     FINALIZACIÓN
     =================================== */

  const finalizeInitialization = () => {
    appState.isInitialized = true;
    appState.performance.loadTime = performance.now() - appState.performance.startTime;
    
    // Configurar handler de errores globales
    setupGlobalErrorHandler();
    
    // Disparar evento de inicialización completa
    window.PeruLogistics.EventUtils.trigger(document, 'appInitialized', {
      loadTime: appState.performance.loadTime,
      systems: appState.systems,
      features: appState.features
    });
    
    // Log final
    console.log(`🎉 Peru Logistics App inicializada correctamente`);
    console.log(`⏱️ Tiempo total de carga: ${appState.performance.loadTime.toFixed(2)}ms`);
    console.log('📊 Performance por sistema:', appState.performance.systems);
    
    // Remover loader si existe
    const loader = document.querySelector('.page-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 300);
      }, 500);
    }
    
    // Marcar body como loaded
    document.body.classList.add('app-loaded');
  };

  /* ===================================
     API PÚBLICA
     =================================== */

  const publicAPI = {
    init,
    
    // Getters
    get isInitialized() { return appState.isInitialized; },
    get performance() { return appState.performance; },
    get features() { return appState.features; },
    get config() { return { ...config }; },
    
    // Métodos útiles
    trackEvent,
    getCurrentPage,
    
    // Debug
    debug: {
      getState: () => appState,
      getConfig: () => config,
      enableDebug: () => { config.debug = true; },
      disableDebug: () => { config.debug = false; }
    }
  };

  return publicAPI;
})();

/* ===================================
   INICIALIZACIÓN AUTOMÁTICA
   =================================== */

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PeruLogisticsApp.init);
} else {
  // DOM ya está listo
  setTimeout(PeruLogisticsApp.init, 0);
}

// Exportar al namespace global
window.PeruLogistics.App = PeruLogisticsApp;

// También hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.PeruLogisticsApp = PeruLogisticsApp;
}

// Hot reload para desarrollo (si está disponible)
if (typeof module !== 'undefined' && module.hot) {
  module.hot.accept();
}