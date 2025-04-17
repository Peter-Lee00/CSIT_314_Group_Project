import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./UserAccountManagementUI.css";
import { UpdateUserAccountController } from "../controller/UpdateUserAccountController";
import { CreateUserAccountController } from "../controller/CreateUserAccountController";
import { SearchUserAccountController } from "../controller/SearchUserAccountController";
import { UserLogoutController } from "../controller/UserAuthController";
import Swal from 'sweetalert2';

function UserAccountManagementUI() {
    const [users, setUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const currentUser = Cookies.get("username");

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Redirect if not admin
    if (Cookies.get("userProfile") !== "UserAdmin") {
        window.open("/", "_self");
    }

    const fetchUsers = async () => {
        const controller = new CreateUserAccountController();
        const userList = await controller.getAllUsers();
        setUsers(userList || []);
    };

    const handleSearch = async () => {
        if (!searchEmail.trim()) {
            await fetchUsers();
            return;
        }

        const controller = new SearchUserAccountController();
        const result = await controller.searchUserAccount(searchEmail);

        if (!result) {
            Swal.fire({
                icon: 'info',
                title: 'No Results',
                text: 'No user account found matching the search criteria.',
            });
            setUsers([]); // Clear the list when no results found
            return;
        }

        setUsers(Array.isArray(result) ? result : [result]);
    };

    const handleCreateAccount = async (formData) => {
        const controller = new CreateUserAccountController();
        
        // Input validation
        if (/* !formData.username || */ !formData.firstName || !formData.lastName || 
            !formData.password || !formData.email || !formData.userProfile) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please try again.',
            });
            return;
        }

        const success = await controller.createUserAccount(
            /* formData.username, */
            formData.firstName,
            formData.lastName,
            formData.password,
            formData.phoneNumber,
            formData.email,
            formData.userProfile
        );

        if (success) {
            Swal.fire({
                icon: 'success',
                title: 'Account Created!',
                showConfirmButton: true,
            });
            setShowCreateForm(false);
            fetchUsers();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Account creation failed',
                text: 'Please try again.',
            });
        }
    };

    const handleLogout = async () => {
        const controller = new UserLogoutController();
        const success = await controller.logout();
        if (success) {
            window.open("/", "_self");
        }
    };

    const viewUserAccount = async (email) => {
        const user = users.find(u => u.email === email);
        if (user) {
            Swal.fire({
                title: 'View User Account',
                html: `
                    <div style="text-align: left; line-height: 1.5em;">
                        <strong>First Name:</strong> ${user.firstName}<br>
                        <strong>Last Name:</strong> ${user.lastName}<br>
                        <strong>Password:</strong> ${user.password}<br>
                        <strong>Phone:</strong> ${user.phoneNumber || 'N/A'}<br>
                        <strong>Email:</strong> ${user.email || 'N/A'}<br>
                        <strong>User Profile:</strong> ${user.userProfile}<br>
                    </div>
                `,
                showCancelButton: true,
                cancelButtonText: 'Close',
                confirmButtonText: 'Update Details',
                showDenyButton: true,
                denyButtonText: user.suspended ? 'Activate' : 'Suspend',
                focusConfirm: false
            }).then((result) => {
                if (result.isConfirmed) {
                    handleUpdateAccount(user);
                } else if (result.isDenied) {
                    // Suspend functionality
                }
            });
        }
    };
    
    const handleUpdateAccount = (user) => {
        Swal.fire({
            title: 'Update User Account',
            width: 800,
            html: `
                <div class="uam-wrapper" style="grid-template-columns: 1fr 1fr;">
                    <div class="item">
                        <label>First Name</label>
                        <input type="text" id="firstName" class="swal2-input" value="${user.firstName}">
                    </div>
                    <div class="item">
                        <label>Last Name</label>
                        <input type="text" id="lastName" class="swal2-input" value="${user.lastName}">
                    </div>
                    <div class="item">
                        <label>Password</label>
                        <input type="text" id="password" class="swal2-input" value="${user.password}">
                    </div>
                    <div class="item">
                        <label>Phone</label>
                        <input type="text" id="phoneNumber" class="swal2-input" value="${user.phoneNumber || ''}">
                    </div>
                    <div class="item">
                        <label>Email</label>
                        <input type="email" id="email" class="swal2-input" value="${user.email}" disabled>
                    </div>
                    <div class="item" style="grid-column: span 2">
                        <label>User Profile</label>
                        <select id="userProfile" class="swal2-select">
                            <option value="PlatformAdmin" ${user.userProfile === 'PlatformAdmin' ? 'selected' : ''}>Platform Admin</option>
                            <option value="Cleaner" ${user.userProfile === 'Cleaner' ? 'selected' : ''}>Cleaner</option>
                            <option value="HomeOwner" ${user.userProfile === 'HomeOwner' ? 'selected' : ''}>Home Owner</option>
                        </select>
                    </div>
                </div>
            `,
            confirmButtonText: 'Update',
            showCancelButton: true,
            focusConfirm: false,
            preConfirm: () => {
                const firstName = document.getElementById('firstName').value;
                const lastName = document.getElementById('lastName').value;
                const password = document.getElementById('password').value;
                const phoneNumber = document.getElementById('phoneNumber').value;
                const email = document.getElementById('email').value;
                const userProfile = document.getElementById('userProfile').value;

                if (!firstName || !lastName || !password || !phoneNumber || !email || !userProfile) {
                    Swal.showValidationMessage('All fields must be filled');
                    return false;
                }
                return { firstName, lastName, password, phoneNumber, email, userProfile };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updateData = result.value;
                const controller = new UpdateUserAccountController();
                const success = await controller.updateUserAccount(
                    updateData.firstName,
                    updateData.lastName,
                    updateData.password,
                    updateData.phoneNumber,
                    updateData.email,
                    updateData.userProfile
                );

                if (success) {
                    Swal.fire('Updated!', 'Account details have been updated.', 'success');
                    fetchUsers(); // Refresh the user list
                } else {
                    Swal.fire('Error!', 'Failed to update account details.', 'error');
                }
            }
        });
    };

    const handleBack = () => {
        window.open("/usermanagement", "_self");
    };

    return (
        <div className="uam-container">
            <div className="uam-header">
                <div className="uam-header-left">
                    <button onClick={handleBack} className="uam-back-button">
                        Back
                    </button>
                    <h1>CS User Account Management</h1>
                </div>
                <div className="uam-user-controls">
                    <span>{currentUser}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="uam-search-section">
                <div className="uam-search-bar">
                    <input
                        type="text"
                        placeholder="Email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>
                <button onClick={() => setShowCreateForm(true)}>Create an account</button>
            </div>

            {showCreateForm && (
                <div className="uam-modal-overlay">
                    <div className="uam-create-form">
                        <h2>Create User Account</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = {
                                firstName: e.target.firstName.value,
                                lastName: e.target.lastName.value,
                                /* username: e.target.username.value, */
                                password: e.target.password.value,
                                phoneNumber: e.target.phone.value,
                                email: e.target.email.value,
                                userProfile: e.target.userProfile.value
                            };
                            handleCreateAccount(formData);
                        }}>
                            <div className="uam-form-row">
                                <input name="firstName" placeholder="First Name" required />
                                <input name="lastName" placeholder="Last Name" required />
                            </div>
                            {/* <input name="username" placeholder="Username" required /> */}
                            <input name="password" type="password" placeholder="Password" required />
                            <input name="phone" placeholder="Phone" required />
                            <input name="email" type="email" placeholder="Email" required />
                            <select name="userProfile" required>
                                <option value="">Select User Profile</option>
                                <option value="PlatformAdmin">Platform Admin</option>
                                <option value="Cleaner">Cleaner</option>
                                <option value="HomeOwner">Home Owner</option>
                            </select>
                            <div className="uam-form-buttons">
                                <button type="submit">Create</button>
                                <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="uam-user-list">
                <div className="uam-list-header">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Profile</span>
                    <span>Action</span>
                </div>
                {users.map((user) => (
                <div key={user.email} className="uam-list-row">
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                    <span>{user.email}</span>
                    <span>{user.userProfile}</span>
                    <button 
                        onClick={() => viewUserAccount(user.email)} 
                        className="uam-modify-button"
                    >
                        Modify
                    </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserAccountManagementUI;