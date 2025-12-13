import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

console.log('Testing SmartFlow application...');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response:', data);
    console.log('🎉 SmartFlow application is working correctly!');
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
  console.log('💡 Make sure the server is running on port 5000');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('⏰ Request timed out');
  req.destroy();
  process.exit(1);
});

req.setTimeout(5000);
req.end();