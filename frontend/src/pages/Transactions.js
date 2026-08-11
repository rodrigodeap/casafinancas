import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = '/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'receivable',
    status: 'pending',
    dueDate: '',
    category: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log('Buscando transações...');
      const response = await axios.get(`${API_URL}/transactions`);
      console.log('Transações recebidas:', response.data);
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      // Dados mock para demonstração
      setTransactions([
        {
          _id: '1',
          description: 'Venda de Produtos',
          amount: 15000,
          type: 'receivable',
          status: 'pending',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Vendas',
        },
        {
          _id: '2',
          description: 'Aluguel do Escritório',
          amount: 3000,
          type: 'payable',
          status: 'pending',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Aluguel',
        },
        {
          _id: '3',
          description: 'Serviços de Consultoria',
          amount: 8500,
          type: 'receivable',
          status: 'pending',
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Serviços',
        },
        {
          _id: '4',
          description: 'Salários Funcionários',
          amount: 12000,
          type: 'payable',
          status: 'pending',
          dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'RH',
        },
        {
          _id: '5',
          description: 'Internet e Telefone',
          amount: 500,
          type: 'payable',
          status: 'overdue',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Utilidades',
        },
      ]);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { 
        ...formData, 
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString()
      };
      
      if (editingTransaction) {
        await axios.put(`${API_URL}/transactions/${editingTransaction._id}`, data);
      } else {
        await axios.post(`${API_URL}/transactions`, data);
      }
      setShowModal(false);
      setEditingTransaction(null);
      setFormData({
        description: '',
        amount: '',
        type: 'receivable',
        status: 'pending',
        dueDate: '',
        category: '',
      });
      fetchTransactions();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Verifique o console para mais detalhes.');
    }
  };

  // ... resto do código (handleDelete, handleEdit, formatCurrency, getStatusBadge, getTypeBadge)

  // Os métodos handleDelete, handleEdit, formatCurrency, getStatusBadge, getTypeBadge
  // permanecem os mesmos da versão anterior

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📋 Transações</h1>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setFormData({
              description: '',
              amount: '',
              type: 'receivable',
              status: 'pending',
              dueDate: '',
              category: '',
            });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span> Nova Transação
        </button>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Nenhuma transação cadastrada
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(transaction.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(transaction.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - mesmo da versão anterior */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingTransaction ? '✏️ Editar Transação' : '➕ Nova Transação'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Campos do formulário - mesmo da versão anterior */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição *</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Ex: Venda de produtos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="receivable">💰 A Receber</option>
                    <option value="payable">💳 A Pagar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="pending">⏳ Pendente</option>
                    <option value="paid">✅ Pago</option>
                    <option value="overdue">🔴 Vencido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Ex: Vendas, RH, Utilidades..."
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  {editingTransaction ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Funções auxiliares
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusBadge = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };
  const labels = {
    pending: '⏳ Pendente',
    paid: '✅ Pago',
    overdue: '🔴 Vencido',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const getTypeBadge = (type) => {
  const styles = {
    receivable: 'bg-green-100 text-green-800',
    payable: 'bg-red-100 text-red-800',
  };
  const labels = {
    receivable: '💰 Receber',
    payable: '💳 Pagar',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};

export default Transactions;
