// SmartFlow Circuit Flow Animation - Flowing Sparks with Trails
class CircuitFlowAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.paths = [];
        this.particles = [];
        this.animationId = null;
        this.time = 0;
        this.energy = 0.7; // Flow speed (0.1 to 1.0)
        this.resizeHandler = null; // Store resize handler for cleanup
        
        // Golden spark colors matching SmartFlow theme
        this.colors = {
            sparkTrailStart: 'rgba(218, 165, 32, 0)',
            sparkTrailMid: 'rgba(255, 200, 100, 0.3)',
            sparkTrailEnd: 'rgba(255, 255, 200, 0.5)',
            sparkRay: 'rgba(255, 255, 150, 0.4)',
            sparkHead: 'rgba(255, 255, 200, 0.6)',
            sparkGlow: 'rgba(255, 255, 200, 0.3)'
        };
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.initializePaths();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'circuit-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }
    
    setupEventListeners() {
        // Store bound resize handler for cleanup
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Regenerate paths on resize
        this.initializePaths();
    }
    
    initializePaths() {
        this.paths = [];
        this.particles = [];
        
        // Create invisible circuit-like paths
        const numPaths = 40 + Math.floor(Math.random() * 20);
        
        for (let i = 0; i < numPaths; i++) {
            const path = {
                points: [],
                orientation: Math.random() > 0.5 ? 'horizontal' : 'vertical'
            };
            
            // Create circuit-like paths with right-angle turns
            const segments = 3 + Math.floor(Math.random() * 5);
            let x = Math.random() * this.width;
            let y = Math.random() * this.height;
            
            path.points.push({ x, y });
            
            for (let j = 0; j < segments; j++) {
                const direction = Math.floor(Math.random() * 4); // 0=right, 1=down, 2=left, 3=up
                const length = 50 + Math.random() * 150;
                
                switch(direction) {
                    case 0: x += length; break;
                    case 1: y += length; break;
                    case 2: x -= length; break;
                    case 3: y -= length; break;
                }
                
                // Keep in bounds
                x = Math.max(50, Math.min(this.width - 50, x));
                y = Math.max(50, Math.min(this.height - 50, y));
                
                path.points.push({ x, y });
            }
            
            this.paths.push(path);
        }
        
        // Initialize particles on paths
        const particlesPerPath = 3;
        
        this.paths.forEach((path, pathIndex) => {
            for (let i = 0; i < particlesPerPath; i++) {
                this.particles.push({
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
    
    updateParticles() {
        this.particles.forEach(particle => {
            const path = this.paths[particle.pathIndex];
            if (!path) return;
            
            // Update progress with random speed spikes
            const speedSpike = Math.random() < 0.05 ? 2 + Math.random() * 3 : 1;
            particle.progress += particle.speed * this.energy * speedSpike;
            
            // Fade in and out
            particle.life = (particle.life || 0) + 0.02;
            const fadeIn = Math.min(particle.life * 2, 1);
            const fadeOut = particle.segmentIndex >= path.points.length - 2 ? 
                Math.max(0, 1 - (particle.progress * 2)) : 1;
            particle.fadeFactor = fadeIn * fadeOut;
            
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
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const path = this.paths[particle.pathIndex];
            if (!path) return;
            
            // Get current position
            const p1 = path.points[particle.segmentIndex];
            const p2 = path.points[particle.segmentIndex + 1];
            
            if (!p1 || !p2) return;
            
            const x = p1.x + (p2.x - p1.x) * particle.progress;
            const y = p1.y + (p2.y - p1.y) * particle.progress;
            
            // Flicker effect - dimmer with fade
            const flicker = (Math.sin(this.time * 8 + particle.flickerOffset) * 0.2 + 0.4) * particle.fadeFactor;
            
            // Calculate direction of movement
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const angle = Math.atan2(dy, dx);
            
            // Add slight random drift for organic movement
            const driftX = Math.sin(this.time * 2 + particle.flickerOffset) * 3;
            const driftY = Math.cos(this.time * 2 + particle.flickerOffset) * 3;
            const finalX = x + driftX;
            const finalY = y + driftY;
            
            // Draw spark trail
            const trailLength = 15 + particle.size * 5;
            const trailStartX = finalX - Math.cos(angle) * trailLength;
            const trailStartY = finalY - Math.sin(angle) * trailLength;
            
            // Main spark line with gradient
            const gradient = this.ctx.createLinearGradient(trailStartX, trailStartY, finalX, finalY);
            gradient.addColorStop(0, this.colors.sparkTrailStart);
            gradient.addColorStop(0.5, `rgba(255, 200, 100, ${0.3 * flicker})`);
            gradient.addColorStop(1, `rgba(255, 255, 200, ${0.5 * flicker})`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(trailStartX, trailStartY);
            this.ctx.lineTo(finalX, finalY);
            this.ctx.stroke();
            
            // Add spark rays at the head
            const numRays = 3;
            for (let i = 0; i < numRays; i++) {
                const rayAngle = angle + (Math.random() - 0.5) * Math.PI / 3;
                const rayLength = 3 + Math.random() * 6;
                const rayEndX = finalX + Math.cos(rayAngle) * rayLength;
                const rayEndY = finalY + Math.sin(rayAngle) * rayLength;
                
                this.ctx.beginPath();
                this.ctx.moveTo(finalX, finalY);
                this.ctx.lineTo(rayEndX, rayEndY);
                this.ctx.strokeStyle = `rgba(255, 255, 150, ${flicker * 0.4})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
            
            // Bright head point
            this.ctx.fillStyle = `rgba(255, 255, 200, ${flicker * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(finalX, finalY, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Head glow
            const glowGradient = this.ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, 8);
            glowGradient.addColorStop(0, `rgba(255, 255, 200, ${0.3 * flicker})`);
            glowGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(finalX, finalY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    render() {
        // Dark background with fade effect for trails
        this.ctx.fillStyle = 'rgba(5, 5, 10, 0.08)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw flowing sparks
        this.drawParticles();
    }
    
    animate() {
        this.time += 0.016;
        
        this.updateParticles();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }
        this.ctx = null;
        this.paths = [];
        this.particles = [];
    }
}

// Initialize when DOM is ready - NOW WORKS ON MOBILE TOO!
document.addEventListener('DOMContentLoaded', () => {
    // Guard against double initialization
    if (window.circuitAnimation) {
        console.log('Circuit flow animation already initialized');
        return;
    }
    
    console.log('DOM loaded, screen width:', window.innerWidth);
    console.log('Initializing circuit flow animation...');
    try {
        window.circuitAnimation = new CircuitFlowAnimation();
        console.log('Circuit flow animation created successfully');
        console.log('Generated paths:', window.circuitAnimation.paths.length);
        console.log('Generated particles:', window.circuitAnimation.particles.length);
    } catch (error) {
        console.error('Error creating circuit flow animation:', error);
    }
});

// Handle page visibility to pause/resume animation
document.addEventListener('visibilitychange', () => {
    if (window.circuitAnimation) {
        if (document.hidden) {
            window.circuitAnimation.destroy();
            window.circuitAnimation = null;
        } else {
            window.circuitAnimation = new CircuitFlowAnimation();
        }
    }
});
