/* ===================================
   PERU LOGISTICS - UTILIDADES GLOBALES
   Funciones utilitarias y helpers comunes
   =================================== */

'use strict';

// Namespace global para Peru Logistics
window.PeruLogistics = window.PeruLogistics || {};

/* ===================================
   UTILIDADES DOM
   =================================== */

const Utils = {
  // Selector mejorado con caché
  $: (selector, context = document) => {
    if (typeof selector === 'string') {
      return context.querySelector(selector);
    }
    return selector; // Ya es un elemento DOM
  },

  // Selector múltiple
  $$: (selector, context = document) => {
    return Array.from(context.querySelectorAll(selector));
  },

  // Crear elemento con atributos
  createElement: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content) {
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else {
        element.appendChild(content);
      }
    }

    return element;
  },

  // Verificar si elemento está en viewport
  isInViewport: (element, threshold = 0.1) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                      ((rect.top + rect.height) >= windowHeight * threshold);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return vertInView && horInView;
  },

  // Obtener posición del elemento relativa al documento
  getElementPosition: (element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
      width: rect.width,
      height: rect.height
    };
  },

  // Smooth scroll mejorado
  smoothScrollTo: (target, duration = 800, offset = 0) => {
    let targetElement;
    
    if (typeof target === 'string') {
      targetElement = Utils.$(target);
    } else if (typeof target === 'number') {
      targetElement = { offsetTop: target };
    } else {
      targetElement = target;
    }

    if (!targetElement) return;

    const startPosition = window.pageYOffset;
    const targetPosition = targetElement.offsetTop - offset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const easeInOutQuart = (t) => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuart(timeElapsed / duration);
      
      window.scrollTo(0, startPosition + distance * run);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }
};

/* ===================================
   UTILIDADES DE EVENTOS
   =================================== */

const EventUtils = {
  // Debounce function
  debounce: (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Delegación de eventos mejorada
  delegate: (parent, selector, event, handler) => {
    parent.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler.call(target, e);
      }
    });
  },

  // Event listener con auto-cleanup
  addEventListenerWithCleanup: (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    
    // Retorna función de cleanup
    return () => {
      element.removeEventListener(event, handler, options);
    };
  },

  // Disparar evento personalizado
  trigger: (element, eventName, detail = {}) => {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
};

/* ===================================
   UTILIDADES DE VALIDACIÓN
   =================================== */

const ValidationUtils = {
  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar teléfono peruano
  isValidPeruvianPhone: (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Formatos válidos: 9xxxxxxxx, +519xxxxxxxx, 00519xxxxxxxx
    return /^(\+?51)?9\d{8}$/.test(cleanPhone);
  },

  // Validar DNI peruano
  isValidDNI: (dni) => {
    const cleanDNI = dni.replace(/\D/g, '');
    return /^\d{8}$/.test(cleanDNI);
  },

  // Validar RUC peruano
  isValidRUC: (ruc) => {
    const cleanRUC = ruc.replace(/\D/g, '');
    if (!/^\d{11}$/.test(cleanRUC)) return false;
    
    // Algoritmo de validación RUC
    const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanRUC[i]) * factors[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;
    
    return checkDigit === parseInt(cleanRUC[10]);
  },

  // Validar campo requerido
  isRequired: (value) => {
    return value && value.toString().trim().length > 0;
  },

  // Validar longitud mínima
  minLength: (value, min) => {
    return value && value.toString().length >= min;
  },

  // Validar longitud máxima
  maxLength: (value, max) => {
    return !value || value.toString().length <= max;
  },

  // Validar número
  isNumeric: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
};

/* ===================================
   UTILIDADES DE FORMATO
   =================================== */

const FormatUtils = {
  // Formatear número con separadores de miles
  formatNumber: (number, decimals = 0) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  },

  // Formatear moneda en soles
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  },

  // Formatear fecha
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('es-PE', { ...defaultOptions, ...options }).format(date);
  },

  // Formatear teléfono peruano
  formatPhone: (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 9) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return phone;
  },

  // Truncar texto con elipsis
  truncateText: (text, maxLength, suffix = '...') => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // Capitalizar primera letra
  capitalize: (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Slug para URLs
  slugify: (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

/* ===================================
   UTILIDADES DE STORAGE
   =================================== */

const StorageUtils = {
  // LocalStorage con manejo de errores
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
      return false;
    }
  },

  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('No se pudo leer de localStorage:', e);
      return defaultValue;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('No se pudo eliminar de localStorage:', e);
      return false;
    }
  },

  // SessionStorage
  setSessionItem: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('No se pudo guardar en sessionStorage:', e);
      return false;
    }
  },

  getSessionItem: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('No se pudo leer de sessionStorage:', e);
      return defaultValue;
    }
  }
};

/* ===================================
   UTILIDADES DE DISPOSITIVO
   =================================== */

const DeviceUtils = {
  // Detectar tipo de dispositivo
  isMobile: () => {
    return window.innerWidth <= 768;
  },

  isTablet: () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  isDesktop: () => {
    return window.innerWidth > 1024;
  },

  // Detectar soporte táctil
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Detectar navegador
  getBrowser: () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    if (userAgent.includes('Opera')) return 'opera';
    return 'unknown';
  },

  // Detectar sistema operativo
  getOS: () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'windows';
    if (userAgent.includes('Mac')) return 'macos';
    if (userAgent.includes('Linux')) return 'linux';
    if (userAgent.includes('Android')) return 'android';
    if (userAgent.includes('iOS')) return 'ios';
    return 'unknown';
  },

  // Obtener dimensiones de viewport
  getViewportSize: () => {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
  }
};

/* ===================================
   UTILIDADES DE PERFORMANCE
   =================================== */

const PerformanceUtils = {
  // Lazy loading de imágenes
  lazyLoadImages: (selector = 'img[data-src]') => {
    const images = Utils.$$(selector);
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback para navegadores sin IntersectionObserver
      images.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        img.classList.add('loaded');
      });
    }
  },

  // Precargar recursos críticos
  preloadResource: (href, as = 'script', crossorigin = null) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  },

  // Medir tiempo de carga
  measureLoadTime: () => {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Tiempo de carga: ${loadTime}ms`);
      });
    }
  }
};

/* ===================================
   UTILIDADES DE URL Y NAVEGACIÓN
   =================================== */

const URLUtils = {
  // Obtener parámetros de URL
  getURLParams: () => {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  // Actualizar URL sin recargar página
  updateURL: (params, title = null) => {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    history.pushState({}, title || document.title, url);
  },

  // Obtener hash sin #
  getHash: () => {
    return window.location.hash.substring(1);
  },

  // Verificar si es URL externa
  isExternalURL: (url) => {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin !== window.location.origin;
    } catch {
      return false;
    }
  }
};

/* ===================================
   SISTEMA DE NOTIFICACIONES
   =================================== */

const NotificationUtils = {
  // Mostrar notificación
  show: (message, type = 'info', duration = 5000) => {
    const container = Utils.$('.notification-container') || (() => {
      const cont = Utils.createElement('div', { className: 'notification-container' });
      document.body.appendChild(cont);
      return cont;
    })();

    const notification = Utils.createElement('div', {
      className: `notification notification-${type}`,
      'aria-live': 'polite',
      'aria-atomic': 'true'
    }, `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Cerrar notificación">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `);

    // Agregar al contenedor
    container.appendChild(notification);

    // Animación de entrada
    requestAnimationFrame(() => {
      notification.classList.add('notification-enter');
    });

    // Auto-remove
    const removeNotification = () => {
      notification.classList.add('notification-exit');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    };

    // Evento de cierre
    Utils.$('.notification-close', notification).addEventListener('click', removeNotification);

    // Auto-remove después del tiempo especificado
    if (duration > 0) {
      setTimeout(removeNotification, duration);
    }

    return notification;
  },

  success: (message, duration) => NotificationUtils.show(message, 'success', duration),
  error: (message, duration) => NotificationUtils.show(message, 'error', duration),
  warning: (message, duration) => NotificationUtils.show(message, 'warning', duration),
  info: (message, duration) => NotificationUtils.show(message, 'info', duration)
};

/* ===================================
   EXPORTAR UTILIDADES
   =================================== */

// Asignar al namespace global
Object.assign(window.PeruLogistics, {
  Utils,
  EventUtils,
  ValidationUtils,
  FormatUtils,
  StorageUtils,
  DeviceUtils,
  PerformanceUtils,
  URLUtils,
  NotificationUtils
});

// Atajos globales comunes (opcional)
window.$ = Utils.$;
window.$$ = Utils.$$;

/* ===================================
   INICIALIZACIÓN
   =================================== */

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Inicializar lazy loading
    PerformanceUtils.lazyLoadImages();
    
    // Medir tiempo de carga
    PerformanceUtils.measureLoadTime();
    
    // Agregar clases de dispositivo al body
    document.body.classList.add(
      DeviceUtils.isMobile() ? 'is-mobile' : 'is-desktop',
      DeviceUtils.isTouchDevice() ? 'is-touch' : 'is-no-touch',
      `browser-${DeviceUtils.getBrowser()}`,
      `os-${DeviceUtils.getOS()}`
    );
  });
} else {
  // El DOM ya está listo
  PerformanceUtils.lazyLoadImages();
  PerformanceUtils.measureLoadTime();
}