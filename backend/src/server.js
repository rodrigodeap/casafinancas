const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-saas', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

const Transaction = mongoose.model('Transaction', TransactionSchema);
const User = mongoose.model('User', UserSchema);

// Rotas
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Dashboard com projeções
app.get('/api/dashboard/projections', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(now.getDate() + 30);

    // Projeção de fluxo de caixa
    const projections = [];
    let currentBalance = 0;

    // Ordenar por data de vencimento
    const sortedTransactions = transactions
      .filter(t => t.dueDate >= now)
      .sort((a, b) => a.dueDate - b.dueDate);

    // Projeção diária
    for (let d = new Date(now); d <= thirtyDaysLater; d.setDate(d.getDate() + 1)) {
      const dayTransactions = sortedTransactions.filter(
        t => new Date(t.dueDate).toDateString() === d.toDateString()
      );

      const dayReceivables = dayTransactions
        .filter(t => t.type === 'receivable' && t.status !== 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

      const dayPayables = dayTransactions
        .filter(t => t.type === 'payable' && t.status !== 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

      currentBalance += dayReceivables - dayPayables;

      projections.push({
        date: new Date(d),
        balance: currentBalance,
        receivables: dayReceivables,
        payables: dayPayables,
        projectedBalance: currentBalance,
      });
    }

    // Estatísticas
    const totalReceivables = transactions
      .filter(t => t.type === 'receivable' && t.status !== 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayables = transactions
      .filter(t => t.type === 'payable' && t.status !== 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueReceivables = transactions
      .filter(t => t.type === 'receivable' && t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0);

    const overduePayables = transactions
      .filter(t => t.type === 'payable' && t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0);

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
        daysToPositive: projections.findIndex(p => p.balance > 0),
        maxNegative: Math.min(...projections.map(p => p.balance)),
        maxPositive: Math.max(...projections.map(p => p.balance)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
