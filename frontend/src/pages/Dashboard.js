import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Area, ComposedChart, Bar,
  ResponsiveContainer, AreaChart
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/projections`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) return <div>Erro ao carregar dados</div>;

  const { projections, summary, metrics } = data;
  const lastProjection = projections[projections.length - 1];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (balance) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (balance) => {
    if (balance > 0) return '📈';
    if (balance < 0) return '📉';
    return '➖';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Financeiro
        </h1>
        <div className="text-sm text-gray-500">
          Atualizado em: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total a Receber</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalReceivables)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total a Pagar</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalPayables)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saldo Atual</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.currentBalance)}`}>
                {formatCurrency(summary.currentBalance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${summary.currentBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className="text-2xl">{getStatusIcon(summary.currentBalance)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Projeção em 30 dias</p>
              <p className={`text-2xl font-bold ${getStatusColor(lastProjection?.balance || 0)}`}>
                {formatCurrency(lastProjection?.balance || 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">🔮</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Projeção */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Projeção de Fluxo de Caixa - 30 Dias</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), 'dd/MM', { locale: ptBR })}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(date) => format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="balance"
              fill="#8884d8"
              stroke="#8884d8"
              fillOpacity={0.3}
              name="Saldo Projetado"
            />
            <Bar
              dataKey="receivables"
              barSize={20}
              fill="#82ca9d"
              name="Recebimentos"
            />
            <Bar
              dataKey="payables"
              barSize={20}
              fill="#ffc658"
              name="Pagamentos"
            />
            <Line
              type="monotone"
              dataKey="projectedBalance"
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
              name="Tendência"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Métricas e Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">Alertas e Indicadores</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="flex items-center">
                <span className="text-yellow-500 mr-2">⚠️</span>
                Dias para saldo positivo
              </span>
              <span className="font-bold">{metrics.daysToPositive > 0 ? `${metrics.daysToPositive} dias` : 'Já positivo'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="flex items-center">
                <span className="text-red-500 mr-2">📉</span>
                Pior projeção
              </span>
              <span className="font-bold text-red-600">{formatCurrency(metrics.maxNegative)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="flex items-center">
                <span className="text-green-500 mr-2">📈</span>
                Melhor projeção
              </span>
              <span className="font-bold text-green-600">{formatCurrency(metrics.maxPositive)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">Contas Vencidas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="flex items-center">
                <span className="text-red-500 mr-2">🔴</span>
                Recebíveis vencidos
              </span>
              <span className="font-bold text-red-600">{formatCurrency(summary.overdueReceivables)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="flex items-center">
                <span className="text-orange-500 mr-2">🟠</span>
                Pagáveis vencidos
              </span>
              <span className="font-bold text-orange-600">{formatCurrency(summary.overduePayables)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
