import React, { useState } from "react";
import Cookies from 'js-cookie';
import './LoginUI.css';
import { UserLoginController } from "../controller/UserAuthController";
import Swal from 'sweetalert2';

function LoginUI() {
    const [userProfile, setUserProfile] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        if (userProfile === "") {
            Swal.fire({
                position: "center",
                title: 'Invalid Input',
                icon: 'error',
                text: 'Please select user profile.',
                confirmButtonText: 'OK',
                timer: 1500
            });
        } else if (email === "" || password === "") {
            Swal.fire({
                position: "center",
                title: 'Invalid Input',
                icon: 'error',
                text: 'Please fill up email/password.',
                confirmButtonText: 'OK',
                timer: 1500
            });
        } else {
            const userLoginController = new UserLoginController();
            const loginSuccess = await userLoginController.authenticateLogin(email, password, userProfile);
            // Inside handleLogin function
        if (loginSuccess) {
            Swal.fire({
                position: "center",
                title: 'Login Successful',
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 1500
            }).then(() => {
                Cookies.set('email', email);
                Cookies.set('userProfile', userProfile);
                if (userProfile === "UserAdmin") {
                    window.location.href = "/usermanagement";  // Changed to use location.href
                } else {
                    window.location.href = "/";
                }
            });
        } else {
                Swal.fire({
                    position: "center",
                    title: 'Login Failed',
                    icon: 'error',
                    text: 'Invalid email/password or account suspended.',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    return (
        <body>
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>Home Cleaning Service</h1>
                    <p>Welcome back! Please login to your account.</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="loginAs">Select Role</label>
                        <select
                            id="loginAs"
                            value={userProfile}
                            onChange={(e) => setUserProfile(e.target.value)}
                            className="form-control"
                        >
                            <option value="">Select your role</option>
                            <option value="UserAdmin">User Administrator</option>
                            <option value="Cleaner">Cleaner</option>
                            <option value="HomeOwner">Home Owner</option>
                            <option value="PlatformManager">Platform Manager</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
            </div>
        </div>
        </body>
    );
}

export default LoginUI;