import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from '../styles/TransactionModal.module.css';
import { addTransaction, getUserCards } from '../services/transactionService';

// Категорії
const expenseCategories = [
  'Продукти', 'Транспорт', 'Комунальні послуги', 'Розваги', 
  'Здоров\'я', 'Освіта', 'Одяг', 'Подарунки', 'Відпочинок', 
  'Техніка', 'Інше'
];

const incomeCategories = [
  'Зарплата', 'Інвестиції', 'Інше'
];

const TransactionModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    type: 'Витрата',
    amount: '',
    description: '',
    category: 'Інше',
    cardId: '',
    date: new Date().toISOString().split('T')[0] // Сьогоднішня дата у форматі YYYY-MM-DD
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCards, setUserCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  
  // Завантажуємо картки користувача при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      loadUserCards();
    }
  }, [isOpen]);

  const loadUserCards = async () => {
    try {
      setCardsLoading(true);
      const cardsData = await getUserCards();
      
      if (cardsData && cardsData.cards && cardsData.cards.length > 0) {
        setUserCards(cardsData.cards);
        // Автоматично вибираємо першу картку
        setFormData(prev => ({ 
          ...prev, 
          cardId: cardsData.cards[0]._id 
        }));
      } else {
        setError('У вас немає карток. Спочатку додайте картку.');
      }
    } catch (err) {
      console.error('Помилка завантаження карток:', err);
      setError('Не вдалося завантажити картки: ' + err.message);
    } finally {
      setCardsLoading(false);
    }
  };

  // Скидаємо стан при закритті модального вікна
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        type: 'Витрата',
        amount: '',
        description: '',
        category: 'Інше',
        cardId: '',
        date: new Date().toISOString().split('T')[0]
      });
      setError(null);
      setUserCards([]);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Перевірка суми
      if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        throw new Error('Будь ласка, введіть правильну суму');
      }

      // Перевірка вибору картки
      if (!formData.cardId) {
        throw new Error('Будь ласка, виберіть картку');
      }

      // Перетворення суми в число
      const amount = parseFloat(formData.amount);
      
      // Відправка даних на сервер
      const response = await addTransaction({
        ...formData,
        amount
      });
      
      console.log('Транзакція додана:', response);
      
      // Закриваємо модальне вікно та оновлюємо дані
      onClose();
      if (onTransactionAdded) {
        onTransactionAdded(response);
      }
    } catch (err) {
      console.error('Помилка додавання транзакції:', err);
      setError(err.message || 'Сталася помилка при додаванні транзакції');
    } finally {
      setLoading(false);
    }
  };

  // Якщо картки ще завантажуються
  if (cardsLoading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>Додати нову транзакцію</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Завантаження карток...
          </div>
        </div>
      </div>
    );
  }

  // Якщо немає карток
  if (userCards.length === 0 && !cardsLoading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>Додати нову транзакцію</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#e74c3c', marginBottom: '15px' }}>
              У вас немає карток. Спочатку додайте картку для створення транзакцій.
            </p>
            <button 
              onClick={onClose} 
              className={styles.cancelButton}
            >
              Закрити
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Додати нову транзакцію</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label htmlFor="cardId">Картка</label>
            <select 
              id="cardId" 
              name="cardId" 
              value={formData.cardId} 
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Виберіть картку</option>
              {userCards.map(card => (
                <option key={card._id} value={card._id}>
                  {card.cardName} (*{card.cardNumber.slice(-4)}) - {card.balance.toFixed(2)} грн
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Тип транзакції</label>
            <select 
              id="type" 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              className={styles.select}
            >
              <option value="Надходження">Надходження</option>
              <option value="Витрата">Витрата</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="amount">Сума (грн)</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange}
              min="0.01" 
              step="0.01" 
              placeholder="0.00"
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description">Опис</label>
            <input 
              type="text" 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="Опис транзакції"
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="category">Категорія</label>
            <select 
              id="category" 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              className={styles.select}
            >
              {(formData.type === 'Витрата' ? expenseCategories : incomeCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="date">Дата</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.cancelButton}
              disabled={loading}
            >
              Скасувати
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !formData.cardId}
            >
              {loading ? 'Зберігання...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;