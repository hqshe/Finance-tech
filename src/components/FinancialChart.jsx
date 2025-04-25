import React from 'react';
import { Activity } from 'lucide-react';
import styles from '../styles/FinancialChart.module.css';

const FinancialChart = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Фінансова аналітика</h2>
        <select className={styles.select}>
          <option>Цей місяць</option>
          <option>Минулий місяць</option>
          <option>За 3 місяці</option>
          <option>За рік</option>
        </select>
      </div>
      <div className={styles.chartContainer}>
        <Activity size={48} className={styles.chartIcon} />
        <p className={styles.chartText}>Графік фінансової активності</p>
      </div>
      <div className={styles.categoriesGrid}>
        <ExpenseCategory name="Продукти" amount="1,250" />
        <ExpenseCategory name="Комунальні" amount="2,300" />
        <ExpenseCategory name="Розваги" amount="450" />
        <ExpenseCategory name="Інше" amount="0" />
      </div>
    </div>
  );
};

const ExpenseCategory = ({ name, amount }) => {
  return (
    <div className={styles.categoryItem}>
      <p className={styles.categoryName}>{name}</p>
      <p className={styles.categoryAmount}>{amount} грн</p>
    </div>
  );
};

export default FinancialChart;