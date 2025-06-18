// Simple test to verify server startup
import { spawn } from 'child_process';

console.log('Testing server startup...');

const server = spawn('node', ['dist/index.js'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '3000'
  }
});

let output = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('Server output:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  if (code === 0) {
    console.log('✅ Server started successfully!');
  } else {
    console.log('❌ Server failed to start');
  }
});

// Kill server after 10 seconds
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 10000); 