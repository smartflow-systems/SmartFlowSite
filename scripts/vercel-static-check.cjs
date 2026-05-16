const fs = require('fs');

const required = [
  'public/index.html',
  'public/checkout.html',
  'public/pricing.html',
  'public/landing.html',
  'public/terms.html',
  'public/privacy.html',
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error('Missing required site file:', file);
    process.exit(1);
  }
}

console.log('SmartFlowSite static build complete');
