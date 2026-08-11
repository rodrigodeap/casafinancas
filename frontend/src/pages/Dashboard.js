import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
// ... resto do código

const Dashboard = () => {
  // ... código existente
  
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/projections`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Criar dados mock em caso de erro
      setData(createMockData());
      setLoading(false);
    }
  };

  // Função para criar dados mock em caso de erro
  const createMockData = () => {
    const projections = [];
    const now = new Date();
    let balance = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Simular flutuações
      const receivables = Math.random() * 10000;
      const payables = Math.random() * 8000;
      balance += receivables - payables;
      
      projections.push({
        date: date.toISOString(),
        balance: balance,
        receivables: receivables,
        payables: payables,
        projectedBalance: balance,
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

  // ... resto do código
};
