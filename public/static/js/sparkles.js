// SmartFlow Magical Sparkles - Little sparkles throughout the entire site
class SparkleSystem {
    constructor() {
        this.sparkles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.colors = [
            '#d4af37',    // Gold
            '#ffdd00',    // Bright gold
            '#ffffff',    // White
            '#e9e6df',    // Cream
            '#f5f2e8'     // Light cream
        ];
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.generateSparkles();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'sparkles-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            pointer-events: none;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        // Removed mouse tracking for more meditative experience
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    generateSparkles() {
        // Generate fewer, more meditative sparkles across the screen
        const sparkleCount = 15;
        
        for (let i = 0; i < sparkleCount; i++) {
            this.addSparkle(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                false
            );
        }
    }
    
    addSparkle(x, y, isInteractive = false) {
        const sparkle = {
            x: x,
            y: y,
            size: 1 + Math.random() * 2, // Smaller, gentler sparkles
            opacity: 0.2 + Math.random() * 0.4, // More subtle opacity
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            life: 8 + Math.random() * 12, // Longer life for peaceful feeling
            maxLife: 8 + Math.random() * 12,
            vx: (Math.random() - 0.5) * 0.3, // Much slower movement
            vy: (Math.random() - 0.5) * 0.3,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.02 + Math.random() * 0.03, // Slower twinkling
            pulseSpeed: 0.01 + Math.random() * 0.02 // Gentler pulsing
        };
        
        this.sparkles.push(sparkle);
        
        // Limit total sparkles for peaceful experience
        if (this.sparkles.length > 40) {
            this.sparkles.shift();
        }
    }
    
    updateSparkles() {
        // Very rarely add new peaceful sparkles
        if (Math.random() < 0.008) {
            this.addSparkle(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                false
            );
        }
        
        // Update existing sparkles with gentle movement
        this.sparkles = this.sparkles.filter(sparkle => {
            // Very slow, meditative movement
            sparkle.x += sparkle.vx * 0.5;
            sparkle.y += sparkle.vy * 0.5;
            sparkle.life -= 0.005; // Much slower fade
            sparkle.twinkle += sparkle.twinkleSpeed;
            
            // No gravity - just peaceful floating
            
            // Gentle fade based on sine wave for meditative twinkling
            sparkle.opacity = (sparkle.life / sparkle.maxLife) * 
                             (0.2 + 0.3 * Math.sin(sparkle.twinkle));
            
            return sparkle.life > 0;
        });
    }
    
    drawSparkles() {
        this.sparkles.forEach(sparkle => {
            const pulse = 1 + 0.3 * Math.sin(sparkle.twinkle);
            const currentSize = sparkle.size * pulse;
            
            // Main sparkle body
            this.ctx.beginPath();
            this.ctx.arc(sparkle.x, sparkle.y, currentSize, 0, Math.PI * 2);
            this.ctx.fillStyle = sparkle.color;
            this.ctx.globalAlpha = sparkle.opacity;
            this.ctx.fill();
            
            // Sparkle glow
            const glowGradient = this.ctx.createRadialGradient(
                sparkle.x, sparkle.y, 0,
                sparkle.x, sparkle.y, currentSize * 3
            );
            glowGradient.addColorStop(0, sparkle.color);
            glowGradient.addColorStop(1, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.arc(sparkle.x, sparkle.y, currentSize * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.globalAlpha = sparkle.opacity * 0.5;
            this.ctx.fill();
            
            // Draw sparkle rays for larger sparkles
            if (sparkle.size > 2) {
                this.ctx.strokeStyle = sparkle.color;
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = sparkle.opacity * 0.8;
                
                // Vertical ray
                this.ctx.beginPath();
                this.ctx.moveTo(sparkle.x, sparkle.y - currentSize * 2);
                this.ctx.lineTo(sparkle.x, sparkle.y + currentSize * 2);
                this.ctx.stroke();
                
                // Horizontal ray
                this.ctx.beginPath();
                this.ctx.moveTo(sparkle.x - currentSize * 2, sparkle.y);
                this.ctx.lineTo(sparkle.x + currentSize * 2, sparkle.y);
                this.ctx.stroke();
            }
            
            this.ctx.globalAlpha = 1;
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sparkles
        this.drawSparkles();
    }
    
    animate() {
        this.updateSparkles();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize sparkle system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing sparkle system...');
    window.sparkleSystem = new SparkleSystem();
    console.log('Sparkles are now twinkling throughout the site!');
});

// Handle page visibility to pause/resume sparkles
document.addEventListener('visibilitychange', () => {
    if (window.sparkleSystem) {
        if (document.hidden) {
            window.sparkleSystem.destroy();
        } else {
            window.sparkleSystem = new SparkleSystem();
        }
    }
});