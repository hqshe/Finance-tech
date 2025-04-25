import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import TransactionItem from './TransactionItem';
import styles from '../styles/RecentTransactions.module.css';

const RecentTransactions = ({ transactions }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Останні транзакції</h2>
        <a href="#" className={styles.viewAll}>Переглянути все</a>
      </div>
      <div className={styles.transactionList}>
        {transactions.map(transaction => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      <button className={styles.addButton}>
        Додати нову транзакцію
      </button>
    </div>
  );
};

export default RecentTransactions;