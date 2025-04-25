import React, { useState, useEffect } from 'react';
import { CreditCard, Building, ExternalLink, X, AlertCircle, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';
import axios from 'axios';

const BankConnection = ({ onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectedBanks, setConnectedBanks] = useState([]);
  const [showPrivatbankForm, setShowPrivatbankForm] = useState(false);
  const [showMobileAuthForm, setShowMobileAuthForm] = useState(false);
  const [privatbankForm, setPrivatbankForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [mobileAuthForm, setMobileAuthForm] = useState({
    phoneNumber: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);

  // Отримуємо список підключених банків
  const fetchConnectedBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || ''}/api/banks`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setConnectedBanks(response.data);
    } catch (err) {
      console.error('Помилка отримання підключених банків:', err);
      setError('Не вдалося отримати список підключених банків');
    } finally {
      setLoading(false);
    }
  };

  // Завантажуємо банки при монтуванні компонента
  useEffect(() => {
    fetchConnectedBanks();
  }, []);

  // Ініціюємо процес підключення Монобанку
  const connectMonobank = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || ''}/api/banks/monobank/init`,
        {
          redirectUrl: `${window.location.origin}/dashboard`
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Відкриваємо URL для авторизації в новій вкладці
      window.open(response.data.authUrl, '_blank');
    } catch (err) {
      console.error('Помилка підключення Монобанку:', err);
      setError('Не вдалося ініціювати підключення Монобанку');
    } finally {
      setLoading(false);
    }
  };

  // Додаємо карту ПриватБанку
  const addPrivatbankCard = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${process.env.REACT_APP_API_URL || ''}/api/banks/privatbank/add`,
        privatbankForm,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Очищаємо форму і закриваємо її
      setPrivatbankForm({
        cardNumber: '',
        expiry: '',
        cvv: ''
      });
      setShowPrivatbankForm(false);
      
      // Оновлюємо список підключених банків
      fetchConnectedBanks();
      
      // Викликаємо колбек для оновлення основного компонента
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Помилка додавання карти ПриватБанку:', err);
      setError(err.response?.data?.message || 'Не вдалося додати карту ПриватБанку');
    } finally {
      setLoading(false);
    }
  };

  // Відключаємо банківський рахунок
  const disconnectBank = async (accountId) => {
    try {
      if (!window.confirm('Ви впевнені, що хочете відключити цей банк?')) {
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${process.env.REACT_APP_API_URL || ''}/api/banks/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Оновлюємо список підключених банків
      fetchConnectedBanks();
      
      // Викликаємо колбек для оновлення основного компонента
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Помилка відключення банку:', err);
      setError('Не вдалося відключити банк');
    } finally {
      setLoading(false);
    }
  };

  // Обробники зміни полів форми ПриватБанку
  const handlePrivatbankFormChange = (e) => {
    const { name, value } = e.target;
    
    // Форматуємо номер карти (4 цифри - пробіл)
    if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '') // видаляємо всі пробіли
        .replace(/\D/g, '') // залишаємо тільки цифри
        .slice(0, 16) // обмежуємо 16 цифрами
        .replace(/(\d{4})(?=\d)/g, '$1 '); // додаємо пробіли після кожних 4 цифр
      
      setPrivatbankForm(prev => ({ ...prev, [name]: formatted }));
    } 
    // Форматуємо термін дії (MM/YY)
    else if (name === 'expiry') {
      const formatted = value
        .replace(/\D/g, '') // залишаємо тільки цифри
        .slice(0, 4) // обмежуємо 4 цифрами
        .replace(/(\d{2})(?=\d)/g, '$1/'); // додаємо / після перших 2 цифр
      
      setPrivatbankForm(prev => ({ ...prev, [name]: formatted }));
    } 
    // Обмежуємо CVV до 3 цифр
    else if (name === 'cvv') {
      const formatted = value
        .replace(/\D/g, '') // залишаємо тільки цифри
        .slice(0, 3); // обмежуємо 3 цифрами
      
      setPrivatbankForm(prev => ({ ...prev, [name]: formatted }));
    } else {
      setPrivatbankForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Обробники зміни полів форми мобільної авторизації
  const handleMobileAuthFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Форматування номеру телефону: +380 XX XXX XX XX
      const formatted = value
        .replace(/\D/g, '') // залишаємо тільки цифри
        .slice(0, 12) // обмежуємо 12 цифрами
        .replace(/^(\d{3})(?=\d)/g, '$1 ') // додаємо пробіл після коду країни
        .replace(/^(\d{3} \d{2})(?=\d)/g, '$1 ') // додаємо пробіл після коду оператора
        .replace(/^(\d{3} \d{2} \d{3})(?=\d)/g, '$1 '); // додаємо пробіл після перших 3 цифр номеру
      
      setMobileAuthForm(prev => ({ ...prev, [name]: formatted }));
    } 
    else if (name === 'otp') {
      // Обмежуємо OTP до 6 цифр
      const formatted = value
        .replace(/\D/g, '') // залишаємо тільки цифри
        .slice(0, 6); // обмежуємо 6 цифрами
      
      setMobileAuthForm(prev => ({ ...prev, [name]: formatted }));
    } else {
      setMobileAuthForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Ініціювати мобільну авторизацію
  const initiateMobileAuth = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Отримуємо тільки цифри з номеру телефону
      const phoneNumber = mobileAuthForm.phoneNumber.replace(/\D/g, '');
      
      await axios.post(
        `${process.env.REACT_APP_API_URL || ''}/api/auth/mobile/send-otp`,
        { phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setOtpSent(true);
      setAuthInProgress(true);
    } catch (err) {
      console.error('Помилка відправки OTP:', err);
      setError(err.response?.data?.message || 'Не вдалося відправити код підтвердження');
    } finally {
      setLoading(false);
    }
  };

  // Підтвердити мобільну авторизацію з OTP
  const verifyMobileAuth = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Отримуємо тільки цифри з номеру телефону
      const phoneNumber = mobileAuthForm.phoneNumber.replace(/\D/g, '');
      
      await axios.post(
        `${process.env.REACT_APP_API_URL || ''}/api/auth/mobile/verify-otp`,
        { 
          phoneNumber,
          otp: mobileAuthForm.otp 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Скидаємо форму і закриваємо її
      setMobileAuthForm({
        phoneNumber: '',
        otp: ''
      });
      setOtpSent(false);
      setAuthInProgress(false);
      setShowMobileAuthForm(false);
      
      // Оновлюємо список підключених банків, оскільки після авторизації можуть з'явитися нові
      fetchConnectedBanks();
      
      // Викликаємо колбек для оновлення основного компонента
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Помилка перевірки OTP:', err);
      setError(err.response?.data?.message || 'Невірний код підтвердження');
    } finally {
      setLoading(false);
    }
  };

  // Скасувати мобільну авторизацію
  const cancelMobileAuth = () => {
    setMobileAuthForm({
      phoneNumber: '',
      otp: ''
    });
    setOtpSent(false);
    setAuthInProgress(false);
    setShowMobileAuthForm(false);
  };

  // Перевіряємо статус авторизації (для мобільного застосунку)
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || ''}/api/auth/mobile/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.status === 'authorized') {
        // Успішна авторизація, скидаємо стан
        setAuthInProgress(false);
        setShowMobileAuthForm(false);
        
        // Оновлюємо список підключених банків
        fetchConnectedBanks();
        
        // Викликаємо колбек для оновлення основного компонента
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (err) {
      console.error('Помилка перевірки статусу авторизації:', err);
    } finally {
      setLoading(false);
    }
  };

  // Встановлюємо інтервал для перевірки статусу авторизації
  useEffect(() => {
    let interval;
    
    if (authInProgress) {
      interval = setInterval(checkAuthStatus, 3000); // Перевіряємо кожні 3 секунди
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [authInProgress]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Підключені банки</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Список підключених банків */}
      {connectedBanks.length > 0 ? (
        <div className="space-y-3 mb-6">
          {connectedBanks.map(bank => (
            <div key={bank.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {bank.type === 'monobank' ? (
                  <Building className="w-5 h-5 mr-3 text-gray-600" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                )}
                <div>
                  <div className="font-medium">
                    {bank.name}
                    {bank.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-1 inline" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bank.maskedNumber || bank.description}
                  </div>
                </div>
              </div>
              <button
                onClick={() => disconnectBank(bank.id)}
                className="text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 mb-6">
          {loading ? 'Завантаження банків...' : 'Немає підключених банків'}
        </div>
      )}
      
      {/* Кнопки для підключення банків */}
      <div className="space-y-3">
        <button
          className="w-full flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
          onClick={connectMonobank}
          disabled={loading}
        >
          <Building className="w-5 h-5 mr-2" />
          <span>Підключити Монобанк</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </button>
        
        <button
          className="w-full flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          onClick={() => setShowPrivatbankForm(true)}
          disabled={loading || showPrivatbankForm}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          <span>Додати карту ПриватБанку</span>
        </button>
        
        <button
          className="w-full flex items-center justify-center bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 disabled:bg-gray-300"
          onClick={() => setShowMobileAuthForm(true)}
          disabled={loading || showMobileAuthForm}
        >
          <Smartphone className="w-5 h-5 mr-2" />
          <span>Авторизуватися через мобільний застосунок</span>
        </button>
        
        <button
          className="w-full flex items-center justify-center text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 disabled:text-gray-300"
          onClick={fetchConnectedBanks}
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span>Оновити список</span>
        </button>
      </div>
      
      {/* Форма для додавання карти ПриватБанку */}
      {showPrivatbankForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Додати карту ПриватБанку</h3>
              <button
                onClick={() => setShowPrivatbankForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={addPrivatbankCard}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Номер карти
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={privatbankForm.cardNumber}
                  onChange={handlePrivatbankFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Термін дії
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={privatbankForm.expiry}
                    onChange={handlePrivatbankFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    value={privatbankForm.cvv}
                    onChange={handlePrivatbankFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="***"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrivatbankForm(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Скасувати
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                  disabled={loading}
                >
                  {loading ? 'Додаємо...' : 'Додати карту'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Форма для мобільної авторизації */}
      {showMobileAuthForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Авторизація через мобільний застосунок</h3>
              <button
                onClick={cancelMobileAuth}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!otpSent ? (
              <form onSubmit={initiateMobileAuth}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Номер телефону
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={mobileAuthForm.phoneNumber}
                    onChange={handleMobileAuthFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+380 XX XXX XX XX"
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={cancelMobileAuth}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Скасувати
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
                    disabled={loading}
                  >
                    {loading ? 'Відправляємо...' : 'Відправити код'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={verifyMobileAuth}>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Код підтвердження надіслано на номер {mobileAuthForm.phoneNumber}
                  </p>
                  
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Код підтвердження
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={mobileAuthForm.otp}
                    onChange={handleMobileAuthFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                    placeholder="______"
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={cancelMobileAuth}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Скасувати
                  </button>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
                    disabled={loading}
                  >
                    {loading ? 'Перевіряємо...' : 'Підтвердити'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankConnection;