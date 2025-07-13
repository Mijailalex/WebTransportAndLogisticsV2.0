/* ===================================
   PERU LOGISTICS - SISTEMA DE ANIMACIONES COMPLETO
   =================================== */

'use strict';

const AnimationSystem = (() => {
  let state = {
    scrollRevealObserver: null,
    counterObserver: null,
    parallaxElements: [],
    isReducedMotion: false,
    animationQueue: [],
    isProcessingQueue: false
  };

  const config = {
    scrollReveal: {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    },
    counters: {
      threshold: 0.3,
      rootMargin: '0px'
    },
    parallax: {
      factor: 0.5,
      threshold: 16
    },
    stagger: {
      delay: 100,
      maxDelay: 800
    }
  };

  const init = () => {
    detectReducedMotion();
    
    if (!state.isReducedMotion) {
      setupScrollReveal();
      setupCounterAnimations();
      setupParallaxEffects();
      setupSliderAnimations();
    }
    
    console.log('✅ Sistema de animaciones inicializado');
  };

  const detectReducedMotion = () => {
    state.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (state.isReducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  };

  const setupScrollReveal = () => {
    if (!('IntersectionObserver' in window)) {
      showAllElements();
      return;
    }

    state.scrollRevealObserver = new IntersectionObserver(
      handleScrollReveal,
      config.scrollReveal
    );

    const revealElements = window.PeruLogistics.Utils.$$([
      '.scroll-reveal',
      '.scroll-reveal-left',
      '.scroll-reveal-right',
      '.scroll-reveal-scale',
      '.scroll-stagger > *',
      '.grid-stagger > *',
      '.timeline-item',
      '.feature-card',
      '.service-card',
      '.news-card',
      '.value-card',
      '.benefit-card'
    ].join(', '));

    revealElements.forEach((element, index) => {
      if (element.closest('.scroll-stagger, .grid-stagger')) {
        const staggerIndex = Array.from(element.parentNode.children).indexOf(element);
        element.style.setProperty('--stagger-delay', `${Math.min(staggerIndex * config.stagger.delay, config.stagger.maxDelay)}ms`);
      }

      state.scrollRevealObserver.observe(element);
    });
  };

  const handleScrollReveal = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        state.scrollRevealObserver.unobserve(entry.target);
      }
    });
  };

  const revealElement = (element) => {
    const delay = element.style.getPropertyValue('--stagger-delay') || '0ms';
    
    if (delay && delay !== '0ms') {
      setTimeout(() => {
        element.classList.add('visible');
        triggerCustomAnimation(element);
      }, parseInt(delay));
    } else {
      element.classList.add('visible');
      triggerCustomAnimation(element);
    }
  };

  const triggerCustomAnimation = (element) => {
    window.PeruLogistics.EventUtils.trigger(element, 'elementRevealed', {
      element: element
    });
  };

  const showAllElements = () => {
    const elements = window.PeruLogistics.Utils.$$('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    elements.forEach(element => {
      element.classList.add('visible');
    });
  };

  const setupCounterAnimations = () => {
    if (!('IntersectionObserver' in window)) return;

    state.counterObserver = new IntersectionObserver(
      handleCounterAnimation,
      config.counters
    );

    const counterElements = window.PeruLogistics.Utils.$$('.stat-number, .counter');
    counterElements.forEach(element => {
      state.counterObserver.observe(element);
    });
  };

  const handleCounterAnimation = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        state.counterObserver.unobserve(entry.target);
      }
    });
  };

  const animateCounter = (element) => {
    const target = parseInt(element.textContent.replace(/\D/g, ''));
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  };

  const setupParallaxEffects = () => {
    state.parallaxElements = window.PeruLogistics.Utils.$$('.hero-parallax, [data-parallax]');
    
    if (state.parallaxElements.length > 0) {
      window.addEventListener('scroll', window.PeruLogistics.EventUtils.throttle(updateParallax, 16));
    }
  };

  const updateParallax = () => {
    const scrollY = window.pageYOffset;
    
    state.parallaxElements.forEach(element => {
      const rate = scrollY * config.parallax.factor;
      element.style.transform = `translateY(${rate}px)`;
    });
  };

  const setupSliderAnimations = () => {
    const sliders = window.PeruLogistics.Utils.$$('.slider-container');
    
    sliders.forEach(container => {
      initializeSlider(container);
    });
  };

  const initializeSlider = (container) => {
    const slider = window.PeruLogistics.Utils.$('.slider', container);
    const slides = window.PeruLogistics.Utils.$$('.slide', slider);
    const prevBtn = window.PeruLogistics.Utils.$('.prev-btn', container);
    const nextBtn = window.PeruLogistics.Utils.$('.next-btn', container);
    const indicators = window.PeruLogistics.Utils.$$('.indicator', container);
    
    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoPlayInterval;

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
        indicator.setAttribute('aria-selected', i === index);
      });
      
      currentSlide = index;
    };

    const nextSlide = () => {
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
    };

    const prevSlide = () => {
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev);
    };

    const startAutoPlay = () => {
      autoPlayInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoPlay = () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
      stopAutoPlay();
      nextSlide();
      startAutoPlay();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
      stopAutoPlay();
      prevSlide();
      startAutoPlay();
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        stopAutoPlay();
        showSlide(index);
        startAutoPlay();
      });
    });

    // Touch events
    let startX = 0;
    let endX = 0;

    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    slider.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        stopAutoPlay();
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        startAutoPlay();
      }
    });

    // Pause on hover
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);

    // Initialize
    showSlide(0);
    startAutoPlay();
  };

  const publicAPI = {
    init,
    get isReducedMotion() { return state.isReducedMotion; }
  };

  return publicAPI;
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AnimationSystem.init);
} else {
  AnimationSystem.init();
}

window.PeruLogistics.Animations = AnimationSystem;