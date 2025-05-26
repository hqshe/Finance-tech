import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Menu, CreditCard, X, Check, AlertTriangle, Info, Calendar, Lightbulb, Trash2, CheckCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Header.module.css';

const API_URL = 'http://localhost:5000/api';

// Компонент для меню повідомлень
const NotificationsDropdown = ({ isOpen, onClose, unreadCount, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const dropdownRef = useRef(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const config = {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  };

  // Отримання повідомлень з БД
  const fetchNotifications = async (page = 1, append = false) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/notifications?page=${page}&limit=10`, config);
      
      if (append) {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      } else {
        setNotifications(response.data.notifications);
      }
      
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setHasMore(response.data.currentPage < response.data.totalPages);
      onUnreadCountChange(response.data.unreadCount);
      
    } catch (error) {
      console.error('Помилка при отриманні повідомлень:', error);
      // Якщо помилка з авторизацією, можна відобразити повідомлення
      if (error.response?.status === 401) {
        console.log('Помилка авторизації');
      }
    } finally {
      setLoading(false);
    }
  };

  // Позначення повідомлення як прочитане
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, config);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      // Оновлюємо кількість непрочитаних
      const currentUnread = notifications.filter(n => !n.isRead).length;
      const wasUnread = notifications.find(n => n._id === notificationId && !n.isRead);
      if (wasUnread) {
        onUnreadCountChange(Math.max(0, currentUnread - 1));
      }
    } catch (error) {
      console.error('Помилка при позначенні повідомлення:', error);
    }
  };

  // Видалення повідомлення
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`, config);
      
      const notificationToDelete = notifications.find(n => n._id === notificationId);
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Якщо видаляємо непрочитане повідомлення, зменшуємо лічильник
      if (notificationToDelete && !notificationToDelete.isRead) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Помилка при видаленні повідомлення:', error);
    }
  };

  // Позначити всі як прочитані
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, config);
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      onUnreadCountChange(0);
    } catch (error) {
      console.error('Помилка при позначенні всіх повідомлень:', error);
    }
  };

  // Видалити всі прочитані повідомлення
  const deleteAllRead = async () => {
    try {
      await axios.delete(`${API_URL}/notifications/delete-read`, config);
      
      setNotifications(prev => prev.filter(notif => !notif.isRead));
    } catch (error) {
      console.error('Помилка при видаленні прочитаних повідомлень:', error);
    }
  };

  // Завантаження більше повідомлень
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(currentPage + 1, true);
    }
  };

  // Отримання іконки для типу повідомлення
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertTriangle size={16} className={styles.iconDanger} />;
      case 'budget_warning':
        return <AlertTriangle size={16} className={styles.iconWarning} />;
      case 'payment_reminder':
        return <Calendar size={16} className={styles.iconInfo} />;
      case 'monthly_report':
        return <Info size={16} className={styles.iconSuccess} />;
      case 'savings_tip':
        return <Lightbulb size={16} className={styles.iconTip} />;
      default:
        return <Info size={16} className={styles.iconDefault} />;
    }
  };

  // Форматування дати
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Щойно';
    } else if (diffInHours < 24) {
      return `${diffInHours} год тому`;
    } else if (diffInHours < 48) {
      return 'Вчора';
    } else {
      return date.toLocaleDateString('uk-UA');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1);
    }
  }, [isOpen]);

  // Закриття при кліку поза меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={styles.notificationsDropdown}
    >
      {/* Заголовок */}
      <div className={styles.notificationsHeader}>
        <h3 className={styles.notificationsTitle}>Повідомлення</h3>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className={styles.markAllButton}
              title="Позначити всі як прочитані"
            >
              <CheckCheck size={16} />
            </button>
          )}
          <button 
            onClick={deleteAllRead}
            className={styles.deleteAllButton}
            title="Видалити всі прочитані"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Список повідомлень */}
      <div className={styles.notificationsList}>
        {loading && notifications.length === 0 ? (
          <div className={styles.loadingMessage}>
            Завантаження...
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyMessage}>
            Немає повідомлень
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`${styles.notificationItem} ${
                  !notification.isRead ? styles.unread : ''
                }`}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className={styles.notificationBody}>
                    <div className={styles.notificationTop}>
                      <h4 className={styles.notificationTitle}>
                        {notification.title}
                      </h4>
                      
                      <div className={styles.notificationActions}>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className={styles.markReadButton}
                            title="Позначити як прочитане"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className={styles.deleteButton}
                          title="Видалити повідомлення"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    
                    <div className={styles.notificationBottom}>
                      <span className={styles.notificationDate}>
                        {formatDate(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <div className={styles.unreadDot}></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Кнопка "Завантажити більше" */}
            {hasMore && (
              <div className={styles.loadMoreSection}>
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className={styles.loadMoreButton}
                >
                  {loading ? 'Завантаження...' : 'Завантажити більше'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Основний компонент Header
const Header = () => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Отримання токену
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

  // Завантаження кількості непрочитаних повідомлень
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`, config);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Помилка при отриманні кількості повідомлень:', error);
    }
  };

  useEffect(() => {
    if (getToken()) {
      fetchUnreadCount();
      
      // Оновлення кожні 30 секунд
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const handleUnreadCountChange = (newCount) => {
    setUnreadCount(newCount);
  };

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
          {/* Кнопка повідомлень */}
          <div className={styles.notificationContainer}>
            <button 
              onClick={toggleNotifications}
              className={styles.iconButton}
            >
              <div className={styles.notificationWrapper}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </button>
            
            {/* Випадаюче меню повідомлень */}
            <NotificationsDropdown 
              isOpen={isNotificationsOpen}
              onClose={closeNotifications}
              unreadCount={unreadCount}
              onUnreadCountChange={handleUnreadCountChange}
            />
          </div>
          
          {/* Кнопка профілю */}
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