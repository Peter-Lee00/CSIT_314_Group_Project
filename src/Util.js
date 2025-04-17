import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export class Util {
    // Get list of all user accounts
    static async getUserAccountList() {
        try {
            const usersRef = collection(db, 'Users');
            const snapshot = await getDocs(usersRef);
            return snapshot;
        } catch (error) {
            console.error("Error getting user accounts:", error);
            return null;
        }
    }

    // Get list of all user profiles
    static async getUserProfiles() {
        try {
            const profilesRef = collection(db, 'UserProfiles');
            const snapshot = await getDocs(profilesRef);
            return snapshot;
        } catch (error) {
            console.error("Error getting user profiles:", error);
            return null;
        }
    }

    // Helper function to validate email format
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Helper function to validate phone number format
    static validatePhoneNumber(phoneNumber) {
        const re = /^\d{10}$/;  // Assumes 10-digit phone number
        return re.test(phoneNumber);
    }

    // Helper function to check if a string is empty or only whitespace
    static isEmpty(str) {
        return !str || str.trim().length === 0;
    }

    // Helper function to format date
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Helper function to generate a random ID
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Helper function to handle Firebase errors
    static handleFirebaseError(error) {
        console.error("Firebase Error:", error);
        let errorMessage = "An error occurred. Please try again.";
        
        switch (error.code) {
            case 'permission-denied':
                errorMessage = "You don't have permission to perform this action.";
                break;
            case 'not-found':
                errorMessage = "The requested resource was not found.";
                break;
            case 'already-exists':
                errorMessage = "This record already exists.";
                break;
            default:
                errorMessage = error.message || errorMessage;
        }
        
        return errorMessage;
    }
}