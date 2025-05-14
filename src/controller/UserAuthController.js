import UserAccount from '../entity/UserAccount';
import UserProfile from '../entity/UserProfile';
import Cookies from 'js-cookie';

export class UserLoginController {
    constructor() {
        this.lastError = null;
    }
    async authenticateLogin(email, password, profileType, profileDocId) {
        try {
            // First verify the user account
            const userProfile = await UserAccount.verifyUserAccount(email, password);

            // If the user account has been suspended
            if (userProfile === "SUSPENDED") {
                this.lastError = 'SUSPENDED_ACCOUNT';
                return false;
            }
            
            // If email/password not match with DB
            if (!userProfile) {
                this.lastError = 'INVALID_CREDENTIALS';
                return false;
            }

            // Strictly check that the user's actual role matches the selected role
            if (userProfile !== profileType) {
                this.lastError = 'INVALID_PROFILE';
                return false;
            }

            // Use UserProfile entity to verify profile type and suspension
            const profileVerified = await UserProfile.verifyUserProfile(profileDocId, profileType);
            if (!profileVerified) {
                this.lastError = 'INVALID_PROFILE';
                return false;
            }

            // If we get here, both credentials and profile type are correct
            // Set cookies and return success
            Cookies.set('email', email);
            Cookies.set('userProfile', profileType);
            const userData = await UserAccount.searchUserAccount(email);
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