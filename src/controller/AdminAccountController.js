import UserAccount from '../entity/UserAccount';

// Handles new user registration
class CreateUserAccountController {
  async createUserAccount(firstName, lastName, password, phoneNumber, email, userProfile) {
    try {
      const newUser = new UserAccount(
        firstName,
        lastName,
        password,
        phoneNumber,
        email,
        userProfile,
      );
      const created = await newUser.createUserAccount(); // save to DB
      return created; // success return true, fail return false
    } catch (err) {
      console.error('Error while creating user account:', err);
      return false;
    }
  }
}

// Reads user data
class ViewUserAccountController {
  async getAllUsers() {
    try {
      const users = await UserAccount.loadAllUsers(); // returns array of user docs
      return users;
    } catch (e) {
      console.error('Failed to load all users:', e);
      return []; // fallback to empty
    }
  }

  async viewUserAccount(email) {
    try {
      return await UserAccount.searchUserAccount(email);
    } catch (e) {
      console.error("Couldn't fetch user account by email:", e);
      return null;
    }
  }
}

// Updates existing user
class UpdateUserAccountController {
  async updateUserAccount(firstName, lastName, password, phoneNumber, email, userProfile) {
    try {
      const result = await new UserAccount(
        firstName,
        lastName,
        password,
        phoneNumber,
        email,
        userProfile
      ).updateUserAccount(
        firstName,
        lastName,
        password,
        phoneNumber,
        email,
        userProfile
      );
      return result;
    } catch (err) {
      console.error("Update failed for user:", err);
      return false;
    }
  }
}

// Search for a user
class SearchUserAccountController {
  async searchUserAccount(email) {
    try {
      return await UserAccount.searchUserAccount(email);
    } catch (err) {
      console.error("User search failed:", err);
      return null;
    }
  }
}

// Suspend a user account
class SuspendUserAccountController {
  async suspendUserAccount(email) {
    try {
      // First get the user data
      const userData = await UserAccount.searchUserAccount(email);
      if (!userData) {
        console.warn("User not found:", email);
        return false;
      }
      // Create a UserAccount instance with the user data
      const user = new UserAccount(
        userData.firstName,
        userData.lastName,
        userData.password,
        userData.phoneNumber,
        userData.email,
        userData.userProfile,
        userData.address
      );
      // Call the suspendUserAccount method
      const result = await user.suspendUserAccount();
      return result;
    } catch (err) {
      console.warn("Could not suspend account for:", email);
      return false;
    }
  }
}

export {
  CreateUserAccountController,
  ViewUserAccountController,
  UpdateUserAccountController,
  SearchUserAccountController,
  SuspendUserAccountController
};

