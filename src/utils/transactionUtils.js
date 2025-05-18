// src/utils/transactionUtils.js

/**
 * Форматування суми з розділювачем тисяч і гривнею
 * @param {number} amount - Сума для форматування
 * @returns {string} Відформатована сума
 */
// 3. Оновлення функції formatAmount для безпечної обробки значень
export const formatAmount = (amount) => {
    // Перевіряємо, чи amount є числом і не undefined/null
    if (amount === undefined || amount === null) {
      amount = 0;
    }
    
    // Переконуємося, що amount є числом
    const numAmount = Number(amount);
    
    // Перевіряємо, чи є numAmount дійсним числом
    if (isNaN(numAmount)) {
      console.warn('formatAmount: надано недійсне значення', amount);
      return '0.00';
    }
    
    try {
      return numAmount.toLocaleString('uk-UA', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    } catch (error) {
      console.error('Помилка форматування суми:', error);
      return numAmount.toFixed(2);
    }
  };
  
  /**
   * Розрахунок місячних сум транзакцій (доходів, витрат, економії)
   * @param {Array} transactions - Список транзакцій
   * @returns {Object} Об'єкт з розрахованими сумами
   */
  export const calculateMonthlyTransactions = (transactions) => {
    // Якщо транзакції не передані або порожній масив
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
  
    // Розраховуємо суми за типами
    const income = thisMonthTransactions
      .filter(transaction => transaction.type === 'Надходження')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const expense = thisMonthTransactions
      .filter(transaction => transaction.type === 'Витрата')
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    
    // Розраховуємо економію та відсоток
    const savings = income - expense;
    const savingsPercentage = income > 0 ? Math.round((savings / income) * 100) : 0;
  
    return {
      income,
      expense,
      savings,
      savingsPercentage
    };
  };