import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

class UserProfile {
    constructor(profileName, description) {
        this.profileName = profileName;
        this.description = description;
    }

    async createUserProfile(profileName, description) {
        try {
            const profileRef = doc(db, 'UserProfiles', profileName);
            await setDoc(profileRef, {
                profileName: profileName,
                description: description,
                suspended: false
            });
            return true;
        } catch (error) {
            console.error("Error creating profile:", error);
            return false;
        }
    }

    async viewUserProfile(profileName) {
        try {
            const profilesRef = collection(db, 'UserProfiles');
            const q = query(profilesRef, where('profileName', '==', profileName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data();
            }
            return null;
        } catch (error) {
            console.error("Error viewing profile:", error);
            return null;
        }
    }

    async updateUserProfile(profileName, description) {
        try {
            const profilesRef = collection(db, 'UserProfiles');
            const q = query(profilesRef, where('profileName', '==', profileName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const profileDoc = querySnapshot.docs[0].ref;
                await updateDoc(profileDoc, {
                    description
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error updating profile:", error);
            return false;
        }
    }

    async suspendUserProfile(profileName) {
        try {
            const profilesRef = collection(db, 'UserProfiles');
            const q = query(profilesRef, where('profileName', '==', profileName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const profileDoc = querySnapshot.docs[0].ref;
                const profileData = querySnapshot.docs[0].data();
                await updateDoc(profileDoc, {
                    suspended: !profileData.suspended
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error suspending profile:", error);
            return false;
        }
    }

    async searchUserProfile(profileName) {
        try {
            const profilesRef = collection(db, 'UserProfiles');
            let q;
            if (profileName) {
                q = query(profilesRef, where('profileName', '==', profileName));
            } else {
                q = query(profilesRef);
            }
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("Error searching profiles:", error);
            return null;
        }
    }

    static async verifyUserProfile(profileName) {
        try {
            const profileDoc = await getDoc(doc(db, 'UserProfiles', profileName));
            if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                return !profileData.suspended;
            }
            return false;
        } catch (error) {
            console.error("Error verifying user profile:", error);
            return false;
        }
    }

    static async deleteUserProfile(profileName) {
        try {
            const profileRef = doc(db, 'UserProfiles', profileName);
            await deleteDoc(profileRef);
            return true;
        } catch (error) {
            console.error("Error deleting profile:", error);
            return false;
        }
    }
}

export default UserProfile;