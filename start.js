const { spawn } = require('child_process');
const open = require('open');

console.log('🚀 Iniciando Financial SaaS...\n');

// Função para executar comando
function runCommand(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd,
      shell: true,
      stdio: 'pipe'
    });

    process.stdout.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${name} ERROR] ${data.toString().trim()}`);
    });

    process.on('error', (error) => {
      reject(error);
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process ${name} exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

// Iniciar backend primeiro
console.log('📦 Iniciando backend...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  shell: true,
  stdio: 'pipe'
});

backend.stdout.on('data', (data) => {
  const msg = data.toString().trim();
  console.log(`[BACKEND] ${msg}`);
  // Quando o backend estiver pronto, iniciar frontend
  if (msg.includes('Server running') || msg.includes('listening')) {
    console.log('\n✅ Backend iniciado com sucesso!');
    console.log('🎨 Iniciando frontend...\n');
    
    const frontend = spawn('npm', ['start'], {
      cwd: './frontend',
      shell: true,
      stdio: 'pipe'
    });

    frontend.stdout.on('data', (data) => {
      console.log(`[FRONTEND] ${data.toString().trim()}`);
    });

    frontend.stderr.on('data', (data) => {
      console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
    });

    // Abrir navegador após 5 segundos
    setTimeout(() => {
      console.log('\n🌐 Abrindo navegador...');
      open('http://localhost:3000');
      console.log('\n✅ Sistema pronto para uso!');
      console.log('📊 Dashboard: http://localhost:3000');
      console.log('🔧 API: http://localhost:5000/api');
      console.log('📋 Para ver transações: http://localhost:3000/transactions\n');
    }, 5000);
  }
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

// Tratamento de encerramento
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidores...');
  process.exit();
});
