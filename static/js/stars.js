// SmartFlow Circuit Board Animation with Flowing Stars and Chip Cricket Effects
class CircuitBoardAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.nodes = [];
        this.connections = [];
        this.pulses = [];
        this.stars = [];
        this.crickets = [];
        this.animationId = null;
        
        // Colors matching the SmartFlow theme - enhanced brightness
        this.colors = {
            background: 'transparent',  // Let page background show through
            circuit: '#d4af37',
            circuitDim: 'rgba(212, 175, 55, 0.6)',  // More visible
            pulse: '#ffdd00',  // Brighter gold
            pulseGlow: 'rgba(255, 221, 0, 0.9)',   // Brighter glow
            node: '#d4af37',
            star: '#ffdd00',   // Brighter gold
            cricket: '#e9e6df'
        };
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.generateCircuitBoard();
        this.generateStars();
        this.generateCrickets();
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
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Regenerate circuit board on resize
        this.generateCircuitBoard();
    }
    
    generateCircuitBoard() {
        this.nodes = [];
        this.connections = [];
        this.pulses = [];
        
        const nodeCount = Math.floor((this.width * this.height) / 8000);  // More nodes
        const gridSpacing = 60;  // Closer together
        
        // Generate nodes in a loose grid pattern
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 3 + Math.random() * 4,  // Larger nodes
                pulse: Math.random() * Math.PI * 2,
                energy: 0.5 + Math.random() * 0.5
            });
        }
        
        // Create connections between nearby nodes
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150 && Math.random() < 0.5) {  // More connections
                    this.connections.push({
                        start: i,
                        end: j,
                        opacity: 0.3 + Math.random() * 0.4
                    });
                }
            }
        }
    }
    
    generateStars() {
        this.stars = [];
        const starCount = 120;  // More stars
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 2 + Math.random() * 4,  // Larger stars
                speed: 0.5 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.7,
                twinkle: Math.random() * Math.PI * 2,
                direction: Math.random() * Math.PI * 2
            });
        }
    }
    
    generateCrickets() {
        this.crickets = [];
        const cricketCount = 15;  // More crickets
        
        for (let i = 0; i < cricketCount; i++) {
            this.crickets.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                targetX: Math.random() * this.width,
                targetY: Math.random() * this.height,
                speed: 0.3 + Math.random() * 0.7,
                size: 2 + Math.random() * 2,
                pulse: Math.random() * Math.PI * 2,
                trail: []
            });
        }
    }
    
    updatePulses() {
        // Add new pulses randomly along connections - more frequent
        if (Math.random() < 0.15 && this.connections.length > 0) {
            const connection = this.connections[Math.floor(Math.random() * this.connections.length)];
            const startNode = this.nodes[connection.start];
            const endNode = this.nodes[connection.end];
            
            this.pulses.push({
                startX: startNode.x,
                startY: startNode.y,
                endX: endNode.x,
                endY: endNode.y,
                progress: 0,
                speed: 0.008 + Math.random() * 0.012,
                size: 2 + Math.random() * 3,
                life: 1.0
            });
        }
        
        // Update existing pulses
        this.pulses = this.pulses.filter(pulse => {
            pulse.progress += pulse.speed;
            pulse.life = Math.max(0, pulse.life - 0.005);
            return pulse.progress < 1.0 && pulse.life > 0;
        });
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.x += Math.cos(star.direction) * star.speed;
            star.y += Math.sin(star.direction) * star.speed;
            star.twinkle += 0.1;
            
            // Wrap around screen edges
            if (star.x < 0) star.x = this.width;
            if (star.x > this.width) star.x = 0;
            if (star.y < 0) star.y = this.height;
            if (star.y > this.height) star.y = 0;
        });
    }
    
    updateCrickets() {
        this.crickets.forEach(cricket => {
            // Move towards target
            const dx = cricket.targetX - cricket.x;
            const dy = cricket.targetY - cricket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 10 || Math.random() < 0.01) {
                // Set new target
                cricket.targetX = Math.random() * this.width;
                cricket.targetY = Math.random() * this.height;
            } else {
                cricket.x += (dx / distance) * cricket.speed;
                cricket.y += (dy / distance) * cricket.speed;
            }
            
            cricket.pulse += 0.15;
            
            // Add to trail
            cricket.trail.push({ x: cricket.x, y: cricket.y });
            if (cricket.trail.length > 20) {
                cricket.trail.shift();
            }
        });
    }
    
    drawCircuitBoard() {
        // Draw connections
        this.connections.forEach(connection => {
            const startNode = this.nodes[connection.start];
            const endNode = this.nodes[connection.end];
            
            this.ctx.beginPath();
            this.ctx.moveTo(startNode.x, startNode.y);
            this.ctx.lineTo(endNode.x, endNode.y);
            this.ctx.strokeStyle = `rgba(212, 175, 55, ${connection.opacity})`;
            this.ctx.lineWidth = 2;  // Thicker lines
            this.ctx.stroke();
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            const pulseSize = node.radius + Math.sin(node.pulse) * 1;
            node.pulse += 0.02;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors.node;
            this.ctx.fill();
            
            // Enhanced glow effect
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, pulseSize + 4, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 221, 0, ${node.energy * 0.5})`;
            this.ctx.fill();
            
            // Outer glow
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, pulseSize + 8, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 221, 0, ${node.energy * 0.2})`;
            this.ctx.fill();
        });
    }
    
    drawPulses() {
        this.pulses.forEach(pulse => {
            const x = pulse.startX + (pulse.endX - pulse.startX) * pulse.progress;
            const y = pulse.startY + (pulse.endY - pulse.startY) * pulse.progress;
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulse.size * 3);
            gradient.addColorStop(0, `rgba(212, 175, 55, ${pulse.life * 0.8})`);
            gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulse.size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Core pulse
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulse.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse.life})`;
            this.ctx.fill();
        });
    }
    
    drawStars() {
        this.stars.forEach(star => {
            const twinkleOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(212, 175, 55, ${twinkleOpacity})`;
            this.ctx.fill();
            
            // Enhanced star glow with multiple layers
            const gradient1 = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 6);
            gradient1.addColorStop(0, `rgba(255, 221, 0, ${twinkleOpacity * 0.8})`);
            gradient1.addColorStop(1, 'rgba(255, 221, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * 6, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient1;
            this.ctx.fill();
            
            // Inner bright glow
            const gradient2 = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
            gradient2.addColorStop(0, `rgba(255, 255, 255, ${twinkleOpacity * 0.6})`);
            gradient2.addColorStop(1, 'rgba(255, 221, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient2;
            this.ctx.fill();
        });
    }
    
    drawCrickets() {
        this.crickets.forEach(cricket => {
            // Draw enhanced trail
            cricket.trail.forEach((point, index) => {
                const alpha = (index / cricket.trail.length) * 0.6;
                const size = 1 + (index / cricket.trail.length) * 2;
                
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(233, 230, 223, ${alpha})`;
                this.ctx.fill();
                
                // Trail glow
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(233, 230, 223, ${alpha * 0.3})`;
                this.ctx.fill();
            });
            
            // Draw cricket body
            const pulseSize = cricket.size + Math.sin(cricket.pulse) * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(cricket.x, cricket.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors.cricket;
            this.ctx.fill();
            
            // Cricket glow
            this.ctx.beginPath();
            this.ctx.arc(cricket.x, cricket.y, pulseSize + 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(233, 230, 223, 0.4)`;
            this.ctx.fill();
        });
    }
    
    render() {
        // Clear canvas with fade effect for trails
        this.ctx.fillStyle = 'rgba(11, 11, 11, 0.1)';  // Semi-transparent clear for trail effects
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw all elements
        this.drawCircuitBoard();
        this.drawPulses();
        this.drawStars();
        this.drawCrickets();
    }
    
    animate() {
        this.updatePulses();
        this.updateStars();
        this.updateCrickets();
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, screen width:', window.innerWidth);
    // Only initialize if we're not on a mobile device (performance consideration)
    if (window.innerWidth > 768) {
        console.log('Initializing circuit board animation...');
        try {
            window.circuitAnimation = new CircuitBoardAnimation();
            console.log('Circuit animation created successfully');
            console.log('Generated nodes:', window.circuitAnimation.nodes.length);
            console.log('Generated connections:', window.circuitAnimation.connections.length);
            console.log('Generated stars:', window.circuitAnimation.stars.length);
        } catch (error) {
            console.error('Error creating circuit animation:', error);
        }
    } else {
        console.log('Skipping animation on mobile device');
    }
});

// Handle page visibility to pause/resume animation
document.addEventListener('visibilitychange', () => {
    if (window.circuitAnimation) {
        if (document.hidden) {
            window.circuitAnimation.destroy();
        } else if (window.innerWidth > 768) {
            window.circuitAnimation = new CircuitBoardAnimation();
        }
    }
});