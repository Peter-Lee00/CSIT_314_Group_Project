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
  UASuspendUserProfileController,
  UADeleteUserProfileController
} from "../controller/AdminProfileController";
import Swal from 'sweetalert2';

function UserProfileManagementUI() {
  const [userProfiles, setUserProfiles] = useState([]);
  const [currentUser] = useState(Cookies.get("username"));

  useEffect(() => {
    // Grab all profiles at the start
    initProfiles();
  }, []);

  if (Cookies.get("userProfile") !== "UserAdmin") {
    window.location.href = "/"; // redirect if not authorized
  }

  const initProfiles = async () => {
    const snapshot = await Util.getUserProfiles();
    if (snapshot) {
      const allProfiles = snapshot.docs.map(doc => ({
        profileName: doc.data().profileName,
        description: doc.data().description,
        suspended: doc.data().suspended
      }));
      setUserProfiles(allProfiles);
    }
  };

  const openCreateModal = () => {
    Swal.fire({
      title: 'New Profile Setup',
      html: `
        <div class="upm-wrapper">
          <div class="item">
            <label>Profile Name</label>
            <input type="text" id="profileName" class="swal2-input" placeholder="e.g., AdminBasic">
          </div>
          <div class="item">
            <label>Description</label>
            <input type="text" id="description" class="swal2-input" placeholder="Short note about role">
          </div>
        </div>
      `,
      confirmButtonText: 'Create',
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('profileName').value;
        const desc = document.getElementById('description').value;
        if (!name || !desc) {
          Swal.showValidationMessage('Everything needs to be filled out!');
          return false;
        }
        return { profileName: name, description: desc };
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        const controller = new UACreateUserProfileController();
        const success = await controller.createUserProfile(
          res.value.profileName,
          res.value.description
        );
        if (success) {
          Swal.fire('Done!', 'Profile created successfully', 'success');
          initProfiles();
        } else {
          Swal.fire('Oops', 'Something went wrong creating the profile.', 'error');
        }
      }
    });
  };

  const handleSearch = async () => {
    const searchTerm = document.getElementById('searchProfileName').value;
    if (!searchTerm.trim()) {
      initProfiles();
      return;
    }

    const controller = new UASearchUserProfileController();
    const result = await controller.searchUserProfile(searchTerm);

    if (!result || result.length === 0) {
      Swal.fire('No matches', 'Try another name?', 'info');
      return;
    }

    setUserProfiles(result);
  };

  const handleView = async (profileName) => {
    const controller = new UAViewUserProfileController();
    const profile = await controller.viewUserProfile(profileName);

    if (profile) {
      Swal.fire({
        title: 'Profile Info',
        html: `
          <div style="text-align:left;line-height:1.6em;">
            <strong>Name:</strong> ${profile.profileName}<br>
            <strong>Description:</strong> ${profile.description}<br>
            <strong>Status:</strong> ${profile.suspended ? 'Suspended' : 'Active'}<br>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Edit',
        showDenyButton: true,
        denyButtonText: profile.suspended ? 'Activate' : 'Suspend'
      }).then((result) => {
        if (result.isConfirmed) {
          handleEdit(profile);
        } else if (result.isDenied) {
          handleToggleSuspend(profile.profileName);
        }
      });
    }
  };

  const handleEdit = (profile) => {
    Swal.fire({
      title: 'Edit Profile',
      html: `
        <div class="upm-wrapper">
          <div class="item">
            <label>Profile Name</label>
            <input type="text" id="profileName" class="swal2-input" value="${profile.profileName}" disabled>
          </div>
          <div class="item">
            <label>Description</label>
            <input type="text" id="description" class="swal2-input" value="${profile.description}">
          </div>
        </div>
      `,
      confirmButtonText: 'Save Changes',
      showCancelButton: true,
      preConfirm: () => {
        const desc = document.getElementById('description').value;

        if (!desc) {
          Swal.showValidationMessage("Don't leave fields empty.");
          return false;
        }

        return {
          profileName: profile.profileName,
          description: desc
        };
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        const controller = new UAUpdateUserProfileController();
        const updated = await controller.updateUserProfile(
          res.value.profileName,
          res.value.description
        );

        if (updated) {
          Swal.fire('Updated', 'Profile saved.', 'success');
          initProfiles();
        } else {
          Swal.fire('Error', 'Update failed.', 'error');
        }
      }
    });
  };

  const handleToggleSuspend = async (profileName) => {
    const controller = new UASuspendUserProfileController();
    const changed = await controller.suspendUserProfile(profileName);

    if (changed) {
      Swal.fire('Updated', 'Profile status changed.', 'success');
      initProfiles();
    } else {
      Swal.fire('Error', 'Could not change status.', 'error');
    }
  };

  const handleDelete = async (profileName) => {
    const result = await Swal.fire({
      title: 'Delete Role?',
      text: `Are you sure you want to delete the role "${profileName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      const controller = new UADeleteUserProfileController();
      const deleted = await controller.deleteUserProfile(profileName);
      if (deleted) {
        Swal.fire('Deleted!', 'Role deleted successfully.', 'success');
        initProfiles();
      } else {
        Swal.fire('Error', 'Failed to delete role.', 'error');
      }
    }
  };

  const logoutAndRedirect = async () => {
    const controller = new UserLogoutController();
    const didLogout = await controller.logout();
    if (didLogout) {
      window.location.href = "/";
    }
  };

  const goBack = () => {
    window.location.href = "/usermanagement";
  };

  return (
    <div className="upm-container">
      <div className="upm-header">
        <div className="upm-header-left">
          <button onClick={goBack} className="upm-back-button">← Back</button>
          <h1>Manage User Profiles</h1>
        </div>
        <div className="upm-user-controls">
          <span>{currentUser}</span>
          <button onClick={logoutAndRedirect}>Logout</button>
        </div>
      </div>

      <div className="upm-search-section">
        <div className="upm-search-bar">
          <input
            id="searchProfileName"
            type="text"
            placeholder="Search by name"
            className="upm-search-input"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <button onClick={openCreateModal}>+ Add New Profile</button>
      </div>

      <div className="upm-profile-list">
        <div className="upm-list-header">
          <span>Profile Name</span>
          <span>Description</span>
          <span>Action</span>
        </div>
        {userProfiles.map(profile => (
          <div key={profile.profileName} className="upm-list-row">
            <span>{profile.profileName}</span>
            <span>{profile.description}</span>
            <div style={{display:'flex',gap:'8px'}}>
            <button onClick={() => handleView(profile.profileName)}>Edit</button>
              <button onClick={() => handleDelete(profile.profileName)} style={{background:'#e53935',color:'#fff',border:'none',borderRadius:'4px',padding:'6px 12px',cursor:'pointer'}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserProfileManagementUI;
