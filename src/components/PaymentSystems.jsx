import React from 'react';
import { Plus } from 'lucide-react';
import PaymentSystemCard from './PaymentCard';
import styles from '../styles/PaymentSystems.module.css';

const PaymentSystems = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Платіжні системи</h2>
      <div className={styles.grid}>
        <PaymentSystemCard 
          name="ПриватБанк" 
          isConnected="Під'єднано" 
          icon={<p className={styles.privatbankIcon}>P</p>}
          color="blue"
        />
        <PaymentSystemCard 
          name="Монобанк" 
          isConnected="Під'єднано" 
          icon={<p className={styles.monoIcon}>M</p>}
          color="green"
        />
        <PaymentSystemCard 
          name="Додати картку" 
          isConnected="PayPal, Visa, MC" 
          icon={<Plus size={20} className={styles.plusIcon} />}
          color="gray"
        />
        <PaymentSystemCard 
          name="Інші методи" 
          isConnected="Додати платіжну систему" 
          icon={<Plus size={20} className={styles.plusIcon} />}
          color="gray"
        />
      </div>
    </div>
  );
};

export default PaymentSystems;