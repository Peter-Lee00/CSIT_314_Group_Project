import { db } from '../firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs,
    doc,
    setDoc,
    updateDoc,
    getDoc
} from 'firebase/firestore';

class UserAccount {
    constructor(firstName, lastName, password, phoneNumber, email, userProfile) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.userProfile = userProfile;
    }

    static async searchUserAccount(email) {
        try {
            const usersRef = collection(db, 'Users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const userData = querySnapshot.docs[0].data();
            return {
                firstName: userData.firstName,
                lastName: userData.lastName,
                password: userData.password, // Make sure password is included
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                userProfile: userData.userProfile,
                suspended: userData.suspended
            };
        } catch (error) {
            console.error("Error searching user account:", error);
            return null;
        }
    }

    async updateUserAccount(firstName, lastName, password, phoneNumber, email, userProfile) {
        try {
            const userRef = doc(db, 'Users', email);
            const docSnap = await getDoc(userRef);
            
            if (!docSnap.exists()) {
                console.error("User document not found");
                return false;
            }

            await updateDoc(userRef, {
                firstName,
                lastName,
                password, // Make sure password is included in update
                phoneNumber,
                email,
                userProfile
            });
            return true;
        } catch (error) {
            console.error("Error updating user account:", error);
            return false;
        }
    }
    
    // Verify user account
    static async verifyUserAccount(email, password) {
        try {
            const usersRef = collection(db, 'Users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                if (userData.suspended) {
                    return { success: false, message: 'Account is suspended' };
                }
                if (userData.password === password) {
                    return {
                        success: true,
                        userProfile: userData.userProfile,
                        userData: userData
                    };
                }
            }
            return { success: false, message: 'Invalid credentials' };
        } catch (error) {
            console.error("Error verifying user:", error);
            return { success: false, message: 'Error during verification' };
        }
    }

    async createUserAccount() {
        try {
            const userRef = doc(db, 'Users', this.email); // Changed from username to email
            await setDoc(userRef, {
                firstName: this.firstName,
                lastName: this.lastName,
                password: this.password,
                phoneNumber: this.phoneNumber,
                email: this.email,
                userProfile: this.userProfile,
                suspended: false
            });
            return { success: true, message: 'User account created successfully' };
        } catch (error) {
            console.error("Error creating user:", error);
            return { success: false, message: 'Error creating user account' };
        }
    }

    // Get user profile types
    static async getUserProfiles() {
        return [
            { id: 'PlatformAdmin', name: 'Platform Administrator' },
            { id: 'Cleaner', name: 'Cleaner' },
            { id: 'HomeOwner', name: 'Home Owner' }
        ];
    }

    // Search users by criteria
static async searchUsers(criteria) {
    try {
        const usersRef = collection(db, 'Users');
        let q = query(usersRef);

        if (criteria.username) {
            q = query(q, where('username', '==', criteria.username));
        }
        if (criteria.userProfile) {
            q = query(q, where('userProfile', '==', criteria.userProfile));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            password: doc.data().password, // Add this line
            phoneNumber: doc.data().phoneNumber,
            email: doc.data().email,
            userProfile: doc.data().userProfile,
            suspended: doc.data().suspended
        }));
    } catch (error) {
        console.error("Error searching users:", error);
        return [];
    }
}

    // Search user account by email
    static async searchUserAccount(email) {
        try {
            const usersRef = collection(db, 'Users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const userData = querySnapshot.docs.map(doc => ({
                email: doc.data().email,
                firstName: doc.data().firstName,
                lastName: doc.data().lastName,
                phoneNumber: doc.data().phoneNumber,
                userProfile: doc.data().userProfile,
                suspended: doc.data().suspended
            }));

            return userData;
        } catch (error) {
            console.error("Error searching user account:", error);
            return null;
        }
    }

    // Update user account
async updateUserAccount(firstName, lastName, password, phoneNumber, email, userProfile) {
    try {
        const userRef = doc(db, 'Users', email);
        await updateDoc(userRef, {
            firstName,
            lastName,
            password,
            phoneNumber,
            email,
            userProfile
        });
        return true;
    } catch (error) {
        console.error("Error updating user account:", error);
        return false;
    }
}
    
}

export default UserAccount;