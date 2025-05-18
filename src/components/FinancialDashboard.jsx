import React, { useState, useEffect } from 'react';
import FinancialChart from './FinancialChart';
import RecentTransactions from './RecentTransaction';
import styles from '../styles/FinancialDashboard.module.css';

const FinancialDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [transactions, setTransactions] = useState([]);

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
  };

  return (
    <div className={styles.dashboard}>
      <FinancialChart 
        selectedPeriod={selectedPeriod} 
        onPeriodChange={handlePeriodChange} 
      />
      <RecentTransactions 
        selectedPeriod={selectedPeriod} 
      />
    </div>
  );
};

export default FinancialDashboard;