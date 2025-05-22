import { BsGithub, BsGoogle, BsFacebook } from "react-icons/bs";
import LoginCss from "../styles/Login.module.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [isActive, setIsActive] = useState(false);

    // Стани для логіну
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    
    // Стани для реєстрації
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);

    // Обробник логіну з підтримкою 2FA
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Перевіряємо чи потрібна 2FA
                if (data.requires2FA) {
                    // Перенаправляємо на сторінку 2FA з необхідними даними
                    navigate('/two-factor-auth', {
                        state: {
                            tempToken: data.tempToken,
                            phoneHint: data.phoneHint
                        }
                    });
                } else {
                    // Звичайний логін без 2FA
                    localStorage.setItem('token', data.token);
                    navigate('/home');
                }
            } else {
                alert(data.message || 'Помилка входу в систему');
            }
        } catch (error) {
            console.error('Помилка логіну', error);
            alert('Сталася помилка під час з\'єднання з сервером');
        } finally {
            setLoginLoading(false);
        }
    };

    // Обробник реєстрації
    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerPassword !== registerConfirmPassword) {
            alert('Паролі не співпадають!');
            return;
        }

        setRegisterLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: registerName,
                    email: registerEmail,
                    password: registerPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Реєстрація успішна! Тепер ви можете увійти в систему.');
                setIsActive(false); // Переключаємо на форму логіну
                
                // Очищуємо поля реєстрації
                setRegisterName('');
                setRegisterEmail('');
                setRegisterPassword('');
                setRegisterConfirmPassword('');
            } else {
                alert(data.message || 'Помилка при реєстрації');
            }
        } catch (error) {
            console.error('Помилка реєстрації', error);
            alert('Сталася помилка під час з\'єднання з сервером');
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <div className={`${LoginCss.container} ${isActive ? LoginCss.active : ""}`}>
            <div className={`${LoginCss["form-box"]} ${LoginCss.login}`}>
                <form onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            disabled={loginLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            disabled={loginLoading}
                        />
                    </div>
                    <div className={LoginCss.forgotLink}>
                        <a href="#">Forgot password?</a>
                    </div>
                    <button 
                        type="submit" 
                        className={`${LoginCss.btn} ${loginLoading ? LoginCss.loading : ''}`}
                        disabled={loginLoading}
                    >
                        {loginLoading ? 'Входимо...' : 'Login'}
                    </button>
                    <p>or login with social platforms</p>
                    <div className={LoginCss.socialIcons}>
                        <a href="#"><BsGithub /></a>
                        <a href="#"><BsGoogle /></a>
                        <a href="#"><BsFacebook /></a>
                    </div>
                </form>
            </div>

            <div className={`${LoginCss["form-box"]} ${LoginCss.register}`}>
                <form onSubmit={handleRegister}>
                    <h1>Register</h1>
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            disabled={registerLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            disabled={registerLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            disabled={registerLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            disabled={registerLoading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className={`${LoginCss.btn} ${registerLoading ? LoginCss.loading : ''}`}
                        disabled={registerLoading}
                    >
                        {registerLoading ? 'Реєструємо...' : 'Register'}
                    </button>
                    <p>or sign up with social platforms</p>
                    <div className={LoginCss.socialIcons}>
                        <a href="#"><BsGithub /></a>
                        <a href="#"><BsGoogle /></a>
                        <a href="#"><BsFacebook /></a>
                    </div>
                </form>
            </div>

            <div className={LoginCss["toggle-box"]}>
                <div className={`${LoginCss["toggle-panel"]} ${LoginCss["toggle-left"]}`}>
                    <h1>Welcome back!</h1>
                    <p>Don't have an account?</p>
                    <button className={LoginCss.btn} onClick={() => setIsActive(true)}>Register</button>
                </div>
                <div className={`${LoginCss["toggle-panel"]} ${LoginCss["toggle-right"]}`}>
                    <h1>Hello, Welcome</h1>
                    <p>Already have an account?</p>
                    <button className={LoginCss.btn} onClick={() => setIsActive(false)}>Login</button>
                </div>
            </div>
        </div>
    );
}