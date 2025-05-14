import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './LoginUI.css';
import { UserLoginController } from "../controller/UserAuthController";
import Swal from 'sweetalert2'; 

function LoginUI() {
  const navigate = useNavigate();

  // Keeping track of form state – using controlled inputs
  const [selectedRole, setSelectedRole] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pwd, setPwd] = useState("");

  // Called when the login form is submitted
  const tryLogin = async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('profileType').value;

    // Map role to Firestore document ID
    const profileNameMap = {
      UserAdmin: "User Admin",
      Cleaner: "Cleaner",
      HomeOwner: "Home Owner",
      PlatformManager: "Platform Manager"
    };
    const profileDocId = profileNameMap[role];

    // Bare-minimum validation
    if (!role) {
      Swal.fire({
        title: 'Oops!',
        text: 'Please choose your role first!',
        icon: 'error',
        confirmButtonText: 'Will do'
      });
      return;
    }

    if (!email || !password) {
      Swal.fire({
        title: 'Missing Info',
        text: 'Both email and password are required.',
        icon: 'error',
        confirmButtonText: 'Alright'
      });
      return;
    }

    // Proceed to check with backend
    const auth = new UserLoginController();
    const success = await auth.authenticateLogin(email, password, role, profileDocId);

    if (success) {
      Swal.fire({
        title: 'Login Successfully !',
        icon: 'success',
        confirmButtonText: 'Okay',
        timer: 1500
      }).then(() => {
        // Navigate user based on their role
        switch (role) {
          case 'Cleaner':
            navigate('/cleaner/services');
            break;
          case 'UserAdmin':
            navigate('/usermanagement');
            break;
          case 'PlatformManager':
            navigate('/platformmanager/dashboard');
            break;
          case 'HomeOwner':
            navigate('/homeowner/dashboard');
            break;
          default:
            navigate('/');
        }
      });
    } else {
      switch (auth.lastError) {
        case 'INVALID_CREDENTIALS':
          Swal.fire({
            title: 'Login failed',
            text: 'Please check your email and password.',
            icon: 'error',
            confirmButtonText: 'Retry'
          });
          break;
        case 'INVALID_PROFILE':
          Swal.fire({
            title: 'Role Mismatch',
            text: "Access denied. Please check your role again.",
            icon: 'error',
            confirmButtonText: 'OK'
          });
          break;
        case 'SUSPENDED_ACCOUNT':
          Swal.fire({
            title: 'Account Suspended',
            text: "Your account has been suspended. Please contact the administrator.",
            icon: 'error',
            confirmButtonText: 'OK'
          });
          break;
        default:
          Swal.fire({
            title: 'Unexpected Error',
            text: 'Something went wrong. Please try again later.',
            icon: 'error',
            confirmButtonText: 'Alright'
          });
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Cleaning Services</h1>
          <p>Login to continue !</p>
        </div>

        <form className="login-form" onSubmit={tryLogin}>
          {/* Select role (required for login logic) */}
          <div className="form-group">
            <label htmlFor="profileType">Role</label>
            <select
              id="profileType"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-control"
            >
              <option value="">Select Role</option>
              <option value="UserAdmin">User Admin</option>
              <option value="Cleaner">Cleaner</option>
              <option value="HomeOwner">Home Owner</option>
              <option value="PlatformManager">Platform Manager</option>
            </select>
          </div>

          {/* Email input field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="form-control"
              placeholder="example@email.com"
            />
          </div>

          {/* Password input field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="form-control"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
      </div>
    </div>
  
    
  );
}

export default LoginUI;
