// SmartFlow Card Selection System with localStorage Persistence
class SFCardSelection {
    constructor() {
        this.storageKey = 'sf-selected-cards';
        this.selectedCards = new Set();
        this.init();
    }
    
    init() {
        this.loadSelections();
        this.setupEventListeners();
        this.restoreSelections();
        console.log('Card selection system initialized with persistence');
    }
    
    // Load selections from localStorage
    loadSelections() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.selectedCards = new Set(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load card selections:', e);
            this.selectedCards = new Set();
        }
    }
    
    // Save selections to localStorage
    saveSelections() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify([...this.selectedCards]));
        } catch (e) {
            console.warn('Failed to save card selections:', e);
        }
    }
    
    // Get unique ID for a card element
    getCardId(cardElement) {
        // Try to use existing ID, or create one from text content
        if (cardElement.id) {
            return cardElement.id;
        }
        
        // For project cards, use the h3 text
        const title = cardElement.querySelector('h3, .title, .card-title');
        if (title) {
            return 'card-' + title.textContent.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
        
        // For price cards, use the plan name
        const planName = cardElement.querySelector('.plan-name, h2, h3');
        if (planName) {
            return 'price-' + planName.textContent.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
        
        // Fallback: use text content or position
        const text = cardElement.textContent.slice(0, 50);
        return 'card-' + text.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    }
    
    // Setup click event listeners for all selectable cards
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card, .latest-card, .price-card, .sf-glass');
            if (!card) return;
            
            // Don't interfere with buttons or links
            if (e.target.closest('button, a, input, select, textarea')) return;
            
            console.log('Card clicked:', card.textContent.slice(0, 50));
            this.toggleCard(card);
        });
    }
    
    // Toggle selection state of a card
    toggleCard(cardElement) {
        const cardId = this.getCardId(cardElement);
        
        if (this.selectedCards.has(cardId)) {
            // Deselect
            this.selectedCards.delete(cardId);
            cardElement.classList.remove('selected');
            console.log('Card deselected:', cardId);
        } else {
            // Select
            this.selectedCards.add(cardId);
            cardElement.classList.add('selected');
            console.log('Card selected:', cardId);
        }
        
        this.saveSelections();
        
        // Dispatch custom event for other systems to listen to
        const event = new CustomEvent('sf-card-selection-change', {
            detail: {
                cardId: cardId,
                selected: this.selectedCards.has(cardId),
                allSelected: [...this.selectedCards]
            }
        });
        document.dispatchEvent(event);
    }
    
    // Restore selection states when page loads
    restoreSelections() {
        const selectableCards = document.querySelectorAll('.project-card, .latest-card, .price-card, .sf-glass');
        
        selectableCards.forEach(card => {
            const cardId = this.getCardId(card);
            if (this.selectedCards.has(cardId)) {
                card.classList.add('selected');
            }
        });
        
        if (this.selectedCards.size > 0) {
            console.log(`Restored ${this.selectedCards.size} selected cards from storage`);
        }
    }
    
    // Public methods for external control
    selectCard(cardElement) {
        const cardId = this.getCardId(cardElement);
        if (!this.selectedCards.has(cardId)) {
            this.toggleCard(cardElement);
        }
    }
    
    deselectCard(cardElement) {
        const cardId = this.getCardId(cardElement);
        if (this.selectedCards.has(cardId)) {
            this.toggleCard(cardElement);
        }
    }
    
    clearAllSelections() {
        const selectableCards = document.querySelectorAll('.selected');
        selectableCards.forEach(card => card.classList.remove('selected'));
        this.selectedCards.clear();
        this.saveSelections();
        
        // Dispatch clear event
        const event = new CustomEvent('sf-card-selection-clear');
        document.dispatchEvent(event);
    }
    
    getSelectedCards() {
        return [...this.selectedCards];
    }
}

// Initialize card selection system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.sfCardSelection === 'undefined') {
        window.sfCardSelection = new SFCardSelection();
    }
});

// Handle page navigation (for SPA)
document.addEventListener('sf-page-loaded', () => {
    if (window.sfCardSelection) {
        window.sfCardSelection.restoreSelections();
    }
});