import React, { useState, useEffect } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import BalanceOverview from '../components/BalanceOverview';
import FinancialChart from '../components/FinancialChart';
import RecentTransactions from '../components/RecentTransaction';
import PaymentSystems from '../components/PaymentSystems';
import BankConnection from '../components/BankConnection';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [balance, setBalance] = useState(25750.42);
  const [transactions, setTransactions] = useState([
    { id: 1, name: "Зарплата", amount: 15000, type: "income", date: "15.04.2025", category: "Дохід" },
    { id: 2, name: "Супермаркет АТБ", amount: 1250.30, type: "expense", date: "16.04.2025", category: "Продукти" },
    { id: 3, name: "Комунальні платежі", amount: 2300, type: "expense", date: "17.04.2025", category: "Комунальні" },
    { id: 4, name: "Кафе", amount: 450, type: "expense", date: "18.04.2025", category: "Розваги" },
  ]);

  // Функція оновлення даних після змін у банківських підключеннях
  const handleBankUpdate = async () => {
    // Тут можна оновити баланс і транзакції з API
    try {
      console.log("Дані оновлено після зміни в банківських підключеннях");
    } catch (error) {
      console.error("Помилка оновлення даних:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <BalanceOverview balance={balance} />
          <div className={styles.gridLayout}>
            <FinancialChart />
            <RecentTransactions transactions={transactions} />
          </div>
          <PaymentSystems>
            <BankConnection onUpdate={handleBankUpdate} />
          </PaymentSystems>
        </div>
      </main>
      <Footer />
    </div>
  );
}