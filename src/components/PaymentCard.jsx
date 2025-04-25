import React from 'react';
import styles from '../styles/PaymentSystemCard.module.css';

const PaymentSystemCard = ({ name, isConnected, icon, color }) => {
  const isAdd = name.includes('Додати');
  
  return (
    <div className={`${styles.card} ${isAdd ? styles.cardAdd : ''}`}>
      <div className={`${styles.iconContainer} ${isAdd ? styles.iconContainerAdd : styles[`iconContainer${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
        {icon}
      </div>
      <p className={styles.name}>{name}</p>
      <p className={styles.status}>{isConnected}</p>
    </div>
  );
};

export default PaymentSystemCard;