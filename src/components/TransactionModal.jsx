import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from '../styles/TransactionModal.module.css';
import { addTransaction } from '../services/transactionService';

const categories = [
  'Продукти', 'Транспорт', 'Комунальні послуги', 'Розваги', 
  'Здоров\'я', 'Освіта', 'Одяг', 'Подарунки', 'Відпочинок', 
  'Техніка', 'Зарплата', 'Інвестиції', 'Інше'
];

const TransactionModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    type: 'Витрата',
    amount: '',
    description: '',
    category: 'Інше',
    date: new Date().toISOString().split('T')[0] // Сьогоднішня дата у форматі YYYY-MM-DD
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
              {categories.map(category => (
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
              disabled={loading}
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