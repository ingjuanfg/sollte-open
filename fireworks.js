/**
 * Fuegos artificiales de celebración (estilo salvapantallas).
 * Canvas fijo detrás del contenido; no intercepta clics.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var rockets = [];
  var particles = [];
  var w = 0;
  var h = 0;
  var dpr = 1;
  var lastRocket = 0;
  var rafId = null;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** 1 = velocidad original; 0.6 ≈ 40 % más lento */
  var ANIM_SPEED = 0.6;

  var PALETTE = [
    '#43FFFF', '#FFD700', '#FF6B9D', '#A78BFA', '#34D399',
    '#FBBF24', '#F472B6', '#22D3EE', '#FB923C', '#E5E5E5'
  ];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickColor() {
    return PALETTE[(Math.random() * PALETTE.length) | 0];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnRocket() {
    var x = rand(w * 0.08, w * 0.92);
    var targetY = rand(h * 0.12, h * 0.45);
    var speed = rand(10, 16) * ANIM_SPEED;
    var angle = rand(-0.12, 0.12);
    rockets.push({
      x: x,
      y: h + rand(10, 40),
      vx: Math.sin(angle) * 2 * ANIM_SPEED,
      vy: -speed,
      targetY: targetY,
      color: pickColor()
    });
  }

  function explode(x, y, color) {
    var n = (40 + Math.random() * 50) | 0;
    for (var i = 0; i < n; i++) {
      var a = (Math.PI * 2 * i) / n + rand(-0.2, 0.2);
      var sp = rand(2, 9) * ANIM_SPEED;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color: i % 3 === 0 ? pickColor() : color,
        life: 1,
        decay: rand(0.012, 0.028) * ANIM_SPEED,
        gravity: rand(0.06, 0.14) * ANIM_SPEED,
        size: rand(1, 2.2)
      });
    }
    // Segunda onda más pequeña
    for (var j = 0; j < 25; j++) {
      var b = Math.random() * Math.PI * 2;
      var sp2 = rand(1, 5) * ANIM_SPEED;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(b) * sp2,
        vy: Math.sin(b) * sp2,
        color: pickColor(),
        life: 0.85,
        decay: rand(0.015, 0.035) * ANIM_SPEED,
        gravity: rand(0.05, 0.1) * ANIM_SPEED,
        size: rand(0.8, 1.5)
      });
    }
  }

  function tick(now) {
    if (reducedMotion) return;

    /* Fondo negro sólido cada frame — sin capa semitransparente que deja trazas grises */
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';

    // Nuevos cohetes desde abajo (aleatorio en tiempo)
    if (now - lastRocket > rand(400 / ANIM_SPEED, 1400 / ANIM_SPEED) && rockets.length < 5) {
      spawnRocket();
      lastRocket = now;
    }

    // Cohetes
    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.12 * ANIM_SPEED;

      var atApex = r.vy >= 0;
      var hitTarget = r.y <= r.targetY;
      if (atApex || hitTarget) {
        explode(r.x, r.y, r.color);
        rockets.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - r.vx * 3, r.y - r.vy * 3);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Partículas
    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(j, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion) return;
    resize();
    lastRocket = performance.now();
    spawnRocket();
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    resize();
  });

  function onMotionPreferenceChange(e) {
    reducedMotion = e.matches;
    if (reducedMotion && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rockets = [];
      particles = [];
    } else if (!reducedMotion && !rafId) {
      start();
    }
  }
  var motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionMql.addEventListener) {
    motionMql.addEventListener('change', onMotionPreferenceChange);
  } else if (motionMql.addListener) {
    motionMql.addListener(function () {
      onMotionPreferenceChange({ matches: motionMql.matches });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
