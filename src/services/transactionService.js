// transactionService.js - сервіс для роботи з транзакціями
const API_BASE_URL = 'http://localhost:5000/api';

// Отримання токену із локального сховища
const getToken = () => {
  return localStorage.getItem('token');
};

// Функція для отримання транзакцій користувача
export const getUserTransactions = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Токен автентифікації не знайдено');
    }
    
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка отримання транзакцій');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Помилка при отриманні транзакцій:', error);
    throw error;
  }
};

// Функція для додавання нової транзакції
export const addTransaction = async (transactionData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Токен автентифікації не знайдено');
    }
    
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка додавання транзакції');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Помилка при додаванні транзакції:', error);
    throw error;
  }
};

// Додаткові функції для роботи з транзакціями можна додати за потребою