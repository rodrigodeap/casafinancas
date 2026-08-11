const { exec } = require('child_process');
const os = require('os');

console.log('🚀 Iniciando Financial SaaS...');

const isWindows = os.platform() === 'win32';
const cmd = isWindows ? 'start' : 'open';

// Iniciar backend
console.log('📦 Iniciando backend...');
const backend = exec('cd backend && npm install && npm run dev');

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data}`);
});

// Iniciar frontend
console.log('🎨 Iniciando frontend...');
const frontend = exec('cd frontend && npm install && npm start');

frontend.stdout.on('data', (data) => {
  console.log(`[FRONTEND] ${data}`);
});

// Abrir navegador após 5 segundos
setTimeout(() => {
  console.log('🌐 Abrindo navegador...');
  const open = require('open');
  open('http://localhost:3000');
}, 5000);

console.log('✅ Sistema inicializado! Aguarde alguns segundos...');
console.log('📊 Dashboard: http://localhost:3000');
console.log('🔧 API: http://localhost:5000/api');
