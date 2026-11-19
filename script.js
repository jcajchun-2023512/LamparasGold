/**
 * ==========================================================================
 * LamparasGold · SCRIPT PRINCIPAL
 * Interacciones de alta gama, animaciones a 60fps y accesibilidad
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Detección de dispositivos táctiles y preferencias de movimiento
  const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. NAVBAR: SCROLL BLUR & MENÚ MÓVIL
     ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');

  let isNavbarScrolled = false;
  const handleNavScroll = () => {
    const shouldScroll = window.scrollY > 40;
    if (shouldScroll !== isNavbarScrolled) {
      isNavbarScrolled = shouldScroll;
      navbar.classList.toggle('is-scrolled', shouldScroll);
    }
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Menú drawer móvil accesible con backdrop oscurecido
  const closeMobileMenu = () => {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    if (menuToggle) {
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    if (navBackdrop) navBackdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  const openMobileMenu = () => {
    if (!navLinks) return;
    navLinks.classList.add('is-open');
    if (menuToggle) {
      menuToggle.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
    }
    if (navBackdrop) navBackdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Cerrar menú al pulsar la tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  /* ==========================================================================
     CONFIGURACIÓN TAREA 2: LÁMPARA DEL HERO (BALANCEO + ILUMINACIÓN NATURAL)
     ========================================================================== */
  const HERO_LAMP_CONFIG = {
    // 1. Simulación de péndulo físico amortiguado y ráfagas suaves
    pendulum: {
      period: 5800,                // Periodo de oscilación principal en ms (~5.8 s)
      damping: 0.032,              // Coeficiente de amortiguación (oscilación continua realista)
      secondaryAmp: 0.65,          // Amplitud de microtorsión axial secundaria en grados (< 1°)
      secondaryPeriod: 4100,       // Periodo de torsión axial en ms (~4.1 s)
      gustIntervalMin: 8000,       // Intervalo mínimo para nueva ráfaga aleatoria (ms)
      gustIntervalMax: 15000,      // Intervalo máximo para nueva ráfaga aleatoria (ms)
      gustImpulseMin: 1.2,         // Impulso angular mínimo aportado por la ráfaga (grados)
      gustImpulseMax: 2.4,         // Impulso angular máximo aportado por la ráfaga (grados)
      mousePushFactor: 0.04,       // Sensibilidad al empuje horizontal del cursor en el Hero
      mousePushMax: 3.5            // Límite de deflexión máxima provocada por el mouse (grados)
    },

    // 2. Coordenadas de la bombilla G16C 5W (filamento cálido central)
    bulbs: [
      { id: 1, x: 50.0, y: 68.0 }
    ],

    // 3. Ciclo orgánico de encendido y enfriamiento de filamento incandescente
    lighting: {
      flickerCount: 3,             // Número de parpadeos de vacilación inicial (2 a 3)
      flickerIntervalMin: 60,      // Duración mínima de cada parpadeo rápido (ms)
      flickerIntervalMax: 140,     // Duración máxima de cada parpadeo rápido (ms)
      ignitionRampMin: 650,        // Tiempo mínimo para alcanzar el 100% de luz (ms)
      ignitionRampMax: 900,        // Tiempo máximo para alcanzar el 100% de luz (ms)
      bulbOffsetMax: 0,            // Foco único: sin desfase entre focos
      onHoldMin: 6000,             // Tiempo mínimo en estado encendido continuo (ms)
      onHoldMax: 12000,            // Tiempo máximo en estado encendido continuo (ms)
      breathingAmp: 0.035,         // Variación sutil de respiración incandescente (±3.5%)
      breathingFreq: 0.0028,       // Frecuencia de la respiración sutil
      cooldownMin: 950,            // Tiempo mínimo de enfriamiento paulatino al apagar (ms)
      cooldownMax: 1450,           // Tiempo máximo de enfriamiento paulatino al apagar (ms)
      offHoldMin: 1500,            // Tiempo mínimo en estado apagado / reposo (ms)
      offHoldMax: 3000,            // Tiempo máximo en estado apagado / reposo (ms)
      ambientLag: 0.08             // Factor de inercia/retraso visual del resplandor del arco
    }
  };

  /* ------------------------------------------------------------------------
     3. TAREA 2: LÁMPARA DEL HERO (BALANCEO + ILUMINACIÓN NATURAL A 60 FPS)
     ------------------------------------------------------------------------ */
  const heroVisual = document.getElementById('heroVisual');
  const heroPendulum = document.getElementById('heroPendulum');
  const heroLamp = document.getElementById('heroLamp');
  const heroLampLit = document.getElementById('heroLampLit');
  const lampBulbs = document.getElementById('lampBulbs');
  const heroArchGlow = document.getElementById('heroArchGlow');
  const heroFloorGlow = document.getElementById('heroFloorGlow');

  if (heroPendulum && heroLamp && heroLampLit && lampBulbs && heroVisual) {
    // Generar los 6 halos de filamento según las coordenadas configurables
    lampBulbs.innerHTML = '';
    const bulbHalos = HERO_LAMP_CONFIG.bulbs.map((b) => {
      const halo = document.createElement('div');
      halo.className = 'lamp-bulb-halo';
      halo.style.left = `${b.x}%`;
      halo.style.top = `${b.y}%`;
      lampBulbs.appendChild(halo);
      return halo;
    });

    if (prefersReducedMotion) {
      // Modo accesibilidad: lámpara estática y 100% encendida
      heroPendulum.style.transform = 'translateX(-50%) rotate(0deg)';
      heroLamp.style.transform = 'rotate(0deg)';
      heroLampLit.style.opacity = '1';
      if (heroArchGlow) heroArchGlow.style.opacity = '1';
      if (heroFloorGlow) heroFloorGlow.style.opacity = '1';
      bulbHalos.forEach(h => {
        h.style.opacity = '1';
        h.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    } else {
      let isHeroVisible = true;
      let heroRafId = null;
      let lastFrameTime = performance.now();
      let heroVisualRect = null;

      // --- Variables físicas del Péndulo ---
      let angle = 0;              // Ángulo actual del péndulo principal (grados)
      let angularVelocity = 0;    // Velocidad angular (rad/s)
      const omega0 = (2 * Math.PI) / (HERO_LAMP_CONFIG.pendulum.period / 1000); // Frecuencia natural
      const damping = HERO_LAMP_CONFIG.pendulum.damping;

      let mouseTargetAngle = 0;
      let mouseCurrentAngle = 0;
      let nextGustTime = performance.now() + 4000;

      // Reacción al cursor en el Hero (empuje suave con amortiguación natural en desktop)
      if (!isTouchDevice) {
        heroVisual.addEventListener('mousemove', (e) => {
          const rect = heroVisual.getBoundingClientRect();
          const relativeX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 a 0.5
          mouseTargetAngle = relativeX * HERO_LAMP_CONFIG.pendulum.mousePushMax * 2;
        }, { passive: true });

        heroVisual.addEventListener('mouseleave', () => {
          mouseTargetAngle = 0;
        });
      }

      // Reacción táctil hiperrealista para teléfono (empuje con el dedo + inercia al soltar)
      let isHeroTouching = false;

      heroVisual.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          isHeroTouching = true;
          heroVisualRect = heroVisual.getBoundingClientRect();
          const touchX = e.touches[0].clientX;
          const relativeX = Math.max(-0.5, Math.min(0.5, (touchX - heroVisualRect.left) / heroVisualRect.width - 0.5));
          mouseTargetAngle = relativeX * HERO_LAMP_CONFIG.pendulum.mousePushMax * 2.2;
        }
      }, { passive: true });

      heroVisual.addEventListener('touchmove', (e) => {
        if (!isHeroTouching || !e.touches || e.touches.length === 0) return;
        const touchX = e.touches[0].clientX;
        const rect = heroVisualRect || heroVisual.getBoundingClientRect();
        const relativeX = Math.max(-0.5, Math.min(0.5, (touchX - rect.left) / rect.width - 0.5));
        mouseTargetAngle = relativeX * HERO_LAMP_CONFIG.pendulum.mousePushMax * 2.2;
      }, { passive: true });

      const onHeroTouchEnd = () => {
        if (!isHeroTouching) return;
        isHeroTouching = false;
        // Al soltar el dedo, transferir momento inercial a la oscilación libre
        const releaseImpulse = (mouseTargetAngle * Math.PI / 180) * 0.45;
        angularVelocity += releaseImpulse;
        mouseTargetAngle = 0;
      };

      heroVisual.addEventListener('touchend', onHeroTouchEnd, { passive: true });
      heroVisual.addEventListener('touchcancel', onHeroTouchEnd, { passive: true });

      // --- Variables del Motor de Iluminación Orgánica ---
      let lightState = 'ON_HOLD'; // 'IGNITION', 'ON_HOLD', 'COOLDOWN', 'OFF_HOLD'
      let stateStartTime = performance.now();
      let stateDuration = 7000;
      let flickers = [];
      let bulbOffsets = HERO_LAMP_CONFIG.bulbs.map(() => Math.random() * HERO_LAMP_CONFIG.lighting.bulbOffsetMax);
      let litOpacity = 1;
      let bulbOpacities = HERO_LAMP_CONFIG.bulbs.map(() => 1);
      let ambientGlow = 0.85;

      const randomRange = (min, max) => min + Math.random() * (max - min);

      const setupIgnitionState = (now) => {
        lightState = 'IGNITION';
        stateStartTime = now;
        bulbOffsets = HERO_LAMP_CONFIG.bulbs.map(() => Math.random() * HERO_LAMP_CONFIG.lighting.bulbOffsetMax);
        const rampDuration = randomRange(HERO_LAMP_CONFIG.lighting.ignitionRampMin, HERO_LAMP_CONFIG.lighting.ignitionRampMax);

        // Generar 2 o 3 parpadeos rápidos e irregulares
        const count = HERO_LAMP_CONFIG.lighting.flickerCount;
        flickers = [];
        let currTime = 0;
        for (let i = 0; i < count; i++) {
          const onTime = randomRange(HERO_LAMP_CONFIG.lighting.flickerIntervalMin, HERO_LAMP_CONFIG.lighting.flickerIntervalMax);
          const offTime = randomRange(HERO_LAMP_CONFIG.lighting.flickerIntervalMin * 0.7, HERO_LAMP_CONFIG.lighting.flickerIntervalMax * 0.9);
          flickers.push({ start: currTime, end: currTime + onTime, peak: randomRange(0.35, 0.75) });
          currTime += onTime + offTime;
        }
        flickers.rampStart = currTime;
        flickers.rampEnd = currTime + rampDuration;
        stateDuration = flickers.rampEnd;
      };

      const setupOnHoldState = (now) => {
        lightState = 'ON_HOLD';
        stateStartTime = now;
        stateDuration = randomRange(HERO_LAMP_CONFIG.lighting.onHoldMin, HERO_LAMP_CONFIG.lighting.onHoldMax);
      };

      const setupCooldownState = (now) => {
        lightState = 'COOLDOWN';
        stateStartTime = now;
        stateDuration = randomRange(HERO_LAMP_CONFIG.lighting.cooldownMin, HERO_LAMP_CONFIG.lighting.cooldownMax);
      };

      const setupOffHoldState = (now) => {
        lightState = 'OFF_HOLD';
        stateStartTime = now;
        stateDuration = randomRange(HERO_LAMP_CONFIG.lighting.offHoldMin, HERO_LAMP_CONFIG.lighting.offHoldMax);
      };

      // Loop de renderizado cinemático a 60 fps
      const renderHeroLamp = (now) => {
        if (!isHeroVisible || document.hidden) {
          heroRafId = null;
          return;
        }

        const dt = Math.min((now - lastFrameTime) / 1000, 0.05); // Limitar dt a 50ms máximo
        lastFrameTime = now;

        // 1. Ráfagas suaves aleatorias cada 8 a 15 s
        if (now >= nextGustTime) {
          const direction = Math.random() > 0.5 ? 1 : -1;
          const impulseDeg = randomRange(HERO_LAMP_CONFIG.pendulum.gustImpulseMin, HERO_LAMP_CONFIG.pendulum.gustImpulseMax);
          angularVelocity += (impulseDeg * direction * Math.PI) / 180;
          nextGustTime = now + randomRange(HERO_LAMP_CONFIG.pendulum.gustIntervalMin, HERO_LAMP_CONFIG.pendulum.gustIntervalMax);
        }

        // 2. Dinámica del oscilador armónico amortiguado
        const radAngle = (angle * Math.PI) / 180;
        const angularAccel = -Math.pow(omega0, 2) * radAngle - 2 * damping * omega0 * angularVelocity;
        angularVelocity += angularAccel * dt;
        angle += (angularVelocity * 180 / Math.PI) * dt;

        // Amortiguación del empuje del cursor
        mouseCurrentAngle += (mouseTargetAngle - mouseCurrentAngle) * (dt * 4);
        const finalSwingAngle = angle + mouseCurrentAngle;

        // 3. Torsión axial secundaria muy sutil (< 1°)
        const secondaryAngle = HERO_LAMP_CONFIG.pendulum.secondaryAmp * Math.sin((now / HERO_LAMP_CONFIG.pendulum.secondaryPeriod) * 2 * Math.PI);

        // Aplicar rotaciones
        heroPendulum.style.transform = `translateX(-50%) rotate(${finalSwingAngle.toFixed(3)}deg)`;
        heroLamp.style.transform = `rotate(${secondaryAngle.toFixed(3)}deg)`;

        // 4. Secuencia de Iluminación Orgánica
        const elapsed = now - stateStartTime;

        if (lightState === 'IGNITION') {
          if (elapsed < flickers.rampStart) {
            // Parpadeos rápidos de filamento
            let flickerVal = 0;
            for (const f of flickers) {
              if (elapsed >= f.start && elapsed <= f.end) {
                const p = (elapsed - f.start) / (f.end - f.start);
                flickerVal = Math.sin(p * Math.PI) * f.peak;
                break;
              }
            }
            litOpacity = flickerVal;
            bulbOpacities = HERO_LAMP_CONFIG.bulbs.map(() => flickerVal);
          } else {
            // Subida gradual al 100% con desfase entre focos
            const rampProgress = Math.min((elapsed - flickers.rampStart) / (flickers.rampEnd - flickers.rampStart), 1);
            const easedRamp = Math.pow(rampProgress, 2);
            litOpacity = Math.min(1, easedRamp);
            bulbOpacities = HERO_LAMP_CONFIG.bulbs.map((_, i) => {
              const bStart = flickers.rampStart + bulbOffsets[i];
              if (elapsed < bStart) return 0;
              const bProg = Math.min((elapsed - bStart) / (flickers.rampEnd - bStart), 1);
              return Math.pow(bProg, 2);
            });
          }

          if (elapsed >= stateDuration) setupOnHoldState(now);

        } else if (lightState === 'ON_HOLD') {
          // Respiración incandescente sutil (±3%)
          const breath = Math.sin(now * HERO_LAMP_CONFIG.lighting.breathingFreq) * HERO_LAMP_CONFIG.lighting.breathingAmp;
          const microFlicker = (Math.random() - 0.5) * 0.008;
          litOpacity = Math.max(0.92, Math.min(1, 0.97 + breath + microFlicker));
          bulbOpacities = HERO_LAMP_CONFIG.bulbs.map((_, i) => {
            const bBreath = Math.sin(now * HERO_LAMP_CONFIG.lighting.breathingFreq + i) * (HERO_LAMP_CONFIG.lighting.breathingAmp * 0.7);
            return Math.max(0.9, Math.min(1, 0.96 + bBreath));
          });

          if (elapsed >= stateDuration) setupCooldownState(now);

        } else if (lightState === 'COOLDOWN') {
          // Enfriamiento gradual del filamento (900 a 1500 ms)
          const coolProgress = Math.min(elapsed / stateDuration, 1);
          const easeCool = Math.pow(1 - coolProgress, 2.5);
          litOpacity = easeCool;
          bulbOpacities = HERO_LAMP_CONFIG.bulbs.map((_, i) => {
            const bElapsed = Math.max(0, elapsed - (bulbOffsets[i] * 0.4));
            const bProg = Math.min(bElapsed / stateDuration, 1);
            return Math.pow(1 - bProg, 2.5);
          });

          if (elapsed >= stateDuration) setupOffHoldState(now);

        } else if (lightState === 'OFF_HOLD') {
          // Apagado: permanece la capa base atenuada
          litOpacity = 0;
          bulbOpacities = HERO_LAMP_CONFIG.bulbs.map(() => 0);

          if (elapsed >= stateDuration) setupIgnitionState(now);
        }

        // Aplicar opacidades a las capas DOM
        heroLampLit.style.opacity = litOpacity.toFixed(3);
        bulbHalos.forEach((halo, idx) => {
          const bOp = bulbOpacities[idx];
          halo.style.opacity = bOp.toFixed(3);
          halo.style.transform = `translate(-50%, -50%) scale(${(0.85 + bOp * 0.25).toFixed(3)})`;
        });

        // 5. Inercia lumínica en los resplandores ambiental del arco y del suelo
        ambientGlow += (litOpacity - ambientGlow) * HERO_LAMP_CONFIG.lighting.ambientLag;
        if (heroArchGlow) {
          heroArchGlow.style.opacity = (0.15 + 0.8 * ambientGlow).toFixed(3);
        }
        if (heroFloorGlow) {
          heroFloorGlow.style.opacity = (0.1 + 0.85 * ambientGlow).toFixed(3);
        }

        heroRafId = requestAnimationFrame(renderHeroLamp);
      };

      const startHeroAnimation = () => {
        if (!heroRafId && isHeroVisible && !document.hidden) {
          lastFrameTime = performance.now();
          heroRafId = requestAnimationFrame(renderHeroLamp);
        }
      };

      const stopHeroAnimation = () => {
        if (heroRafId) {
          cancelAnimationFrame(heroRafId);
          heroRafId = null;
        }
      };

      startHeroAnimation();

      // IntersectionObserver para pausar el loop cuando el Hero sale de pantalla
      const heroObserver = new IntersectionObserver((entries) => {
        isHeroVisible = entries[0].isIntersecting;
        if (isHeroVisible) {
          startHeroAnimation();
        } else {
          stopHeroAnimation();
        }
      }, { threshold: 0.05 });
      heroObserver.observe(heroVisual);

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopHeroAnimation();
        } else if (isHeroVisible) {
          startHeroAnimation();
        }
      });
    }
  }

  // Activar balanceo natural en lámparas con data-pendulum
  document.querySelectorAll('[data-pendulum]').forEach((lamp) => {
    lamp.classList.add('is-swinging');
  });

  /* ------------------------------------------------------------------------
     4. CONTADORES ANIMADOS (Estadísticas 9K+, 2k+, 28+)
     ------------------------------------------------------------------------ */
  const statCounters = document.querySelectorAll('.counter');
  let hasAnimatedStats = false;

  const animateCounters = () => {
    statCounters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0', 10);
      const duration = 1600; // ms
      const startTime = performance.now();

      const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        // Easing cúbico de desaceleración
        const ease = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(ease * target).toString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target.toString();
        }
      };
      requestAnimationFrame(step);
    });
  };

  const statsRow = document.getElementById('statsRow');
  if (statsRow) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimatedStats) {
          hasAnimatedStats = true;
          animateCounters();
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.15 });
    statsObserver.observe(statsRow);
  }

  /* ------------------------------------------------------------------------
     5. EFECTO 3D TILT EN TARJETAS DE PRODUCTO
     ------------------------------------------------------------------------ */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  if (!isTouchDevice && !prefersReducedMotion) {
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        if (popularViewport && popularViewport.classList.contains('is-dragging')) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7; // grados
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     SECCIÓN 2: CARRUSEL CONTROLADO POR EL USUARIO ("POPULAR PRODUCT")
     - Sin flechas visuales de navegación (eliminadas)
     - Autoplay completamente desactivado (cero temporizadores/intervalos)
     - Desplazamiento manual mediante swipe táctil en móvil y drag con mouse en desktop
     - Sin listeners globales no pasivos que bloqueen el hilo del scroll vertical
     - Posición fija y estable sin reinicios ni saltos inesperados
     ========================================================================== */
  const CAROUSEL_CONFIG = {
    transitionDuration: 550,       // Duración del desplazamiento suave (ms)
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Easing suave natural
    gap: 28,                       // Espaciado entre tarjetas en px
    dragThreshold: 0.15,           // Umbral de arrastre (% ancho de tarjeta para avanzar)
    inertiaFactor: 120,            // Multiplicador de inercia al soltar arrastre/swipe
    pulseDuration: 550,            // Duración del pulso en botón "+" (ms)
    responsive: [
      { minWidth: 1200, visibleCards: 4, activeOffset: 1 },   // Desktop: 4 tarjetas
      { minWidth: 992,  visibleCards: 3, activeOffset: 1 },   // Laptop: 3 tarjetas
      { minWidth: 680,  visibleCards: 2, activeOffset: 0 },   // Tablet: 2 tarjetas
      { minWidth: 480,  visibleCards: 1.25, activeOffset: 0 }, // Teléfono grande: 1 tarjeta + peek 25%
      { minWidth: 0,    visibleCards: 1.14, activeOffset: 0 }  // Teléfono estándar: 1 tarjeta + peek 14%
    ]
  };

  const popularViewport = document.getElementById('popularViewport');
  const popularTrack = document.getElementById('popularTrack');

  if (popularViewport && popularTrack) {
    const originalCards = Array.from(popularTrack.children);
    const originalCount = originalCards.length;

    // Clonar tarjetas al inicio y al final para loop continuo al deslizar
    const clonesBefore = originalCards.map(c => c.cloneNode(true));
    const clonesAfter = originalCards.map(c => c.cloneNode(true));

    clonesBefore.reverse().forEach(clone => {
      clone.setAttribute('aria-hidden', 'true');
      popularTrack.insertBefore(clone, popularTrack.firstChild);
    });
    clonesAfter.forEach(clone => {
      clone.setAttribute('aria-hidden', 'true');
      popularTrack.appendChild(clone);
    });

    const allCards = Array.from(popularTrack.children);
    const baseOffset = originalCount;

    let currentIndex = baseOffset;
    let visibleCards = 4;
    let activeOffset = 1;
    let cardWidth = 280;
    let step = 308;
    let isTransitioning = false;
    let isDragging = false;

    // Calcular medidas y dimensiones responsive
    const updateDimensions = () => {
      const width = window.innerWidth;
      const conf = CAROUSEL_CONFIG.responsive.find(r => width >= r.minWidth) || CAROUSEL_CONFIG.responsive[CAROUSEL_CONFIG.responsive.length - 1];
      visibleCards = conf.visibleCards;
      activeOffset = conf.activeOffset;

      const viewportWidth = popularViewport.clientWidth;
      const gap = CAROUSEL_CONFIG.gap;
      cardWidth = (viewportWidth - (Math.floor(visibleCards) - 1) * gap) / visibleCards;
      step = cardWidth + gap;

      popularViewport.style.setProperty('--card-width', `${cardWidth.toFixed(2)}px`);
      popularViewport.style.setProperty('--carousel-gap', `${gap}px`);

      // Posicionar sin transición durante resize
      popularTrack.classList.add('no-transition');
      popularTrack.style.transform = `translate3d(${-currentIndex * step}px, 0, 0)`;
      popularTrack.offsetHeight;
      popularTrack.classList.remove('no-transition');

      updateActiveState(false);
    };

    // Actualizar estado resaltado de la tarjeta activa
    const updateActiveState = (triggerPulse = true) => {
      allCards.forEach(card => card.classList.remove('is-active'));
      const activeCardIndex = currentIndex + activeOffset;
      const activeCard = allCards[activeCardIndex];

      if (activeCard) {
        activeCard.classList.add('is-active');

        if (triggerPulse) {
          const btnPlus = activeCard.querySelector('.btn-plus');
          if (btnPlus) {
            btnPlus.classList.remove('is-pulsing');
            void btnPlus.offsetWidth;
            btnPlus.classList.add('is-pulsing');
            setTimeout(() => btnPlus.classList.remove('is-pulsing'), CAROUSEL_CONFIG.pulseDuration);
          }
        }
      }
    };

    // Mover carrusel a un índice con translate3d
    const moveTo = (index, smooth = true) => {
      if (isTransitioning && smooth) return;
      isTransitioning = smooth;
      currentIndex = index;

      if (smooth) {
        popularTrack.style.transition = `transform ${CAROUSEL_CONFIG.transitionDuration}ms ${CAROUSEL_CONFIG.easing}`;
      } else {
        popularTrack.classList.add('no-transition');
      }

      popularTrack.style.transform = `translate3d(${-currentIndex * step}px, 0, 0)`;

      if (!smooth) {
        popularTrack.offsetHeight;
        popularTrack.classList.remove('no-transition');
        isTransitioning = false;
      }

      updateActiveState(smooth);
    };

    // Ajuste silencioso del bucle infinito al terminar la transición
    popularTrack.addEventListener('transitionend', (e) => {
      if (e.target !== popularTrack) return;
      isTransitioning = false;

      if (currentIndex >= baseOffset + originalCount) {
        moveTo(currentIndex - originalCount, false);
      } else if (currentIndex < baseOffset) {
        moveTo(currentIndex + originalCount, false);
      }
    });

    // --- Control Desktop (Arrastre con mouse) ---
    let mouseStartX = 0;
    let mouseDeltaX = 0;
    let mouseLastX = 0;
    let mouseLastTime = 0;
    let mouseVelocity = 0;

    const onMouseMove = (e) => {
      if (!isDragging) return;
      mouseDeltaX = e.clientX - mouseStartX;
      if (Math.abs(mouseDeltaX) > 6) {
        window._isPopularDragging = true;
      }

      const now = performance.now();
      const dt = now - mouseLastTime;
      if (dt > 10) {
        mouseVelocity = (e.clientX - mouseLastX) / dt;
        mouseLastX = e.clientX;
        mouseLastTime = now;
      }

      const currentTransform = -currentIndex * step + mouseDeltaX;
      popularTrack.style.transform = `translate3d(${currentTransform.toFixed(2)}px, 0, 0)`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      popularViewport.classList.remove('is-dragging');
      popularTrack.classList.remove('no-transition');

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const inertia = mouseVelocity * CAROUSEL_CONFIG.inertiaFactor;
      const totalDisplacement = mouseDeltaX + inertia;
      const threshold = cardWidth * CAROUSEL_CONFIG.dragThreshold;

      if (Math.abs(totalDisplacement) > threshold) {
        if (totalDisplacement < 0) {
          moveTo(currentIndex + 1, true);
        } else {
          moveTo(currentIndex - 1, true);
        }
      } else {
        moveTo(currentIndex, true);
      }

      setTimeout(() => {
        window._isPopularDragging = false;
      }, 100);
    };

    const onMouseDown = (e) => {
      if (isTransitioning || e.button !== 0) return;
      isDragging = true;
      mouseStartX = e.clientX;
      mouseLastX = mouseStartX;
      mouseLastTime = performance.now();
      mouseDeltaX = 0;
      mouseVelocity = 0;

      popularTrack.classList.add('no-transition');
      popularViewport.classList.add('is-dragging');

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    popularViewport.addEventListener('mousedown', onMouseDown);

    // --- Control Táctil en Móvil (Axis Locking: Scroll vertical nativo libre, swipe horizontal suave) ---
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;
    let touchLastX = 0;
    let touchLastTime = 0;
    let touchVelocity = 0;
    let touchDirection = null; // 'horizontal' | 'vertical' | null

    const onTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const curX = e.touches[0].clientX;
      const curY = e.touches[0].clientY;
      const diffX = curX - touchStartX;
      const diffY = curY - touchStartY;

      if (!touchDirection) {
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        if (absX > 8 || absY > 8) {
          if (absX >= absY) {
            touchDirection = 'horizontal';
            window._isPopularDragging = true;
            popularTrack.classList.add('no-transition');
            popularViewport.classList.add('is-dragging');
          } else {
            // El usuario desea desplazarse verticalmente por la página: desconectar inmediatamente
            touchDirection = 'vertical';
            cleanupTouchListeners();
            return;
          }
        } else {
          return;
        }
      }

      if (touchDirection !== 'horizontal') return;

      if (e.cancelable) {
        e.preventDefault(); // Prevenir scroll vertical únicamente mientras se realiza el swipe horizontal en el carrusel
      }

      touchDeltaX = diffX;
      const now = performance.now();
      const dt = now - touchLastTime;
      if (dt > 10) {
        touchVelocity = (curX - touchLastX) / dt;
        touchLastX = curX;
        touchLastTime = now;
      }

      const currentTransform = -currentIndex * step + touchDeltaX;
      popularTrack.style.transform = `translate3d(${currentTransform.toFixed(2)}px, 0, 0)`;
    };

    const cleanupTouchListeners = () => {
      popularViewport.removeEventListener('touchmove', onTouchMove);
      popularViewport.removeEventListener('touchend', onTouchEnd);
      popularViewport.removeEventListener('touchcancel', onTouchEnd);
    };

    const onTouchEnd = () => {
      cleanupTouchListeners();

      if (touchDirection === 'horizontal') {
        popularViewport.classList.remove('is-dragging');
        popularTrack.classList.remove('no-transition');

        const inertia = touchVelocity * CAROUSEL_CONFIG.inertiaFactor;
        const totalDisplacement = touchDeltaX + inertia;
        const threshold = cardWidth * CAROUSEL_CONFIG.dragThreshold;

        if (Math.abs(totalDisplacement) > threshold) {
          if (totalDisplacement < 0) {
            moveTo(currentIndex + 1, true);
          } else {
            moveTo(currentIndex - 1, true);
          }
        } else {
          moveTo(currentIndex, true);
        }

        setTimeout(() => {
          window._isPopularDragging = false;
        }, 120);
      }

      touchDirection = null;
    };

    popularViewport.addEventListener('touchstart', (e) => {
      if (isTransitioning || !e.touches || e.touches.length === 0) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLastX = touchStartX;
      touchLastTime = performance.now();
      touchDeltaX = 0;
      touchVelocity = 0;
      touchDirection = null;

      // Vincular listeners solo mientras dure el toque actual iniciado dentro de popularViewport
      popularViewport.addEventListener('touchmove', onTouchMove, { passive: false });
      popularViewport.addEventListener('touchend', onTouchEnd, { passive: true });
      popularViewport.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }, { passive: true });

    // Inicialización y Resize controlado (evita reinicios por cambios de barra de URL en móvil)
    let lastWindowWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWindowWidth) return;
      lastWindowWidth = window.innerWidth;
      clearTimeout(window._carouselResizeTimer);
      window._carouselResizeTimer = setTimeout(updateDimensions, 100);
    }, { passive: true });

    updateDimensions();
  }

  /* ------------------------------------------------------------------------
     7. ACORDEÓN EN "WHY CHOOSE US" (03)
     ------------------------------------------------------------------------ */
  const accordion = document.getElementById('whyAccordion');
  if (accordion) {
    const items = accordion.querySelectorAll('.accordion__item');

    // Inicializar altura del elemento abierto por defecto
    items.forEach((item) => {
      const collapse = item.querySelector('.accordion__collapse');
      if (item.classList.contains('is-open') && collapse) {
        collapse.style.maxHeight = collapse.scrollHeight + 'px';
        collapse.removeAttribute('hidden');
      }
    });

    items.forEach((item) => {
      const header = item.querySelector('.accordion__header');
      const collapse = item.querySelector('.accordion__collapse');

      if (!header || !collapse) return;

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Cerrar todos los demás items
        items.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('.accordion__header');
            const otherCollapse = other.querySelector('.accordion__collapse');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherCollapse) {
              otherCollapse.style.maxHeight = '0px';
              setTimeout(() => otherCollapse.setAttribute('hidden', ''), 350);
            }
          }
        });

        // Alternar el item actual
        if (isOpen) {
          item.classList.remove('is-open');
          header.setAttribute('aria-expanded', 'false');
          collapse.style.maxHeight = '0px';
          setTimeout(() => collapse.setAttribute('hidden', ''), 350);
        } else {
          item.classList.add('is-open');
          header.setAttribute('aria-expanded', 'true');
          collapse.removeAttribute('hidden');
          collapse.style.maxHeight = collapse.scrollHeight + 'px';
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. FILTROS DE CATEGORÍA EN "OUR PRODUCT" (04)
     ------------------------------------------------------------------------ */
  const filterPills = document.querySelectorAll('.pill-filter');
  const productCards = document.querySelectorAll('#ourProductsGrid .arch-card');

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');

      const filter = pill.getAttribute('data-filter') || 'all';

      productCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Controles prev/next de catálogo en Our Product
  const ourProdPrev = document.getElementById('ourProdPrev');
  const ourProdNext = document.getElementById('ourProdNext');
  if (ourProdPrev && ourProdNext) {
    ourProdPrev.addEventListener('click', () => {
      window.scrollBy({ top: -350, behavior: 'smooth' });
    });
    ourProdNext.addEventListener('click', () => {
      window.scrollBy({ top: 350, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     9. MODAL DE VIDEO PRESENTACIÓN
     ------------------------------------------------------------------------ */
  const btnPlayVideo = document.getElementById('btnPlayVideo');
  const videoModal = document.getElementById('videoModal');
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');

  const openModal = () => {
    if (!videoModal) return;
    videoModal.classList.add('is-active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!videoModal) return;
    videoModal.classList.remove('is-active');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (btnPlayVideo) btnPlayVideo.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('is-active')) {
      closeModal();
    }
  });

  /* ------------------------------------------------------------------------
     12. EFECTO ONDA (RIPPLE) EN BOTONES TERRACOTA
     ------------------------------------------------------------------------ */
  const primaryButtons = document.querySelectorAll('.btn--primary, .btn-plus');
  primaryButtons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      const rect = this.getBoundingClientRect();

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.style.position = 'absolute';
      circle.style.borderRadius = '50%';
      circle.style.transform = 'scale(0)';
      circle.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
      circle.style.pointerEvents = 'none';
      circle.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';

      this.appendChild(circle);

      requestAnimationFrame(() => {
        circle.style.transform = 'scale(2.5)';
        circle.style.opacity = '0';
      });

      setTimeout(() => {
        circle.remove();
      }, 650);
    });
  });

  /* ------------------------------------------------------------------------
     13. INTERACCIÓN DE TARJETAS DE PRODUCTO (ARCH-CARD):
     - Pequeña descripción interactiva al hacer clic
     - Manejo accesible (teclado + clic en tarjeta o botón 'Ver detalles')
     - Cierre automático de otras tarjetas abiertas para mantener armonía visual
     ------------------------------------------------------------------------ */
  const initProductCardDescriptions = () => {
    const cards = document.querySelectorAll('.arch-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      // Evitar que el clic en enlaces internos (WhatsApp, cotizar) colapse la tarjeta
      const interactiveLinks = card.querySelectorAll('a, .btn-plus');
      interactiveLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      });

      const toggleCard = (e) => {
        // Si el usuario está arrastrando/deslizando en el carrusel, no expandir detalles
        if (window._isPopularDragging) {
          return;
        }

        // Si el clic proviene de un link o botón con enlace a WhatsApp, no interferir
        if (e && e.target && e.target.closest('a')) {
          return;
        }

        const isCurrentlyExpanded = card.classList.contains('is-expanded');

        // Cerrar otras tarjetas abiertas para mantener la cuadrícula ordenada
        cards.forEach((otherCard) => {
          if (otherCard !== card && otherCard.classList.contains('is-expanded')) {
            otherCard.classList.remove('is-expanded');
            const otherHintBtn = otherCard.querySelector('.arch-card__toggle-hint');
            if (otherHintBtn) {
              otherHintBtn.setAttribute('aria-expanded', 'false');
              const textSpan = otherHintBtn.querySelector('.arch-card__toggle-text');
              if (textSpan) textSpan.textContent = 'Ver detalles';
            }
            const otherDesc = otherCard.querySelector('.arch-card__desc');
            if (otherDesc) otherDesc.setAttribute('aria-hidden', 'true');
          }
        });

        // Alternar el estado de esta tarjeta
        if (isCurrentlyExpanded) {
          card.classList.remove('is-expanded');
          const hintBtn = card.querySelector('.arch-card__toggle-hint');
          if (hintBtn) {
            hintBtn.setAttribute('aria-expanded', 'false');
            const textSpan = hintBtn.querySelector('.arch-card__toggle-text');
            if (textSpan) textSpan.textContent = 'Ver detalles';
          }
          const desc = card.querySelector('.arch-card__desc');
          if (desc) desc.setAttribute('aria-hidden', 'true');
        } else {
          card.classList.add('is-expanded');
          const hintBtn = card.querySelector('.arch-card__toggle-hint');
          if (hintBtn) {
            hintBtn.setAttribute('aria-expanded', 'true');
            const textSpan = hintBtn.querySelector('.arch-card__toggle-text');
            if (textSpan) textSpan.textContent = 'Ocultar detalles';
          }
          const desc = card.querySelector('.arch-card__desc');
          if (desc) desc.setAttribute('aria-hidden', 'false');

          // Pequeño pulso en el botón Cotizar (+) para guiar la acción comercial
          const plusBtn = card.querySelector('.btn-plus');
          if (plusBtn) {
            plusBtn.classList.remove('is-pulsing');
            void plusBtn.offsetWidth;
            plusBtn.classList.add('is-pulsing');
          }
        }
      };

      // Clic en la tarjeta o botón de detalles
      card.addEventListener('click', toggleCard);

      // Accesibilidad: permitir Enter y Espacio
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!e.target.closest('a')) {
            e.preventDefault();
            toggleCard(e);
          }
        }
      });
    });
  };

  initProductCardDescriptions();

  /* ------------------------------------------------------------------------
     14. SCROLL REVEAL CINEMATOGRÁFICO
     ------------------------------------------------------------------------ */
  const initScrollReveal = () => {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('is-in-view');
      });
      return;
    }

    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  };

  initScrollReveal();

});
