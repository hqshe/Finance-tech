import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/TwoFactorAuth.module.css';

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Отримуємо дані з попереднього екрану логіну
  const { tempToken, phoneHint } = location.state || {};
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 хвилин в секундах
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Перенаправляємо якщо немає tempToken
  useEffect(() => {
    if (!tempToken) {
      navigate('/login');
    }
  }, [tempToken, navigate]);

  // Таймер для коду
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Обробка введення коду
  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Дозволяємо тільки одну цифру
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Автоматично переходимо до наступного поля
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Автоматично відправляємо якщо введено всі 6 цифр
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleSubmit(newCode.join(''));
    }
  };

  // Обробка натискання клавіш
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Відправка коду для верифікації
  const handleSubmit = async (codeToSubmit = null) => {
    const verificationCode = codeToSubmit || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Введіть повний 6-значний код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempToken,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Зберігаємо токен та перенаправляємо
        localStorage.setItem('token', data.token);
        navigate('/home');
      } else {
        setError(data.message || 'Невірний код підтвердження');
        
        // Очищуємо поля при помилці
        setCode(['', '', '', '', '', '']);
        const firstInput = document.getElementById('code-0');
        if (firstInput) firstInput.focus();
      }
    } catch (error) {
      console.error('Помилка верифікації:', error);
      setError('Сталася помилка під час перевірки коду');
    } finally {
      setLoading(false);
    }
  };

  // Повторна відправка коду
  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/resend-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeLeft(300); // Скидаємо таймер
        setCanResend(false);
        setCode(['', '', '', '', '', '']); // Очищуємо поля
        
        // Фокус на першому полі
        const firstInput = document.getElementById('code-0');
        if (firstInput) firstInput.focus();
        
        alert('Новий код відправлено на ваш телефон');
      } else {
        setError(data.message || 'Не вдалося відправити новий код');
      }
    } catch (error) {
      console.error('Помилка повторної відправки:', error);
      setError('Сталася помилка під час відправки нового коду');
    } finally {
      setResendLoading(false);
    }
  };

  // Повернення до логіну
  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Форматування часу
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!tempToken) {
    return null; // Компонент не рендериться поки не перенаправить
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className={styles.title}>Двофакторна автентифікація</h1>
          <p className={styles.subtitle}>
            Ми відправили 6-значний код підтвердження на номер {phoneHint}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className={styles.form}>
          <div className={styles.codeInputs}>
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`${styles.codeInput} ${error ? styles.error : ''}`}
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.timer}>
            {timeLeft > 0 ? (
              <span>Код дійсний ще {formatTime(timeLeft)}</span>
            ) : (
              <span className={styles.expired}>Термін дії коду закінчився</span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
              disabled={loading || code.some(digit => digit === '')}
            >
              {loading ? 'Перевіряємо...' : 'Підтвердити'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              className={`${styles.resendButton} ${(!canResend || resendLoading) ? styles.disabled : ''}`}
              disabled={!canResend || resendLoading}
            >
              {resendLoading ? 'Надсилаємо...' : 'Надіслати новий код'}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className={styles.backButton}
              disabled={loading}
            >
              Повернутися до входу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuth;