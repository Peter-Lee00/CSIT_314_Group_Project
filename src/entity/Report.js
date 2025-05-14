import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

class Report {
  static async getAllCategories() {
    const categoriesSnap = await getDocs(collection(db, 'ServiceCategories'));
    return categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  static async getAllServices() {
    const servicesSnap = await getDocs(collection(db, 'CleaningServices'));
    return servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  static async getAllRequests() {
    const requestsSnap = await getDocs(collection(db, 'CleaningServiceRequests'));
    return requestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export default Report; 