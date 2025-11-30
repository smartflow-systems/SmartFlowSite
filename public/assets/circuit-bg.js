/**
 * SmartFlow Circuit Background Animation
 * Unified 3D circuit board animation for all SFS apps
 */

(function() {
  'use strict';

  // Create and inject canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'circuit-bg';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;opacity:0.7;pointer-events:none;background:rgba(0,0,0,0.2)';
  document.body.insertBefore(canvas, document.body.firstChild);
  console.log('🔌 Circuit animation canvas created and injected');

  const ctx = canvas.getContext('2d');
  let animationId;
  let time = 0;
  let paths = [];
  let particles = [];
  let energy = 0.4;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializePaths();
  }

  function initializePaths() {
    paths = [];
    const gridSize = 80;
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);

    // Horizontal paths
    for (let row = 1; row < rows; row++) {
      const y = row * gridSize;
      const path = { points: [] };
      const startCol = Math.floor(Math.random() * (cols - 4));
      const segments = 3 + Math.floor(Math.random() * 5);
      let x = startCol * gridSize;
      path.points.push({ x, y });

      for (let i = 0; i < segments; i++) {
        x += gridSize * (1 + Math.floor(Math.random() * 3));
        if (x > canvas.width - gridSize) break;
        path.points.push({ x, y });

        if (Math.random() > 0.6 && i < segments - 1) {
          const newY = y + gridSize * (Math.random() > 0.5 ? 1 : -1);
          if (newY > 0 && newY < canvas.height) {
            path.points.push({ x, y: newY });
          }
        }
      }

      if (path.points.length > 1) paths.push(path);
    }

    // Vertical paths
    for (let col = 1; col < cols; col++) {
      const x = col * gridSize;
      const path = { points: [] };
      const startRow = Math.floor(Math.random() * (rows - 4));
      const segments = 2 + Math.floor(Math.random() * 4);
      let y = startRow * gridSize;
      path.points.push({ x, y });

      for (let i = 0; i < segments; i++) {
        y += gridSize * (1 + Math.floor(Math.random() * 3));
        if (y > canvas.height - gridSize) break;
        path.points.push({ x, y });

        if (Math.random() > 0.6 && i < segments - 1) {
          const newX = x + gridSize * (Math.random() > 0.5 ? 1 : -1);
          if (newX > 0 && newX < canvas.width) {
            path.points.push({ x: newX, y });
          }
        }
      }

      if (path.points.length > 1) paths.push(path);
    }

    // Initialize particles
    particles = [];
    const particlesPerPath = 3;
    paths.forEach((path, pathIndex) => {
      for (let i = 0; i < particlesPerPath; i++) {
        particles.push({
          pathIndex,
          segmentIndex: 0,
          progress: Math.random(),
          speed: 0.01 + Math.random() * 0.02,
          size: 2 + Math.random() * 2,
          flickerOffset: Math.random() * Math.PI * 2,
          life: 0
        });
      }
    });
  }

  function animate() {
    time += 0.016;
    ctx.fillStyle = 'rgba(5,5,10,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid nodes
    const gridSize = 80;
    ctx.fillStyle = 'rgba(212,175,55,0.08)';
    for (let x = gridSize; x < canvas.width; x += gridSize) {
      for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw and update particles
    particles.forEach(particle => {
      const path = paths[particle.pathIndex];
      if (!path) return;

      const speedSpike = Math.random() < 0.05 ? 2 + Math.random() * 3 : 1;
      particle.progress += particle.speed * energy * speedSpike;
      particle.life = (particle.life || 0) + 0.02;

      const fadeIn = Math.min(particle.life * 2, 1);
      const fadeOut = particle.segmentIndex >= path.points.length - 2 ?
        Math.max(0, 1 - (particle.progress * 2)) : 1;
      const fadeFactor = fadeIn * fadeOut;

      if (particle.progress >= 1) {
        particle.progress = 0;
        particle.segmentIndex++;
        if (particle.segmentIndex >= path.points.length - 1) {
          particle.segmentIndex = 0;
          particle.life = 0;
          particle.speed = 0.01 + Math.random() * 0.02;
        }
      }

      const p1 = path.points[particle.segmentIndex];
      const p2 = path.points[particle.segmentIndex + 1];
      if (!p1 || !p2) return;

      const x = p1.x + (p2.x - p1.x) * particle.progress;
      const y = p1.y + (p2.y - p1.y) * particle.progress;

      const flicker = (Math.sin(time * 8 + particle.flickerOffset) * 0.2 + 0.4) * fadeFactor;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angle = Math.atan2(dy, dx);

      // Draw trail
      const trailLength = 20 + particle.size * 6;
      const trailStartX = x - Math.cos(angle) * trailLength;
      const trailStartY = y - Math.sin(angle) * trailLength;

      const gradient = ctx.createLinearGradient(trailStartX, trailStartY, x, y);
      gradient.addColorStop(0, 'rgba(218,165,32,0)');
      gradient.addColorStop(0.5, `rgba(212,175,55,${0.4 * flicker})`);
      gradient.addColorStop(1, `rgba(244,228,193,${0.6 * flicker})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(trailStartX, trailStartY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw particle
      ctx.fillStyle = `rgba(244,228,193,${flicker * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
      glowGradient.addColorStop(0, `rgba(244,228,193,${0.4 * flicker})`);
      glowGradient.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    animationId = requestAnimationFrame(animate);
  }

  // Export control function
  window.SmartFlowCircuit = {
    setEnergy: function(value) {
      energy = Math.max(0.1, Math.min(1, value));
    },
    getEnergy: function() {
      return energy;
    },
    pause: function() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    resume: function() {
      if (!animationId) {
        animate();
      }
    }
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      resizeCanvas();
      animate();
    });
  } else {
    resizeCanvas();
    animate();
  }

  window.addEventListener('resize', resizeCanvas);
})();
