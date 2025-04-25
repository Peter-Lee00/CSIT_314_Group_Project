import UserAccount from '../entity/UserAccount';
import UserProfile from '../entity/UserProfile';
import Cookies from 'js-cookie';

export class UserLoginController {
    async authenticateLogin(email, password, profileType) {
        try {
            // First verify the user account
            const userProfile = await UserAccount.verifyUserAccount(email, password);

            // If the user account has been suspended
            if (userProfile === "SUSPENDED") {
                console.log("User account has been suspended");
                return 'SUSPENDED_ACCOUNT';
            }
            
            // If email/password not match with DB
            if (!userProfile) {
                console.log("Invalid email/password");
                return 'INVALID_CREDENTIALS';
            }

            // If credentials are correct, after that check profile type
            if (userProfile !== profileType) {
                console.log("Profile type mismatch", userProfile, profileType);
                return 'INVALID_PROFILE';
            }

            // If we get here, both credentials and profile type are correct
            // Set cookies and return success
            Cookies.set('email', email);
            Cookies.set('userProfile', profileType);
            const userData = await UserAccount.searchUserAccount(email);
            if (userData) {
                Cookies.set('username', userData.firstName || email);
            }
            console.log("Login successfully");
            return 'SUCCESS';

        } catch (error) {
            console.error("Authentication error:", error);
            return 'ERROR';
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