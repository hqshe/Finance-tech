import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import styles from '../styles/RecentTransactions.module.css';
import { getUserTransactions } from '../services/transactionService';
import { formatAmount } from '../utils/transactionUtils';
import TransactionModal from './TransactionModal';

// Компонент для відображення однієї транзакції
const TransactionItem = ({ transaction }) => {
  const isIncome = transaction.type === 'Надходження';
  const formattedDate = formatTransactionDate(transaction.date);
  
  return (
    <div className={styles.transactionItem}>
      <div className={`${styles.iconContainer} ${isIncome ? styles.incomeIcon : styles.expenseIcon}`}>
        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>
      
      <div className={styles.transactionInfo}>
        <div className={styles.transactionTitle}>
          <p className={styles.transactionName}>{transaction.description || transaction.category || 'Транзакція'}</p>
          <p className={`${styles.transactionAmount} ${isIncome ? styles.income : styles.expense}`}>
            {isIncome ? '+' : '-'} {formatAmount(Math.abs(transaction.amount))} грн
          </p>
        </div>
        <div className={styles.transactionDetails}>
          <p className={styles.transactionCategory}>{transaction.category || 'Без категорії'}</p>
          <p className={styles.transactionDate}>{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

// Форматування дати транзакції
const formatTransactionDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
};

// Функція фільтрації транзакцій за періодом
const filterTransactionsByPeriod = (transactions, period) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    
    switch (period) {
      case 'thisMonth':
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      
      case 'lastMonth':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return transactionDate.getMonth() === lastMonth && 
               transactionDate.getFullYear() === lastMonthYear;
      
      case 'last3Months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentMonth - 3);
        return transactionDate >= threeMonthsAgo;
      
      case 'lastYear':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(currentYear - 1);
        return transactionDate >= oneYearAgo;
      
      default:
        return true;
    }
  });
};

const RecentTransactions = ({ selectedPeriod }) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchRecentTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserTransactions();
      
      if (!response || !response.transactions) {
        throw new Error('Дані транзакцій не отримано');
      }
      
      setAllTransactions(response.transactions);
      
      // Фільтруємо і сортуємо транзакції відповідно до поточного періоду
      updateDisplayedTransactions(response.transactions, selectedPeriod);
    } catch (err) {
      console.error('Помилка при отриманні транзакцій:', err);
      setError('Помилка при завантаженні даних. Спробуйте перезавантажити сторінку.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRecentTransactions();
  }, []);
  
  // Оновлюємо відображені транзакції при зміні періоду
  useEffect(() => {
    if (allTransactions.length > 0) {
      updateDisplayedTransactions(allTransactions, selectedPeriod);
    }
  }, [selectedPeriod, allTransactions]);
  
  // Функція для оновлення відображених транзакцій на основі вибраного періоду
  const updateDisplayedTransactions = (transactions, period) => {
    const filteredTransactions = filterTransactionsByPeriod(transactions, period);
    
    // Сортуємо транзакції за датою (від найновіших до найстаріших)
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Беремо тільки 5 останніх транзакцій для відображення
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    setDisplayedTransactions(recentTransactions);
  };
  
  // Обробник кнопки додавання нової транзакції
  const handleAddTransaction = () => {
    setIsModalOpen(true);
  };
  
  // Обробник після успішного додавання транзакції
  const handleTransactionAdded = (response) => {
    console.log('Транзакція успішно додана:', response);
    // Оновлюємо дані транзакцій
    fetchRecentTransactions();
  };
  
  // Обробник для перегляду всіх транзакцій
  const handleViewAll = () => {
    console.log('Перегляд всіх транзакцій');
    // Тут можна реалізувати навігацію на сторінку з повним списком транзакцій
  };
  
  if (loading) {
    return <div className={styles.loading}>Завантаження транзакцій...</div>;
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
  
  // Отримуємо текстовий підпис для поточного періоду
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'thisMonth': return 'за цей місяць';
      case 'lastMonth': return 'за минулий місяць';
      case 'last3Months': return 'за останні 3 місяці';
      case 'lastYear': return 'за останній рік';
      default: return '';
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Останні транзакції {getPeriodLabel()}</h2>
        <a href="#" className={styles.viewAll} onClick={handleViewAll}>
          Переглянути все
        </a>
      </div>
      
      <div className={styles.transactionList}>
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id || `transaction-${Math.random()}`} 
              transaction={transaction} 
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Немає транзакцій для відображення за обраний період</p>
          </div>
        )}
      </div>
      
      <button className={styles.addButton} onClick={handleAddTransaction}>
        <Plus size={16} className={styles.buttonIcon} />
        Додати нову транзакцію
      </button>
      
      {/* Модальне вікно для додавання транзакції */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
};

export default RecentTransactions;