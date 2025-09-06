// Full Coverage Circuit Board Network - Intense pulsing grid for SmartFlow
document.addEventListener('DOMContentLoaded', function() {
  // Create main circuit board container
  const circuitBoard = document.createElement('div');
  circuitBoard.id = 'starfield';
  circuitBoard.className = 'circuit-board';
  document.body.appendChild(circuitBoard);
  
  // Create full coverage SVG circuit board
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.position = 'absolute';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.top = '0';
  svg.style.left = '0';
  
  // Create grid pattern for circuit board
  const gridSize = 50; // Size of each grid cell
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const cols = Math.ceil(screenWidth / gridSize) + 2;
  const rows = Math.ceil(screenHeight / gridSize) + 2;
  
  // Store all connection points
  const nodes = [];
  const connections = [];
  
  // Create grid of connection nodes
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSize;
      const y = row * gridSize;
      
      // Create node
      const node = document.createElement('div');
      node.className = 'circuit-node-grid';
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      node.dataset.row = row;
      node.dataset.col = col;
      
      // Random node types for variety
      const nodeType = Math.random();
      if (nodeType < 0.1) {
        node.classList.add('major-node'); // Major junction
      } else if (nodeType < 0.3) {
        node.classList.add('active-node'); // Active component
      }
      
      circuitBoard.appendChild(node);
      nodes.push({element: node, x: x, y: y, row: row, col: col});
    }
  }
  
  // Create circuit traces (wires) connecting nodes
  function createCircuitTrace(startNode, endNode) {
    const trace = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    trace.setAttribute('x1', startNode.x);
    trace.setAttribute('y1', startNode.y);
    trace.setAttribute('x2', endNode.x);
    trace.setAttribute('y2', endNode.y);
    trace.className = 'circuit-trace';
    
    // Random trace intensity
    if (Math.random() < 0.3) {
      trace.classList.add('power-trace'); // Main power lines
    }
    
    svg.appendChild(trace);
    connections.push({trace: trace, start: startNode, end: endNode});
    return trace;
  }
  
  // Connect nodes in grid pattern with some randomization
  nodes.forEach((node, index) => {
    // Connect to right neighbor
    if ((index + 1) % cols !== 0 && Math.random() < 0.7) {
      const rightNode = nodes[index + 1];
      if (rightNode) createCircuitTrace(node, rightNode);
    }
    
    // Connect to bottom neighbor
    if (index + cols < nodes.length && Math.random() < 0.7) {
      const bottomNode = nodes[index + cols];
      if (bottomNode) createCircuitTrace(node, bottomNode);
    }
    
    // Diagonal connections for complexity
    if (Math.random() < 0.2 && index + cols + 1 < nodes.length) {
      const diagNode = nodes[index + cols + 1];
      if (diagNode) createCircuitTrace(node, diagNode);
    }
    
    // Long-range connections for major pathways
    if (Math.random() < 0.05) {
      const farIndex = Math.min(index + cols * 3 + Math.floor(Math.random() * 5), nodes.length - 1);
      const farNode = nodes[farIndex];
      if (farNode) {
        const trace = createCircuitTrace(node, farNode);
        trace.classList.add('major-pathway');
      }
    }
  });
  
  circuitBoard.appendChild(svg);
  
  // Create electric pulses that travel through the network
  function createElectricPulse() {
    if (connections.length === 0) return;
    
    // Pick a random connection
    const connection = connections[Math.floor(Math.random() * connections.length)];
    
    const pulse = document.createElement('div');
    pulse.className = 'electric-pulse';
    pulse.style.left = connection.start.x + 'px';
    pulse.style.top = connection.start.y + 'px';
    
    // Calculate angle for pulse direction
    const dx = connection.end.x - connection.start.x;
    const dy = connection.end.y - connection.start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = distance / 200; // Speed of pulse
    
    // Animate pulse along the wire
    pulse.style.transition = `all ${duration}s linear`;
    circuitBoard.appendChild(pulse);
    
    // Start animation
    setTimeout(() => {
      pulse.style.left = connection.end.x + 'px';
      pulse.style.top = connection.end.y + 'px';
      
      // Flash the destination node
      connection.end.element.classList.add('node-flash');
      setTimeout(() => {
        connection.end.element.classList.remove('node-flash');
      }, 300);
    }, 50);
    
    // Remove pulse after animation
    setTimeout(() => pulse.remove(), duration * 1000 + 100);
    
    // Light up the trace
    connection.trace.classList.add('trace-active');
    setTimeout(() => {
      connection.trace.classList.remove('trace-active');
    }, duration * 1000);
  }
  
  // Create data burst effect (multiple pulses)
  function createDataBurst() {
    const burstCount = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < burstCount; i++) {
      setTimeout(createElectricPulse, i * 100);
    }
  }
  
  // Create major power surge effect
  function createPowerSurge() {
    // Select multiple connected paths
    const surgeCount = Math.min(20, connections.length);
    const indices = new Set();
    
    while (indices.size < surgeCount) {
      indices.add(Math.floor(Math.random() * connections.length));
    }
    
    indices.forEach(index => {
      const connection = connections[index];
      connection.trace.classList.add('power-surge');
      
      // Create intense pulse
      const surgePulse = document.createElement('div');
      surgePulse.className = 'surge-pulse';
      surgePulse.style.left = connection.start.x + 'px';
      surgePulse.style.top = connection.start.y + 'px';
      circuitBoard.appendChild(surgePulse);
      
      // Animate surge
      const dx = connection.end.x - connection.start.x;
      const dy = connection.end.y - connection.start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = distance / 400; // Faster for surge
      
      surgePulse.style.transition = `all ${duration}s ease-out`;
      setTimeout(() => {
        surgePulse.style.left = connection.end.x + 'px';
        surgePulse.style.top = connection.end.y + 'px';
        surgePulse.style.transform = 'scale(2)';
        surgePulse.style.opacity = '0';
      }, 50);
      
      // Cleanup
      setTimeout(() => {
        connection.trace.classList.remove('power-surge');
        surgePulse.remove();
      }, duration * 1000 + 500);
    });
    
    // Screen flash effect
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    circuitBoard.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }
  
  // Create scanning line effect
  function createScanLine() {
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line';
    circuitBoard.appendChild(scanLine);
    
    // Trigger node reactions as scan passes
    setTimeout(() => {
      nodes.forEach((node, index) => {
        setTimeout(() => {
          node.element.classList.add('node-scanned');
          setTimeout(() => {
            node.element.classList.remove('node-scanned');
          }, 1000);
        }, index * 2);
      });
    }, 100);
    
    setTimeout(() => scanLine.remove(), 4000);
  }
  
  // Start continuous animations
  // Regular pulses
  setInterval(createElectricPulse, 100);
  
  // Data bursts
  setInterval(createDataBurst, 3000);
  
  // Power surges
  setInterval(createPowerSurge, 5000);
  
  // Scanning effect
  setInterval(createScanLine, 8000);
  
  // Initial burst on load
  setTimeout(createPowerSurge, 500);
  
  // Responsive - rebuild on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      location.reload(); // Simple rebuild
    }, 1000);
  });
  
  console.log('⚡ FULL CIRCUIT BOARD ACTIVATED - Intense grid network with ' + connections.length + ' connections');
});