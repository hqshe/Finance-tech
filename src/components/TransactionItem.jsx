import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import styles from '../styles/TransactionItem.module.css';

const TransactionItem = ({ transaction }) => {
  return (
    <div className={styles.item}>
      <div className={transaction.type === 'income' ? styles.iconContainerIncome : styles.iconContainerExpense}>
        {transaction.type === 'income' ? 
          <ArrowDown className={styles.iconIncome} size={16} /> : 
          <ArrowUp className={styles.iconExpense} size={16} />
        }
      </div>
      <div className={styles.content}>
        <p className={styles.name}>{transaction.name}</p>
        <p className={styles.details}>{transaction.date} • {transaction.category}</p>
      </div>
      <div className={transaction.type === 'income' ? styles.amountIncome : styles.amountExpense}>
        {transaction.type === 'income' ? '+' : '-'}{transaction.amount} грн
      </div>
    </div>
  );
};

export default TransactionItem;