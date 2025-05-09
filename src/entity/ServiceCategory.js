import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

class ServiceCategory {
    static async addCategory(name, description = '') {
        try {
            const ref = collection(db, 'ServiceCategories');
            const result = await addDoc(ref, { name, description });
            return result.id;
        } catch (e) {
            console.error('Error adding category:', e);
            return null;
        }
    }

    static async editCategory(categoryId, updateFields) {
        try {
            const ref = doc(db, 'ServiceCategories', categoryId);
            await updateDoc(ref, updateFields);
            return true;
        } catch (e) {
            console.error('Error editing category:', e);
            return false;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            const ref = doc(db, 'ServiceCategories', categoryId);
            await deleteDoc(ref);
            return true;
        } catch (e) {
            console.error('Error deleting category:', e);
            return false;
        }
    }

    static async listCategories() {
        try {
            const ref = collection(db, 'ServiceCategories');
            const results = await getDocs(ref);
            return results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error('Error listing categories:', e);
            return [];
        }
    }
}

export default ServiceCategory; 