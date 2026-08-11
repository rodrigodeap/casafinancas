import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
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
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro:', error);
      setTransactions([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, amount: Number(form.amount), dueDate: new Date(form.dueDate) };
      if (editing) {
        await axios.put(`/api/transactions/${editing._id}`, data);
      } else {
        await axios.post('/api/transactions', data);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ description: '', amount: '', type: 'receivable', status: 'pending', dueDate: '', category: '' });
      fetchTransactions();
    } catch (error) {
      alert('Erro ao salvar!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
    try {
      await axios.delete(`/api/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      alert('Erro ao excluir!');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>🏠 Carregando transações...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none', marginRight: '16px' }}>← Voltar</a>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', display: 'inline' }}>📋 Transações</h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ description: '', amount: '', type: 'receivable', status: 'pending', dueDate: '', category: '' });
            setShowModal(true);
          }}
          style={{ background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          ➕ Nova Transação
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Descrição</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Valor</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Tipo</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Vencimento</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Categoria</th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Nenhuma transação cadastrada</td></tr>
            ) : (
              transactions.map(t => (
                <tr key={t._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{t.description}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatCurrency(t.amount)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: t.type === 'receivable' ? '#dcfce7' : '#fee2e2',
                      color: t.type === 'receivable' ? '#166534' : '#991b1b'
                    }}>
                      {t.type === 'receivable' ? '💰 Receber' : '💳 Pagar'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: t.status === 'pending' ? '#fef3c7' : t.status === 'paid' ? '#dcfce7' : '#fee2e2',
                      color: t.status === 'pending' ? '#92400e' : t.status === 'paid' ? '#166534' : '#991b1b'
                    }}>
                      {t.status === 'pending' ? '⏳ Pendente' : t.status === 'paid' ? '✅ Pago' : '🔴 Vencido'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {format(new Date(t.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td style={{ padding: '12px' }}>{t.category || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        setEditing(t);
                        setForm({
                          description: t.description,
                          amount: String(t.amount),
                          type: t.type,
                          status: t.status,
                          dueDate: format(new Date(t.dueDate), 'yyyy-MM-dd'),
                          category: t.category || '',
                        });
                        setShowModal(true);
                      }}
                      style={{ marginRight: '8px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(t._id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            maxWidth: '450px', 
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              {editing ? '✏️ Editar Transação' : '➕ Nova Transação'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Descrição *</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="Ex: Venda de produtos"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Valor (R$) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="0,00"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Tipo *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="receivable">💰 A Receber</option>
                  <option value="payable">💳 A Pagar</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Status *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="pending">⏳ Pendente</option>
                  <option value="paid">✅ Pago</option>
                  <option value="overdue">🔴 Vencido</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Data de Vencimento *</label>
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Categoria</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="Ex: Vendas, RH, Utilidades..."
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {editing ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
