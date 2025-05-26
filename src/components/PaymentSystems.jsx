import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import PaymentSystemCard from './PaymentCard';
import styles from '../styles/PaymentSystems.module.css';

const PaymentSystems = () => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error('Помилка при завантаженні карток:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    setError('');
    
    if (!cardName.trim() || !cardNumber.trim()) {
      setError('Будь ласка, заповніть всі поля');
      return;
    }

    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      setError('Номер картки повинен містити рівно 16 цифр');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/addcard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardName: cardName.trim(),
          cardNumber: cardNumber.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCards([...cards, data.card]);
        setShowModal(false);
        setCardName('');
        setCardNumber('');
        alert('Картку додано успішно! Тестові транзакції згенеровано.');
      } else {
        setError(data.message || 'Помилка при додаванні картки');
      }
    } catch (error) {
      setError('Помилка з\'єднання з сервером');
      console.error('Помилка при додаванні картки:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCard = async () => {
    setError('');
    
    if (!cardName.trim() || !cardNumber.trim()) {
      setError('Будь ласка, заповніть всі поля');
      return;
    }

    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      setError('Номер картки повинен містити рівно 16 цифр');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/cards/${selectedCard._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardName: cardName.trim(),
          cardNumber: cardNumber.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCards(cards.map(card => 
          card._id === selectedCard._id 
            ? { ...card, cardName: cardName.trim(), cardNumber: cardNumber.trim() }
            : card
        ));
        setShowEditModal(false);
        setCardName('');
        setCardNumber('');
        setSelectedCard(null);
        alert('Картку оновлено успішно!');
      } else {
        setError(data.message || 'Помилка при оновленні картки');
      }
    } catch (error) {
      setError('Помилка з\'єднання з сервером');
      console.error('Помилка при оновленні картки:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю картку? Всі пов\'язані транзакції також будуть видалені.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/cards/${selectedCard._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCards(cards.filter(card => card._id !== selectedCard._id));
        setShowEditModal(false);
        setSelectedCard(null);
        alert('Картку видалено успішно!');
      } else {
        setError(data.message || 'Помилка при видаленні картки');
      }
    } catch (error) {
      setError('Помилка з\'єднання з сервером');
      console.error('Помилка при видаленні картки:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setCardName(card.cardName);
    setCardNumber(card.cardNumber);
    setShowEditModal(true);
    setError('');
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(value);
  };

  const formatCardNumberDisplay = (value) => {
    return value.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const closeModals = () => {
    setShowModal(false);
    setShowEditModal(false);
    setCardName('');
    setCardNumber('');
    setSelectedCard(null);
    setError('');
  };

  if (isLoading) {
    return <div className={styles.loading}>Завантаження...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Мої картки</h2>
      
      <div className={styles.grid}>
        {cards.map((card) => (
          <div key={card._id} onClick={() => handleCardClick(card)} style={{cursor: 'pointer'}}>
            <PaymentSystemCard
              name={card.cardName}
              cardNumber={card.cardNumber}
              balance={card.balance}
            />
          </div>
        ))}
        
        <div className={styles.addCard} onClick={() => setShowModal(true)}>
          <div className={styles.addCardIcon}>
            <Plus size={24} />
          </div>
          <p className={styles.addCardTitle}>Додати картку</p>
          <p className={styles.addCardDescription}>Додайте нову банківську картку</p>
        </div>
      </div>

      {/* Модальне вікно додавання картки */}
      {showModal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && closeModals()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Додати нову картку</h3>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.formContainer}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Назва картки</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Наприклад: Основна картка"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Номер картки</label>
                <input
                  type="text"
                  className={`${styles.input} ${styles.cardNumberInput}`}
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumberDisplay(cardNumber)}
                  onChange={handleCardNumberChange}
                />
              </div>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <button
                type="button"
                className={styles.submitButton}
                disabled={isSubmitting}
                onClick={handleAddCard}
              >
                {isSubmitting ? 'Додавання...' : 'Додати картку'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування картки */}
      {showEditModal && selectedCard && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && closeModals()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Редагувати картку</h3>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.formContainer}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Назва картки</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Наприклад: Основна картка"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Номер картки</label>
                <input
                  type="text"
                  className={`${styles.input} ${styles.cardNumberInput}`}
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumberDisplay(cardNumber)}
                  onChange={handleCardNumberChange}
                />
              </div>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                  onClick={handleEditCard}
                >
                  <Edit2 size={16} />
                  {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                </button>

                <button
                  type="button"
                  className={styles.deleteButton}
                  disabled={isDeleting}
                  onClick={handleDeleteCard}
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Видалення...' : 'Видалити картку'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSystems;