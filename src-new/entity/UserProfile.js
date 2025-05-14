import FirebaseService from "../FirebaseService";
import { db } from './../firebase';
import { doc, collection, where, query, getDocs } from 'firebase/firestore';


class UserProfile {
    constructor(profileName, description, profileType) {
        this.profileName = profileName;
        this.description = description;
        this.profileType = profileType;
        this.firebaseService = new FirebaseService();
    }

    // Save profile to Firestore
    async createUserProfile(profileName, description, profileType) {
        try {
            const profileData = {
                profileName: profileName,
                description: description,
                profileType: profileType
            };
            const firebaseService = new FirebaseService();
            await firebaseService.addDocument("UserProfile", profileName, profileData);

            console.log("UserProfile saved successfully", profileName, profileData);
            return true;
        } catch (error) {
            console.error("Error saving user profile:", error);
            return false;
        }
    }

    // Fetch profile by profileId from Firestore
    async viewUserProfile(profileName) {
        try {
            const userProfile = await this.firebaseService.getDocument("UserProfile", profileName);
            console.log("Success to display Profile: ", profileName);
            return userProfile;
        } catch (error) {
            console.error("Error getting user profile:", error);
            throw error;
        }
    }

    // Update profile by profileId
    async updateUserProfile(profileName, description, profileType) {
        try {
            var newProfileData = {
                profileName,
                description,
                profileType
            };
            // Use this.type as the document ID
            const firebaseService = new FirebaseService();
            await firebaseService.updateDocument("UserProfile", profileName, newProfileData);
            console.log("UserProfile updated successfully");

            return true;
        } catch (error) {
            console.error("Error updating user profile:", error);
            return false;
        }
    }

    // Suspend profile by setting 'suspended' to true
    async suspendUserProfile(profileName) {
        try {
            await this.firebaseService.updateDocument('UserProfile', profileName, { suspended: true });
            console.log("UserProfile suspended successfully", profileName);
            return true;
        } catch (error) {
            console.error("Error suspending user profile:", error);
            return false;
        }
    }


    // Search profile by name
    async searchUserProfile(profileName) {
        try {
            let rawquery = collection(db, 'UserProfile');

            const conditions = [];
            if (profileName) {
                conditions.push(where("profileName", "==", profileName));
            }

            console.log(conditions)

            const finalQuery = query(rawquery, ...conditions);
            const snapshot = await getDocs(finalQuery);
            const userProfile = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            console.log(userProfile)

            if (userProfile.length > 0) {
                return userProfile;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error searching for user:", error);
            return null;
        }
    }

    static async getUserProfiles() {
        try {
            const firebaseService = new FirebaseService();
            const userData = await firebaseService.getDocuments('UserProfile');
            console.log(userData);
            return userData;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async verifyUserProfile(profileName, selectedType) {
        try {
            // Search for the user by username in Firestore
            const profileData = await this.firebaseService.getDocument('UserProfile', profileName);
            console.log("Profile data:", profileData);

            if (profileData && profileData.profileName === profileName) {

                // Check if password matches
                if (profileData.suspended === true) {
                    console.log("User profile is suspended");
                    return false;
                } else {
                    if (profileData.profileType === selectedType) {
                        console.log("Profile Type Match", profileData.profileType, selectedType);
                        return true;
                    } else {
                        console.log("Profile Type Mismatch");
                        return false;
                    }
                }
            } else {
                console.log("User not found");
                return false;
            }
        } catch (error) {
            console.error("Error logging in:", error);
            return false;
        }
    }
}

export default UserProfile;
