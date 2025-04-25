import React from 'react';
import { ArrowDown, ArrowUp, PieChart, Plus } from 'lucide-react';
import BalanceCard from './BalanceCard';
import styles from '../styles/BalanceOverview.module.css';

const BalanceOverview = ({ balance }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Загальний баланс</h2>
          <p className={styles.balanceAmount}>{balance.toLocaleString()} грн</p>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.addButton}>
            <Plus size={18} className={styles.buttonIcon} />
            Додати транзакцію
          </button>
        </div>
      </div>
      
      <div className={styles.cardsGrid}>
        <BalanceCard 
          title="Доходи" 
          amount="15,000.00" 
          icon={<ArrowDown className={styles.incomeIcon} size={20} />}
          color="green"
          subtitle="Цього місяця"
          prefix="+"
        />
        
        <BalanceCard 
          title="Витрати" 
          amount="4,000.30" 
          icon={<ArrowUp className={styles.expenseIcon} size={20} />}
          color="red"
          subtitle="Цього місяця"
          prefix="-"
        />
        
        <BalanceCard 
          title="Економія" 
          amount="11,000.00" 
          icon={<PieChart className={styles.savingsIcon} size={20} />}
          color="blue"
          subtitle="73% доходу"
          prefix="+"
        />
      </div>
    </div>
  );
};

export default BalanceOverview;