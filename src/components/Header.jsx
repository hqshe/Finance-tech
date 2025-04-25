import React from 'react';
import { Bell, User, Menu, CreditCard } from 'lucide-react';
import styles from '../styles/Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Menu className={styles.menuIcon} size={24} />
          <div className={styles.logoWrapper}>
            <CreditCard className={styles.logo} size={28} />
            <h1 className={styles.title}>TechFinance</h1>
          </div>
        </div>
        
        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            <a href="#" className={styles.navLinkActive}>Головна</a>
            <a href="#" className={styles.navLink}>Транзакції</a>
            <a href="#" className={styles.navLink}>Аналітика</a>
            <a href="#" className={styles.navLink}>Бюджет</a>
            <a href="#" className={styles.navLink}>Платежі</a>
          </nav>
        </div>
        
        <div className={styles.userActions}>
          <button className={styles.iconButton}>
            <Bell size={20} />
          </button>
          <button className={styles.iconButton}>
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;