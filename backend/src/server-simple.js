const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Dados em memória
let transactions = [];
let idCounter = 1;

// Dados iniciais
const now = new Date();
const futureDate = (days) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d;
};

transactions = [
  { _id: String(idCounter++), description: 'Venda de Produtos', amount: 15000, type: 'receivable', status: 'pending', dueDate: futureDate(5), category: 'Vendas', createdAt: new Date() },
  { _id: String(idCounter++), description: 'Serviços de Consultoria', amount: 8500, type: 'receivable', status: 'pending', dueDate: futureDate(12), category: 'Serviços', createdAt: new Date() },
  { _id: String(idCounter++), description: 'Aluguel do Escritório', amount: 3000, type: 'payable', status: 'pending', dueDate: futureDate(3), category: 'Aluguel', createdAt: new Date() },
  { _id: String(idCounter++), description: 'Salários Funcionários', amount: 12000, type: 'payable', status: 'pending', dueDate: futureDate(8), category: 'RH', createdAt: new Date() },
  { _id: String(idCounter++), description: 'Projeto Site', amount: 5000, type: 'receivable', status: 'pending', dueDate: futureDate(20), category: 'Projetos', createdAt: new Date() },
];

// Rotas
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/api/transactions', (req, res) => res.json(transactions));
app.post('/api/transactions', (req, res) => {
  const t = { ...req.body, _id: String(idCounter++), createdAt: new Date() };
  transactions.push(t);
  res.status(201).json(t);
});
app.put('/api/transactions/:id', (req, res) => {
  const idx = transactions.findIndex(t => t._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  transactions[idx] = { ...transactions[idx], ...req.body };
  res.json(transactions[idx]);
});
app.delete('/api/transactions/:id', (req, res) => {
  transactions = transactions.filter(t => t._id !== req.params.id);
  res.status(204).send();
});

// Dashboard
app.get('/api/dashboard/projections', (req, res) => {
  const projections = [];
  let balance = 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    
    const dayTrans = transactions.filter(t => {
      const d = new Date(t.dueDate);
      return d.toDateString() === date.toDateString() && t.status !== 'paid';
    });
    
    const receivables = dayTrans.filter(t => t.type === 'receivable').reduce((s, t) => s + t.amount, 0);
    const payables = dayTrans.filter(t => t.type === 'payable').reduce((s, t) => s + t.amount, 0);
    balance += receivables - payables;
    
    projections.push({ date: date.toISOString(), balance, receivables, payables, projectedBalance: balance });
  }
  
  const totalReceivables = transactions.filter(t => t.type === 'receivable' && t.status !== 'paid').reduce((s, t) => s + t.amount, 0);
  const totalPayables = transactions.filter(t => t.type === 'payable' && t.status !== 'paid').reduce((s, t) => s + t.amount, 0);
  
  res.json({
    projections,
    summary: {
      totalReceivables,
      totalPayables,
      overdueReceivables: 0,
      overduePayables: 0,
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

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
