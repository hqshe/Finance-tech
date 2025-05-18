import React, { useState, useEffect } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import BalanceOverview from '../components/BalanceOverview';
import FinancialDashboard from '../components/FinancialDashboard';
import PaymentSystems from '../components/PaymentSystems';
import styles from '../styles/Home.module.css';

export default function Home() {

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <BalanceOverview/>
            <FinancialDashboard />
          <PaymentSystems>
          </PaymentSystems>
        </div>
      </main>
      <Footer />
    </div>
  );
}