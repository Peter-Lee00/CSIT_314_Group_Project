import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';

class FirebaseService {
    constructor() {
        if (!db) {
            throw new Error('Firestore is not initialized');
        }
        console.log("FirebaseService initialized with db:", db);
    }

    // Create a new document in Firestore
    async addDocument(collectionName, docId, data) {
        try {
            console.log("Adding document with params:", {
                collectionName,
                docId,
                data,
                db: db
            });

            if (!db) {
                throw new Error('Firestore instance is null');
            }

            // Create collection reference
            const collectionRef = collection(db, collectionName);
            console.log("Collection reference created:", collectionRef);

            // Create document reference
            const docRef = doc(collectionRef, docId);
            console.log("Document reference created:", docRef);

            // Set document data
            await setDoc(docRef, data);
            console.log(`Document added successfully to ${collectionName} with ID: ${docId}`);
            return true;
        } catch (error) {
            console.error("Detailed error in addDocument:", {
                error: error,
                message: error.message,
                stack: error.stack,
                db: db,
                collectionName: collectionName,
                docId: docId
            });
            throw error;
        }
    }

    // Read a document from Firestore
    async getDocument(collectionName, docId) {
        try {
            const collectionRef = collection(db, collectionName);
            const docRef = doc(collectionRef, docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                console.log("No such document!");
                return null;
            }
        } catch (error) {
            console.error("Error getting document:", error);
            throw error;
        }
    }

    // Get all documents in Firestore
    async getDocuments(collectionName) {
        try {
            const collectionRef = collection(db, collectionName);
            const querySnapshot = await getDocs(collectionRef);
            return querySnapshot;
        } catch (error) {
            console.error("Error getting documents:", error);
            throw error;
        }
    }

    // Update a document in Firestore
    async updateDocument(collectionName, docId, newData) {
        try {
            const collectionRef = collection(db, collectionName);
            const docRef = doc(collectionRef, docId);
            await updateDoc(docRef, newData);
            console.log(`Document with ID: ${docId} updated successfully in ${collectionName}`);
            return true;
        } catch (error) {
            console.error("Error updating document:", error);
            throw error;
        }
    }

    // Delete a document from Firestore
    async deleteDocument(collectionName, docId) {
        try {
            const collectionRef = collection(db, collectionName);
            const docRef = doc(collectionRef, docId);
            await deleteDoc(docRef);
            console.log(`Document with ID ${docId} has been deleted successfully.`);
            return true;
        } catch (error) {
            console.error("Error deleting document:", error);
            return false;
        }
    }
}

export default FirebaseService;