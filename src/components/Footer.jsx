import React from 'react';
import { CreditCard } from 'lucide-react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <CreditCard className={styles.logo} size={24} />
            <h2 className={styles.logoText}>ФінансПро</h2>
          </div>
          <div className={styles.links}>
            <a href="#" className={styles.link}>Про нас</a>
            <a href="#" className={styles.link}>Підтримка</a>
            <a href="#" className={styles.link}>Умови використання</a>
            <a href="#" className={styles.link}>Конфіденційність</a>
          </div>
          <div className={styles.copyright}>
            © 2025 ФінансПро. Всі права захищені.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;