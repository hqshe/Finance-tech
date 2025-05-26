// transactionService.js

const API_URL = 'http://localhost:5000/api';

// Функція для отримання токена
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Функція для отримання всіх транзакцій користувача (по всіх картках)
export const getUserTransactions = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    const response = await fetch(`${API_URL}/transactions/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Помилка відповіді:', errorText);
      throw new Error(`HTTP помилка! статус: ${response.status}, повідомлення: ${errorText}`);
    }

    const data = await response.json();
    console.log('Отримані всі транзакції користувача:', data);

    return data;
  } catch (error) {
    console.error('Помилка при отриманні транзакцій:', error);
    throw error;
  }
};

// Функція для отримання транзакцій конкретної картки
export const getCardTransactions = async (cardId) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    if (!cardId) {
      throw new Error('ID картки не вказано');
    }

    // ВИПРАВЛЕНО: правильний шлях до транзакцій картки
    const response = await fetch(`${API_URL}/transactions/card/${cardId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Помилка відповіді:', errorText);
      throw new Error(`HTTP помилка! статус: ${response.status}, повідомлення: ${errorText}`);
    }

    const data = await response.json();
    console.log('Отримані транзакції картки:', data);

    return data;
  } catch (error) {
    console.error('Помилка при отриманні транзакцій картки:', error);
    throw error;
  }
};

// Функція для отримання карток користувача
export const getUserCards = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    const response = await fetch(`${API_URL}/cards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Помилка відповіді:', errorText);
      throw new Error(`HTTP помилка! статус: ${response.status}, повідомлення: ${errorText}`);
    }

    const data = await response.json();
    console.log('Отримані картки:', data);

    return data;
  } catch (error) {
    console.error('Помилка при отриманні карток:', error);
    throw error;
  }
};

// Функція для додавання нової транзакції
export const addTransaction = async (transactionData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    // Перевірка даних
    if (!transactionData.type || !transactionData.amount || !transactionData.cardId) {
      throw new Error('Обовʼязкові поля не заповнені');
    }

    // ВИПРАВЛЕНО: правильний URL для додавання транзакції
    const response = await fetch(`${API_URL}/transactions/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP помилка! статус: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Транзакцію додано:', data);

    return data;
  } catch (error) {
    console.error('Помилка при додаванні транзакції:', error);
    throw error;
  }
};

// Функція для отримання аналітики по категоріях
export const getCategoryAnalytics = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    // ВИПРАВЛЕНО: правильний шлях до аналітики
    const response = await fetch(`${API_URL}/transactions/analytics/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Помилка відповіді:', errorText);
      throw new Error(`HTTP помилка! статус: ${response.status}, повідомлення: ${errorText}`);
    }

    const data = await response.json();
    console.log('Отримана аналітика по категоріях:', data);

    return data;
  } catch (error) {
    console.error('Помилка при отриманні аналітики:', error);
    throw error;
  }
};

// Функція для генерації тестових транзакцій
export const generateTestTransactions = async (count = 50) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    // ВИПРАВЛЕНО: правильний шлях до генерації тестових транзакцій
    const response = await fetch(`${API_URL}/transactions/generate-test-transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ count })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Помилка відповіді:', errorText);
      throw new Error(`HTTP помилка! статус: ${response.status}, повідомлення: ${errorText}`);
    }

    const data = await response.json();
    console.log('Тестові транзакції згенеровано:', data);

    return data;
  } catch (error) {
    console.error('Помилка при генерації тестових транзакцій:', error);
    throw error;
  }
};

// Функція для скидання місячних витрат
export const resetMonthlySpending = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    // ВИПРАВЛЕНО: правильний шлях до скидання витрат
    const response = await fetch(`${API_URL}/transactions/reset-monthly-spending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Помилка відповіді:', errorText);
      throw new Error(`HTTP помилка! статус: ${response.status}, повідомлення: ${errorText}`);
    }

    const data = await response.json();
    console.log('Місячні витрати скинуто:', data);

    return data;
  } catch (error) {
    console.error('Помилка при скиданні витрат:', error);
    throw error;
  }
};

// Функція для перевірки доступності API
export const checkApiHealth = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен авторизації не знайдено');
    }

    console.log('Перевіряємо доступність API...');
    console.log('Використаний токен:', token.substring(0, 20) + '...');

    const response = await fetch(`${API_URL}/transactions/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Статус відповіді:', response.status);
    console.log('Заголовки відповіді:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Текст помилки:', errorText);
      return { success: false, error: errorText, status: response.status };
    }

    const data = await response.json();
    console.log('API працює, отримані дані:', data);

    return { success: true, data };
  } catch (error) {
    console.error('Помилка при перевірці API:', error);
    return { success: false, error: error.message };
  }
};