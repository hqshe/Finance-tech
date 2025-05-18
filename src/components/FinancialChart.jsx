import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart4 } from 'lucide-react';
import styles from '../styles/FinancialChart.module.css';
import { getUserTransactions } from '../services/transactionService';
import { formatAmount } from '../utils/transactionUtils';

const FinancialChart = ({ selectedPeriod, onPeriodChange }) => {
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUserTransactions();
        
        if (!response || !response.transactions) {
          throw new Error('Дані транзакцій не отримано');
        }
        
        setTransactions(response.transactions);
        
        // Після отримання транзакцій, обробляємо дані для відображення
        processTransactionData(response.transactions, selectedPeriod);
      } catch (err) {
        console.error('Помилка при отриманні транзакцій:', err);
        setError('Помилка при завантаженні даних. Спробуйте перезавантажити сторінку.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    // При зміні періоду, перераховуємо дані для графіка
    if (transactions.length > 0) {
      processTransactionData(transactions, selectedPeriod);
    }
  }, [selectedPeriod, transactions]);

  // Обробка транзакцій для графіка і категорій
  const processTransactionData = (transactions, period) => {
    if (!transactions || transactions.length === 0) {
      setChartData([]);
      setCategoryData([]);
      return;
    }

    // Фільтрація транзакцій за обраним періодом
    const filteredTransactions = filterTransactionsByPeriod(transactions, period);
    
    // Підготовка даних для графіка
    const balanceChartData = prepareBalanceChartData(filteredTransactions);
    setChartData(balanceChartData);
    
    // Підготовка даних для категорій витрат
    const expenseCategories = calculateExpenseCategories(filteredTransactions);
    setCategoryData(expenseCategories);
  };

  // Фільтрація транзакцій за періодом
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

  // Підготовка даних для графіка зміни балансу
  const prepareBalanceChartData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Сортуємо транзакції за датою (від найстарішої до найновішої)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Створюємо мапу для зберігання щоденних балансів
    const dailyBalanceMap = new Map();
    let runningBalance = 0;

    // Обчислюємо баланс для кожного дня з транзакціями
    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateString = date.toISOString().split('T')[0]; // формат YYYY-MM-DD
      
      // Оновлюємо поточний баланс
      if (transaction.type === 'Надходження') {
        runningBalance += Number(transaction.amount);
      } else if (transaction.type === 'Витрата') {
        runningBalance -= Math.abs(Number(transaction.amount));
      }
      
      // Зберігаємо баланс на кінець дня
      dailyBalanceMap.set(dateString, runningBalance);
    });

    // Перетворюємо мапу в масив для графіка
    const chartData = Array.from(dailyBalanceMap, ([date, balance]) => {
      const dateObj = new Date(date);
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const formattedDate = `${day}.${month < 10 ? '0' + month : month}`;
      
      return {
        date: formattedDate,
        balance: balance
      };
    });

    return chartData;
  };

  // Розрахунок витрат за категоріями
  const calculateExpenseCategories = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Фільтруємо тільки витрати
    const expenses = transactions.filter(
      transaction => transaction.type === 'Витрата'
    );

    // Групуємо витрати за категоріями
    const categoriesMap = new Map();
    
    expenses.forEach(expense => {
      const category = expense.category || 'Інше';
      const amount = Math.abs(Number(expense.amount));
      
      if (categoriesMap.has(category)) {
        categoriesMap.set(category, categoriesMap.get(category) + amount);
      } else {
        categoriesMap.set(category, amount);
      }
    });

    // Перетворюємо мапу в масив і сортуємо за розміром витрат (від більшого до меншого)
    const categoriesArray = Array.from(categoriesMap, ([name, amount]) => ({
      name,
      amount
    })).sort((a, b) => b.amount - a.amount);

    return categoriesArray;
  };

  const handlePeriodChange = (e) => {
    // Викликаємо обробник з батьківського компонента
    onPeriodChange(e.target.value);
  };

  // Перекладач періодів для інтерфейсу
  const periodLabels = {
    thisMonth: 'Цей місяць',
    lastMonth: 'Минулий місяць',
    last3Months: 'За 3 місяці',
    lastYear: 'За рік'
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
        <h2 className={styles.title}>Фінансова аналітика</h2>
        <select 
          className={styles.select} 
          value={selectedPeriod}
          onChange={handlePeriodChange}
        >
          <option value="thisMonth">Цей місяць</option>
          <option value="lastMonth">Минулий місяць</option>
          <option value="last3Months">За 3 місяці</option>
          <option value="lastYear">За рік</option>
        </select>
      </div>
      
      <div className={styles.chartContainer}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value} грн`}
                width={80}
              />
              <Tooltip 
                formatter={(value) => [`${formatAmount(value)} грн`, 'Баланс']}
                labelFormatter={(label) => `Дата: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noDataContainer}>
            <BarChart4 size={48} className={styles.chartIcon} />
            <p className={styles.chartText}>
              Немає даних для відображення за обраний період
            </p>
          </div>
        )}
      </div>
      
      <h3 className={styles.categoriesTitle}>Витрати за категоріями</h3>
      <div className={styles.categoriesGrid}>
        {categoryData.length > 0 ? (
          categoryData.map((category, index) => (
            <ExpenseCategory 
              key={index} 
              name={category.name} 
              amount={formatAmount(category.amount)} 
            />
          ))
        ) : (
          <p className={styles.noCategories}>Немає витрат за обраний період</p>
        )}
      </div>
    </div>
  );
};

const ExpenseCategory = ({ name, amount }) => {
  return (
    <div className={styles.categoryItem}>
      <p className={styles.categoryName}>{name}</p>
      <p className={styles.categoryAmount}>{amount} грн</p>
    </div>
  );
};

export default FinancialChart;