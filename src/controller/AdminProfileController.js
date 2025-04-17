import UserProfile from '../entity/UserProfile';

class UACreateUserProfileController {
    async createUserProfile(profileName, description, profileType) {
        try {
            const profile = new UserProfile();
            const success = await profile.createUserProfile(profileName, description, profileType);
            return success;
        } catch (error) {
            console.log("Error:", error);
            return false;
        }
    }
}

class UAViewUserProfileController {
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

class UAUpdateUserProfileController {
    async updateUserProfile(profileName, description, profileType) {
        try {
            const userProfile = new UserProfile();
            const success = await userProfile.updateUserProfile(profileName, description, profileType);
            if (success) {
                console.log("Success update user profile: ", profileName, description, profileType);
                return true;
            } else {
                console.log("Failed update user profile: ", profileName, description, profileType);
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

export { 
    UACreateUserProfileController, 
    UAViewUserProfileController, 
    UAUpdateUserProfileController, 
    UASuspendUserProfileController, 
    UASearchUserProfileController 
};