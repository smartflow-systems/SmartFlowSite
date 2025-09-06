// Sophisticated Circuit Pattern Background - Dark Brown with Gold Traces
document.addEventListener('DOMContentLoaded', function() {
  // Create main circuit pattern container
  const circuitPattern = document.createElement('div');
  circuitPattern.id = 'starfield';
  circuitPattern.className = 'circuit-pattern';
  document.body.appendChild(circuitPattern);
  
  // Create SVG for circuit traces
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'absolute';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.top = '0';
  svg.style.left = '0';
  
  // Define circuit pattern
  const patternSize = 100;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Create repeating circuit pattern
  function createCircuitPattern() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Create pattern element
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'circuitPattern');
    pattern.setAttribute('x', '0');
    pattern.setAttribute('y', '0');
    pattern.setAttribute('width', patternSize);
    pattern.setAttribute('height', patternSize);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    // Draw circuit traces in pattern
    const traces = [
      'M10,10 L40,10 L40,30 L60,30',
      'M60,30 L60,60 L80,60',
      'M10,10 L10,40 L30,40',
      'M30,40 L30,70 L50,70 L50,90',
      'M40,10 L40,20 L70,20 L70,50',
      'M80,60 L80,80 L90,80',
      'M50,70 L80,70',
      'M70,50 L90,50',
      'M20,80 L20,90 L40,90',
      'M0,50 L10,50 L10,70',
      'M90,20 L100,20',
      'M90,80 L100,80',
      'M0,0 L10,0 L10,10',
      'M90,90 L100,90 L100,100'
    ];
    
    traces.forEach(d => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'rgba(92, 64, 51, 0.15)'); // Dark brown traces
      path.setAttribute('stroke-width', '0.5');
      path.setAttribute('fill', 'none');
      pattern.appendChild(path);
    });
    
    // Add connection nodes
    const nodes = [
      [10, 10], [40, 10], [40, 30], [60, 30],
      [60, 60], [80, 60], [30, 40], [50, 70],
      [70, 20], [70, 50], [80, 80], [20, 80],
      [40, 90], [10, 50], [90, 20], [90, 80]
    ];
    
    nodes.forEach(([x, y]) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '1.5');
      circle.setAttribute('fill', 'rgba(92, 64, 51, 0.2)');
      circle.setAttribute('stroke', 'rgba(139, 105, 71, 0.3)');
      circle.setAttribute('stroke-width', '0.5');
      pattern.appendChild(circle);
    });
    
    defs.appendChild(pattern);
    svg.appendChild(defs);
    
    // Create background rect with pattern
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'url(#circuitPattern)');
    rect.setAttribute('opacity', '0.7');
    svg.appendChild(rect);
  }
  
  createCircuitPattern();
  circuitPattern.appendChild(svg);
  
  // Add subtle animated traces
  function createAnimatedTrace() {
    const trace = document.createElement('div');
    trace.className = 'animated-trace';
    
    // Random path across screen
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const endX = Math.random() * 100;
    const endY = Math.random() * 100;
    
    trace.style.left = startX + '%';
    trace.style.top = startY + '%';
    
    // Create path line
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    
    trace.style.width = length + '%';
    trace.style.transform = `rotate(${angle}deg)`;
    
    circuitPattern.appendChild(trace);
    
    // Remove after animation
    setTimeout(() => trace.remove(), 5000);
  }
  
  // Add subtle gold pulse points
  function createGoldPulse() {
    const pulse = document.createElement('div');
    pulse.className = 'gold-pulse';
    
    // Position at circuit intersections
    const gridX = Math.floor(Math.random() * (screenWidth / patternSize)) * patternSize;
    const gridY = Math.floor(Math.random() * (screenHeight / patternSize)) * patternSize;
    
    // Add some randomness within grid
    pulse.style.left = (gridX + Math.random() * 50 - 25) + 'px';
    pulse.style.top = (gridY + Math.random() * 50 - 25) + 'px';
    
    circuitPattern.appendChild(pulse);
    
    // Remove after animation
    setTimeout(() => pulse.remove(), 2000);
  }
  
  // Create data flow effect
  function createDataFlow() {
    const flow = document.createElement('div');
    flow.className = 'data-flow';
    
    // Horizontal or vertical
    const isHorizontal = Math.random() > 0.5;
    
    if (isHorizontal) {
      flow.style.left = '-5%';
      flow.style.top = Math.floor(Math.random() * 10) * 10 + '%';
      flow.style.width = '110%';
      flow.style.height = '1px';
      flow.classList.add('horizontal');
    } else {
      flow.style.top = '-5%';
      flow.style.left = Math.floor(Math.random() * 10) * 10 + '%';
      flow.style.height = '110%';
      flow.style.width = '1px';
      flow.classList.add('vertical');
    }
    
    circuitPattern.appendChild(flow);
    
    // Remove after animation
    setTimeout(() => flow.remove(), 3000);
  }
  
  // Start subtle animations
  setInterval(createAnimatedTrace, 4000);
  setInterval(createGoldPulse, 3000);
  setInterval(createDataFlow, 5000);
  
  // Initial effects
  setTimeout(() => {
    createGoldPulse();
    createDataFlow();
  }, 500);
  
  console.log('🔌 Circuit pattern background initialized');
});