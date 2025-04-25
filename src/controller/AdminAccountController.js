import UserAccount from '../entity/UserAccount';

// Handles new user registration
export class CreateUserAccountController {
  async createUserAccount(firstName, lastName, password, phoneNumber, email, userProfile, address = null) {
    try {
      const newUser = new UserAccount(
        firstName,
        lastName,
        password,
        phoneNumber,
        email,
        userProfile,
        userProfile === 'HomeOwner' ? address : null // Only HomeOwner needs address
      );

      const created = await newUser.createUserAccount(); // save to DB
      return created;
    } catch (err) {
      console.error('Error while creating user account:', err);
      return false; // fail-safe
    }
  }
}

// Reads user data
export class ViewUserAccountController {
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
export class UpdateUserAccountController {
  async updateUserAccount(firstName, lastName, password, phoneNumber, email, userProfile, address = null) {
    try {
      // Not reusing instance unnecessarily – just calling static-style
      const result = await new UserAccount(
        firstName,
        lastName,
        password,
        phoneNumber,
        email,
        userProfile,
        userProfile === 'HomeOwner' ? address : null
      ).updateUserAccount(
        firstName,
        lastName,
        password,
        phoneNumber,
        email,
        userProfile,
        userProfile === 'HomeOwner' ? address : null
      );

      return result;
    } catch (err) {
      console.error("Update failed for user:", err);
      return false;
    }
  }
}

// Looks up a user
export class SearchUserAccountController {
  async searchUserAccount(email) {
    try {
      return await UserAccount.searchUserAccount(email);
    } catch (err) {
      console.error("User search failed:", err);
      return null;
    }
  }
}


export class SuspendUserAccountController {
  async suspendUserAccount(username) {
    try {
      // First get the user data
      const userData = await UserAccount.searchUserAccount(username);
      if (!userData) {
        console.warn("User not found:", username);
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
      console.warn("Could not suspend account for:", username);
      return false;
    }
  }
}

