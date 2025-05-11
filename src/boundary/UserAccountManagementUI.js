import React, { useState, useEffect } from "react";
// import all the controllers for User Account Management
import {
  AdminAccountController,
  CreateUserAccountController,
  ViewUserAccountController
} from "../controller/AdminAccountController";
import { UserLogoutController } from "../controller/UserAuthController";
import { Util } from "../Util";
import Cookies from "js-cookie";
import "./UserAccountManagementUI.css";
import Swal from 'sweetalert2';

function UserAccountManagementUI() {
  const [userList, setUserList] = useState([]);
  const [emailFilter, setEmailFilter] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const activeUser = Cookies.get("username");

  useEffect(() => {
    // initial fetch of all users
    loadUsers();
    loadRoles();
  }, []);

  // Only let user admins access this page
  if (Cookies.get("userProfile") !== "UserAdmin") {
    window.open("/", "_self");
  }

  const loadUsers = async () => {
    const controller = new ViewUserAccountController();
    const data = await controller.getAllUsers();
    setUserList(data || []);
  };

  const loadRoles = async () => {
    const snapshot = await Util.getUserProfiles();
    if (snapshot) {
      const roles = snapshot.docs.map(doc => doc.data().profileName);
      setRoleOptions(roles);
    }
  };

  const runSearch = async () => {
    if (!emailFilter.trim()) {
      loadUsers(); // reset back to full list
      return;
    }

    const controller = new AdminAccountController();
    const found = await controller.searchUserAccount(emailFilter);

    if (!found) {
      Swal.fire({
        icon: 'info',
        title: 'No Results',
        text: "Couldn't find any user with this email."
      });
      setUserList([]);
      return;
    }

    setUserList(Array.isArray(found) ? found : [found]);
  };

  const triggerCreateForm = () => {
    Swal.fire({
      title: 'Create Account',
      width: 800,
      html: `
        <div class="uam-wrapper">
          <div class="item">
            <label>First Name</label>
            <input type="text" id="firstName" class="swal2-input" placeholder="John">
          </div>
          <div class="item">
            <label>Last Name</label>
            <input type="text" id="lastName" class="swal2-input" placeholder="Doe">
          </div>
          <div class="item">
            <label>Password</label>
            <input type="password" id="password" class="swal2-input" placeholder="••••••••">
          </div>
          <div class="item">
            <label>Phone</label>
            <input type="text" id="phoneNumber" class="swal2-input" placeholder="e.g., 1234567890">
          </div>
          <div class="item">
            <label>Email</label>
            <input type="email" id="email" class="swal2-input" placeholder="user@example.com">
          </div>
          <div class="item full-width">
            <label>User Profile</label>
            <select id="userProfile" class="swal2-select">
              <option value="">Choose role</option>
              ${roleOptions.map(role => `<option value="${role}">${role}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Create',
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const payload = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          password: document.getElementById('password').value,
          phoneNumber: document.getElementById('phoneNumber').value,
          email: document.getElementById('email').value,
          userProfile: document.getElementById('userProfile').value
        };

        if (!payload.firstName || !payload.lastName || !payload.password ||
            !payload.phoneNumber || !payload.email || !payload.userProfile) {
          Swal.showValidationMessage('Please fill in all required fields.');
          return false;
        }
        if (/\s/.test(payload.email)) {
          Swal.showValidationMessage('Email cannot contain spaces.');
          return false;
        }
        return payload;
      }
    }).then(handleNewAccount);
  };

  const handleNewAccount = async (result) => {
    if (!result.isConfirmed) return;

    const data = result.value;
    const controller = new CreateUserAccountController();
    const created = await controller.createUserAccount(
      data.firstName,
      data.lastName,
      data.password,
      data.phoneNumber,
      data.email,
      data.userProfile
    );

    if (created === 'DUPLICATE_EMAIL') {
      Swal.fire('Error!', 'Email already exists. Please use a different email.', 'error');
    } else if (created === 'DUPLICATE_PHONE') {
      Swal.fire('Error!', 'Phone number already exists. Please use a different phone number.', 'error');
    } else if (created) {
      Swal.fire('Success!', 'New user created.', 'success');
      loadUsers();
    } else {
      Swal.fire('Error!', "Couldn't create the account.", 'error');
    }
  };

  const handleLogout = async () => {
    const ctrl = new UserLogoutController();
    const didLogout = await ctrl.logout();
    if (didLogout) {
      window.open("/", "_self");
    }
  };

  const launchUpdateModal = (user) => {
    Swal.fire({
      title: 'Edit Account Details',
      width: 800,
      html: `
        <div class="uam-wrapper">
          <div class="item">
            <label>First Name</label>
            <input id="firstName" class="swal2-input" value="${user.firstName}">
          </div>
          <div class="item">
            <label>Last Name</label>
            <input id="lastName" class="swal2-input" value="${user.lastName}">
          </div>
          <div class="item">
            <label>Password</label>
            <input id="password" class="swal2-input" value="${user.password}">
          </div>
          <div class="item">
            <label>Phone</label>
            <input id="phoneNumber" class="swal2-input" value="${user.phoneNumber || ''}">
          </div>
          <div class="item">
            <label>Email</label>
            <input id="email" class="swal2-input" value="${user.email}" disabled>
          </div>
          <div class="item full-width">
            <label>User Profile</label>
            <select id="userProfile" class="swal2-select">
              ${roleOptions.map(role => `<option value="${role}" ${user.userProfile === role ? 'selected' : ''}>${role}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      confirmButtonText: 'Update',
      showCancelButton: true,
      preConfirm: () => {
        const data = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          password: document.getElementById('password').value,
          phoneNumber: document.getElementById('phoneNumber').value,
          email: document.getElementById('email').value,
          userProfile: document.getElementById('userProfile').value
        };

        if (!data.firstName || !data.lastName || !data.password ||
            !data.phoneNumber || !data.userProfile) {
          Swal.showValidationMessage('Fill everything out!');
          return false;
        }
        return data;
      }
    }).then(applyUpdate);
  };

  const applyUpdate = async (result) => {
    if (!result.isConfirmed) return;

    const update = result.value;
    const ctrl = new AdminAccountController();
    const ok = await ctrl.updateUserAccount(
      update.firstName,
      update.lastName,
      update.password,
      update.phoneNumber,
      update.email,
      update.userProfile
    );

    if (ok) {
      Swal.fire('Updated!', 'User info saved.', 'success');
      loadUsers();
    } else {
      Swal.fire('Error!', "Update didn't go through.", 'error');
    }
  };

  const goBack = () => {
    window.open("/usermanagement", "_self");
  };

  const handleSuspend = async (email) => {
    const ctrl = new AdminAccountController();
    const didSuspend = await ctrl.suspendUserAccount(email);
    if (didSuspend) {
      Swal.fire('Success!', 'User suspended Successfully.', 'success');
      loadUsers();
    } else {
      Swal.fire('Error!', "Couldn't suspend the user.", 'error');
    }
  };

  return (
    <div className="uam-container">
      <div className="uam-header">
        <div className="uam-header-left">
          <button onClick={goBack} className="uam-back-button">← Back</button>
          <h1>Accounts Management</h1>
        </div>
        <div className="uam-user-controls">
          <span>{activeUser}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="uam-search-section">
        <div className="uam-search-bar">
          <input
            type="text"
            placeholder="Search by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          />
          <button onClick={runSearch}>Search</button>
        </div>
        <button onClick={triggerCreateForm}>+ Create User</button>
      </div>

      <div className="uam-user-list">
        <div className="uam-list-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Action</span>
        </div>
        {userList.map((usr) => (
          <div key={usr.email} className="uam-list-row">
            <span>{`${usr.firstName} ${usr.lastName}`}</span>
            <span>{usr.email}</span>
            <span>{usr.userProfile}</span>
            <div className="uam-action-buttons">
              <button onClick={() => launchUpdateModal(usr)} className="uam-modify-button">Edit</button>
              <button onClick={() => handleSuspend(usr.email)} className="uam-suspend-button">Suspend</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserAccountManagementUI;
