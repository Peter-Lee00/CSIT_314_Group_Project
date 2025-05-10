import React, { useState } from "react";
import Cookies from "js-cookie";
import './UserManagementUI.css';
import { UserLogoutController } from "../controller/UserAuthController";
import Swal from 'sweetalert2';

function UserManagementUI() {
    const [email] = useState(Cookies.get("email"));

    // Important: Check if user is admin, if not redirect
    if (Cookies.get("userProfile") !== "UserAdmin") {
        window.open("/", "_self");
    }

    const handleAccountManagement = () => {
        console.log("User Account Management");
        window.open("/useraccountmanagement", "_self");
    };

    const handleProfileManagement = () => {
        console.log("User Profile Management");
        window.open("/userprofilemanagement", "_self");
    };

    const handleLogout = async () => {
        const userAuthController = new UserLogoutController();
        const logout = await userAuthController.logout();
        if (logout) {
            Swal.fire({
                position: "center",
                title: 'Logout Successfully !',
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 1500
            }).then(() => {
                window.open("/", "_self");
            });
        }
    };

    return (
        <div>
        <div className="umContainer">
            <div className="umHeader">
                <div className="umUserInfo">
                    <img
                        src={"https://placehold.co/40x40?text=" + email}
                        alt="Profile"
                        className="umProfilePicture"
                    />
                    <span className="umUsername">{email}</span>
                </div>
                <button onClick={handleLogout} className="umLogoutButton">
                    Logout
                </button>
            </div>
            <div className="umButtonContainer">
                <button onClick={handleAccountManagement} className="umActionButton">
                    User Account Management
                </button>
                <button onClick={handleProfileManagement} className="umActionButton">
                    User Profile Management
                </button>
            </div>
        </div>
        </div>
    );
}

export default UserManagementUI;