import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, PieChart, Plus } from 'lucide-react';
import BalanceCard from './BalanceCard';
import TransactionModal from './TransactionModal';
import styles from '../styles/BalanceOverview.module.css';
import { getUserTransactions, getUserCards, getCategoryAnalytics } from '../services/transactionService';
import { formatAmount } from '../utils/transactionUtils';

const BalanceOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    savings: 0,
    savingsPercentage: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Функція для розрахунку місячних даних на стороні клієнта (резервний варіант)
  const calculateMonthlyData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return {
        income: 0,
        expense: 0,
        savings: 0,
        savingsPercentage: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const income = thisMonthTransactions
      .filter(transaction => transaction.type === 'Надходження')
      .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount)), 0);
    
    const expense = thisMonthTransactions
      .filter(transaction => transaction.type === 'Витрата')
      .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount)), 0);
    
    const savings = income - expense;
    const savingsPercentage = income > 0 ? Math.round((savings / income) * 100) : 0;

    return {
      income,
      expense,
      savings,
      savingsPercentage
    };
  };

  // Основна функція для завантаження всіх даних
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Починаємо завантаження даних...');
      
      // Отримуємо всі транзакції користувача (по всіх картках)
      const transactionsResponse = await getUserTransactions();
      console.log('Відповідь транзакцій:', transactionsResponse);
      
      // Перевіряємо, чи отримали ми дані
      if (!transactionsResponse) {
        throw new Error('Сервер не повернув відповідь');
      }

      // Більш детальна перевірка структури відповіді
      console.log('Структура відповіді:', {
        hasTotalBalance: transactionsResponse.hasOwnProperty('totalBalance'),
        hasCards: transactionsResponse.hasOwnProperty('cards'),
        hasTransactions: transactionsResponse.hasOwnProperty('transactions'),
        hasIncome: transactionsResponse.hasOwnProperty('income'),
        hasExpense: transactionsResponse.hasOwnProperty('expense'),
        keys: Object.keys(transactionsResponse)
      });
      
      // Перевіряємо основні поля
      if (typeof transactionsResponse !== 'object') {
        throw new Error('Відповідь сервера не є об\'єктом');
      }
      
      // Зберігаємо картки з відповіді
      const cardsData = transactionsResponse.cards || [];
      setCards(cardsData);
      
      // Зберігаємо транзакції
      const transactionsData = transactionsResponse.transactions || [];
      setTransactions(transactionsData);
      
      // Отримуємо баланс з відповіді або розраховуємо самостійно
      const totalBalance = transactionsResponse.totalBalance || 0;
      
      // Використовуємо дані з сервера або розраховуємо на клієнті
      let monthlyData;
      if (transactionsResponse.hasOwnProperty('income') && 
          transactionsResponse.hasOwnProperty('expense')) {
        // Використовуємо дані з сервера
        monthlyData = {
          income: transactionsResponse.income || 0,
          expense: transactionsResponse.expense || 0,
          savings: transactionsResponse.savings || 0,
          savingsPercentage: transactionsResponse.savingsPercentage || 0
        };
      } else {
        // Розраховуємо на клієнті як резервний варіант
        monthlyData = calculateMonthlyData(transactionsData);
      }
      
      // Встановлюємо дані балансу
      setBalanceData({
        balance: totalBalance,
        income: monthlyData.income,
        expense: monthlyData.expense,
        savings: monthlyData.savings,
        savingsPercentage: monthlyData.savingsPercentage
      });

      console.log('Встановлені дані балансу:', {
        balance: totalBalance,
        income: monthlyData.income,
        expense: monthlyData.expense,
        savings: monthlyData.savings,
        savingsPercentage: monthlyData.savingsPercentage
      });

      // Отримуємо аналітику по категоріях
      try {
        const analyticsResponse = await getCategoryAnalytics();
        if (analyticsResponse) {
          setAnalyticsData(analyticsResponse);
          console.log('Аналітика завантажена:', analyticsResponse);
        }
      } catch (analyticsError) {
        console.warn('Не вдалося завантажити аналітику:', analyticsError);
        // Не зупиняємо виконання, якщо аналітика не завантажилася
      }
      
    } catch (error) {
      console.error('Помилка при завантаженні даних:', error);
      setError(`Помилка при завантаженні даних: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Обробник для додавання нової транзакції
  const handleAddTransaction = () => {
    setIsModalOpen(true);
  };

  // Обробник після успішного додавання транзакції
  const handleTransactionAdded = (response) => {
    console.log('Транзакція успішно додана:', response);
    // Оновлюємо всі дані після додавання транзакції
    fetchAllData();
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className={styles.loading}>Завантаження даних...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button 
          onClick={fetchAllData} 
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
          <h2 className={styles.title}>Загальний баланс всіх карток</h2>
          <p className={styles.balanceAmount}>
            {formatAmount(balanceData.balance)} грн
          </p>
          {cards.length > 0 && (
            <div className={styles.additionalInfo}>
              <p className={styles.cardsCount}>
                Карток: {cards.length}
              </p>
              <p className={styles.transactionsCount}>
                Транзакцій: {transactions.length}
              </p>
            </div>
          )}
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
          subtitle="Цього місяця (всі картки)"
          prefix="+"
        />
        
        <BalanceCard 
          title="Витрати" 
          amount={formatAmount(balanceData.expense)} 
          icon={<ArrowUp className={styles.expenseIcon} size={20} />}
          color="red"
          subtitle="Цього місяця (всі картки)"
          prefix="-"
        />
        
        <BalanceCard 
          title="Економія" 
          amount={formatAmount(balanceData.savings)} 
          icon={<PieChart className={styles.savingsIcon} size={20} />}
          color="blue"
          subtitle={`${balanceData.savingsPercentage}% доходу`}
          prefix={balanceData.savings >= 0 ? "+" : ""}
        />
      </div>

      {/* Аналітика по категоріях */}
      {analyticsData && Object.keys(analyticsData.categoryStats).length > 0 && (
        <div className={styles.analyticsSection}>
          <h3 className={styles.sectionTitle}>Витрати по категоріях</h3>
          <div className={styles.categoriesList}>
            {Object.entries(analyticsData.categoryStats)
              .sort(([,a], [,b]) => b.expense - a.expense)
              .slice(0, 5) // Показуємо топ 5 категорій
              .map(([category, stats]) => (
                <div key={category} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.categoryCount}>{stats.count} транзакцій</span>
                  </div>
                  <div className={styles.categoryAmount}>
                    -{formatAmount(stats.expense)} грн
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
      
      {/* Модальне вікно для додавання транзакції */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        BalanceTransactionAdded={handleTransactionAdded}
        cards={cards} // Передаємо список карток для вибору
      />
    </div>
  );
};

export default BalanceOverview;