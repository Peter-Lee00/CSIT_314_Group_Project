import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';

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
            if (!homeownerId) {
                throw new Error('Homeowner ID is required');
            }

            const requestsRef = collection(db, 'CleaningServiceRequests');
            const q = query(
                requestsRef,
                where('homeownerId', '==', homeownerId),
                orderBy('requestedDate', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const requests = [];
            
            querySnapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data(),
                    requestedDate: doc.data().requestedDate?.toDate?.() || doc.data().requestedDate
                });
            });

            return requests;
        } catch (error) {
            console.error('Error in getRequestsByHomeowner:', error);
            throw error;
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

    static async searchServiceHistory(homeownerId, filters = {}) {
        try {
            if (!homeownerId) {
                throw new Error('Homeowner ID is required');
            }

            const requestsRef = collection(db, 'CleaningServiceRequests');
            let q = query(
                requestsRef,
                where('homeownerId', '==', homeownerId)
            );

            // Apply status filter if provided
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            // Apply date range filters
            if (filters.startDate) {
                q = query(q, where('requestedDate', '>=', filters.startDate));
            }
            if (filters.endDate) {
                q = query(q, where('requestedDate', '<=', filters.endDate));
            }

            // Add ordering
            q = query(q, orderBy('requestedDate', 'desc'));

            const querySnapshot = await getDocs(q);
            const requests = [];
            
            querySnapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data(),
                    requestedDate: doc.data().requestedDate?.toDate?.() || doc.data().requestedDate
                });
            });

            return requests;
        } catch (error) {
            console.error('Error in searchServiceHistory:', error);
            throw error;
        }
    }
}

export default CleaningServiceRequest; 