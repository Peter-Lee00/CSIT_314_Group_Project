import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';

class Shortlist {
    // Save a cleaning service to the user's shortlist
    static async saveToShortlist(username, service) {
        try {
            // Save under collection 'ShortlistedCleaningServices', doc: username, subcollection: 'services', doc: service.id
            const ref = doc(db, 'ShortlistedCleaningServices', username, 'services', service.id);
            await setDoc(ref, service);
            return true;
        } catch (error) {
            console.error('Error saving to shortlist:', error);
            return false;
        }
    }

    static async getShortlistedServices(username) {
        try {
            const servicesCol = collection(db, 'ShortlistedCleaningServices', username, 'services');
            const snapshot = await getDocs(servicesCol);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching shortlist:', error);
            return [];
        }
    }

    static async removeFromShortlist(username, serviceId) {
        try {
            const ref = doc(db, 'ShortlistedCleaningServices', username, 'services', serviceId);
            await deleteDoc(ref);
            return true;
        } catch (error) {
            console.error('Error removing from shortlist:', error);
            return false;
        }
    }
}

export default Shortlist; 