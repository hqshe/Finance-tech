import React from 'react';
import styles from '../styles/BalanceCard.module.css';

const BalanceCard = ({ title, amount, icon, color, subtitle, prefix }) => {
  return (
    <div className={styles.card}>
      <div className={styles.container}>
        <div className={`${styles.iconContainer} ${styles[`color${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
          {icon}
        </div>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={`${styles.amount} ${styles[`text${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
            {prefix}{amount} грн
          </p>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;