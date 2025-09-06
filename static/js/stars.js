// Dark Brown Aesthetic with Subtle Gold Flashes for SmartFlow
document.addEventListener('DOMContentLoaded', function() {
  // Create background container
  const darkField = document.createElement('div');
  darkField.id = 'starfield';
  darkField.className = 'dark-brown-field';
  document.body.appendChild(darkField);
  
  // Create gradient mesh background
  const meshCanvas = document.createElement('canvas');
  meshCanvas.className = 'gradient-mesh';
  meshCanvas.width = window.innerWidth;
  meshCanvas.height = window.innerHeight;
  darkField.appendChild(meshCanvas);
  
  const ctx = meshCanvas.getContext('2d');
  
  // Draw dark brown gradient mesh
  function drawGradientMesh() {
    const gradient = ctx.createRadialGradient(
      meshCanvas.width / 2, meshCanvas.height / 2, 0,
      meshCanvas.width / 2, meshCanvas.height / 2, meshCanvas.width / 2
    );
    
    // Dark brown to black gradient
    gradient.addColorStop(0, 'rgba(25, 15, 10, 0.95)');  // Very dark brown
    gradient.addColorStop(0.3, 'rgba(30, 20, 15, 0.9)'); // Dark brown
    gradient.addColorStop(0.6, 'rgba(20, 12, 8, 0.9)');  // Darker brown
    gradient.addColorStop(1, 'rgba(5, 3, 2, 0.95)');     // Almost black brown
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, meshCanvas.width, meshCanvas.height);
    
    // Add subtle texture
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * meshCanvas.width;
      const y = Math.random() * meshCanvas.height;
      const radius = Math.random() * 200 + 50;
      
      const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      spotGradient.addColorStop(0, 'rgba(40, 25, 18, 0.03)');
      spotGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = spotGradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  
  drawGradientMesh();
  
  // Create subtle floating particles
  function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.className = 'brown-particle';
    
    // Position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Size variation
    const size = Math.random() * 3 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Animation duration
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    
    darkField.appendChild(particle);
  }
  
  // Create subtle gold flashes (rare and elegant)
  function createGoldFlash() {
    const flash = document.createElement('div');
    flash.className = 'gold-flash';
    
    // Random position
    flash.style.left = Math.random() * 100 + '%';
    flash.style.top = Math.random() * 100 + '%';
    
    darkField.appendChild(flash);
    
    // Remove after animation
    setTimeout(() => flash.remove(), 3000);
  }
  
  // Create soft ambient glow spots
  function createAmbientGlow() {
    const glow = document.createElement('div');
    glow.className = 'ambient-glow';
    
    // Random position with bias towards edges
    const edge = Math.floor(Math.random() * 4);
    switch(edge) {
      case 0: // top
        glow.style.left = Math.random() * 100 + '%';
        glow.style.top = '-20%';
        break;
      case 1: // right
        glow.style.right = '-20%';
        glow.style.top = Math.random() * 100 + '%';
        break;
      case 2: // bottom
        glow.style.left = Math.random() * 100 + '%';
        glow.style.bottom = '-20%';
        break;
      case 3: // left
        glow.style.left = '-20%';
        glow.style.top = Math.random() * 100 + '%';
        break;
    }
    
    darkField.appendChild(glow);
    
    // Remove after animation
    setTimeout(() => glow.remove(), 20000);
  }
  
  // Create subtle shimmer effect
  function createShimmer() {
    const shimmer = document.createElement('div');
    shimmer.className = 'brown-shimmer';
    
    // Create a line of shimmering light
    shimmer.style.left = Math.random() * 100 + '%';
    shimmer.style.top = Math.random() * 100 + '%';
    shimmer.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    darkField.appendChild(shimmer);
    
    // Remove after animation
    setTimeout(() => shimmer.remove(), 4000);
  }
  
  // Initial particle creation
  for (let i = 0; i < 50; i++) {
    createFloatingParticle();
  }
  
  // Continuous subtle animations
  // Rare gold flashes (subtle and elegant)
  setInterval(createGoldFlash, 8000);
  
  // Ambient glows
  setInterval(createAmbientGlow, 5000);
  
  // Occasional shimmers
  setInterval(createShimmer, 6000);
  
  // Add new floating particles occasionally
  setInterval(createFloatingParticle, 3000);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    meshCanvas.width = window.innerWidth;
    meshCanvas.height = window.innerHeight;
    drawGradientMesh();
  });
  
  console.log('✨ Dark brown aesthetic with subtle gold accents initialized');
});