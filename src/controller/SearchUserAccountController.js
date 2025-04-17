import UserAccount from '../entity/UserAccount';

export class SearchUserAccountController {
    async searchUserAccount(email) {
        try {
            const result = await UserAccount.searchUserAccount(email);
            return result;
        } catch (error) {
            console.error("Error in searchUserAccount:", error);
            return null;
        }
    }
}