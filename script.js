/**
 * ==========================================================================
 * SULIGHT · SCRIPT PRINCIPAL
 * Interacciones de alta gama, animaciones a 60fps y accesibilidad
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Detección de dispositivos táctiles y preferencias de movimiento
  const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. CURSOR PERSONALIZADO (Solo Desktop)
     ------------------------------------------------------------------------ */
  const customCursor = document.getElementById('customCursor');
  const customCursorFollower = document.getElementById('customCursorFollower');

  if (!isTouchDevice && customCursor && customCursorFollower && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      customCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    // Loop suave de seguimiento (inercia fluida)
    const renderCursor = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      customCursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Expandir cursor sobre elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, .arch-card, .feature-tile, .accordion__header, input');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        customCursor.classList.add('custom-cursor--hover');
        customCursorFollower.classList.add('custom-cursor-follower--hover');
      });
      el.addEventListener('mouseleave', () => {
        customCursor.classList.remove('custom-cursor--hover');
        customCursorFollower.classList.remove('custom-cursor-follower--hover');
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. NAVBAR: SCROLL BLUR & MENÚ MÓVIL
     ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  const handleNavScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Menú hamburguesa accesible
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
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

    // 2. Coordenadas de los 6 focos (% relativos al contenedor del candelabro)
    bulbs: [
      { id: 1, x: 15.1, y: 81.5 }, // Foco 1: inferior izquierdo
      { id: 2, x: 19.0, y: 62.7 }, // Foco 2: medio izquierdo
      { id: 3, x: 41.5, y: 92.6 }, // Foco 3: inferior centro-izquierdo
      { id: 4, x: 59.8, y: 66.7 }, // Foco 4: centro-medio
      { id: 5, x: 60.7, y: 70.4 }, // Foco 5: inferior centro-derecho
      { id: 6, x: 88.4, y: 53.2 }  // Foco 6: superior derecho
    ],

    // 3. Ciclo orgánico de encendido y enfriamiento de filamento incandescente
    lighting: {
      flickerCount: 3,             // Número de parpadeos de vacilación inicial (2 a 3)
      flickerIntervalMin: 60,      // Duración mínima de cada parpadeo rápido (ms)
      flickerIntervalMax: 140,     // Duración máxima de cada parpadeo rápido (ms)
      ignitionRampMin: 650,        // Tiempo mínimo para alcanzar el 100% de luz (ms)
      ignitionRampMax: 900,        // Tiempo máximo para alcanzar el 100% de luz (ms)
      bulbOffsetMax: 250,          // Desfase máximo de encendido entre focos individuales (ms)
      onHoldMin: 6000,             // Tiempo mínimo en estado encendido continuo (ms)
      onHoldMax: 12000,            // Tiempo máximo en estado encendido continuo (ms)
      breathingAmp: 0.03,          // Variación sutil de respiración incandescente (±3%)
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
      let lastFrameTime = performance.now();

      // --- Variables físicas del Péndulo ---
      let angle = 0;              // Ángulo actual del péndulo principal (grados)
      let angularVelocity = 0;    // Velocidad angular (rad/s)
      const omega0 = (2 * Math.PI) / (HERO_LAMP_CONFIG.pendulum.period / 1000); // Frecuencia natural
      const damping = HERO_LAMP_CONFIG.pendulum.damping;

      let mouseTargetAngle = 0;
      let mouseCurrentAngle = 0;
      let nextGustTime = performance.now() + 4000;

      // Reacción al cursor en el Hero (empuje suave con amortiguación natural)
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
          lastFrameTime = now;
          requestAnimationFrame(renderHeroLamp);
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

        requestAnimationFrame(renderHeroLamp);
      };

      requestAnimationFrame(renderHeroLamp);

      // IntersectionObserver para pausar el loop cuando el Hero sale de pantalla
      const heroObserver = new IntersectionObserver((entries) => {
        isHeroVisible = entries[0].isIntersecting;
      }, { threshold: 0.1 });
      heroObserver.observe(heroVisual);
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
    }, { threshold: 0.3 });
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
     CONFIGURACIÓN TAREA 1: CARRUSEL AUTOMÁTICO EN "POPULAR PRODUCT"
     ========================================================================== */
  const CAROUSEL_CONFIG = {
    autoplayInterval: 3500,        // Intervalo entre avances automáticos (ms)
    transitionDuration: 700,       // Duración del desplazamiento suave (ms)
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Easing suave (nunca lineal)
    gap: 28,                       // Espaciado entre tarjetas en px
    dragThreshold: 0.18,           // Umbral de arrastre (% ancho de tarjeta para avanzar)
    inertiaFactor: 150,            // Multiplicador de inercia al soltar arrastre/swipe
    pulseDuration: 550,            // Duración del pulso en botón "+" (ms)
    responsive: [
      { minWidth: 1200, visibleCards: 4, activeOffset: 1 },  // Desktop: 4 tarjetas, activa es la 2da (índice 1)
      { minWidth: 992,  visibleCards: 3, activeOffset: 1 },  // Laptop pequeña: 3 tarjetas, activa es la 2da
      { minWidth: 680,  visibleCards: 2, activeOffset: 0 },  // Tablet: 2 tarjetas, activa es la 1ra
      { minWidth: 0,    visibleCards: 1.18, activeOffset: 0 } // Móvil: 1 tarjeta + fragmento de la siguiente
    ]
  };

  /* ------------------------------------------------------------------------
     6. TAREA 1: CARRUSEL AUTOMÁTICO INFINITO ("POPULAR PRODUCT")
     ------------------------------------------------------------------------ */
  const popularViewport = document.getElementById('popularViewport');
  const popularTrack = document.getElementById('popularTrack');
  const popularPrev = document.getElementById('popularPrev');
  const popularNext = document.getElementById('popularNext');
  const popularSection = document.getElementById('popular');

  if (popularViewport && popularTrack && popularPrev && popularNext) {
    const originalCards = Array.from(popularTrack.children);
    const originalCount = originalCards.length;

    // Clonar tarjetas al inicio y al final para loop continuo infinito sin saltos
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
    const totalCount = allCards.length;
    const baseOffset = originalCount; // Desfase inicial para posicionar en tarjetas reales

    let currentIndex = baseOffset;
    let visibleCards = 4;
    let activeOffset = 1;
    let cardWidth = 280;
    let step = 308;
    let isTransitioning = false;
    let autoplayTimer = null;
    let isHovered = false;
    let isFocused = false;
    let isDragging = false;
    let isSectionVisible = true;

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

    // Actualizar estado resaltado dinámico de la tarjeta activa y pulso en botón "+"
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
            void btnPlus.offsetWidth; // Reflow para reiniciar la animación
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

    const nextSlide = () => moveTo(currentIndex + 1, true);
    const prevSlide = () => moveTo(currentIndex - 1, true);

    // Ajuste silencioso del bucle infinito al terminar la transición
    popularTrack.addEventListener('transitionend', (e) => {
      if (e.target !== popularTrack) return;
      isTransitioning = false;

      // Si sobrepasamos las tarjetas originales hacia adelante
      if (currentIndex >= baseOffset + originalCount) {
        moveTo(currentIndex - originalCount, false);
      }
      // Si sobrepasamos hacia atrás
      else if (currentIndex < baseOffset) {
        moveTo(currentIndex + originalCount, false);
      }
    });

    // Control de Autoplay
    const startAutoplay = () => {
      if (prefersReducedMotion || autoplayTimer) return;
      if (isHovered || isFocused || isDragging || !isSectionVisible || document.hidden) return;

      autoplayTimer = setInterval(() => {
        nextSlide();
      }, CAROUSEL_CONFIG.autoplayInterval);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    // Flechas de navegación ‹ ›
    popularNext.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    popularPrev.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    // Pausa por hover
    popularViewport.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoplay();
    });

    popularViewport.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!isDragging && !isFocused && isSectionVisible) startAutoplay();
    });

    // Pausa por foco de teclado
    popularViewport.addEventListener('focusin', () => {
      isFocused = true;
      stopAutoplay();
    });

    popularViewport.addEventListener('focusout', () => {
      isFocused = false;
      if (!isHovered && !isDragging && isSectionVisible) startAutoplay();
    });

    // Pausa por visibilidad de pestaña (Page Visibility API)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        if (!isHovered && !isFocused && !isDragging && isSectionVisible) startAutoplay();
      }
    });

    // Pausa cuando la sección está fuera de pantalla (IntersectionObserver)
    if (popularSection) {
      const sectionObserver = new IntersectionObserver((entries) => {
        isSectionVisible = entries[0].isIntersecting;
        if (isSectionVisible) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      }, { threshold: 0.15 });
      sectionObserver.observe(popularSection);
    }

    // Arrastre con mouse y swipe táctil con inercia
    let startX = 0;
    let currentDeltaX = 0;
    let lastMoveX = 0;
    let lastMoveTime = 0;
    let dragVelocity = 0;

    const onPointerDown = (e) => {
      if (isTransitioning) return;
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      lastMoveX = startX;
      lastMoveTime = performance.now();
      currentDeltaX = 0;
      dragVelocity = 0;

      stopAutoplay();
      popularTrack.classList.add('no-transition');
      popularViewport.classList.add('is-dragging');
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      currentDeltaX = clientX - startX;

      const now = performance.now();
      const dt = now - lastMoveTime;
      if (dt > 10) {
        dragVelocity = (clientX - lastMoveX) / dt;
        lastMoveX = clientX;
        lastMoveTime = now;
      }

      const currentTransform = -currentIndex * step + currentDeltaX;
      popularTrack.style.transform = `translate3d(${currentTransform.toFixed(2)}px, 0, 0)`;
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      popularViewport.classList.remove('is-dragging');
      popularTrack.classList.remove('no-transition');

      // Inercia al soltar
      const inertia = dragVelocity * CAROUSEL_CONFIG.inertiaFactor;
      const totalDisplacement = currentDeltaX + inertia;
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

      resetAutoplay();
    };

    popularViewport.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    popularViewport.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Inicialización y Resize
    window.addEventListener('resize', () => {
      clearTimeout(window._carouselResizeTimer);
      window._carouselResizeTimer = setTimeout(updateDimensions, 100);
    });

    updateDimensions();
    startAutoplay();
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
     8. CUADRÍCULA 2X2 DE CARACTERÍSTICAS ("LATEST FEATURES")
     ------------------------------------------------------------------------ */
  const featureTiles = document.querySelectorAll('.feature-tile');
  featureTiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      featureTiles.forEach((t) => t.classList.remove('is-active'));
      tile.classList.add('is-active');
    });
  });

  /* ------------------------------------------------------------------------
     9. FILTROS DE CATEGORÍA EN "OUR PRODUCT" (05)
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
     10. FORMULARIO GET STARTED (NEWSLETTER)
     ------------------------------------------------------------------------ */
  const newsletterForm = document.getElementById('newsletterForm');
  const formFeedback = document.getElementById('formFeedback');

  if (newsletterForm && formFeedback) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newsletterEmail');
      const email = input ? input.value.trim() : '';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        formFeedback.className = 'form-feedback is-error';
        formFeedback.textContent = 'Por favor ingresa un correo electrónico válido.';
        if (input) input.focus();
        return;
      }

      // Simulación de envío exitoso
      formFeedback.className = 'form-feedback is-success';
      formFeedback.textContent = '¡Gracias por unirte! Te hemos enviado un 15% de descuento exclusivo.';
      newsletterForm.reset();

      setTimeout(() => {
        formFeedback.textContent = '';
      }, 7000);
    });
  }

  /* ------------------------------------------------------------------------
     11. MODAL DE VIDEO PRESENTACIÓN
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

});
