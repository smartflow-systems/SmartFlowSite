// Stars.js - Animated starfield for SmartFlow
document.addEventListener('DOMContentLoaded', function() {
  // Create starfield container
  const starfield = document.createElement('div');
  starfield.id = 'starfield';
  document.body.appendChild(starfield);
  
  // Generate random stars
  function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random position
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    
    // Random size (1-3px)
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    
    // Random animation duration
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    
    return star;
  }
  
  // Add 50 stars
  for (let i = 0; i < 50; i++) {
    starfield.appendChild(createStar());
  }
  
  console.log('✨ Starfield initialized with 50 twinkling stars');
});
