// Enhanced Stars.js - Highly visible animated starfield for SmartFlow
document.addEventListener('DOMContentLoaded', function() {
  // Create starfield container
  const starfield = document.createElement('div');
  starfield.id = 'starfield';
  document.body.appendChild(starfield);
  
  // Generate random stars with better visibility
  function createStar(isBright = false) {
    const star = document.createElement('div');
    star.className = isBright ? 'star bright' : 'star';
    
    // Random position
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    
    // Bigger sizes for better visibility (2-8px for normal, 4-12px for bright)
    const size = isBright ? 
      Math.random() * 8 + 4 : 
      Math.random() * 6 + 2;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    
    // Random animation duration for natural effect
    star.style.animationDuration = (Math.random() * 4 + 2) + 's';
    star.style.animationDelay = Math.random() * 3 + 's';
    
    return star;
  }
  
  // Add 100 stars total for dense starfield
  // 80 regular stars
  for (let i = 0; i < 80; i++) {
    starfield.appendChild(createStar(false));
  }
  
  // 20 bright golden stars
  for (let i = 0; i < 20; i++) {
    starfield.appendChild(createStar(true));
  }
  
  // Add floating particles effect
  function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '2px';
    particle.style.height = '2px';
    particle.style.background = '#d4af37';
    particle.style.borderRadius = '50%';
    particle.style.opacity = '0.6';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.bottom = '-10px';
    particle.style.pointerEvents = 'none';
    
    // Animate upward
    particle.style.animation = `floatUp ${10 + Math.random() * 10}s linear infinite`;
    
    starfield.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => particle.remove(), 20000);
  }
  
  // Create floating particles periodically
  setInterval(createFloatingParticle, 2000);
  
  // Add CSS for floating animation if not exists
  if (!document.querySelector('#star-animations')) {
    const style = document.createElement('style');
    style.id = 'star-animations';
    style.textContent = `
      @keyframes floatUp {
        0% {
          transform: translateY(0) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 0.6;
        }
        90% {
          opacity: 0.6;
        }
        100% {
          transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  console.log('✨ Enhanced starfield initialized with 100 twinkling stars and floating particles');
});