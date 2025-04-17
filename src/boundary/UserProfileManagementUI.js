import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./UserProfileManagementUI.css";
import { Util } from "../Util";
import { UserLogoutController } from "../controller/UserAuthController";
import { 
    UAViewUserProfileController, 
    UACreateUserProfileController, 
    UAUpdateUserProfileController, 
    UASearchUserProfileController, 
    UASuspendUserProfileController 
} from "../controller/AdminProfileController";

import Swal from 'sweetalert2';

function UserProfileManagementUI() {
    const [currentUser] = useState(Cookies.get("username"));
    const [userProfiles, setUserProfiles] = useState([]);

    const fetchUserProfiles = async () => {
        const snapshot = await Util.getUserProfiles();
        if (snapshot !== null) {
            const userData = snapshot.docs.map(doc => ({
                profileName: doc.data().profileName,
                description: doc.data().description,
                profileType: doc.data().profileType,
                suspended: doc.data().suspended
            }));
            setUserProfiles(userData);
        }
    };

    useEffect(() => {
        fetchUserProfiles();
    }, []);

    if (Cookies.get("userProfile") !== "UserAdmin") {
        window.open("/", "_self");
    }

    const profileTypes = [
        { value: "UserAdmin", label: "User Admin" },
        { value: "Cleaner", label: "Cleaner" },
        { value: "HomeOwner", label: "Home Owner" },
        { value: "PlatformManager", label: "Platform Management" }
    ];

    const createUserProfile = () => {
        Swal.fire({
            title: 'Create User Profile',
            html: `
                <div class="upm-wrapper">
                    <div class="item">
                        <label>Profile Name</label>
                        <input type="text" id="profileName" class="swal2-input" placeholder="Profile Name">
                    </div>
                    <div class="item">
                        <label>Description</label>
                        <input type="text" id="description" class="swal2-input" placeholder="Description">
                    </div>
                    <div class="item">
                        <label>Type</label>
                        <select id="profileType" class="swal2-select">
                            <option value="">Select Type</option>
                            ${profileTypes.map(type => 
                                `<option value="${type.value}">${type.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            `,
            confirmButtonText: 'Create',
            showCancelButton: true,
            focusConfirm: false,
            preConfirm: () => {
                const profileName = document.getElementById('profileName').value;
                const description = document.getElementById('description').value;
                const profileType = document.getElementById('profileType').value;

                if (!profileName || !description || !profileType) {
                    Swal.showValidationMessage('Invalid input. Please try again.');
                    return false;
                }
                return { profileName, description, profileType };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { profileName, description, profileType } = result.value;
                const uaCreateUserProfileController = new UACreateUserProfileController();
                const success = await uaCreateUserProfileController.createUserProfile(
                    profileName, description, profileType
                );

                if (success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Profile Created!',
                        showConfirmButton: true,
                    });
                    fetchUserProfiles();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Profile creation failed',
                        text: 'Please try again.',
                    });
                }
            }
        });
    };

    const viewUserProfile = async (profileName) => {
        const uaViewUserProfileController = new UAViewUserProfileController();
        const profileData = await uaViewUserProfileController.viewUserProfile(profileName);

        if (profileData) {
            Swal.fire({
                title: 'View User Profile',
                html: `
                    <div style="text-align: left; line-height: 1.5em;">
                        <strong>Profile Name:</strong> ${profileData.profileName}<br>
                        <strong>Description:</strong> ${profileData.description}<br>
                        <strong>Type:</strong> ${profileData.profileType}<br>
                        <strong>Status:</strong> ${profileData.suspended ? 'Suspended' : 'Active'}<br>
                    </div>
                `,
                showCancelButton: true,
                cancelButtonText: 'Close',
                confirmButtonText: 'Update Details',
                showDenyButton: true,
                denyButtonText: profileData.suspended ? 'Activate' : 'Suspend',
                focusConfirm: false
            }).then((result) => {
                if (result.isConfirmed) {
                    updateUserProfile(profileData);
                } else if (result.isDenied) {
                    suspendUserProfile(profileName);
                }
            });
        }
    };

    const updateUserProfile = (profileData) => {
        Swal.fire({
            title: 'Update User Profile',
            html: `
                <div class="upm-wrapper">
                    <div class="item">
                        <label>Profile Name</label>
                        <input type="text" id="profileName" class="swal2-input" value="${profileData.profileName}" disabled>
                    </div>
                    <div class="item">
                        <label>Description</label>
                        <input type="text" id="description" class="swal2-input" value="${profileData.description}">
                    </div>
                    <div class="item">
                        <label>Type</label>
                        <select id="profileType" class="swal2-select">
                            ${profileTypes.map(type => 
                                `<option value="${type.value}" ${profileData.profileType === type.value ? 'selected' : ''}>
                                    ${type.label}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            `,
            confirmButtonText: 'Update',
            showCancelButton: true,
            focusConfirm: false,
            preConfirm: () => {
                const profileName = document.getElementById('profileName').value;
                const description = document.getElementById('description').value;
                const profileType = document.getElementById('profileType').value;

                if (!description || !profileType) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                }
                return { profileName, description, profileType };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { profileName, description, profileType } = result.value;
                const uaUpdateUserProfileController = new UAUpdateUserProfileController();
                const success = await uaUpdateUserProfileController.updateUserProfile(
                    profileName, description, profileType
                );

                if (success) {
                    Swal.fire('Updated!', 'Profile has been updated.', 'success');
                    fetchUserProfiles();
                } else {
                    Swal.fire('Error!', 'Failed to update profile.', 'error');
                }
            }
        });
    };

    const suspendUserProfile = async (profileName) => {
        const uaSuspendUserProfileController = new UASuspendUserProfileController();
        const success = await uaSuspendUserProfileController.suspendUserProfile(profileName);

        if (success) {
            Swal.fire('Success!', 'Profile status has been updated.', 'success');
            fetchUserProfiles();
        } else {
            Swal.fire('Error!', 'Failed to update profile status.', 'error');
        }
    };

    const searchUserProfile = async () => {
        const searchName = document.getElementById('searchProfileName').value;
        if (!searchName.trim()) {
            await fetchUserProfiles();
            return;
        }
        
        const uaSearchUserProfileController = new UASearchUserProfileController();
        const searchResult = await uaSearchUserProfileController.searchUserProfile(searchName);

        if (!searchResult) {
            Swal.fire('No Results', 'No profiles found.', 'info');
            return;
        }

        setUserProfiles(searchResult);
    };

    const handleLogout = async () => {
        const userAuthController = new UserLogoutController();
        const logout = await userAuthController.logout();
        if (logout) {
            window.open("/", "_self");
        }
    };

    const handleBack = () => {
        window.open("/usermanagement", "_self");
    };

    return (
        <div className="upm-container">
            <div className="upm-header">
                <div className="upm-header-left">
                    <button onClick={handleBack} className="upm-back-button">
                        Back
                    </button>
                    <h1>CS User Profile Management</h1>
                </div>
                <div className="upm-user-controls">
                    <span>{currentUser}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="upm-search-section">
                <div className="upm-search-bar">
                    <input
                        id="searchProfileName"
                        type="text"
                        placeholder="Profile Name"
                        className="upm-search-input"
                    />
                    <button onClick={searchUserProfile}>Search</button>
                </div>
                <button onClick={createUserProfile}>Create user profile</button>
            </div>

            <div className="upm-profile-list">
                <div className="upm-list-header">
                    <span>Profile Name</span>
                    <span>Description</span>
                    <span>Type</span>
                    <span>Action</span>
                </div>
                {userProfiles.map((profile) => (
                    <div key={profile.profileName} className="upm-list-row">
                        <span>{profile.profileName}</span>
                        <span>{profile.description}</span>
                        <span>{profile.profileType}</span>
                        <button onClick={() => viewUserProfile(profile.profileName)}>
                            Inspect
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserProfileManagementUI;