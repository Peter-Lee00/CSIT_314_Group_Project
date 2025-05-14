import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

class ServiceCategory {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    async addCategory() {
        try {
            const categoryCollRef = collection(db, 'ServiceCategories');
            const result = await addDoc(categoryCollRef, {
                name: this.name,
                description: this.description,
                createdAt: new Date().toISOString()
            });
            return result.id;
        } catch (e) {
            console.error("Couldn't add new category:", e);
            return null;
        }
    }

    static async listCategories() {
        try {
            const categoryColl = collection(db, 'ServiceCategories');
            const results = await getDocs(categoryColl);
            return results.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (err) {
            console.error("Problem getting categories:", err);
            return [];
        }
    }

    static async editCategory(categoryId, updateFields) {
        try {
            const categoryRef = doc(db, 'ServiceCategories', categoryId);
            await updateDoc(categoryRef, {
                ...updateFields,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (err) {
            console.error("Update failed for category ID", categoryId, ":", err);
            return false;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            const ref = doc(db, 'ServiceCategories', categoryId);
            await deleteDoc(ref);
            return true;
        } catch (e) {
            console.error("Could not delete the category with ID", categoryId, ":", e);
            return false;
        }
    }

    static async getCategoryById(categoryId) {
        try {
            const categorySnap = await getDocs(query(collection(db, 'ServiceCategories'), where('__name__', '==', categoryId)));
            if (!categorySnap.empty) {
                const docData = categorySnap.docs[0];
                return { id: docData.id, ...docData.data() };
            } else {
                return null;
            }
        } catch (e) {
            console.error('Error fetching category by ID:', e);
            return null;
        }
    }

    static async searchCategories(searchTerm) {
        try {
            const categoryColl = collection(db, 'ServiceCategories');
            const results = await getDocs(categoryColl);
            return results.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
        } catch (err) {
            console.error("Problem searching categories:", err);
            return [];
        }
    }
}

export default ServiceCategory; 