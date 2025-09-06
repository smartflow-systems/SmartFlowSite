// Golden Dark Brown Circuit Board - Full Grid Coverage
document.addEventListener('DOMContentLoaded', function() {
  // Create circuit board container
  const circuitBoard = document.createElement('div');
  circuitBoard.id = 'starfield';
  circuitBoard.className = 'golden-circuit-board';
  document.body.appendChild(circuitBoard);
  
  // Create full coverage SVG circuit board
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'absolute';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.top = '0';
  svg.style.left = '0';
  
  // Create grid pattern for circuit board
  const gridSize = 60; // Size of each grid cell
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const cols = Math.ceil(screenWidth / gridSize) + 2;
  const rows = Math.ceil(screenHeight / gridSize) + 2;
  
  // Store all connection points and traces
  const nodes = [];
  const traces = [];
  
  // Create grid of connection nodes
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSize;
      const y = row * gridSize;
      
      // Create connection node
      const node = document.createElement('div');
      node.className = 'circuit-node';
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      
      // Random node types for variety
      const nodeType = Math.random();
      if (nodeType < 0.15) {
        node.classList.add('major-junction'); // Major golden junction
      } else if (nodeType < 0.35) {
        node.classList.add('active-component'); // Active golden component
      }
      
      circuitBoard.appendChild(node);
      nodes.push({element: node, x: x, y: y, row: row, col: col});
    }
  }
  
  // Create circuit traces connecting nodes
  function createTrace(startNode, endNode, traceType = 'normal') {
    const trace = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    trace.setAttribute('x1', startNode.x);
    trace.setAttribute('y1', startNode.y);
    trace.setAttribute('x2', endNode.x);
    trace.setAttribute('y2', endNode.y);
    trace.className = `circuit-trace ${traceType}`;
    
    svg.appendChild(trace);
    traces.push({trace: trace, start: startNode, end: endNode, type: traceType});
    return trace;
  }
  
  // Connect nodes in comprehensive grid pattern
  nodes.forEach((node, index) => {
    // Connect to right neighbor
    if ((index + 1) % cols !== 0) {
      const rightNode = nodes[index + 1];
      if (rightNode) {
        const traceType = Math.random() < 0.3 ? 'power-line' : 'normal';
        createTrace(node, rightNode, traceType);
      }
    }
    
    // Connect to bottom neighbor
    if (index + cols < nodes.length) {
      const bottomNode = nodes[index + cols];
      if (bottomNode) {
        const traceType = Math.random() < 0.3 ? 'power-line' : 'normal';
        createTrace(node, bottomNode, traceType);
      }
    }
    
    // Diagonal connections for complexity
    if (Math.random() < 0.4 && index + cols + 1 < nodes.length && (index + 1) % cols !== 0) {
      const diagNode = nodes[index + cols + 1];
      if (diagNode) createTrace(node, diagNode, 'diagonal');
    }
    
    // Long-range power connections
    if (Math.random() < 0.1) {
      const range = 3 + Math.floor(Math.random() * 4);
      const targetIndex = Math.min(index + cols * range, nodes.length - 1);
      const farNode = nodes[targetIndex];
      if (farNode) createTrace(node, farNode, 'main-power');
    }
  });
  
  circuitBoard.appendChild(svg);
  
  // Create electric data pulses
  function createDataPulse() {
    if (traces.length === 0) return;
    
    const trace = traces[Math.floor(Math.random() * traces.length)];
    
    const pulse = document.createElement('div');
    pulse.className = 'data-pulse';
    pulse.style.left = trace.start.x + 'px';
    pulse.style.top = trace.start.y + 'px';
    
    // Calculate movement
    const dx = trace.end.x - trace.start.x;
    const dy = trace.end.y - trace.start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = distance / 150; // Pulse speed
    
    pulse.style.transition = `all ${duration}s linear`;
    circuitBoard.appendChild(pulse);
    
    // Animate pulse
    setTimeout(() => {
      pulse.style.left = trace.end.x + 'px';
      pulse.style.top = trace.end.y + 'px';
      
      // Light up destination node
      trace.end.element.classList.add('node-active');
      setTimeout(() => {
        trace.end.element.classList.remove('node-active');
      }, 400);
    }, 50);
    
    // Light up the trace
    trace.trace.classList.add('trace-energized');
    setTimeout(() => {
      trace.trace.classList.remove('trace-energized');
    }, duration * 1000);
    
    // Remove pulse
    setTimeout(() => pulse.remove(), duration * 1000 + 100);
  }
  
  // Create golden energy bursts
  function createEnergyBurst() {
    const burstCount = 8 + Math.floor(Math.random() * 12);
    for (let i = 0; i < burstCount; i++) {
      setTimeout(createDataPulse, i * 150);
    }
    
    // Screen glow effect
    const glow = document.createElement('div');
    glow.className = 'golden-screen-glow';
    circuitBoard.appendChild(glow);
    setTimeout(() => glow.remove(), 2000);
  }
  
  // Create power surge effect
  function createPowerSurge() {
    const powerTraces = traces.filter(t => t.type === 'power-line' || t.type === 'main-power');
    
    powerTraces.forEach((trace, index) => {
      setTimeout(() => {
        trace.trace.classList.add('power-surge');
        
        // Create intense pulse
        const surgePulse = document.createElement('div');
        surgePulse.className = 'power-surge-pulse';
        surgePulse.style.left = trace.start.x + 'px';
        surgePulse.style.top = trace.start.y + 'px';
        circuitBoard.appendChild(surgePulse);
        
        const dx = trace.end.x - trace.start.x;
        const dy = trace.end.y - trace.start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const duration = distance / 300;
        
        surgePulse.style.transition = `all ${duration}s ease-out`;
        setTimeout(() => {
          surgePulse.style.left = trace.end.x + 'px';
          surgePulse.style.top = trace.end.y + 'px';
          surgePulse.style.transform = 'scale(2)';
          surgePulse.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
          trace.trace.classList.remove('power-surge');
          surgePulse.remove();
        }, duration * 1000 + 500);
        
      }, index * 100);
    });
  }
  
  // Start animations
  setInterval(createDataPulse, 200);  // Regular data flow
  setInterval(createEnergyBurst, 4000); // Energy bursts
  setInterval(createPowerSurge, 7000); // Power surges
  
  // Initial power surge
  setTimeout(createPowerSurge, 1000);
  
  console.log('🏆 Golden circuit board activated with ' + traces.length + ' connections');
});