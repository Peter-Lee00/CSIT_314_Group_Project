import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

class CleaningServiceRequest {
    constructor(serviceId, homeownerId, cleanerId, status = 'PENDING', message = '', requestedDate = '') {
        this.serviceId = serviceId;
        this.homeownerId = homeownerId;
        this.cleanerId = cleanerId;
        this.status = status; // PENDING, ACCEPTED, DECLINED
        this.message = message;
        this.requestedDate = requestedDate;
        this.createdAt = new Date().toISOString();
    }

    static async createRequest(serviceId, homeownerId, cleanerId, message = '', requestedDate = '') {
        try {
            const requestColl = collection(db, 'CleaningServiceRequests');
            const newRequest = {
                serviceId,
                homeownerId,
                cleanerId,
                status: 'PENDING',
                message,
                requestedDate,
                createdAt: new Date().toISOString()
            };
            const result = await addDoc(requestColl, newRequest);
            return { id: result.id, ...newRequest };
        } catch (error) {
            console.error('Error creating cleaning service request:', error);
            return null;
        }
    }

    static async getRequestsByCleaner(cleanerId) {
        try {
            const requestColl = collection(db, 'CleaningServiceRequests');
            const q = query(requestColl, where('cleanerId', '==', cleanerId));
            const results = await getDocs(q);
            return results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting requests for cleaner:', error);
            return [];
        }
    }

    static async getRequestsByHomeowner(homeownerId) {
        try {
            const requestColl = collection(db, 'CleaningServiceRequests');
            const q = query(requestColl, where('homeownerId', '==', homeownerId));
            const results = await getDocs(q);
            return results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting requests for homeowner:', error);
            return [];
        }
    }

    static async updateRequestStatus(requestId, newStatus) {
        try {
            const requestRef = doc(db, 'CleaningServiceRequests', requestId);
            await updateDoc(requestRef, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error updating request status:', error);
            return false;
        }
    }
}

export default CleaningServiceRequest; 