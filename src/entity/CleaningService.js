import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, increment } from 'firebase/firestore';
import { collection as firestoreCollection } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Define service offering status constant
export const ServiceOffering = {
    CURRENT: true,
    ARCHIVED: false
};

class CleaningService {
    constructor(name, desc, price, durationHrs, cleanerEmail, type, isOffering = true, serviceArea = '', specialEquipment = '', numWorkers = '', includedTasks = [], serviceAvailableFrom = '', serviceAvailableTo = '') {
        this.serviceName = name;
        this.description = desc;
        this.price = price;
        this.duration = durationHrs;
        this.cleanerId = cleanerEmail;
        this.serviceType = type;
        this.isAvailable = true;
        this.isOffering = isOffering;
        this.serviceArea = serviceArea;
        this.specialEquipment = specialEquipment;
        this.numWorkers = numWorkers;
        this.includedTasks = includedTasks;
        this.serviceAvailableFrom = serviceAvailableFrom;
        this.serviceAvailableTo = serviceAvailableTo;
    }

    async createService() {
        try {
            const serviceCollRef = collection(db, 'CleaningServices');
            const result = await addDoc(serviceCollRef, {
                serviceName: this.serviceName,
                description: this.description,
                price: this.price,
                duration: this.duration,
                cleanerId: this.cleanerId,
                serviceType: this.serviceType,
                isAvailable: this.isAvailable,
                isOffering: this.isOffering,
                serviceArea: this.serviceArea,
                specialEquipment: this.specialEquipment,
                numWorkers: this.numWorkers,
                includedTasks: this.includedTasks,
                serviceAvailableFrom: this.serviceAvailableFrom,
                serviceAvailableTo: this.serviceAvailableTo,
                createdAt: new Date().toISOString() // just saving ISO for now
            });
            return result.id;
        } catch (e) {
            console.error("Couldn't add new service:", e);
            return null;
        }
    }

    static async getCleanerServices(cleanerEmail) {
        try {
            const serviceColl = collection(db, 'CleaningServices');
            const q = query(serviceColl, where("cleanerId", "==", cleanerEmail));
            const results = await getDocs(q);

            // Note: might want to sort by date later
            return results.docs.map(item => ({
                id: item.id,
                ...item.data(),
                isOffering: item.data().isOffering ?? true // default to true for existing services
            }));
        } catch (err) {
            console.warn("Problem getting services for cleaner:", err);
            return []; // show nothing on error
        }
    }


    static async updateService(serviceId, updateFields) {
        try {
            const singleService = doc(db, 'CleaningServices', serviceId);
            await updateDoc(singleService, {
                ...updateFields,
                updatedAt: new Date().toISOString()  // new timestamp for modified
            });
            return true;
        } catch (err) {
            console.error("Update failed for service ID", serviceId, ":", err);
            return false;
        }
    }

    static async deleteService(serviceId) {
        try {
            const ref = doc(db, 'CleaningServices', serviceId);
            await deleteDoc(ref); // fire and forget
            return true;
        } catch (e) {
            console.error("Could not delete the service with ID", serviceId, ":", e);
            return false;
        }
    }

    static async updateServiceOffering(serviceId, isOffering) {
        try {
            const serviceRef = doc(db, 'CleaningServices', serviceId);
            await updateDoc(serviceRef, {
                isOffering: isOffering,
                updatedAt: new Date().toISOString()
            });
            return {
                success: true,
                serviceId: serviceId,
                isOffering: isOffering
            };
        } catch (error) {
            console.error("Failed to update service offering status:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async searchCleaningService(serviceName, serviceType, priceRange, duration, cleanerId) {
        try {
            const serviceColl = collection(db, 'CleaningServices');
            const conditions = [];

            if (serviceName) conditions.push(where("serviceName", "==", serviceName));
            if (serviceType) conditions.push(where("serviceType", "==", serviceType));
            if (priceRange && priceRange.length === 2) {
                conditions.push(where("price", ">=", Number(priceRange[0])));
                conditions.push(where("price", "<=", Number(priceRange[1])));
            }
            if (duration) conditions.push(where("duration", "==", Number(duration)));
            if (cleanerId) conditions.push(where("cleanerId", "==", cleanerId));
            // Only show currently offered services
            conditions.push(where("isOffering", "==", true));

            const q = query(serviceColl, ...conditions);
            const results = await getDocs(q);

            if (results.empty) return null;
            return results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error("Error searching cleaning services:", err);
            return null;
        }
    }

    static async getServiceById(serviceId) {
        try {
            const serviceRef = doc(db, 'CleaningServices', serviceId);
            const serviceSnap = await getDocs(query(collection(db, 'CleaningServices'), where('__name__', '==', serviceId)));
            if (!serviceSnap.empty) {
                const docData = serviceSnap.docs[0];
                return { id: docData.id, ...docData.data() };
            } else {
                return null;
            }
        } catch (e) {
            console.error('Error fetching service by ID:', e);
            return null;
        }
    }

    static async increaseCount(serviceId, countType) {
        try {
            if (countType !== "view" && countType !== "shortlist") {
                throw new Error("Invalid count type. Use 'view' or 'shortlist'");
            }

            const current_month = new Date().toISOString().slice(0, 7);
            const serviceRef = doc(db, 'CleaningServices', serviceId);

            await updateDoc(serviceRef, {
                [countType + "_count"]: increment(1),
                [`${countType}_history.${current_month}`]: increment(1)
            });

            console.log(`Successfully incremented ${countType} for service ID: ${serviceId}`);
            return { success: true, message: `${countType} incremented successfully` };
        } catch (error) {
            console.error(`Error incrementing ${countType} for cleaning service:`, error);
            return { success: false, message: error.message };
        }
    }

    static async increaseViewCount(serviceId) {
        try {
            const current_month = new Date().toISOString().slice(0, 7);
            const serviceRef = doc(db, 'CleaningServices', serviceId);

            await updateDoc(serviceRef, {
                view_count: increment(1),
                [`view_history.${current_month}`]: increment(1)
            });

            console.log(`Successfully incremented view count for service ID: ${serviceId}`);
            return true;
        } catch (error) {
            console.error(`Error incrementing view count for cleaning service:`, error);
            return false;
        }
    }

    static async increaseShortlistCount(serviceId) {
        try {
            const current_month = new Date().toISOString().slice(0, 7);
            const serviceRef = doc(db, 'CleaningServices', serviceId);

            await updateDoc(serviceRef, {
                shortlist_count: increment(1),
                [`shortlist_history.${current_month}`]: increment(1)
            });

            console.log(`Successfully incremented shortlist count for service ID: ${serviceId}`);
            return true;
        } catch (error) {
            console.error(`Error incrementing shortlist count for cleaning service:`, error);
            return false;
        }
    }

    static async trackViewCount(serviceId) {
        try {
            const serviceSnap = await getDocs(query(collection(db, 'CleaningServices'), where('__name__', '==', serviceId)));
            
            if (!serviceSnap.empty) {
                const serviceData = serviceSnap.docs[0].data();
                return serviceData.view_history || null;
            }
            return null;
        } catch (error) {
            console.error("Error tracking view count:", error);
            return null;
        }
    }

    static async trackShortlistCount(serviceId) {
        try {
            const serviceSnap = await getDocs(query(collection(db, 'CleaningServices'), where('__name__', '==', serviceId)));
            
            if (!serviceSnap.empty) {
                const serviceData = serviceSnap.docs[0].data();
                return serviceData.shortlist_history || null;
            }
            return null;
        } catch (error) {
            console.error("Error tracking shortlist count:", error);
            return null;
        }
    }

    static async getConfirmedMatches(cleanerId, serviceType, priceRange, startDate, endDate) {
        try {
            const matchesColl = collection(db, 'ConfirmedMatches');
            const conditions = [where('cleanerId', '==', cleanerId)];
            if (serviceType) conditions.push(where('serviceType', '==', serviceType));
            if (priceRange && priceRange.length === 2) {
                conditions.push(where('price', '>=', Number(priceRange[0])));
                conditions.push(where('price', '<=', Number(priceRange[1])));
            }
            if (startDate) conditions.push(where('confirmedAt', '>=', startDate));
            if (endDate) conditions.push(where('confirmedAt', '<=', endDate));
            const q = query(matchesColl, ...conditions);
            const results = await getDocs(q);
            return results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error('Error fetching confirmed matches:', err);
            return [];
        }
    }

    static async getAllServices() {
        try {
            const serviceColl = collection(db, 'CleaningServices');
            const results = await getDocs(serviceColl);
            return results.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (err) {
            console.error("Error getting all cleaning services:", err);
            return [];
        }
    }
}

export default CleaningService;
