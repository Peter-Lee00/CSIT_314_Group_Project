import UserAccount from '../entity/UserAccount';

class UACreateUserAccountController {
    async createUserAccount(email, fName, lName, password, phoneNum, userProfile) {
        try {
            const userAccount = new UserAccount(email, fName, lName, password, phoneNum, userProfile);
            await userAccount.createUserAccount();
            return true;
        } catch (error) {
            console.log("Error:", error);
            return false;
        }
    }
}

class UAViewUserAccountController {
    async viewUserAccount(email) {
        try {
            const userAccount = new UserAccount();
            const userData = await userAccount.viewUserAccount(email);
            console.log("Fetched user account:", userData);
            return userData;
        } catch (error) {
            console.error("Error fetching user account:", error);
            return null;
        }
    }
}

class UAUpdateUserAccountController {
    async updateUserAccount(email, fName, lName, password, phoneNum, userProfile) {
        try {
            const userAccount = new UserAccount();
            await userAccount.updateUserAccount(email, fName, lName, password, phoneNum, userProfile);
            return true;
        } catch (error) {
            return false;
        }
    }
}

class UASuspendUserAccountController {
    async suspendUserAccount(email) {
        try {
            const userAccount = new UserAccount();
            await userAccount.suspendUserAccount(email);
            return true;
        } catch (error) {
            return false;
        }
    }
}

class UASearchUserAccountController {
    async searchUserAccount(email) {
        try {
            const userAccount = new UserAccount();
            const userAccountData = await userAccount.searchUserAccount(email);
            return userAccountData;
        } catch (error) {
            return null;
        }
    }
}

export { 
    UACreateUserAccountController, 
    UAViewUserAccountController, 
    UAUpdateUserAccountController, 
    UASuspendUserAccountController, 
    UASearchUserAccountController 
};