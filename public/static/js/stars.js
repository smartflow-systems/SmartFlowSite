/*
 * SmartFlow Circuit Flow Visualization
 * -------------------------------------
 * Vanilla canvas translation of the React CircuitFlowVisualization backdrop.
 * The animation builds a network of energy channels with flowing particles and
 * pulses rendered in the SmartFlow black/brown/gold palette.
 */

class SmartFlowCircuitBackdrop {
    constructor(options = {}) {
        this.canvasId = options.canvasId || 'circuit-canvas';
        this.parent = options.parent || document.body;

        this.canvas = null;
        this.ctx = null;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.width = 0;
        this.height = 0;

        this.nodes = [];
        this.channels = [];
        this.channelParticles = [];
        this.channelPulses = [];
        this.sparkles = [];

        this.animationId = null;
        this.lastTimestamp = null;
        this.isMounted = false;

        this.handleResize = this.handleResize.bind(this);
        this.handleMotionChange = this.handleMotionChange.bind(this);

        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reduceMotion = this.motionQuery.matches;

        this.colors = {
            backgroundFade: 'rgba(8, 6, 4, 0.25)',
            coreGlow: 'rgba(255, 196, 87, 0.8)',
            accentGlow: 'rgba(255, 214, 131, 0.35)',
            channel: '#b98b2e',
            channelGlow: 'rgba(255, 212, 92, 0.22)',
            nodeCore: '#f5c542',
            nodeGlow: 'rgba(255, 219, 112, 0.45)',
            spark: 'rgba(255, 221, 158, 0.85)',
            sparkle: 'rgba(244, 201, 116, 0.65)'
        };

        this.mount();
    }

    mount() {
        if (this.isMounted) {
            return;
        }

        this.createCanvas();
        this.handleResize();
        this.buildNetwork();

        window.addEventListener('resize', this.handleResize, { passive: true });
        if (typeof this.motionQuery.addEventListener === 'function') {
            this.motionQuery.addEventListener('change', this.handleMotionChange);
        } else if (typeof this.motionQuery.addListener === 'function') {
            this.motionQuery.addListener(this.handleMotionChange);
        }

        this.isMounted = true;

        if (this.reduceMotion) {
            this.renderStaticFrame();
        } else {
            this.start();
        }
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = this.canvasId;
        this.canvas.setAttribute('role', 'presentation');
        this.canvas.setAttribute('aria-hidden', 'true');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';

        this.parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    handleResize() {
        if (!this.canvas) {
            return;
        }

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width = Math.round(this.width * this.dpr);
        this.canvas.height = Math.round(this.height * this.dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.buildNetwork();
        if (this.reduceMotion) {
            this.renderStaticFrame();
        }
    }

    handleMotionChange(event) {
        this.reduceMotion = event.matches;
        if (this.reduceMotion) {
            this.stop();
            this.renderStaticFrame();
        } else {
            this.start();
        }
    }

    buildNetwork() {
        this.createNodes();
        this.createChannels();
        this.seedParticles();
        this.seedSparkles();
        this.channelPulses = [];
    }

    createNodes() {
        const columnCount = Math.max(4, Math.floor(this.width / 260));
        const rowCount = Math.max(3, Math.floor(this.height / 200));
        const horizontalSpacing = this.width / (columnCount + 1);
        const verticalSpacing = this.height / (rowCount + 1);

        this.nodes = [];

        for (let c = 1; c <= columnCount; c++) {
            for (let r = 1; r <= rowCount; r++) {
                const jitterX = (Math.random() - 0.5) * horizontalSpacing * 0.6;
                const jitterY = (Math.random() - 0.5) * verticalSpacing * 0.5;

                this.nodes.push({
                    x: c * horizontalSpacing + jitterX,
                    y: r * verticalSpacing + jitterY,
                    radius: 2.5 + Math.random() * 2.5,
                    energy: 0.5 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2,
                    band: r / rowCount
                });
            }
        }
    }

    createChannels() {
        this.channels = [];

        const maxConnections = 3;
        const maxDistance = Math.hypot(this.width, this.height) * 0.35;

        this.nodes.forEach((node, index) => {
            const neighbours = this.nodes
                .map((target, targetIndex) => {
                    if (targetIndex === index) {
                        return null;
                    }
                    const dx = target.x - node.x;
                    const dy = target.y - node.y;
                    const distance = Math.hypot(dx, dy);
                    return { target, targetIndex, distance };
                })
                .filter(Boolean)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, maxConnections);

            neighbours.forEach((entry, neighbourIndex) => {
                if (entry.distance > maxDistance || index > entry.targetIndex) {
                    return;
                }

                const controlOffset = (Math.random() - 0.5) * 80;
                const midPointX = (node.x + entry.target.x) / 2;
                const midPointY = (node.y + entry.target.y) / 2;
                const dx = entry.target.x - node.x;
                const dy = entry.target.y - node.y;
                const normalLength = Math.hypot(-dy, dx) || 1;
                const normalX = (-dy / normalLength) * controlOffset;
                const normalY = (dx / normalLength) * controlOffset;

                const points = [
                    { x: node.x, y: node.y },
                    { x: midPointX + normalX, y: midPointY + normalY },
                    { x: entry.target.x, y: entry.target.y }
                ];

                const channel = this.buildChannel(points, neighbourIndex);
                this.channels.push(channel);
            });
        });
    }

    buildChannel(points, neighbourIndex) {
        const segments = [];
        let totalLength = 0;

        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            const length = Math.hypot(end.x - start.x, end.y - start.y);
            totalLength += length;
            segments.push({ start, end, length, cumulative: totalLength });
        }

        const width = 1.2 + Math.random() * 1.8 + neighbourIndex * 0.35;
        const glow = 0.35 + Math.random() * 0.3;

        return {
            points,
            segments,
            length: totalLength,
            width,
            glow,
            accent: Math.random() < 0.35
        };
    }

    seedParticles() {
        this.channelParticles = [];

        this.channels.forEach(channel => {
            const particleCount = channel.accent ? 4 : 2;
            for (let i = 0; i < particleCount; i++) {
                this.channelParticles.push({
                    channel,
                    progress: Math.random(),
                    speed: (channel.accent ? 0.0025 : 0.0015) + Math.random() * 0.002,
                    size: channel.width * (channel.accent ? 1.6 : 1.2),
                    pulse: Math.random() * Math.PI * 2
                });
            }
        });
    }

    seedSparkles() {
        const sparkleDensity = Math.max(70, Math.floor((this.width + this.height) / 18));
        this.sparkles = [];
        for (let i = 0; i < sparkleDensity; i++) {
            this.sparkles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                baseSize: 0.6 + Math.random() * 1.4,
                opacity: 0.2 + Math.random() * 0.6,
                twinkle: Math.random() * Math.PI * 2,
                drift: (Math.random() * 0.4 + 0.1) * (Math.random() < 0.5 ? -1 : 1)
            });
        }
    }

    start() {
        if (this.animationId) {
            return;
        }
        this.lastTimestamp = null;
        const animate = timestamp => {
            if (!this.canvas) {
                return;
            }

            if (this.lastTimestamp === null) {
                this.lastTimestamp = timestamp;
            }
            const delta = Math.min(32, timestamp - this.lastTimestamp);
            this.lastTimestamp = timestamp;

            this.update(delta);
            this.render();

            this.animationId = window.requestAnimationFrame(animate);
        };

        this.animationId = window.requestAnimationFrame(animate);
    }

    stop() {
        if (this.animationId) {
            window.cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    update(delta) {
        const deltaFactor = delta * 0.06;

        this.nodes.forEach(node => {
            node.phase += 0.006 * deltaFactor;
            node.energy = 0.55 + Math.sin(node.phase) * 0.45;
        });

        this.channelParticles.forEach(particle => {
            particle.progress += particle.speed * deltaFactor;
            if (particle.progress > 1) {
                particle.progress -= 1;
            }
            particle.pulse += 0.12 * deltaFactor;
        });

        if (this.channels.length && Math.random() < 0.035 * deltaFactor) {
            const channel = this.channels[Math.floor(Math.random() * this.channels.length)];
            this.channelPulses.push({
                channel,
                progress: 0,
                speed: (0.008 + Math.random() * 0.01) * (1 + channel.width * 0.2),
                strength: 0.6 + Math.random() * 0.4,
                size: channel.width * 3
            });
        }

        this.channelPulses = this.channelPulses.filter(pulse => {
            pulse.progress += pulse.speed * deltaFactor;
            return pulse.progress < 1;
        });

        this.sparkles.forEach(sparkle => {
            sparkle.twinkle += 0.03 * deltaFactor;
            sparkle.x += 0.02 * deltaFactor * sparkle.drift;
            sparkle.y += 0.01 * deltaFactor * sparkle.drift;

            if (sparkle.x < -10) sparkle.x = this.width + 10;
            if (sparkle.x > this.width + 10) sparkle.x = -10;
            if (sparkle.y < -10) sparkle.y = this.height + 10;
            if (sparkle.y > this.height + 10) sparkle.y = -10;
        });
    }

    render() {
        if (!this.ctx) {
            return;
        }

        this.ctx.fillStyle = this.colors.backgroundFade;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawSparkles();
        this.drawChannels();
        this.drawPulses();
        this.drawParticles();
        this.drawNodes();
    }

    renderStaticFrame() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawSparkles();
        this.drawChannels(true);
        this.drawNodes(true);
    }

    drawChannels(isStatic = false) {
        this.channels.forEach(channel => {
            this.ctx.save();
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            const primaryOpacity = isStatic ? 0.45 : 0.58 + channel.glow * 0.15;
            this.ctx.strokeStyle = `rgba(153, 112, 44, ${primaryOpacity})`;
            this.ctx.lineWidth = channel.width;

            this.ctx.beginPath();
            const [first, ...rest] = channel.points;
            this.ctx.moveTo(first.x, first.y);
            rest.forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.stroke();

            this.ctx.strokeStyle = this.colors.channelGlow;
            this.ctx.lineWidth = channel.width * 3.2;
            this.ctx.globalAlpha = channel.accent ? 0.55 : 0.35;
            this.ctx.stroke();

            this.ctx.restore();
        });
    }

    drawNodes(isStatic = false) {
        this.nodes.forEach(node => {
            const pulse = isStatic ? 0 : Math.sin(node.phase);
            const glowStrength = isStatic ? node.energy : node.energy * (0.6 + 0.4 * (1 + pulse));
            const radius = node.radius + pulse * 0.8;

            const gradient = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
            gradient.addColorStop(0, `rgba(255, 221, 140, ${glowStrength * 0.65})`);
            gradient.addColorStop(1, 'rgba(255, 221, 140, 0)');

            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 205, 102, ${glowStrength * 0.9})`;
            this.ctx.arc(node.x, node.y, radius * 1.7, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = this.colors.nodeCore;
            this.ctx.arc(node.x, node.y, radius * 0.9, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawParticles() {
        this.channelParticles.forEach(particle => {
            const position = this.pointAlongChannel(particle.channel, particle.progress);
            if (!position) {
                return;
            }

            const baseOpacity = 0.55 + 0.35 * Math.sin(particle.pulse);
            const gradient = this.ctx.createRadialGradient(position.x, position.y, 0, position.x, position.y, particle.size * 3.2);
            gradient.addColorStop(0, `rgba(255, 219, 126, ${baseOpacity})`);
            gradient.addColorStop(1, 'rgba(255, 219, 126, 0)');

            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(position.x, position.y, particle.size * 3.2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 239, 210, ${Math.min(1, baseOpacity + 0.15)})`;
            this.ctx.arc(position.x, position.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawPulses() {
        this.channelPulses.forEach(pulse => {
            const position = this.pointAlongChannel(pulse.channel, pulse.progress);
            const tangent = this.tangentAlongChannel(pulse.channel, pulse.progress);
            if (!position || !tangent) {
                return;
            }

            const angle = Math.atan2(tangent.y, tangent.x);
            const opacity = 0.4 + pulse.strength * 0.4;

            this.ctx.save();
            this.ctx.translate(position.x, position.y);
            this.ctx.rotate(angle);

            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, pulse.size * 2.8);
            gradient.addColorStop(0, `rgba(255, 231, 152, ${opacity})`);
            gradient.addColorStop(1, 'rgba(255, 231, 152, 0)');

            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.ellipse(0, 0, pulse.size * 2.8, pulse.size * 1.1, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 249, 230, ${Math.min(1, opacity + 0.25)})`;
            this.ctx.ellipse(0, 0, pulse.size * 1.4, pulse.size * 0.55, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    drawSparkles() {
        this.sparkles.forEach(sparkle => {
            const twinkleOpacity = sparkle.opacity * (0.55 + 0.45 * Math.sin(sparkle.twinkle));

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(78, 58, 32, ${twinkleOpacity * 0.6})`;
            this.ctx.arc(sparkle.x, sparkle.y, sparkle.baseSize * 3, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 206, 134, ${twinkleOpacity})`;
            this.ctx.arc(sparkle.x, sparkle.y, sparkle.baseSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    pointAlongChannel(channel, progress) {
        if (!channel || channel.length === 0) {
            return null;
        }

        const distance = progress * channel.length;
        let previousCumulative = 0;

        for (let i = 0; i < channel.segments.length; i++) {
            const segment = channel.segments[i];
            const segmentStartDistance = previousCumulative;
            const segmentEndDistance = segment.cumulative;

            if (distance >= segmentStartDistance && distance <= segmentEndDistance) {
                const segmentProgress = (distance - segmentStartDistance) / segment.length;
                return {
                    x: segment.start.x + (segment.end.x - segment.start.x) * segmentProgress,
                    y: segment.start.y + (segment.end.y - segment.start.y) * segmentProgress
                };
            }

            previousCumulative = segment.cumulative;
        }

        const lastSegment = channel.segments[channel.segments.length - 1];
        return { x: lastSegment.end.x, y: lastSegment.end.y };
    }

    tangentAlongChannel(channel, progress) {
        if (!channel || channel.length === 0) {
            return null;
        }

        const distance = progress * channel.length;
        let previousCumulative = 0;

        for (let i = 0; i < channel.segments.length; i++) {
            const segment = channel.segments[i];
            const segmentStartDistance = previousCumulative;
            const segmentEndDistance = segment.cumulative;

            if (distance >= segmentStartDistance && distance <= segmentEndDistance) {
                const dx = segment.end.x - segment.start.x;
                const dy = segment.end.y - segment.start.y;
                const magnitude = Math.hypot(dx, dy) || 1;
                return { x: dx / magnitude, y: dy / magnitude };
            }

            previousCumulative = segment.cumulative;
        }

        const lastSegment = channel.segments[channel.segments.length - 1];
        const dx = lastSegment.end.x - lastSegment.start.x;
        const dy = lastSegment.end.y - lastSegment.start.y;
        const magnitude = Math.hypot(dx, dy) || 1;
        return { x: dx / magnitude, y: dy / magnitude };
    }

    destroy() {
        this.stop();

        window.removeEventListener('resize', this.handleResize);
        if (this.motionQuery) {
            if (typeof this.motionQuery.removeEventListener === 'function') {
                this.motionQuery.removeEventListener('change', this.handleMotionChange);
            } else if (typeof this.motionQuery.removeListener === 'function') {
                this.motionQuery.removeListener(this.handleMotionChange);
            }
        }

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        this.canvas = null;
        this.ctx = null;
        this.isMounted = false;
    }
}

function initSmartFlowCircuitBackdrop() {
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile) {
        console.log('Skipping SmartFlow circuit backdrop on mobile devices');
        return null;
    }

    if (prefersReducedMotion) {
        console.log('Skipping SmartFlow circuit backdrop due to reduced motion preference');
        return null;
    }

    console.log('Initializing SmartFlow circuit backdrop...');
    const instance = new SmartFlowCircuitBackdrop();
    console.log('SmartFlow circuit backdrop ready with', instance.nodes.length, 'nodes and', instance.channels.length, 'channels');
    return instance;
}

let smartFlowBackdrop = null;

document.addEventListener('DOMContentLoaded', () => {
    smartFlowBackdrop = initSmartFlowCircuitBackdrop();
    if (smartFlowBackdrop) {
        window.smartFlowBackdrop = smartFlowBackdrop;
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (smartFlowBackdrop) {
            smartFlowBackdrop.destroy();
            smartFlowBackdrop = null;
            delete window.smartFlowBackdrop;
        }
    } else if (!smartFlowBackdrop) {
        smartFlowBackdrop = initSmartFlowCircuitBackdrop();
        if (smartFlowBackdrop) {
            window.smartFlowBackdrop = smartFlowBackdrop;
        }
    }
});

window.SmartFlowCircuitBackdrop = SmartFlowCircuitBackdrop;
