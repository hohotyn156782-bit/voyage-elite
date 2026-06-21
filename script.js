/* ============================================
   VOYAGE ELITE — Premium Travel Agency
   script.js — Golden Hour Dreamscape + Soft Trail
   ============================================ */

(function () {
  'use strict';

  /* ========== GLOBAL STATE ========== */
  var currentLang = 'ru';
  var isTouchDevice = false;

  /* ========== DETECT TOUCH ========== */
  function detectTouch() {
    isTouchDevice = ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (window.matchMedia('(hover: none)').matches);
    // Touch device detected — sparkle orb will be hidden via CSS
  }
  detectTouch();

  /* ========== PRELOADER ========== */
  window.addEventListener('load', function () {
    var preloader = document.getElementById('preloader');
    setTimeout(function () {
      preloader.classList.add('hidden');
    }, 800);
  });

  /* ========== LENIS SMOOTH SCROLL ========== */
  var lenis;
  try {
    lenis = new Lenis({
      duration: 0.8,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smooth: true,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } catch (e) {
    console.warn('Lenis not loaded:', e);
  }

  /* ========== AOS INIT ========== */
  try {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  } catch (e) {
    console.warn('AOS not loaded:', e);
  }

  /* ========== HERO SPARKLE ORB (only inside hero section) ========== */
  var sparkleCanvas = document.getElementById('heroSparkleCanvas');
  var sparkleCtx = sparkleCanvas ? sparkleCanvas.getContext('2d') : null;
  var sparkleParticles = [];
  var orbX = -100, orbY = -100;       // current orb position (lerped)
  var orbTargetX = -100, orbTargetY = -100; // mouse position relative to hero
  var orbOpacity = 0;                  // fade in/out
  var orbInHero = false;               // is mouse inside hero?
  var orbSize = 6;
  var sparkleColors = ['#f0d9c4', '#e8c8a0', '#d4956a', '#fef5e8', '#c47d6a'];

  function resizeSparkleCanvas() {
    if (sparkleCanvas) {
      sparkleCanvas.width = sparkleCanvas.offsetWidth;
      sparkleCanvas.height = sparkleCanvas.offsetHeight;
    }
  }

  if (!isTouchDevice && sparkleCanvas && sparkleCtx) {
    resizeSparkleCanvas();
    window.addEventListener('resize', resizeSparkleCanvas);

    var heroEl = document.getElementById('hero');

    heroEl.addEventListener('mouseenter', function () {
      orbInHero = true;
    });

    heroEl.addEventListener('mouseleave', function () {
      orbInHero = false;
    });

    heroEl.addEventListener('mousemove', function (e) {
      var rect = sparkleCanvas.getBoundingClientRect();
      orbTargetX = e.clientX - rect.left;
      orbTargetY = e.clientY - rect.top;
    });

    function animateSparkleOrb() {
      // Fade in/out
      if (orbInHero) {
        orbOpacity = Math.min(1, orbOpacity + 0.04);
      } else {
        orbOpacity = Math.max(0, orbOpacity - 0.03);
      }

      // Skip rendering if fully invisible and no particles
      if (orbOpacity <= 0 && sparkleParticles.length === 0) {
        requestAnimationFrame(animateSparkleOrb);
        return;
      }

      sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

      // Lerp orb toward target (smooth delay ~0.3s at 60fps → lerp 0.08)
      var lerpFactor = 0.08;
      orbX += (orbTargetX - orbX) * lerpFactor;
      orbY += (orbTargetY - orbY) * lerpFactor;

      // Spawn sparkle particles from orb position
      if (orbOpacity > 0.1) {
        for (var s = 0; s < 2; s++) {
          sparkleParticles.push({
            x: orbX + (Math.random() - 0.5) * 8,
            y: orbY + (Math.random() - 0.5) * 8,
            size: 1.2 + Math.random() * 2.5,
            color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
            opacity: (0.35 + Math.random() * 0.15) * orbOpacity,
            vx: (Math.random() - 0.5) * 1.0,
            vy: (Math.random() - 0.5) * 0.5,
            gravity: 0.02 + Math.random() * 0.03,
            life: 0.7 + Math.random() * 0.3,
            maxLife: 0.7 + Math.random() * 0.3,
          });
        }
      }

      // Update and draw particles
      var dt = 1 / 60;
      for (var i = sparkleParticles.length - 1; i >= 0; i--) {
        var p = sparkleParticles[i];
        p.life -= dt;
        if (p.life <= 0) {
          sparkleParticles.splice(i, 1);
          continue;
        }

        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        var lifeRatio = p.life / p.maxLife;

        sparkleCtx.beginPath();
        sparkleCtx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
        sparkleCtx.fillStyle = p.color;
        sparkleCtx.globalAlpha = p.opacity * lifeRatio;
        sparkleCtx.fill();
      }
      sparkleCtx.globalAlpha = 1;

      // Draw the orb itself (peach glow)
      if (orbOpacity > 0.01) {
        // Outer glow
        var glowGrad = sparkleCtx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * 3);
        glowGrad.addColorStop(0, 'rgba(240, 217, 196, 0.25)');
        glowGrad.addColorStop(0.5, 'rgba(212, 149, 106, 0.08)');
        glowGrad.addColorStop(1, 'rgba(212, 149, 106, 0)');
        sparkleCtx.beginPath();
        sparkleCtx.arc(orbX, orbY, orbSize * 3, 0, Math.PI * 2);
        sparkleCtx.fillStyle = glowGrad;
        sparkleCtx.globalAlpha = orbOpacity;
        sparkleCtx.fill();

        // Core orb
        var orbGrad = sparkleCtx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize);
        orbGrad.addColorStop(0, '#fef0e0');
        orbGrad.addColorStop(0.5, '#f0d9c4');
        orbGrad.addColorStop(1, 'rgba(212, 149, 106, 0)');
        sparkleCtx.beginPath();
        sparkleCtx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
        sparkleCtx.fillStyle = orbGrad;
        sparkleCtx.globalAlpha = orbOpacity * 0.9;
        sparkleCtx.fill();
        sparkleCtx.globalAlpha = 1;
      }

      // Limit particles
      if (sparkleParticles.length > 150) {
        sparkleParticles.splice(0, sparkleParticles.length - 150);
      }

      requestAnimationFrame(animateSparkleOrb);
    }
    animateSparkleOrb();
  }

  /* ========== HEADER SCROLL EFFECT + PROGRESS BAR ========== */
  var header = document.getElementById('header');
  var backToTop = document.getElementById('backToTop');
  var scrollProgressBar = document.getElementById('scrollProgress');

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY || window.pageYOffset;

    // Header shrink
    if (scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top visibility
    if (scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Scroll progress bar
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrollPercent + '%';
    }
  });

  backToTop.addEventListener('click', function () {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  /* ========== HAMBURGER MENU ========== */
  var hamburger = document.getElementById('hamburger');
  var headerNav = document.getElementById('headerNav');

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    headerNav.classList.toggle('open');
  });

  headerNav.querySelectorAll('.header__link').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      headerNav.classList.remove('open');
    });
  });

  /* ========== SMOOTH ANCHOR SCROLLING ========== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        var offset = header.offsetHeight + 10;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        if (lenis) {
          lenis.scrollTo(targetPos);
        } else {
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      }
    });
  });

  /* ========== HERO CANVAS — GOLDEN HOUR DREAMSCAPE ========== */
  var canvas = document.getElementById('heroCanvas');
  var ctx = canvas.getContext('2d');
  var heroMouseX = -9999;
  var heroMouseY = -9999;

  // Animation state
  var sunPulse = 0;
  var rayRotation = 0;
  var time = 0;

  // Floating lanterns
  var lanterns = [];
  var lanternCount = 16;

  // Birds
  var birds = [];
  var birdCount = 5;

  // Ripple effects
  var ripples = [];

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  var heroSection = document.getElementById('hero');
  var heroVisible = true;

  // Pause hero canvas when not visible — saves GPU
  var heroObserver = new IntersectionObserver(function (entries) {
    heroVisible = entries[0].isIntersecting;
  }, { threshold: 0 });
  heroObserver.observe(heroSection);

  heroSection.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    heroMouseX = e.clientX - rect.left;
    heroMouseY = e.clientY - rect.top;

    // Water ripples on mouse near water — subtler
    var waterLine = canvas.height * 0.7;
    if (heroMouseY > waterLine) {
      ripples.push({
        x: heroMouseX,
        y: heroMouseY,
        radius: 2,
        maxRadius: 15 + Math.random() * 10,
        opacity: 0.4,
        speed: 0.6 + Math.random() * 0.3,
      });
    }
  });
  heroSection.addEventListener('mouseleave', function () {
    heroMouseX = -9999;
    heroMouseY = -9999;
  });

  // Initialize lanterns — softer, like dusk stars
  function createLantern() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height * 0.5 + Math.random() * canvas.height * 0.3,
      size: 1.5 + Math.random() * 2.5,
      color: ['#f0d9c4', '#d4956a', '#c47d6a', '#fef5e8', '#e8c8a0'][Math.floor(Math.random() * 5)],
      speedY: -(0.15 + Math.random() * 0.3),
      swaySpeed: 0.3 + Math.random() * 1.0,
      swayAmount: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.3,
    };
  }

  for (var i = 0; i < lanternCount; i++) {
    var l = createLantern();
    l.y = Math.random() * canvas.height; // spread initial positions
    lanterns.push(l);
  }

  // Initialize birds — slower
  function createBird() {
    return {
      x: -50 - Math.random() * 200,
      y: canvas.height * 0.1 + Math.random() * canvas.height * 0.35,
      speed: 0.5 + Math.random() * 0.7,
      flapSpeed: 2.5 + Math.random() * 2.5,
      flapPhase: Math.random() * Math.PI * 2,
      size: 4 + Math.random() * 6,
    };
  }

  for (var b = 0; b < birdCount; b++) {
    var bird = createBird();
    bird.x = Math.random() * canvas.width; // spread initial positions
    birds.push(bird);
  }

  function drawSunsetScene() {
    if (!heroVisible) {
      requestAnimationFrame(drawSunsetScene);
      return;
    }
    var w = canvas.width;
    var h = canvas.height;
    time += 0.016;
    sunPulse = Math.sin(time * 0.5) * 0.03;

    ctx.clearRect(0, 0, w, h);

    // 1. Animated gradient sky — softer, calmer
    var skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
    var shift = Math.sin(time * 0.15) * 0.02;
    skyGrad.addColorStop(0, '#0f1923');
    skyGrad.addColorStop(0.25 + shift, '#2a2040');
    skyGrad.addColorStop(0.45 + shift, '#8a5a6a');
    skyGrad.addColorStop(0.65, '#d4956a');
    skyGrad.addColorStop(0.85, '#f0d9c4');
    skyGrad.addColorStop(1, '#0f1923');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Sun at horizon — lower, softer
    var sunX = w / 2;
    var sunY = h * 0.75;
    var sunRadius = Math.min(w, h) * 0.10 * (1 + sunPulse);

    // Sun rays (rotating beams) — fewer, slower, more transparent
    rayRotation += 0.0015;
    var rayCount = 6;
    var rayAngleOffset = 0;

    // If mouse is in hero, rotate rays toward cursor MORE GENTLY
    if (heroMouseX > 0 && heroMouseX < w && heroMouseY > 0 && heroMouseY < h) {
      rayAngleOffset = Math.atan2(heroMouseY - sunY, heroMouseX - sunX) * 0.08;
    }

    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(rayRotation + rayAngleOffset);
    for (var r = 0; r < rayCount; r++) {
      var angle = (r / rayCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-sunRadius * 0.2, 0);
      ctx.lineTo(0, -sunRadius * 4);
      ctx.lineTo(sunRadius * 0.2, 0);
      ctx.closePath();
      var rayGrad = ctx.createLinearGradient(0, 0, 0, -sunRadius * 4);
      rayGrad.addColorStop(0, 'rgba(254, 245, 232, 0.06)');
      rayGrad.addColorStop(0.5, 'rgba(212, 149, 106, 0.03)');
      rayGrad.addColorStop(1, 'rgba(212, 149, 106, 0)');
      ctx.fillStyle = rayGrad;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Sun glow — softer
    var sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
    sunGlow.addColorStop(0, 'rgba(254, 245, 232, 0.25)');
    sunGlow.addColorStop(0.3, 'rgba(212, 149, 106, 0.10)');
    sunGlow.addColorStop(1, 'rgba(212, 149, 106, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);

    // Sun body — warm white center fading to peach
    var sunBody = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    sunBody.addColorStop(0, '#fef5e8');
    sunBody.addColorStop(0.4, '#e8c8a0');
    sunBody.addColorStop(0.7, '#d4956a');
    sunBody.addColorStop(1, 'rgba(212, 149, 106, 0)');
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunBody;
    ctx.fill();

    // 3. Ocean waves — slower, gentler
    var waterTop = h * 0.7;

    // Dark water base — soft deep blue
    ctx.fillStyle = '#0e1e3a';
    ctx.fillRect(0, waterTop, w, h - waterTop);

    // Wave layers (back to front) — soft blue ocean reflecting sunset
    var waveLayers = [
      { color: 'rgba(16, 40, 80, 0.95)', amplitude: 8, frequency: 0.008, speed: 0.24, yOffset: 0 },
      { color: 'rgba(30, 60, 120, 0.5)', amplitude: 6, frequency: 0.012, speed: 0.36, yOffset: 15 },
      { color: 'rgba(100, 140, 200, 0.15)', amplitude: 4, frequency: 0.015, speed: 0.54, yOffset: 25 },
      { color: 'rgba(212, 170, 140, 0.12)', amplitude: 3, frequency: 0.02, speed: 0.72, yOffset: 35 },
    ];

    for (var wl = 0; wl < waveLayers.length; wl++) {
      var wave = waveLayers[wl];
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (var x = 0; x <= w; x += 3) {
        var waveY = waterTop + wave.yOffset +
          Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7) * wave.amplitude * 0.5;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();
    }

    // Sun reflection on water — softer, more diffused
    var reflectionTop = waterTop + 10;
    var reflectionWidth = sunRadius * 1.2;
    for (var ry = reflectionTop; ry < h; ry += 5) {
      var reflectionProgress = (ry - reflectionTop) / (h - reflectionTop);
      var shimmerX = sunX + Math.sin(ry * 0.08 + time * 1.5) * (8 + reflectionProgress * 15);
      var shimmerW = reflectionWidth * (1 - reflectionProgress * 0.5);
      var shimmerOpacity = 0.2 * (1 - reflectionProgress) * (0.7 + Math.sin(ry * 0.25 + time * 2) * 0.3);

      ctx.beginPath();
      ctx.ellipse(shimmerX, ry, shimmerW, 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(254, 245, 232, ' + shimmerOpacity + ')';
      ctx.fill();
    }

    // Golden shimmer spots on wave crests — very subtle
    var shimmerZoneLeft = sunX - w * 0.3;
    var shimmerZoneRight = sunX + w * 0.3;
    for (var sx = shimmerZoneLeft; sx < shimmerZoneRight; sx += 10) {
      if (sx < 0 || sx > w) continue;
      var waveYPos = waterTop + Math.sin(sx * 0.015 + time * 0.54) * 4 + 25;
      var sparkle = Math.sin(sx * 0.5 + time * 3) * 0.5 + 0.5;
      if (sparkle > 0.7) {
        ctx.beginPath();
        ctx.arc(sx, waveYPos, 0.8 + sparkle * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(254, 245, 232, ' + (sparkle * 0.3) + ')';
        ctx.fill();
      }
    }

    // 4. Floating lanterns/orbs — like dusk stars
    for (var li = 0; li < lanterns.length; li++) {
      var la = lanterns[li];
      la.y += la.speedY;
      la.x += Math.sin(time * la.swaySpeed + la.phase) * la.swayAmount;

      // Fade out in top 20%
      var fadeZone = h * 0.2;
      var lanternAlpha = la.opacity;
      if (la.y < fadeZone) {
        lanternAlpha *= la.y / fadeZone;
      }

      // Respawn at horizon if off top
      if (la.y < -10 || lanternAlpha < 0.01) {
        lanterns[li] = createLantern();
        continue;
      }

      ctx.beginPath();
      ctx.arc(la.x, la.y, la.size, 0, Math.PI * 2);
      var lanternGrad = ctx.createRadialGradient(la.x, la.y, 0, la.x, la.y, la.size);
      lanternGrad.addColorStop(0, la.color);
      lanternGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lanternGrad;
      ctx.globalAlpha = lanternAlpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 5. Birds (V-shaped silhouettes) — slightly more transparent
    for (var bi = 0; bi < birds.length; bi++) {
      var bd = birds[bi];
      bd.x += bd.speed;
      var flapAngle = Math.sin(time * bd.flapSpeed + bd.flapPhase) * 0.4;

      // Respawn if off screen
      if (bd.x > w + 100) {
        birds[bi] = createBird();
        continue;
      }

      ctx.save();
      ctx.translate(bd.x, bd.y);
      ctx.strokeStyle = 'rgba(15, 25, 35, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // Left wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-bd.size, -bd.size * flapAngle - bd.size * 0.5);
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bd.size, -bd.size * flapAngle - bd.size * 0.5);
      ctx.stroke();

      ctx.restore();
    }

    // 6. Ripples (from mouse interaction) — subtler
    for (var ri = ripples.length - 1; ri >= 0; ri--) {
      var rip = ripples[ri];
      rip.radius += rip.speed;
      rip.opacity -= 0.012;

      if (rip.opacity <= 0 || rip.radius > rip.maxRadius) {
        ripples.splice(ri, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(240, 217, 196, ' + rip.opacity + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Limit ripples
    if (ripples.length > 30) {
      ripples.splice(0, ripples.length - 30);
    }

    requestAnimationFrame(drawSunsetScene);
  }
  drawSunsetScene();

  /* ========== TYPED.JS — HERO DESTINATIONS ========== */
  var typedStringsRu = ['Мальдивы', 'Швейцарию', 'Японию', 'Дубай', 'Бали', 'Санторини'];
  var typedStringsEn = ['Maldives', 'Switzerland', 'Japan', 'Dubai', 'Bali', 'Santorini'];
  var typedInstance = null;

  function initTyped() {
    var strings = currentLang === 'ru' ? typedStringsRu : typedStringsEn;
    if (typedInstance) {
      typedInstance.destroy();
    }
    try {
      typedInstance = new Typed('#typedWrap', {
        strings: strings,
        typeSpeed: 80,
        backSpeed: 40,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|',
      });
    } catch (e) {
      console.warn('Typed.js not loaded:', e);
      document.getElementById('typedWrap').textContent = strings[0];
    }
  }
  initTyped();

  /* ========== SWIPER — DESTINATIONS SLIDER ========== */
  try {
    new Swiper('.destinationsSwiper', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 200,
        modifier: 1.5,
        slideShadows: false,
      },
      breakpoints: {
        320: { slidesPerView: 1.2 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  } catch (e) {
    console.warn('Swiper not loaded:', e);
  }

  /* ========== ANIMATED COUNTERS ========== */
  var counters = document.querySelectorAll('.counter__number');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      var duration = 2000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        counter.textContent = current.toLocaleString('ru-RU');
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target.toLocaleString('ru-RU');
        }
      }
      requestAnimationFrame(step);
    });
  }

  var countersSection = document.querySelector('.counters');
  if (countersSection) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    counterObserver.observe(countersSection);
  }

  /* ========== COUNTDOWN TIMERS ========== */
  var countdownElements = document.querySelectorAll('.deal-card__countdown');

  // Динамические дедлайны — счётчики всегда «живые» (не истекают в 00:00:00:00)
  var countdownOffsets = [3, 5, 7];
  countdownElements.forEach(function (el, i) {
    var end = new Date();
    end.setDate(end.getDate() + (countdownOffsets[i] || 4));
    end.setHours(23, 59, 59, 0);
    el.setAttribute('data-end', end.toISOString());
  });

  function updateCountdowns() {
    var now = new Date().getTime();

    countdownElements.forEach(function (el) {
      var endDate = new Date(el.getAttribute('data-end')).getTime();
      var diff = endDate - now;

      if (diff <= 0) {
        el.querySelector('[data-days]').textContent = '00';
        el.querySelector('[data-hours]').textContent = '00';
        el.querySelector('[data-mins]').textContent = '00';
        el.querySelector('[data-secs]').textContent = '00';
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var secs = Math.floor((diff % (1000 * 60)) / 1000);

      el.querySelector('[data-days]').textContent = String(days).padStart(2, '0');
      el.querySelector('[data-hours]').textContent = String(hours).padStart(2, '0');
      el.querySelector('[data-mins]').textContent = String(mins).padStart(2, '0');
      el.querySelector('[data-secs]').textContent = String(secs).padStart(2, '0');
    });
  }

  updateCountdowns();
  setInterval(updateCountdowns, 1000);

  /* ========== BILINGUAL TOGGLE (RU/EN) ========== */
  var langToggle = document.getElementById('langToggle');
  var langCurrent = langToggle.querySelector('.lang-toggle__current');

  langToggle.addEventListener('click', function () {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    langCurrent.textContent = currentLang.toUpperCase();
    applyLanguage();
    initTyped();
  });

  function applyLanguage() {
    document.querySelectorAll('[data-lang-' + currentLang + ']').forEach(function (el) {
      var text = el.getAttribute('data-lang-' + currentLang);
      if (text) {
        if (text.includes('&')) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    document.querySelectorAll('[data-lang-' + currentLang + '-placeholder]').forEach(function (el) {
      var placeholder = el.getAttribute('data-lang-' + currentLang + '-placeholder');
      if (placeholder) {
        el.placeholder = placeholder;
      }
    });

    document.querySelectorAll('option[data-lang-' + currentLang + ']').forEach(function (el) {
      var text = el.getAttribute('data-lang-' + currentLang);
      if (text) el.textContent = text;
    });

    document.documentElement.lang = currentLang;
  }

  /* ========== FORM HANDLING ========== */
  var finderForm = document.getElementById('finderForm');
  var contactForm = document.getElementById('contactForm');

  function handleFormSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('.btn--submit');
    var originalText = btn.textContent;

    btn.textContent = currentLang === 'ru' ? 'Отправлено!' : 'Sent!';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    setTimeout(function () {
      btn.textContent = originalText;
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      form.reset();
    }, 2500);
  }

  if (finderForm) finderForm.addEventListener('submit', handleFormSubmit);
  if (contactForm) contactForm.addEventListener('submit', handleFormSubmit);

  /* ========== ACTIVE SECTION HIGHLIGHTING IN NAV ========== */
  var navLinks = document.querySelectorAll('.header__link');
  var navSections = [];

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      var section = document.querySelector(href);
      if (section) {
        navSections.push({ el: section, link: link });
      }
    }
  });

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var match = navSections.find(function (s) { return s.el === entry.target; });
      if (match) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          match.link.classList.add('active');
        }
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  navSections.forEach(function (s) {
    sectionObserver.observe(s.el);
  });

  /* ========== TEXT REVEAL ANIMATION ========== */
  var titleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.section__title').forEach(function (title) {
    title.style.opacity = '0';
    titleObserver.observe(title);
  });

  /* ========== RIPPLE EFFECT ON BUTTONS ========== */
  document.querySelectorAll('.btn--hero, .btn--card, .btn--deal, .btn--submit').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      var size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  });

  /* ========== PARALLAX ON SCROLL (lightweight CSS transform) ========== */
  var parallaxElements = document.querySelectorAll('.parallax-divider__content');

  function updateParallax() {
    var scrollY = window.scrollY || window.pageYOffset;

    parallaxElements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var viewCenter = window.innerHeight / 2;
      var offset = (center - viewCenter) * 0.04;

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transform = 'translateY(' + (-offset) + 'px)';
      }
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });

  /* ========== TESTIMONIALS SWIPER ========== */
  try {
    new Swiper('.testimonialsSwiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.testimonials-pagination',
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2 },
      },
    });
  } catch (e) {
    console.warn('Testimonials Swiper error:', e);
  }

})();