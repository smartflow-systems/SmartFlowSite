import React, { useState, useEffect, useRef, useCallback } from 'react';

const TRANSLATIONS = {
  "en-US": {
    "title": "Circuit Flow",
    "inputPlaceholder": "Adjust the energy...",
    "updateButton": "Generate",
    "processingText": "Processing...",
  },
  "es-ES": {
    "title": "Flujo de Circuito",
    "inputPlaceholder": "Ajusta la energía...",
    "updateButton": "Generar",
    "processingText": "Procesando...",
  }
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const CircuitFlowVisualization = () => {
  const [energy, setEnergy] = useState(0.7);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const pathsRef = useRef([]);
  const particlesRef = useRef([]);

  // Initialize circuit paths - more computer-like grid
  const initializePaths = useCallback((canvas) => {
    pathsRef.current = [];
    const gridSize = 80;
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);
    
    // Create horizontal traces
    for (let row = 1; row < rows; row++) {
      const y = row * gridSize;
      const path = { points: [] };
      
      // Random start column
      const startCol = Math.floor(Math.random() * (cols - 4));
      const segments = 3 + Math.floor(Math.random() * 5);
      
      let x = startCol * gridSize;
      path.points.push({ x, y });
      
      for (let i = 0; i < segments; i++) {
        // Move right
        x += gridSize * (1 + Math.floor(Math.random() * 3));
        if (x > canvas.width - gridSize) break;
        path.points.push({ x, y });
        
        // Sometimes add vertical segment
        if (Math.random() > 0.6 && i < segments - 1) {
          const newY = y + gridSize * (Math.random() > 0.5 ? 1 : -1);
          if (newY > 0 && newY < canvas.height) {
            path.points.push({ x, y: newY });
          }
        }
      }
      
      if (path.points.length > 1) {
        pathsRef.current.push(path);
      }
    }
    
    // Create vertical traces
    for (let col = 1; col < cols; col++) {
      const x = col * gridSize;
      const path = { points: [] };
      
      const startRow = Math.floor(Math.random() * (rows - 4));
      const segments = 2 + Math.floor(Math.random() * 4);
      
      let y = startRow * gridSize;
      path.points.push({ x, y });
      
      for (let i = 0; i < segments; i++) {
        // Move down
        y += gridSize * (1 + Math.floor(Math.random() * 3));
        if (y > canvas.height - gridSize) break;
        path.points.push({ x, y });
        
        // Sometimes add horizontal segment
        if (Math.random() > 0.6 && i < segments - 1) {
          const newX = x + gridSize * (Math.random() > 0.5 ? 1 : -1);
          if (newX > 0 && newX < canvas.width) {
            path.points.push({ x: newX, y });
          }
        }
      }
      
      if (path.points.length > 1) {
        pathsRef.current.push(path);
      }
    }
    
    // Initialize particles on paths
    particlesRef.current = [];
    const particlesPerPath = 3;
    
    pathsRef.current.forEach((path, pathIndex) => {
      for (let i = 0; i < particlesPerPath; i++) {
        particlesRef.current.push({
          pathIndex,
          segmentIndex: 0,
          progress: Math.random(),
          speed: 0.01 + Math.random() * 0.02,
          size: 2 + Math.random() * 2,
          flickerOffset: Math.random() * Math.PI * 2
        });
      }
    });
  }, []);

  // Animation loop
  const animate = useCallback((canvas, ctx) => {
    timeRef.current += 0.016;
    
    // Dark background
    ctx.fillStyle = 'rgba(5, 5, 10, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Lines removed - only sparks visible
    
    // Draw subtle grid dots for computer circuit aesthetic
    const gridSize = 80;
    ctx.fillStyle = 'rgba(0, 100, 150, 0.15)';
    for (let x = gridSize; x < canvas.width; x += gridSize) {
      for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      const path = pathsRef.current[particle.pathIndex];
      if (!path) return;
      
      // Update progress with speed spikes
      const speedSpike = Math.random() < 0.05 ? 2 + Math.random() * 3 : 1;
      particle.progress += particle.speed * energy * speedSpike;
      
      // Fade in and out
      particle.life = (particle.life || 0) + 0.02;
      const fadeIn = Math.min(particle.life * 2, 1);
      const fadeOut = particle.segmentIndex >= path.points.length - 2 ? 
        Math.max(0, 1 - (particle.progress * 2)) : 1;
      const fadeFactor = fadeIn * fadeOut;
      
      // Move to next segment if needed
      if (particle.progress >= 1) {
        particle.progress = 0;
        particle.segmentIndex++;
        
        // Loop back to start with new life cycle
        if (particle.segmentIndex >= path.points.length - 1) {
          particle.segmentIndex = 0;
          particle.life = 0;
          particle.speed = 0.01 + Math.random() * 0.02;
        }
      }
      
      // Get current position
      const p1 = path.points[particle.segmentIndex];
      const p2 = path.points[particle.segmentIndex + 1];
      
      if (!p1 || !p2) return;
      
      const x = p1.x + (p2.x - p1.x) * particle.progress;
      const y = p1.y + (p2.y - p1.y) * particle.progress;
      
      // Flicker effect - dimmer with fade
      const flicker = (Math.sin(timeRef.current * 8 + particle.flickerOffset) * 0.2 + 0.4) * fadeFactor;
      
      // Calculate direction of movement - force right angles for circuit look
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angle = Math.atan2(dy, dx);
      
      // No drift - keep it on the circuit path
      const finalX = x;
      const finalY = y;
      
      // Draw spark trail - cyan/blue computer color
      const trailLength = 20 + particle.size * 6;
      const trailStartX = finalX - Math.cos(angle) * trailLength;
      const trailStartY = finalY - Math.sin(angle) * trailLength;
      
      // Main spark line - computer blue/cyan
      const gradient = ctx.createLinearGradient(trailStartX, trailStartY, finalX, finalY);
      gradient.addColorStop(0, 'rgba(0, 150, 255, 0)');
      gradient.addColorStop(0.5, `rgba(0, 200, 255, ${0.4 * flicker})`);
      gradient.addColorStop(1, `rgba(100, 230, 255, ${0.6 * flicker})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(trailStartX, trailStartY);
      ctx.lineTo(finalX, finalY);
      ctx.stroke();
      
      // Bright head point - electric blue
      ctx.fillStyle = `rgba(150, 240, 255, ${flicker * 0.8})`;
      ctx.beginPath();
      ctx.arc(finalX, finalY, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Head glow - cyan glow
      const glowGradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, 12);
      glowGradient.addColorStop(0, `rgba(100, 230, 255, ${0.4 * flicker})`);
      glowGradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(finalX, finalY, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Pulse effects removed for cleaner look
    
    animationRef.current = requestAnimationFrame(() => animate(canvas, ctx));
  }, [energy]);

  // Handle canvas setup and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializePaths(canvas);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    animate(canvas, ctx);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, initializePaths]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-4xl font-light text-cyan-400 tracking-wide">{t('title')}</h1>
        <p className="text-sm text-cyan-400/60 mt-2">Digital signals through the circuit grid</p>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-96">
        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-cyan-400/30">
          <label className="block text-cyan-400 mb-2 text-sm">Signal Flow</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={energy}
            onChange={(e) => setEnergy(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-cyan-400/80 text-center mt-2 text-sm">
            {Math.floor(energy * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitFlowVisualization;