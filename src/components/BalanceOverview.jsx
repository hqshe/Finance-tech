import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, PieChart, Plus } from 'lucide-react';
import BalanceCard from './BalanceCard';
import TransactionModal from './TransactionModal';
import styles from '../styles/BalanceOverview.module.css';
import { getUserTransactions } from '../services/transactionService';
import { formatAmount } from '../utils/transactionUtils';

const BalanceOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    savings: 0,
    savingsPercentage: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Функція для розрахунку загального балансу на основі всіх транзакцій
  const calculateTotalBalance = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return 0;
    }

    return transactions.reduce((balance, transaction) => {
      // Додаємо суму для надходжень і віднімаємо для витрат
      if (transaction.type === 'Надходження') {
        return balance + Number(transaction.amount);
      } else if (transaction.type === 'Витрата') {
        return balance - Math.abs(Number(transaction.amount));
      }
      return balance;
    }, 0);
  };

  // Функція для розрахунку місячних сум на стороні клієнта
  const calculateMonthlyData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return {
        income: 0,
        expense: 0,
        savings: 0,
        savingsPercentage: 0
      };
    }

    // Поточний місяць і рік
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Фільтруємо транзакції за поточним місяцем
    const thisMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    console.log('Транзакції поточного місяця:', thisMonthTransactions);

    // Розраховуємо доходи (надходження)
    const income = thisMonthTransactions
      .filter(transaction => transaction.type === 'Надходження')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    
    // Розраховуємо витрати (тип "Витрата")
    const expense = thisMonthTransactions
      .filter(transaction => transaction.type === 'Витрата')
      .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount)), 0);
    
    // Розраховуємо економію та відсоток
    const savings = income - expense;
    const savingsPercentage = income > 0 ? Math.round((savings / income) * 100) : 0;

    console.log('Розраховані дані:', { income, expense, savings, savingsPercentage });
    
    return {
      income,
      expense,
      savings,
      savingsPercentage
    };
  };

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Отримуємо дані з API
      const response = await getUserTransactions();
      
      // Перевіряємо наявність даних
      if (!response) {
        throw new Error('Дані не отримано');
      }
      
      console.log('Дані отримані компонентом:', response);
      
      // Зберігаємо транзакції в стані
      const transactionsData = response.transactions || [];
      setTransactions(transactionsData);
      
      // Обчислюємо загальний баланс на основі всіх транзакцій
      const calculatedBalance = calculateTotalBalance(transactionsData);
      
      // Обчислюємо місячні суми на стороні клієнта
      const calculatedData = calculateMonthlyData(transactionsData);
      
      // Встановлюємо дані балансу
      setBalanceData({
        balance: calculatedBalance, // Використовуємо обчислений баланс замість response.balance
        income: calculatedData.income,
        expense: calculatedData.expense,
        savings: calculatedData.savings,
        savingsPercentage: calculatedData.savingsPercentage
      });
    } catch (error) {
      console.error('Помилка при завантаженні даних транзакцій:', error);
      setError('Помилка при завантаженні даних. Спробуйте перезавантажити сторінку.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, []);

  // Обробник для додавання нової транзакції
  const handleAddTransaction = () => {
    setIsModalOpen(true);
  };

  // Обробник після успішного додавання транзакції
  const handleTransactionAdded = (response) => {
    console.log('Транзакція успішно додана:', response);
    // Оновлюємо дані балансу та транзакцій
    fetchTransactionData();
  };

  if (loading) {
    return <div className={styles.loading}>Завантаження даних...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.reloadButton}>
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Загальний баланс</h2>
          <p className={styles.balanceAmount}>
            {formatAmount(balanceData.balance)} грн
          </p>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.addButton} onClick={handleAddTransaction}>
            <Plus size={18} className={styles.buttonIcon} />
            Додати транзакцію
          </button>
        </div>
      </div>
      
      <div className={styles.cardsGrid}>
        <BalanceCard 
          title="Доходи" 
          amount={formatAmount(balanceData.income)} 
          icon={<ArrowDown className={styles.incomeIcon} size={20} />}
          color="green"
          subtitle="Цього місяця"
          prefix="+"
        />
        
        <BalanceCard 
          title="Витрати" 
          amount={formatAmount(balanceData.expense)} 
          icon={<ArrowUp className={styles.expenseIcon} size={20} />}
          color="red"
          subtitle="Цього місяця"
          prefix="-"
        />
        
        <BalanceCard 
          title="Економія" 
          amount={formatAmount(balanceData.savings)} 
          icon={<PieChart className={styles.savingsIcon} size={20} />}
          color="blue"
          subtitle={`${balanceData.savingsPercentage}% доходу`}
          prefix="+"
        />
      </div>
      
      {/* Модальне вікно для додавання транзакції */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
};

export default BalanceOverview;