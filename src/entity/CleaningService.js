import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Define service offering status constant
export const ServiceOffering = {
    CURRENT: true,
    ARCHIVED: false
};

class CleaningService {
    // Available service types – feels like an enum
    static SERVICE_TYPES = {
        BASIC_CLEANING: "Basic Cleaning",
        DEEP_CLEANING: "Deep Cleaning",
        MOVE_IN_OUT: "Move In/Out Cleaning",
        OFFICE_CLEANING: "Office Cleaning",
        WINDOW_CLEANING: "Window Cleaning",
        CARPET_CLEANING: "Carpet Cleaning",
        POST_RENOVATION: "Post Renovation Cleaning",
        DISINFECTION: "Disinfection Service"
    };

    constructor(name, desc, price, durationHrs, cleanerEmail, type) {
        // Storing all the passed data here
        this.serviceName = name;
        this.description = desc;
        this.price = price;
        this.duration = durationHrs;
        this.cleanerId = cleanerEmail;
        this.serviceType = type;
        this.isAvailable = true;  // might need a toggle later
        this.isOffering = true;   // by default, new services are current offerings
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

    static getServiceTypes() {
        // Just returns values, no keys
        return Object.values(this.SERVICE_TYPES);
    }
}

export default CleaningService;
