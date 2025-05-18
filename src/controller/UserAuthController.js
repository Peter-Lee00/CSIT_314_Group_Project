import UserAccount from '../entity/UserAccount';
import UserProfile from '../entity/UserProfile';
import Cookies from 'js-cookie';

export class UserLoginController {
    constructor() {
        this.lastError = null;
    }
    // Helper to normalize strings (remove spaces, lowercase)
    normalize(str) {
        return (str || '').replace(/\s+/g, '').toLowerCase();
    }
    async authenticateLogin(email, password, profileType, profileDocId) {
        try {
            // First verify the user account
            const userProfileName = await UserAccount.verifyUserAccount(email, password);

            // If the user account has been suspended
            if (userProfileName === "SUSPENDED") {
                this.lastError = 'SUSPENDED_ACCOUNT';
                return false;
            }
            
            // If email/password not match with DB
            if (!userProfileName) {
                this.lastError = 'INVALID_CREDENTIALS';
                return false;
            }

            // Fetch all user profiles
            const userProfileEntity = new UserProfile();
            const allProfiles = await userProfileEntity.searchUserProfile();

            // Find the profile that matches the user's profileName (normalized)
            const userProfileDoc = allProfiles.find(
                p =>
                    this.normalize(p.profileName) === this.normalize(userProfileName) ||
                    this.normalize(p.profileType) === this.normalize(userProfileName)
            );

            if (!userProfileDoc) {
                this.lastError = 'INVALID_PROFILE';
                return false;
            }

            // Fetch user data from Users collection
            const userData = await UserAccount.searchUserAccount(email);
            if (!userData) {
                this.lastError = 'INVALID_CREDENTIALS';
                return false;
            }

            // Debug: Log the values being compared
            console.log('DEBUG: Comparing userData.type:', userData.type, 'with profileType:', profileType);
            console.log('userData.type chars:', Array.from(userData.type || '').map(c => c.charCodeAt(0)));
            console.log('profileType chars:', Array.from(profileType || '').map(c => c.charCodeAt(0)));
            console.log('Normalized userData.type:', this.normalize(userData.type));
            console.log('Normalized profileType:', this.normalize(profileType));

            // Compare the selected role to the 'type' field from Users
            if (this.normalize(userData.type) !== this.normalize(profileType)) {
                this.lastError = 'INVALID_PROFILE';
                return false;
            }

            // Use UserProfile entity to verify profile type and suspension
            // Use the user's actual userProfile as the profileDocId
            const profileVerified = await UserProfile.verifyUserProfile(userData.userProfile);
            if (!profileVerified) {
                this.lastError = 'INVALID_PROFILE';
                return false;
            }

            // If we get here, both credentials and profile type are correct
            // Set cookies and return success
            Cookies.set('email', email);
            Cookies.set('userProfile', profileType);
            if (userData) {
                Cookies.set('username', userData.firstName || email);
            }
            this.lastError = null;
            return true;

        } catch (error) {
            console.error("Authentication error:", error);
            this.lastError = 'ERROR';
            return false;
        }
    }
}

export class UserLogoutController {
    async logout() {
        try {
            Cookies.remove('email');
            Cookies.remove('userProfile');
            Cookies.remove('username');
            console.log("Logout successfully");
            return true;
        } catch (error) {
            console.error("Logout error:", error);
            return false;
        }
    }
}