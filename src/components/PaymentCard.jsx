import React from 'react';
import styles from '../styles/PaymentSystemCard.module.css';

const PaymentSystemCard = ({ name, cardNumber, balance }) => {
  const formatCardNumber = (number) => {
    if (!number) return '';
    return '**** **** **** ' + number.slice(-4);
  };

  const formatBalance = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    return Number(amount).toFixed(2);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardName}>{name}</h3>
        <div className={styles.cardChip}></div>
      </div>

      <p className={styles.cardNumber}>{formatCardNumber(cardNumber)}</p>

      <div className={styles.cardFooter}>
        <div className={styles.balance}>
          <span className={styles.balanceLabel}>Баланс</span>
          <p className={styles.balanceAmount}>{formatBalance(balance)} ₴</p>
        </div>
        <span className={styles.cardBrand}>Bank Card</span>
      </div>
    </div>
  );
};

export default PaymentSystemCard;