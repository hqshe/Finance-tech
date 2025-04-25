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
    // Стани для реєстрації
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

    // Обробник логіну
const handleLogin = async (e) => {
    e.preventDefault();

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

        // Додаємо перевірку успішності запиту
        if (res.ok) {
            const data = await res.json();
            
            // Можна зберегти токен аутентифікації або інформацію про користувача в localStorage
            localStorage.setItem('token', data.token); // якщо ваш API повертає токен
            
            // Перенаправлення на сторінку Home
            navigate('/home'); // або інший шлях, залежно від структури маршрутизації
        } else {
            // Обробляємо помилку аутентифікації
            const errorData = await res.json();
            alert(errorData.message || 'Помилка входу в систему');
        }
    } catch (error) {
        console.error('Помилка логіну', error);
        alert('Сталася помилка під час з\'єднання з сервером');
    }
};

    // Обробник реєстрації
    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerPassword !== registerConfirmPassword) {
            alert('Паролі не співпадають!');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/register', { // <- заміни шлях якщо інший
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
            console.log(data);

            if (res.ok) {
                alert('Реєстрація успішна!');
                setIsActive(false); // Переключаємо на форму логіну
            } else {
                alert(data.message || 'Помилка при реєстрації');
            }
        } catch (error) {
            console.error('Помилка реєстрації', error);
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
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                    </div>
                    <div className={LoginCss.forgotLink}>
                        <a href="#">Forgot password?</a>
                    </div>
                    <button type="submit" className={LoginCss.btn}>Login</button>
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
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={LoginCss.btn}>Register</button>
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
