import UserProfile from '../entity/UserProfile';

class CreateProfileController {
    async createUserProfile(profileName, description) {
        try {
            const profile = new UserProfile();
            const success = await profile.createUserProfile(profileName, description);
            return success;
        } catch (error) {
            console.log("Error:", error);
            return false;
        }
    }
}

class ViewProfileController {
    async viewUserProfile(profileName) {
        try {
            const userProfile = new UserProfile();
            const profileData = await userProfile.viewUserProfile(profileName);
            return profileData;
        } catch (error) {
            console.log("Error:", error);
            throw error;
        }
    }
}

class UpdateProfileController {
    async updateUserProfile(profileName, description) {
        try {
            const userProfile = new UserProfile();
            const success = await userProfile.updateUserProfile(profileName, description);
            if (success) {
                console.log("Success update user profile: ", profileName, description);
                return true;
            } else {
                console.log("Failed update user profile: ", profileName, description);
                return false;
            }
        } catch (error) {
            return error;
        }
    }
}

class UASuspendUserProfileController {
    async suspendUserProfile(profileName) {
        try {
            const profile = new UserProfile();
            const success = await profile.suspendUserProfile(profileName);
            return success;
        } catch (error) {
            return false;
        }
    }
}

class UASearchUserProfileController {
    async searchUserProfile(profileName) {
        try {
            const userProfile = new UserProfile();
            const profile = await userProfile.searchUserProfile(profileName);
            return profile;
        } catch (error) {
            return null;
        }
    }
}

class UADeleteUserProfileController {
    async deleteUserProfile(profileName) {
        try {
            const success = await UserProfile.deleteUserProfile(profileName);
            return success;
        } catch (error) {
            return false;
        }
    }
}

export { 
    CreateProfileController,
    ViewProfileController,
    UpdateProfileController,
    UASuspendUserProfileController,
    UASearchUserProfileController,
    UADeleteUserProfileController
};