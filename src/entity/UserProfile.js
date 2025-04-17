import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

class UserProfile {
    constructor(profileName, description, profileType) {
        this.profileName = profileName;
        this.description = description;
        this.profileType = profileType;
    }

    async createUserProfile(profileName, description, profileType) {
        try {
            const profileRef = doc(db, 'UserProfiles', profileName);
            await setDoc(profileRef, {
                profileName: profileName,
                description: description,
                profileType: profileType,
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

    async updateUserProfile(profileName, description, profileType) {
        try {
            const profilesRef = collection(db, 'UserProfiles');
            const q = query(profilesRef, where('profileName', '==', profileName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const profileDoc = querySnapshot.docs[0].ref;
                await updateDoc(profileDoc, {
                    description,
                    profileType
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
}

export default UserProfile;