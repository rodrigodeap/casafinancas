const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ===== DADOS EM MEMÓRIA =====
let transactions = [];
let idCounter = 1;

// Dados iniciais de exemplo
const now = new Date();
const futureDate = (days) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d;
};

transactions = [
  { 
    _id: String(idCounter++), 
    description: 'Venda de Produtos', 
    amount: 15000, 
    type: 'receivable', 
    status: 'pending', 
    dueDate: futureDate(5), 
    category: 'Vendas' 
  },
  { 
    _id: String(idCounter++), 
    description: 'Serviços de Consultoria', 
    amount: 8500, 
    type: 'receivable', 
    status: 'pending', 
    dueDate: futureDate(12), 
    category: 'Serviços' 
  },
  { 
    _id: String(idCounter++), 
    description: 'Aluguel do Escritório', 
    amount: 3000, 
    type: 'payable', 
    status: 'pending', 
    dueDate: futureDate(3), 
    category: 'Aluguel' 
  },
  { 
    _id: String(idCounter++), 
    description: 'Salários Funcionários', 
    amount: 12000, 
    type: 'payable', 
    status: 'pending', 
    dueDate: futureDate(8), 
    category: 'RH' 
  },
  { 
    _id: String(idCounter++), 
    description: 'Projeto Site', 
    amount: 5000, 
    type: 'receivable', 
    status: 'pending', 
    dueDate: futureDate(20), 
    category: 'Projetos' 
  },
  { 
    _id: String(idCounter++), 
    description: 'Internet e Telefone', 
    amount: 500, 
    type: 'payable', 
    status: 'overdue', 
    dueDate: futureDate(-2), 
    category: 'Utilidades' 
  },
];

// ===== ROTAS =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CasaFinanças rodando!' });
});

// Listar todas as transações
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// Criar nova transação
app.post('/api/transactions', (req, res) => {
  const { description, amount, type, status, dueDate, category } = req.body;
  const newTransaction = {
    _id: String(idCounter++),
    description,
    amount: Number(amount),
    type,
    status: status || 'pending',
    dueDate: new Date(dueDate),
    category: category || '',
  };
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Atualizar transação
app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const index = transactions.findIndex(t => t._id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }
  
  transactions[index] = {
    ...transactions[index],
    ...req.body,
    amount: Number(req.body.amount),
    dueDate: new Date(req.body.dueDate),
  };
  res.json(transactions[index]);
});

// Deletar transação
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  transactions = transactions.filter(t => t._id !== id);
  res.status(204).send();
});

// Dashboard com projeções
app.get('/api/dashboard/projections', (req, res) => {
  const projections = [];
  let balance = 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    
    const dayTransactions = transactions.filter(t => {
      const d = new Date(t.dueDate);
      return d.toDateString() === date.toDateString() && t.status !== 'paid';
    });
    
    const receivables = dayTransactions
      .filter(t => t.type === 'receivable')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const payables = dayTransactions
      .filter(t => t.type === 'payable')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    balance += receivables - payables;
    
    projections.push({
      date: date.toISOString(),
      balance: Math.round(balance * 100) / 100,
      receivables: Math.round(receivables * 100) / 100,
      payables: Math.round(payables * 100) / 100,
      projectedBalance: Math.round(balance * 100) / 100,
    });
  }
  
  const totalReceivables = transactions
    .filter(t => t.type === 'receivable' && t.status !== 'paid')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalPayables = transactions
    .filter(t => t.type === 'payable' && t.status !== 'paid')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  res.json({
    projections,
    summary: {
      totalReceivables,
      totalPayables,
      overdueReceivables: transactions
        .filter(t => t.type === 'receivable' && t.status === 'overdue')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      overduePayables: transactions
        .filter(t => t.type === 'payable' && t.status === 'overdue')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      currentBalance: totalReceivables - totalPayables,
      projectedBalance: balance,
    },
    metrics: {
      daysToPositive: projections.findIndex(p => p.balance > 0),
      maxNegative: Math.min(0, ...projections.map(p => p.balance)),
      maxPositive: Math.max(0, ...projections.map(p => p.balance)),
    },
  });
});

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ CasaFinanças Backend rodando em: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 Transações: http://localhost:${PORT}/api/transactions`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard/projections`);
});
