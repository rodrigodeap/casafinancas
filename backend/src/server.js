const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Conexão MongoDB (com fallback para dados em memória)
let useMemoryDB = false;
let memoryTransactions = [];
let memoryIdCounter = 1;

try {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-saas', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB conectado com sucesso!');
} catch (error) {
  console.warn('MongoDB não disponível, usando dados em memória');
  useMemoryDB = true;
}

// Models
const TransactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: { type: String, enum: ['receivable', 'payable'] },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  dueDate: Date,
  paymentDate: Date,
  category: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  company: String,
  createdAt: { type: Date, default: Date.now },
});

let Transaction, User;

if (!useMemoryDB) {
  Transaction = mongoose.model('Transaction', TransactionSchema);
  User = mongoose.model('User', UserSchema);
}

// Dados iniciais para demonstração
const seedMemoryData = () => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const futureDate = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d;
  };

  // Criar dados de exemplo
  const sampleData = [
    { description: 'Venda de Produtos', amount: 15000, type: 'receivable', status: 'pending', dueDate: futureDate(5), category: 'Vendas' },
    { description: 'Serviços de Consultoria', amount: 8500, type: 'receivable', status: 'pending', dueDate: futureDate(12), category: 'Serviços' },
    { description: 'Aluguel do Escritório', amount: 3000, type: 'payable', status: 'pending', dueDate: futureDate(3), category: 'Aluguel' },
    { description: 'Salários Funcionários', amount: 12000, type: 'payable', status: 'pending', dueDate: futureDate(8), category: 'RH' },
    { description: 'Projeto Site', amount: 5000, type: 'receivable', status: 'pending', dueDate: futureDate(20), category: 'Projetos' },
    { description: 'Internet e Telefone', amount: 500, type: 'payable', status: 'pending', dueDate: futureDate(10), category: 'Utilidades' },
    { description: 'Venda Consultoria', amount: 7500, type: 'receivable', status: 'paid', dueDate: futureDate(-5), category: 'Serviços' },
    { description: 'Fornecedor Materiais', amount: 2000, type: 'payable', status: 'overdue', dueDate: futureDate(-2), category: 'Compras' },
    { description: 'Projeto Desenvolvimento', amount: 12000, type: 'receivable', status: 'pending', dueDate: futureDate(15), category: 'Projetos' },
    { description: 'Energia Elétrica', amount: 800, type: 'payable', status: 'pending', dueDate: futureDate(18), category: 'Utilidades' },
  ];

  memoryTransactions = sampleData.map((item, index) => ({
    _id: String(memoryIdCounter++),
    ...item,
    createdAt: new Date(),
  }));
};

seedMemoryData();

// ============= ROTAS =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Rotas de Transações
app.get('/api/transactions', async (req, res) => {
  try {
    if (useMemoryDB) {
      return res.json(memoryTransactions);
    }
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    console.error('Erro GET /transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { description, amount, type, status, dueDate, category } = req.body;
    
    if (useMemoryDB) {
      const newTransaction = {
        _id: String(memoryIdCounter++),
        description,
        amount: Number(amount),
        type,
        status: status || 'pending',
        dueDate: new Date(dueDate),
        category: category || '',
        createdAt: new Date(),
      };
      memoryTransactions.push(newTransaction);
      return res.status(201).json(newTransaction);
    }

    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erro POST /transactions:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useMemoryDB) {
      const index = memoryTransactions.findIndex(t => t._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      memoryTransactions[index] = {
        ...memoryTransactions[index],
        ...req.body,
        amount: Number(req.body.amount),
        dueDate: new Date(req.body.dueDate),
      };
      return res.json(memoryTransactions[index]);
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Erro PUT /transactions:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useMemoryDB) {
      const index = memoryTransactions.findIndex(t => t._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      memoryTransactions.splice(index, 1);
      return res.status(204).send();
    }

    await Transaction.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro DELETE /transactions:', error);
    res.status(400).json({ error: error.message });
  }
});

// Dashboard com projeções
app.get('/api/dashboard/projections', async (req, res) => {
  try {
    let transactions;
    if (useMemoryDB) {
      transactions = memoryTransactions;
    } else {
      transactions = await Transaction.find();
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(now.getDate() + 30);

    // Filtrar transações ativas (não pagas)
    const activeTransactions = transactions.filter(t => t.status !== 'paid');

    // Projeção de fluxo de caixa
    const projections = [];
    let currentBalance = 0;

    // Ordenar por data de vencimento
    const sortedTransactions = activeTransactions
      .filter(t => new Date(t.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Projeção diária
    for (let d = new Date(now); d <= thirtyDaysLater; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      
      const dayTransactions = sortedTransactions.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate.toDateString() === currentDate.toDateString();
      });

      const dayReceivables = dayTransactions
        .filter(t => t.type === 'receivable')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const dayPayables = dayTransactions
        .filter(t => t.type === 'payable')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      currentBalance += dayReceivables - dayPayables;

      projections.push({
        date: new Date(currentDate),
        balance: currentBalance,
        receivables: dayReceivables,
        payables: dayPayables,
        projectedBalance: currentBalance,
      });
    }

    // Estatísticas
    const totalReceivables = activeTransactions
      .filter(t => t.type === 'receivable')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayables = activeTransactions
      .filter(t => t.type === 'payable')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const overdueReceivables = transactions
      .filter(t => t.type === 'receivable' && t.status === 'overdue')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const overduePayables = transactions
      .filter(t => t.type === 'payable' && t.status === 'overdue')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Métricas
    const balances = projections.map(p => p.balance);
    const daysToPositive = projections.findIndex(p => p.balance > 0);

    res.json({
      projections,
      summary: {
        totalReceivables,
        totalPayables,
        overdueReceivables,
        overduePayables,
        currentBalance: totalReceivables - totalPayables,
        projectedBalance: projections[projections.length - 1]?.balance || 0,
      },
      metrics: {
        daysToPositive: daysToPositive > 0 ? daysToPositive : 0,
        maxNegative: Math.min(0, ...balances),
        maxPositive: Math.max(0, ...balances),
      },
    });
  } catch (error) {
    console.error('Erro GET /dashboard/projections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para deletar todas as transações (útil para reset)
app.delete('/api/transactions', async (req, res) => {
  try {
    if (useMemoryDB) {
      memoryTransactions = [];
      memoryIdCounter = 1;
      return res.status(204).send();
    }
    await Transaction.deleteMany({});
    res.status(204).send();
  } catch (error) {
    console.error('Erro DELETE /transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para seed de dados de exemplo
app.post('/api/seed', async (req, res) => {
  try {
    if (useMemoryDB) {
      seedMemoryData();
      return res.json({ message: 'Dados de exemplo carregados!', count: memoryTransactions.length });
    }
    
    // Se usar MongoDB, criar dados de exemplo
    const sampleData = [
      { description: 'Venda de Produtos', amount: 15000, type: 'receivable', status: 'pending', dueDate: new Date(Date.now() + 5*24*60*60*1000), category: 'Vendas' },
      { description: 'Serviços de Consultoria', amount: 8500, type: 'receivable', status: 'pending', dueDate: new Date(Date.now() + 12*24*60*60*1000), category: 'Serviços' },
      { description: 'Aluguel do Escritório', amount: 3000, type: 'payable', status: 'pending', dueDate: new Date(Date.now() + 3*24*60*60*1000), category: 'Aluguel' },
      { description: 'Salários Funcionários', amount: 12000, type: 'payable', status: 'pending', dueDate: new Date(Date.now() + 8*24*60*60*1000), category: 'RH' },
    ];
    
    await Transaction.insertMany(sampleData);
    res.json({ message: 'Dados de exemplo carregados!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota 404 para APIs não encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📋 Transactions: http://localhost:${PORT}/api/transactions`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard/projections`);
});
