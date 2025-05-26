// ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { User, Edit3, Lock, Bell, Camera, X, Check, Settings } from 'lucide-react';
import styles from '../styles/Profile.module.css';
import Header from '../components/Header';

const API_URL = 'http://localhost:5000/api';

const ProfilePage = () => {
  // User state - початково порожній
  const [user, setUser] = useState({
    username: '',
    email: '',
    birthdate: '',
    phone: '',
    location: '',
    twoFactorEnabled: false,
    avatarUrl: '',
    monthlyBudget: 0,
    currentSpending: 0,
    budgetThreshold: 80,
    notificationSettings: {
      monthlyReport: true,
      paymentReminders: true,
      budgetExceeded: true,
      savingsTips: false
    }
  });

  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditPhotoModalOpen, setIsEditPhotoModalOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Функція для завантаження даних користувача
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Користувач не авторизований');
        return;
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Помилка при завантаженні даних профілю');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Помилка завантаження профілю:', error);
      setError('Не вдалося завантажити дані профілю');
    } finally {
      setLoading(false);
    }
  };

  // Завантажуємо дані при монтуванні компонента
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Event handlers
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = async (name) => {
    try {
      const token = localStorage.getItem('token');
      const updatedSettings = {
        ...user.notificationSettings,
        [name]: !user.notificationSettings[name]
      };

      const response = await fetch('/api/users/notification-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        setUser(prev => ({
          ...prev,
          notificationSettings: updatedSettings
        }));
      }
    } catch (error) {
      console.error('Помилка оновлення налаштувань:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleBudgetChange = (value) => {
    const budgetValue = parseFloat(value) || 0;
    setUser(prev => ({
      ...prev,
      monthlyBudget: budgetValue
    }));
  };

  const handleThresholdChange = (threshold) => {
    setUser(prev => ({
      ...prev,
      budgetThreshold: threshold
    }));
  };

  const formatBirthdate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const getUserInitials = () => {
    if (!user.username) return '';
    return user.username.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        setIsEditProfileModalOpen(false);
        setProfileForm({});
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка при збереженні профілю');
      }
    } catch (error) {
      console.error('Помилка збереження профілю:', error);
      alert('Помилка при збереженні профілю');
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Паролі не співпадають');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        alert('Пароль успішно змінено');
        setIsChangePasswordModalOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка при зміні пароля');
      }
    } catch (error) {
      console.error('Помилка зміни пароля:', error);
      alert('Помилка при зміні пароля');
    }
  };

  const uploadProfilePhoto = async () => {
    if (!selectedFile) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUser(prev => ({
          ...prev,
          avatarUrl: result.avatarUrl
        }));
        setIsEditPhotoModalOpen(false);
        setSelectedFile(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка при завантаженні фото');
      }
    } catch (error) {
      console.error('Помилка завантаження фото:', error);
      alert('Помилка при завантаженні фото');
    }
  };

  const toggleTwoFactor = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/users/two-factor', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !user.twoFactorEnabled
        })
      });

      if (response.ok) {
        const result = await response.json();
        setUser(prev => ({
          ...prev,
          twoFactorEnabled: result.twoFactorEnabled
        }));
      } else {
        const error = await response.json();
        alert(error.message || 'Помилка при зміні налаштувань 2FA');
      }
    } catch (error) {
      console.error('Помилка зміни 2FA:', error);
      alert('Помилка при зміні налаштувань двофакторної автентифікації');
    }
  };

  // Обробка помилок
  if (error) {
    return (
      <div className={styles.profilePage}>
        <Header />
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={fetchUserProfile} className={styles.retryBtn}>
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Завантаження даних...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <Header />
    <div className={styles.pageContainer}>
      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentGrid}>
          {/* Left Sidebar - Profile Card */}
          <div className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {getUserInitials()}
                    </div>
                  )}
                  <button 
                    onClick={() => setIsEditPhotoModalOpen(true)}
                    className={styles.editPhotoBtn}
                  >
                    <Camera className={styles.cameraIcon} />
                  </button>
                </div>
                <h2 className={styles.userName}>{user.username}</h2>
                <p className={styles.userEmail}>{user.email}</p>
              </div>

              {/* Quick Stats */}
              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Безпека</span>
                  <span className={`${styles.badge} ${user.twoFactorEnabled ? styles.badgeSuccess : styles.badgeWarning}`}>
                    {user.twoFactorEnabled ? 'Захищено' : 'Базовий'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Бюджет</span>
                  <span className={styles.statValue}>₴{user.monthlyBudget || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={styles.mainArea}>
            {/* Personal Information */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Особиста інформація</h3>
                <button 
                  onClick={() => {
                    setProfileForm({ ...user });
                    setIsEditProfileModalOpen(true);
                  }}
                  className={styles.editBtn}
                >
                  <Edit3 className={styles.editIcon} />
                  <span>Редагувати</span>
                </button>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.infoGrid}>
                  <InfoItem label="Ім'я та прізвище" value={user.username || '—'} />
                  <InfoItem label="Дата народження" value={user.birthdate ? formatBirthdate(user.birthdate) : '—'} />
                  <InfoItem label="Телефон" value={user.phone || '—'} />
                  <InfoItem label="Email" value={user.email} />
                  <InfoItem label="Локація" value={user.location || '—'} />
                </div>
              </div>
            </div>

            {/* Budget Settings */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Налаштування бюджету</h3>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.budgetGrid}>
                  <div className={styles.budgetLeft}>
                    <div className={styles.budgetInputGroup}>
                      <label className={styles.inputLabel}>
                        Місячний бюджет (₴)
                      </label>
                      <input 
                        type="number" 
                        value={user.monthlyBudget || ''} 
                        onChange={(e) => handleBudgetChange(e.target.value)}
                        placeholder="Введіть ваш місячний бюджет"
                        min="0"
                        step="100"
                        className={styles.budgetInput}
                      />
                    </div>

                    <div className={styles.budgetStats}>
                      <div className={styles.budgetStatItem}>
                        <span className={styles.budgetStatLabel}>Поточні витрати:</span>
                        <span className={styles.budgetStatValue}>₴{user.currentSpending || 0}</span>
                      </div>
                      
                      {user.monthlyBudget && (
                        <div className={styles.budgetStatItem}>
                          <span className={styles.budgetStatLabel}>Залишок бюджету:</span>
                          <span className={`${styles.budgetStatValue} ${
                            (user.monthlyBudget - (user.currentSpending || 0)) < 0 
                              ? styles.budgetNegative 
                              : styles.budgetPositive
                          }`}>
                            ₴{user.monthlyBudget - (user.currentSpending || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.budgetRight}>
                    <h4 className={styles.thresholdTitle}>Попередження про перевищення</h4>
                    <div className={styles.thresholdOptions}>
                      {[
                        { value: 80, label: 'При 80% від бюджету' },
                        { value: 90, label: 'При 90% від бюджету' },
                        { value: 100, label: 'При 100% від бюджету' }
                      ].map((option) => (
                        <label key={option.value} className={styles.radioOption}>
                          <input 
                            type="radio" 
                            name="budgetThreshold" 
                            value={option.value}
                            checked={user.budgetThreshold === option.value}
                            onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
                            className={styles.radioInput}
                          />
                          <span className={styles.radioLabel}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Notifications Grid */}
            <div className={styles.twoColumnGrid}>
              {/* Security */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Безпека</h3>
                  <button 
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className={styles.changePasswordBtn}
                  >
                    <Lock className={styles.lockIcon} />
                    <span>Змінити пароль</span>
                  </button>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.securityContent}>
                    <InfoItem label="Пароль" value="•••••••••••" />
                    <div className={styles.twoFactorItem}>
                      <div className={styles.twoFactorInfo}>
                        <p className={styles.twoFactorLabel}>Двофакторна автентифікація</p>
                        <p className={styles.twoFactorValue}>
                          {user.twoFactorEnabled ? 'Увімкнено' : 'Вимкнено'}
                        </p>
                      </div>
                      <button 
                        onClick={toggleTwoFactor}
                        className={`${styles.twoFactorBtn} ${
                          user.twoFactorEnabled 
                            ? styles.twoFactorBtnDisable 
                            : styles.twoFactorBtnEnable
                        }`}
                      >
                        {user.twoFactorEnabled ? 'Вимкнути' : 'Увімкнути'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Налаштування повідомлень</h3>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.notificationsList}>
                    {[
                      { key: 'monthlyReport', label: 'Щомісячний звіт' },
                      { key: 'paymentReminders', label: 'Нагадування про платежі' },
                      { key: 'budgetExceeded', label: 'Перевищення бюджету' },
                      { key: 'savingsTips', label: 'Поради щодо економії' }
                    ].map((notification) => (
                      <NotificationToggle 
                        key={notification.key}
                        label={notification.label} 
                        isEnabled={user.notificationSettings?.[notification.key] || false} 
                        onChange={() => handleNotificationToggle(notification.key)} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Modals */}
      {isEditProfileModalOpen && (
        <Modal 
          title="Редагувати профіль" 
          onClose={() => setIsEditProfileModalOpen(false)}
        >
          <div className={styles.modalForm}>
            <FormField 
              label="Ім'я та прізвище" 
              name="username" 
              type="text" 
              value={profileForm.username || ''} 
              onChange={handleProfileFormChange} 
            />
            <FormField 
              label="Дата народження" 
              name="birthdate" 
              type="date" 
              value={profileForm.birthdate ? profileForm.birthdate.split('T')[0] : ''} 
              onChange={handleProfileFormChange} 
            />
            <FormField 
              label="Телефон" 
              name="phone" 
              type="tel" 
              value={profileForm.phone || ''} 
              onChange={handleProfileFormChange} 
            />
            <FormField 
              label="Email" 
              name="email" 
              type="email" 
              value={profileForm.email || ''} 
              onChange={handleProfileFormChange}
              disabled={true}
            />
            <FormField 
              label="Локація" 
              name="location" 
              type="text" 
              value={profileForm.location || ''} 
              onChange={handleProfileFormChange} 
            />
          </div>
          
          <div className={styles.modalActions}>
            <button 
              onClick={() => setIsEditProfileModalOpen(false)}
              className={styles.cancelBtn}
            >
              Скасувати
            </button>
            <button 
              onClick={saveProfile}
              className={styles.saveBtn}
            >
              Зберегти зміни
            </button>
          </div>
        </Modal>
      )}
      
      {isChangePasswordModalOpen && (
        <Modal 
          title="Змінити пароль" 
          onClose={() => setIsChangePasswordModalOpen(false)}
        >
          <div className={styles.modalForm}>
            <FormField 
              label="Поточний пароль" 
              name="currentPassword" 
              type="password" 
              value={passwordForm.currentPassword} 
              onChange={handlePasswordFormChange} 
            />
            <FormField 
              label="Новий пароль" 
              name="newPassword" 
              type="password" 
              value={passwordForm.newPassword} 
              onChange={handlePasswordFormChange} 
            />
            <FormField 
              label="Підтвердження паролю" 
              name="confirmPassword" 
              type="password" 
              value={passwordForm.confirmPassword} 
              onChange={handlePasswordFormChange} 
            />
          </div>
          
          <div className={styles.modalActions}>
            <button 
              onClick={() => setIsChangePasswordModalOpen(false)}
              className={styles.cancelBtn}
            >
              Скасувати
            </button>
            <button 
              onClick={changePassword}
              className={styles.saveBtn}
            >
              Зберегти новий пароль
            </button>
          </div>
        </Modal>
      )}
      
      {isEditPhotoModalOpen && (
        <Modal 
          title="Змінити фото профілю" 
          onClose={() => setIsEditPhotoModalOpen(false)}
        >
          <div className={styles.modalForm}>
            <div className={styles.fileUploadGroup}>
              <label className={styles.inputLabel}>
                Завантажити нове фото
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              {selectedFile && (
                <p className={styles.fileSelectedText}>
                  Вибрано: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
          
          <div className={styles.modalActions}>
            <button 
              onClick={() => {
                setIsEditPhotoModalOpen(false);
                setSelectedFile(null);
              }}
              className={styles.cancelBtn}
            >
              Скасувати
            </button>
            <button 
              onClick={uploadProfilePhoto}
              disabled={!selectedFile}
              className={`${styles.saveBtn} ${!selectedFile ? styles.saveBtn_disabled : ''}`}
            >
              Зберегти фото
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Component for displaying information
const InfoItem = ({ label, value }) => (
  <div className={styles.infoItem}>
    <p className={styles.infoLabel}>{label}</p>
    <p className={styles.infoValue}>{value}</p>
  </div>
);

// Notification toggle component
const NotificationToggle = ({ label, isEnabled, onChange }) => (
  <div className={styles.notificationItem}>
    <span className={styles.notificationLabel}>{label}</span>
    <button
      onClick={onChange}
      className={`${styles.toggle} ${isEnabled ? styles.toggleEnabled : styles.toggleDisabled}`}
    >
      <span className={`${styles.toggleSlider} ${isEnabled ? styles.toggleSliderActive : ''}`} />
    </button>
  </div>
);

// Form field component
const FormField = ({ label, name, type, value, onChange, disabled = false }) => (
  <div className={styles.formField}>
    <label htmlFor={name} className={styles.inputLabel}>
      {label}
    </label>
    <input 
      type={type} 
      id={name}
      name={name}
      value={value} 
      onChange={onChange}
      disabled={disabled}
      className={`${styles.input} ${disabled ? styles.inputDisabled : ''}`}
    />
  </div>
);

// Modal component
const Modal = ({ title, children, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button 
            onClick={onClose} 
            className={styles.modalCloseBtn}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;