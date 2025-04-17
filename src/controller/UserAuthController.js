import UserAccount from '../entity/UserAccount';
import Cookies from 'js-cookie';

export class UserLoginController {
    async authenticateLogin(email, password, userProfile) {
        try {
            const result = await UserAccount.verifyUserAccount(email, password);
            
            if (result.success && result.userProfile === userProfile) {
                Cookies.set('email', email);
                Cookies.set('userProfile', userProfile);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    }
}

export class UserLogoutController {
    async logout() {
        try {
            Cookies.remove('email');
            Cookies.remove('userProfile');
            return true;
        } catch (error) {
            console.error("Logout error:", error);
            return false;
        }
    }
}