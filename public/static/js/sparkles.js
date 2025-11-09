
// SmartFlow Flowing Circuit Animation - Premium dark gold aesthetic
class CircuitAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.paths = [];
        this.particles = [];
        this.nodes = [];
        
        // SmartFlow gold color palette - more subtle and relaxing
        this.colors = {
            gold: '#FFD700',
            goldDim: 'rgba(255, 215, 0, 0.12)',
            goldBright: 'rgba(230, 194, 0, 0.35)',
            glow: 'rgba(255, 215, 0, 0.15)',
            node: 'rgba(255, 215, 0, 0.25)'
        };
        
        this.burstTimer = 0;
        this.burstActive = false;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.generateCircuitPaths();
        this.generateNodes();
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
            opacity: 0.4;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateCircuitPaths();
        this.generateNodes();
    }
    
    generateCircuitPaths() {
        this.paths = [];
        const pathCount = 5; // Reduced from 12 to 5
        
        for (let i = 0; i < pathCount; i++) {
            const startX = Math.random() * this.canvas.width;
            const startY = Math.random() * this.canvas.height;
            
            const points = [];
            let currentX = startX;
            let currentY = startY;
            
            const segments = 3 + Math.floor(Math.random() * 4);
            
            for (let j = 0; j < segments; j++) {
                points.push({ x: currentX, y: currentY });
                
                const segmentLength = 100 + Math.random() * 200;
                const angle = (Math.random() * Math.PI * 2);
                
                const controlX = currentX + Math.cos(angle) * segmentLength * 0.5;
                const controlY = currentY + Math.sin(angle) * segmentLength * 0.5;
                
                currentX = currentX + Math.cos(angle) * segmentLength;
                currentY = currentY + Math.sin(angle) * segmentLength;
                
                points.push({ x: controlX, y: controlY });
            }
            
            points.push({ x: currentX, y: currentY });
            
            this.paths.push({
                points: points,
                opacity: 0.2 + Math.random() * 0.15, // Reduced opacity
                pulse: Math.random() * Math.PI * 2
            });
        }
        
        // Generate particles for each path - slower and smaller
        this.particles = [];
        this.paths.forEach((path, pathIndex) => {
            const particleCount = 1 + Math.floor(Math.random() * 2); // Fewer particles
            for (let i = 0; i < particleCount; i++) {
                this.particles.push({
                    pathIndex: pathIndex,
                    progress: Math.random(),
                    speed: 0.0003 + Math.random() * 0.0005, // Much slower
                    size: 1.5 + Math.random() * 1.5, // Smaller
                    glow: 5 + Math.random() * 6, // Smaller glow
                    isBurst: false
                });
            }
        });
    }
    
    generateNodes() {
        this.nodes = [];
        const nodeCount = 4; // Reduced from 8 to 4
        
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 2 + Math.random() * 2.5, // Smaller
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.015 + Math.random() * 0.02 // Slower pulse
            });
        }
    }
    
    getPointOnPath(path, t) {
        const points = path.points;
        const segments = Math.floor((points.length - 1) / 3);
        const segment = Math.min(Math.floor(t * segments), segments - 1);
        const localT = (t * segments) - segment;
        
        const i = segment * 3;
        const p0 = points[i];
        const p1 = points[i + 1];
        const p2 = points[i + 2];
        const p3 = points[i + 3] || p2;
        
        // Cubic Bezier curve
        const x = Math.pow(1 - localT, 3) * p0.x +
                  3 * Math.pow(1 - localT, 2) * localT * p1.x +
                  3 * (1 - localT) * Math.pow(localT, 2) * p2.x +
                  Math.pow(localT, 3) * p3.x;
                  
        const y = Math.pow(1 - localT, 3) * p0.y +
                  3 * Math.pow(1 - localT, 2) * localT * p1.y +
                  3 * (1 - localT) * Math.pow(localT, 2) * p2.y +
                  Math.pow(localT, 3) * p3.y;
        
        return { x, y };
    }
    
    drawPaths() {
        this.paths.forEach(path => {
            path.pulse += 0.01; // Slower pulse
            const pulseIntensity = 0.4 + 0.3 * Math.sin(path.pulse); // More subtle
            
            this.ctx.strokeStyle = this.colors.goldDim;
            this.ctx.lineWidth = 1;
            this.ctx.shadowColor = this.colors.glow;
            this.ctx.shadowBlur = 2;
            this.ctx.globalAlpha = path.opacity * pulseIntensity;
            
            this.ctx.beginPath();
            const points = path.points;
            this.ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 0; i < points.length - 3; i += 3) {
                this.ctx.bezierCurveTo(
                    points[i + 1].x, points[i + 1].y,
                    points[i + 2].x, points[i + 2].y,
                    points[i + 3].x, points[i + 3].y
                );
            }
            
            this.ctx.stroke();
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
    
    drawParticles() {
        // Burst timing - trigger fast particle every 10 seconds
        this.burstTimer++;
        if (this.burstTimer >= 600) { // 60fps * 10 seconds = 600 frames
            this.burstTimer = 0;
            this.burstActive = true;
            
            // Add 1-2 fast burst particles
            const burstCount = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < burstCount; i++) {
                const randomPath = Math.floor(Math.random() * this.paths.length);
                this.particles.push({
                    pathIndex: randomPath,
                    progress: 0,
                    speed: 0.008 + Math.random() * 0.004, // Super fast
                    size: 2 + Math.random() * 2,
                    glow: 10 + Math.random() * 8,
                    isBurst: true,
                    lifetime: 0
                });
            }
        }
        
        this.particles.forEach((particle, index) => {
            const currentSpeed = particle.isBurst ? particle.speed : particle.speed;
            particle.progress += currentSpeed;
            
            if (particle.progress >= 1) {
                if (particle.isBurst) {
                    // Remove burst particles when done
                    this.particles.splice(index, 1);
                    return;
                }
                particle.progress = 0;
            }
            
            const path = this.paths[particle.pathIndex];
            const pos = this.getPointOnPath(path, particle.progress);
            
            const alpha = particle.isBurst ? 0.8 : 0.4; // Burst particles brighter
            
            // Particle glow
            const gradient = this.ctx.createRadialGradient(
                pos.x, pos.y, 0,
                pos.x, pos.y, particle.glow
            );
            gradient.addColorStop(0, this.colors.goldBright);
            gradient.addColorStop(0.5, this.colors.glow);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.globalAlpha = alpha * 0.6;
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, particle.glow, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Particle core
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = this.colors.gold;
            this.ctx.shadowColor = this.colors.gold;
            this.ctx.shadowBlur = particle.isBurst ? 6 : 3;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
    
    drawNodes() {
        this.nodes.forEach(node => {
            node.pulse += node.pulseSpeed;
            const pulseIntensity = 0.5 + 0.3 * Math.sin(node.pulse); // More subtle
            
            // Node glow
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.size * 3
            );
            gradient.addColorStop(0, this.colors.node);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = pulseIntensity * 0.6; // More transparent
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Node core
            this.ctx.fillStyle = this.colors.gold;
            this.ctx.shadowColor = this.colors.gold;
            this.ctx.shadowBlur = 3;
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.size * pulseIntensity, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawPaths();
        this.drawNodes();
        this.drawParticles();
        
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
    console.log('Initializing SmartFlow circuit animation...');
    window.circuitAnimation = new CircuitAnimation();
    console.log('Circuit animation now flowing throughout the site!');
});

// Handle page visibility to pause/resume animation
document.addEventListener('visibilitychange', () => {
    if (window.circuitAnimation) {
        if (document.hidden) {
            window.circuitAnimation.destroy();
        } else {
            window.circuitAnimation = new CircuitAnimation();
        }
    }
});
