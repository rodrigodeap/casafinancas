const { spawn } = require('child_process');
const open = require('open');

console.log('🏠 Iniciando CasaFinanças...\n');

// Iniciar backend
console.log('📦 Iniciando backend...');
const backend = spawn('node', ['server.js'], {
  cwd: './backend',
  shell: true,
  stdio: 'pipe'
});

backend.stdout.on('data', (data) => {
  const msg = data.toString().trim();
  console.log(`[BACKEND] ${msg}`);
  if (msg.includes('rodando em')) {
    console.log('\n✅ Backend iniciado com sucesso!');
    console.log('🎨 Iniciando frontend...\n');
    
    const frontend = spawn('npm', ['start'], {
      cwd: './frontend',
      shell: true,
      stdio: 'pipe'
    });

    frontend.stdout.on('data', (d) => console.log(`[FRONTEND] ${d.toString().trim()}`));
    frontend.stderr.on('data', (d) => console.error(`[FRONTEND] ${d.toString().trim()}`));

    setTimeout(() => {
      console.log('\n🌐 Abrindo navegador...');
      open('http://localhost:3000');
      console.log('\n✅ CasaFinanças pronto para uso!');
      console.log('🏠 Dashboard: http://localhost:3000');
      console.log('📋 Transações: http://localhost:3000/transactions');
      console.log('🔧 API: http://localhost:5000/api\n');
      console.log('📊 Dados de exemplo carregados! Comece a gerenciar suas finanças.');
    }, 3000);
  }
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando CasaFinanças...');
  process.exit();
});
