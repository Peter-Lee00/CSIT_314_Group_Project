import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

class UserAccount {
  constructor(firstName, lastName, password, phoneNumber, email, userProfile, address = null) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.userProfile = userProfile;
    this.address = userProfile === 'HomeOwner' ? address : null; // Only for HomeOwners
  }

  async createUserAccount() {
    try {
      if (this.userProfile === 'HomeOwner' && !this.address) {
        return { success: false, message: 'Home Owner must have an address' };
      }

      const userRef = doc(db, 'Users', this.email);

      const payload = {
        firstName: this.firstName,
        lastName: this.lastName,
        password: this.password,
        phoneNumber: this.phoneNumber,
        email: this.email,
        userProfile: this.userProfile,
        suspended: false
      };

      if (this.userProfile === 'HomeOwner') {
        payload.address = this.address;
      }

      await setDoc(userRef, payload);
      return { success: true, message: 'Account created successfully' };
    } catch (err) {
      console.error("User creation error:", err);
      return { success: false, message: 'Something went wrong during creation' };
    }
  }

  static async searchUserAccount(email) {
    try {
      const usersCol = collection(db, 'Users');
      const q = query(usersCol, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("User not found for email:", email);
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      return {
        id: docSnap.id,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        phoneNumber: data.phoneNumber,
        email: data.email,
        userProfile: data.userProfile,
        suspended: data.suspended || false,
        address: data.address
      };
    } catch (err) {
      console.error("Error looking up user:", err);
      return null;
    }
  }

  async updateUserAccount(firstName, lastName, password, phoneNumber, email, userProfile, address) {
    try {
      const userRef = doc(db, 'Users', email);
      const updatePayload = {
        firstName,
        lastName,
        password,
        phoneNumber,
        email,
        userProfile
      };

      if (userProfile === 'HomeOwner') {
        updatePayload.address = address;
      } else {
        updatePayload.address = null;
      }

      await updateDoc(userRef, updatePayload);
      return true;
    } catch (err) {
      console.error("Update error:", err);
      return false;
    }
  }

  static async getUserProfiles() {
    // Static profile presets
    return [
      { id: 'UserAdmin', name: 'User Administrator' },
      { id: 'PlatformAdmin', name: 'Platform Administrator' },
      { id: 'Cleaner', name: 'Cleaner' },
      { id: 'HomeOwner', name: 'Home Owner' }
    ];
  }

  static async loadAllUsers() {
    try {
      const usersRef = collection(db, 'Users');
      const snapshot = await getDocs(usersRef);

      return snapshot.docs.map(docSnap => {
        const user = docSnap.data();
        return {
          id: docSnap.id,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          phoneNumber: user.phoneNumber,
          email: user.email,
          userProfile: user.userProfile,
          suspended: user.suspended || false,
          ...(user.userProfile === 'HomeOwner' && { address: user.address })
        };
      });
    } catch (err) {
      console.error("Failed to fetch users:", err);
      return [];
    }
  }

  static async verifyUserAccount(email, password) {
    try {
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("No matching user for:", email);
        return null;
      }

      const user = snapshot.docs[0].data();

      if (user.suspended === true) {
        console.log("Suspended account attempted login.");
        return "SUSPENDED";
      }

      if (user.password === password) {
        console.log("User verified:", user.userProfile);
        return user.userProfile;
      }

      console.log("Wrong password entered");
      return null;
    } catch (err) {
      console.error("Verification failed:", err);
      return null;
    }
  }

  async suspendUserAccount() {
    try {
        const usersCol = collection(db, 'Users');
        const q = query(usersCol, where('email', '==', this.email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No user found with email:", this.email);
            return false;
        }

        const userDoc = snapshot.docs[0];
        const userRef = doc(db, 'Users', userDoc.id);
        await updateDoc(userRef, { suspended: true });
        return true;
    } catch (error) {
        console.error("Error suspending user account:", error);
        return false;
    }
  }
}

export default UserAccount;
