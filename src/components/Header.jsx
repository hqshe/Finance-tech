import React from 'react';
import { Bell, User, Menu, CreditCard } from 'lucide-react';
import styles from '../styles/Header.module.css';
import { Link, useLocation } from 'react-router-dom'; // Використовуємо react-router-dom для визначення шляху

const Header = () => {
  const location = useLocation(); // Отримуємо об'єкт локації
  const isProfilePage = location.pathname === '/profile'; // Перевіряємо, чи знаходимось на сторінці профілю

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Menu className={styles.menuIcon} size={24} />
          <div className={styles.logoWrapper}>
            <CreditCard className={styles.logo} size={28} />
            <a href="/home" className={styles.title}>TechFinance</a>
          </div>
        </div>
        
        <div className={styles.userActions}>
          <button className={styles.iconButton}>
            <Bell size={20} />
          </button>
          <Link
            to="/profile"
            className={`${styles.iconButton} ${isProfilePage ? styles.active : ''}`}
          >
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;