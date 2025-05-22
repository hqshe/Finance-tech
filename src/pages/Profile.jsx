import React, { useState, useEffect } from 'react';
import styles from '../styles/Profile.module.css';
import Header from '../components/Header';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UNSAFE_FrameworkContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const ProfilePage = () => {
  // Стан користувача
  const [user, setUser] = useState({
    userame: '',
    email: '',
    birthdate: '',
    phone: '',
    location: '',
    twoFactorEnabled: false,
    avatarUrl: '',
    notificationSettings: {
      monthlyReport: true,
      paymentReminders: true,
      budgetExceeded: true,
      savingsTips: false
    }
  });

  // Стан завантаження
  const [loading, setLoading] = useState(true);

  // Стани модальних вікон
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEditPhotoModalOpen, setIsEditPhotoModalOpen] = useState(false);

  // Стан форми редагування профілю
  const [profileForm, setProfileForm] = useState({});

  // Стан форми зміни паролю
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Стан для завантаження файлу
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Токен з локального сховища
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Конфігурація для HTTP запитів
  const config = {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  };

  // Отримання даних користувача
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/profile`, config);
        setUser(response.data);
        setProfileForm(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Помилка при отриманні даних профілю:', error);
        toast.error('Не вдалося завантажити дані профілю');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Обробники подій
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
      const updatedSettings = {
        ...user.notificationSettings,
        [name]: !user.notificationSettings[name]
      };

      const response = await axios.put(
        `${API_URL}/notification-settings`,
        updatedSettings,
        config
      );

      setUser(prev => ({
        ...prev,
        notificationSettings: response.data.notificationSettings
      }));

      toast.success('Налаштування повідомлень оновлено');
    } catch (error) {
      console.error('Помилка при оновленні налаштувань повідомлень:', error);
      toast.error('Не вдалося оновити налаштування повідомлень');
    }
  };

  // Завантаження файлу
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Форматування дати народження для відображення
  const formatBirthdate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Формування повного шляху до аватара
  const getFullAvatarUrl = (url) => {
    if (!url) return null;
    // Якщо URL вже містить повний домен, повертаємо як є
    if (url.startsWith('http')) {
      return url;
    }
    // Інакше додаємо базовий URL сервера
    return `http://localhost:5000${url}`;
  };

  // Збереження змін профілю
  const saveProfile = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/profile`,
        {
          UNSAFE_FrameworkContextame: profileForm.username,
          birthdate: profileForm.birthdate,
          phone: profileForm.phone,
          location: profileForm.location
        },
        config
      );

      setUser(response.data.user);
      setIsEditProfileModalOpen(false);
      toast.success('Профіль успішно оновлено');
    } catch (error) {
      console.error('Помилка при оновленні профілю:', error);
      toast.error('Не вдалося оновити профіль');
    }
  };

  // Зміна паролю
  const changePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Будь ласка, заповніть всі поля');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Новий пароль і підтвердження не співпадають');
      return;
    }
    
    try {
      await axios.put(
        `${API_URL}/change-password`,
        {
          currentPassword,
          newPassword
        },
        config
      );
      
      setIsChangePasswordModalOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Пароль успішно змінено');
    } catch (error) {
      console.error('Помилка при зміні пароля:', error);
      
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Невірний поточний пароль');
      } else {
        toast.error('Не вдалося змінити пароль');
      }
    }
  };

  // Завантаження фото профілю
  const uploadProfilePhoto = async () => {
    if (!selectedFile) {
      toast.error('Будь ласка, виберіть файл');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      
      const uploadConfig = {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(
        `${API_URL}/upload-avatar`,
        formData,
        uploadConfig
      );
      
      setUser(prev => ({
        ...prev,
        avatarUrl: response.data.avatarUrl
      }));
      
      setIsEditPhotoModalOpen(false);
      setSelectedFile(null);
      toast.success('Фото профілю успішно оновлено');
    } catch (error) {
      console.error('Помилка при завантаженні фото:', error);
      toast.error('Не вдалося завантажити фото');
    }
  };

  // Зміна статусу двофакторної автентифікації
  const toggleTwoFactor = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/two-factor`,
        { enabled: !user.twoFactorEnabled },
        config
      );
      
      setUser(prev => ({
        ...prev,
        twoFactorEnabled: response.data.twoFactorEnabled
      }));
      
      toast.success(`Двофакторну автентифікацію ${response.data.twoFactorEnabled ? 'увімкнено' : 'вимкнено'}`);
    } catch (error) {
      console.error('Помилка при зміні статусу двофакторної автентифікації:', error);
      toast.error('Не вдалося змінити налаштування двофакторної автентифікації');
    }
  };

  // Генерація ініціалів для аватара
  const getUserInitials = () => {
    if (!user.username) return '';
    return user.username.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.mainContainer}>
          <Header />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Завантаження даних...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainContainer}>
        <Header/>
        
        {/* Avatar Section */}
        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {user.avatarUrl ? (
                <img 
                  src={getFullAvatarUrl(user.avatarUrl)} 
                  alt={user.username || 'Аватар'} 
                  className={styles.avatarImage}
                  onError={(e) => {
                    console.error('Помилка завантаження зображення:', user.avatarUrl);
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={styles.avatar} style={{ display: user.avatarUrl ? 'none' : 'flex' }}>
                {getUserInitials()}
              </div>
              <button 
                className={styles.editPhotoButton}
                onClick={() => setIsEditPhotoModalOpen(true)}
              >
                <svg className={styles.plusIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <h2 className={styles.userName}>{user.username || 'Користувач'}</h2>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        </div>
        
        {/* Personal Information */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Особиста інформація</h2>
            <button 
              className={styles.primaryButton}
              onClick={() => {
                setProfileForm({ ...user });
                setIsEditProfileModalOpen(true);
              }}
            >
              Редагувати профіль
            </button>
          </div>
          
          <div className={styles.infoGrid}>
            <InfoItem label="Ім'я та прізвище" value={user.username || '—'} />
            <InfoItem label="Дата народження" value={user.birthdate ? formatBirthdate(user.birthdate) : '—'} />
            <InfoItem label="Телефон" value={user.phone || '—'} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Локація" value={user.location || '—'} />
          </div>
        </div>
        
        {/* Security */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Безпека</h2>
            <div className={styles.securityButtons}>
              <button 
                className={styles.primaryButton}
                onClick={() => setIsChangePasswordModalOpen(true)}
              >
                Змінити пароль
              </button>
            </div>
          </div>
          
          <div className={styles.infoGrid}>
            <InfoItem label="Пароль" value="•••••••••••" />
            <div className={styles.twoFactorItem}>
              <InfoItem 
                label="Двофакторна автентифікація" 
                value={user.twoFactorEnabled ? 'Увімкнено' : 'Вимкнено'} 
              />
              <button 
                className={`${styles.twoFactorToggleButton} ${user.twoFactorEnabled ? styles.twoFactorEnabled : styles.twoFactorDisabled}`}
                onClick={toggleTwoFactor}
              >
                {user.twoFactorEnabled ? 'Вимкнути' : 'Увімкнути'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Налаштування повідомлень</h2>
          </div>
          
          <div>
            <NotificationToggle 
              label="Щомісячний звіт" 
              isEnabled={user.notificationSettings?.monthlyReport} 
              onChange={() => handleNotificationToggle('monthlyReport')} 
            />
            <NotificationToggle 
              label="Нагадування про платежі" 
              isEnabled={user.notificationSettings?.paymentReminders} 
              onChange={() => handleNotificationToggle('paymentReminders')} 
            />
            <NotificationToggle 
              label="Перевищення бюджету" 
              isEnabled={user.notificationSettings?.budgetExceeded} 
              onChange={() => handleNotificationToggle('budgetExceeded')} 
            />
            <NotificationToggle 
              label="Поради щодо економії" 
              isEnabled={user.notificationSettings?.savingsTips} 
              onChange={() => handleNotificationToggle('savingsTips')} 
            />
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <Modal 
          title="Редагувати профіль" 
          onClose={() => setIsEditProfileModalOpen(false)}
        >
          <div className={styles.formContainer}>
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
              className={styles.secondaryButton}
              onClick={() => setIsEditProfileModalOpen(false)}
            >
              Скасувати
            </button>
            <button 
              className={styles.primaryButton}
              onClick={saveProfile}
            >
              Зберегти зміни
            </button>
          </div>
        </Modal>
      )}
      
      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <Modal 
          title="Змінити пароль" 
          onClose={() => setIsChangePasswordModalOpen(false)}
        >
          <div className={styles.formContainer}>
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
              className={styles.secondaryButton}
              onClick={() => setIsChangePasswordModalOpen(false)}
            >
              Скасувати
            </button>
            <button 
              className={styles.primaryButton}
              onClick={changePassword}
            >
              Зберегти новий пароль
            </button>
          </div>
        </Modal>
      )}
      
      {/* Edit Photo Modal */}
      {isEditPhotoModalOpen && (
        <Modal 
          title="Змінити фото профілю" 
          onClose={() => setIsEditPhotoModalOpen(false)}
        >
          <div className={styles.fileUploadContainer}>
            <label className={styles.fieldLabel}>
              Завантажити нове фото
            </label>
            <input 
              type="file" 
              className={styles.fileInput}
              accept="image/*" 
              onChange={handleFileChange}
            />
            {selectedFile && (
              <p className={styles.selectedFileName}>
                Вибрано: {selectedFile.name}
              </p>
            )}
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.secondaryButton}
              onClick={() => {
                setIsEditPhotoModalOpen(false);
                setSelectedFile(null);
              }}
            >
              Скасувати
            </button>
            <button 
              className={styles.primaryButton}
              onClick={uploadProfilePhoto}
              disabled={!selectedFile}
            >
              Зберегти фото
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Компонент для відображення інформації
const InfoItem = ({ label, value }) => (
  <div className={styles.infoItem}>
    <p className={styles.infoLabel}>{label}</p>
    <p className={styles.infoValue}>{value}</p>
  </div>
);

// Компонент перемикача сповіщень
const NotificationToggle = ({ label, isEnabled, onChange }) => (
  <div className={styles.notificationToggle}>
    <span className={styles.toggleLabel}>{label}</span>
    <label className={styles.toggleSwitch}>
      <input 
        type="checkbox" 
        className={styles.toggleInput} 
        checked={isEnabled}
        onChange={onChange}
      />
      <span className={`${styles.toggleSlider} ${isEnabled ? styles.toggleSliderActive : ''}`}>
        <span className={`${styles.toggleSliderKnob} ${isEnabled ? styles.toggleSliderKnobActive : ''}`}></span>
      </span>
    </label>
  </div>
);

// Компонент поля форми
const FormField = ({ label, name, type, value, onChange, disabled = false }) => (
  <div className={styles.formField}>
    <label htmlFor={name} className={styles.fieldLabel}>
      {label}
    </label>
    <input 
      type={type} 
      id={name}
      name={name}
      className={`${styles.fieldInput} ${disabled ? styles.fieldInputDisabled : ''}`}
      value={value} 
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);

// Компонент модального вікна
const Modal = ({ title, children, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} className={styles.modalCloseButton}>
            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;