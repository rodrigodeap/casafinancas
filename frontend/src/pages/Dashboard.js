import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Area, Bar, ResponsiveContainer
} from 'recharts';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dados mockados - funciona sem backend
    setTimeout(() => {
      setData(createMockData());
      setLoading(false);
    }, 1000);
  }, []);

  const createMockData = () => {
    const projections = [];
    let balance = 15000;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(now, i);
      // Simular flutuações realistas
      const receivables = Math.random() * 8000 + 2000;
      const payables = Math.random() * 6000 + 1000;
      balance += receivables - payables;
      
      projections.push({
        date: date.toISOString(),
        balance: Math.round(balance * 100) / 100,
        receivables: Math.round(receivables * 100) / 100,
        payables: Math.round(payables * 100) / 100,
        projectedBalance: Math.round(balance * 100) / 100,
      });
    }
    
    return {
      projections,
      summary: {
        totalReceivables: 45000,
        totalPayables: 32000,
        overdueReceivables: 5000,
        overduePayables: 2000,
        currentBalance: 13000,
        projectedBalance: balance,
      },
      metrics: {
        daysToPositive: 0,
        maxNegative: -5000,
        maxPositive: 25000,
      },
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontSize:'18px'}}>
        🏠 Carregando CasaFinanças...
      </div>
    );
  }

  if (!data) return <div>Erro ao carregar dados</div>;

  const { projections, summary, metrics } = data;
  const last = projections[projections.length - 1];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>🏠 Dashboard CasaFinanças</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/transactions" style={{ 
            background: '#2563eb', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px',
            textDecoration: 'none'
          }}>
            📋 Transações
          </a>
        </div>
      </div>
      
      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>💰 Total a Receber</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(summary.totalReceivables)}</p>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>💳 Total a Pagar</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(summary.totalPayables)}</p>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>📊 Saldo Atual</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: summary.currentBalance >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatCurrency(summary.currentBalance)}
          </p>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>🔮 Projeção 30 dias</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: last?.balance >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatCurrency(last?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Indicadores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#92400e' }}>
            📅 Dias para saldo positivo: <strong>{metrics.daysToPositive > 0 ? `${metrics.daysToPositive} dias` : '✅ Já positivo'}</strong>
          </p>
        </div>
        <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#991b1b' }}>
            📉 Pior projeção: <strong>{formatCurrency(metrics.maxNegative)}</strong>
          </p>
        </div>
        <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: '#166534' }}>
            📈 Melhor projeção: <strong>{formatCurrency(metrics.maxPositive)}</strong>
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📈 Projeção de Fluxo de Caixa - 30 Dias</h2>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), 'dd/MM')} />
            <YAxis tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Area type="monotone" dataKey="balance" fill="#8884d8" stroke="#8884d8" fillOpacity={0.2} name="Saldo Projetado" />
            <Bar dataKey="receivables" fill="#82ca9d" name="Recebimentos" />
            <Bar dataKey="payables" fill="#ffc658" name="Pagamentos" />
            <Line type="monotone" dataKey="projectedBalance" stroke="#ff7300" name="Tendência" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: '#f0f9ff', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ color: '#0369a1', fontSize: '14px' }}>
          💡 Dados de demonstração - Versão GitHub Pages
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
