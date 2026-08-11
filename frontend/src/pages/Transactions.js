import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
// ... resto do código

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... resto do código

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      // Dados mock em caso de erro
      setTransactions([
        {
          _id: '1',
          description: 'Venda de Produtos',
          amount: 15000,
          type: 'receivable',
          status: 'pending',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          category: 'Vendas',
        },
        {
          _id: '2',
          description: 'Aluguel do Escritório',
          amount: 3000,
          type: 'payable',
          status: 'pending',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          category: 'Aluguel',
        },
        // ... mais dados mock
      ]);
      setLoading(false);
    }
  };

  // ... resto do código
};
