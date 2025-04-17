import UserAccount from '../entity/UserAccount';

export class UpdateUserAccountController {
    async updateUserAccount(firstName, lastName, password, phoneNumber, email, userProfile) {
        try {
            const userAccount = new UserAccount(
                firstName,
                lastName,
                password,
                phoneNumber,
                email,
                userProfile
            );

            const success = await userAccount.updateUserAccount(
                firstName,
                lastName,
                password,
                phoneNumber,
                email,
                userProfile
            );

            return success;
        } catch (error) {
            console.error("Error in updateUserAccount:", error);
            return false;
        }
    }
}