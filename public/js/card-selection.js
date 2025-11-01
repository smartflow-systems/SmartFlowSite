// Initialize card selection system with persistence
console.log('Card selection system initialized with persistence');
console.log('Added direct click handlers to', cards.length, 'cards');

// Add subtle hover effect enhancement
cards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    if (!this.classList.contains('selected')) {
      this.style.transform = 'translateY(-6px) scale(1.01)';
    }
  });

  card.addEventListener('mouseleave', function() {
    if (!this.classList.contains('selected')) {
      this.style.transform = '';
    }
  });
});