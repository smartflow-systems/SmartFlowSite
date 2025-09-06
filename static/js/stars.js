// Digital Circuit Flow - Animated circuit patterns for SmartFlow
document.addEventListener('DOMContentLoaded', function() {
  // Create circuit container
  const circuitField = document.createElement('div');
  circuitField.id = 'starfield';
  circuitField.className = 'circuit-field';
  document.body.appendChild(circuitField);
  
  // Circuit path patterns
  const circuitPatterns = [
    'M0,0 L20,0 L20,20 L40,20',
    'M0,0 L30,0 L30,30 L60,30 L60,60',
    'M0,0 L10,0 L10,10 L20,10 L20,20 L30,20',
    'M0,0 L40,0 L40,40 L80,40',
    'M0,0 L15,0 L15,15 L30,15 L30,30 L45,30'
  ];
  
  // Create flowing circuit line
  function createCircuitLine() {
    const circuit = document.createElement('div');
    circuit.className = 'circuit-line';
    
    // Random starting position
    const startSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    
    switch(startSide) {
      case 0: // from top
        circuit.style.left = Math.random() * 100 + '%';
        circuit.style.top = '-100px';
        circuit.dataset.direction = 'down';
        break;
      case 1: // from right
        circuit.style.right = '-100px';
        circuit.style.top = Math.random() * 100 + '%';
        circuit.dataset.direction = 'left';
        break;
      case 2: // from bottom
        circuit.style.left = Math.random() * 100 + '%';
        circuit.style.bottom = '-100px';
        circuit.dataset.direction = 'up';
        break;
      case 3: // from left
        circuit.style.left = '-100px';
        circuit.style.top = Math.random() * 100 + '%';
        circuit.dataset.direction = 'right';
        break;
    }
    
    // Create circuit path SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    svg.style.position = 'absolute';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', circuitPatterns[Math.floor(Math.random() * circuitPatterns.length)]);
    path.setAttribute('stroke', '#d4af37');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.className = 'circuit-path';
    
    svg.appendChild(path);
    circuit.appendChild(svg);
    
    // Add circuit nodes (dots)
    const numNodes = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numNodes; i++) {
      const node = document.createElement('div');
      node.className = 'circuit-node';
      node.style.left = Math.random() * 80 + 10 + 'px';
      node.style.top = Math.random() * 80 + 10 + 'px';
      circuit.appendChild(node);
    }
    
    // Add data packet (flowing spark)
    const dataPacket = document.createElement('div');
    dataPacket.className = 'data-packet';
    circuit.appendChild(dataPacket);
    
    return circuit;
  }
  
  // Create binary rain effect
  function createBinaryRain() {
    const binary = document.createElement('div');
    binary.className = 'binary-rain';
    binary.textContent = Math.random() > 0.5 ? '1' : '0';
    binary.style.left = Math.random() * 100 + '%';
    binary.style.animationDuration = (5 + Math.random() * 5) + 's';
    binary.style.animationDelay = Math.random() * 2 + 's';
    return binary;
  }
  
  // Create sparkling effect
  function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'digital-sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    
    // Random sparkle pattern
    const size = Math.random() * 4 + 2;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    
    circuitField.appendChild(sparkle);
    
    // Remove after animation
    setTimeout(() => sparkle.remove(), 2000);
  }
  
  // Create hexagon grid pattern
  function createHexGrid() {
    const hex = document.createElement('div');
    hex.className = 'hex-grid';
    
    // Create hexagon shape
    const hexSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hexSvg.setAttribute('width', '60');
    hexSvg.setAttribute('height', '60');
    
    const hexPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    hexPath.setAttribute('points', '30,5 50,15 50,35 30,45 10,35 10,15');
    hexPath.setAttribute('stroke', '#d4af37');
    hexPath.setAttribute('stroke-width', '1');
    hexPath.setAttribute('fill', 'none');
    hexPath.style.opacity = '0.3';
    
    hexSvg.appendChild(hexPath);
    hex.appendChild(hexSvg);
    
    hex.style.left = Math.random() * 100 + '%';
    hex.style.top = Math.random() * 100 + '%';
    
    return hex;
  }
  
  // Initial creation
  // Add flowing circuit lines
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      circuitField.appendChild(createCircuitLine());
    }, i * 500);
  }
  
  // Add binary rain
  for (let i = 0; i < 30; i++) {
    circuitField.appendChild(createBinaryRain());
  }
  
  // Add hex grid
  for (let i = 0; i < 15; i++) {
    circuitField.appendChild(createHexGrid());
  }
  
  // Continuously create new elements
  setInterval(() => {
    // Add new circuit line
    const circuit = createCircuitLine();
    circuitField.appendChild(circuit);
    
    // Remove old circuit after animation
    setTimeout(() => circuit.remove(), 15000);
  }, 2000);
  
  // Create sparkles periodically
  setInterval(createSparkle, 300);
  
  // Add new binary rain periodically
  setInterval(() => {
    const binary = createBinaryRain();
    circuitField.appendChild(binary);
    setTimeout(() => binary.remove(), 10000);
  }, 1000);
  
  console.log('⚡ Digital circuit flow initialized with flowing patterns and sparkles');
});