import UserAccount from '../entity/UserAccount';

export class CreateUserAccountController {
    async createUserAccount(/* username */ firstName, lastName, password, phoneNumber, email, userProfile) {
        try {
            const userAccount = new UserAccount(
                firstName,
                lastName,
                password,
                phoneNumber,
                email,
                userProfile,
                /* username */
            );

            const result = await userAccount.createUserAccount();
            return result.success;
        } catch (error) {
            console.error('Error in createUserAccount:', error);
            return false;
        }
    }

    async getAllUsers() {
        try {
            return await UserAccount.searchUsers({});
        } catch (error) {
            console.error('Error getting all users:', error);
            return [];
        }
    }

    async searchUsers(email) {
        try {
            return await UserAccount.searchUsers({ email });
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }
}