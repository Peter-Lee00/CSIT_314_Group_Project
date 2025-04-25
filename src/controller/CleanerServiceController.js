import CleaningService from '../entity/CleaningService';
import Cookies from 'js-cookie';

class CleanerServiceController {
    constructor() {
        const profile = Cookies.get('userProfile');
        
        // Just making sure only cleaners can use this controller
        if (!profile || profile !== 'Cleaner') {
            throw new Error('Not authorized – expected cleaner profile.');
        }
    }

    async getCleanerServices(cleanerEmail) {
        try {
            // Should return a list of services associated with this cleaner
            const fetchedServices = await CleaningService.getCleanerServices(cleanerEmail);
            return fetchedServices;
        } catch (err) {
            console.error("Issue while fetching cleaner's services:", err);
            return []; // fallback so UI doesn't break
        }
    }

    async createService(name, desc, price, durationHrs, cleanerEmail, type, isOffering = true) {
        try {
            // Slightly paranoid: force float just in case
            const parsedPrice = parseFloat(price); 
            const parsedDuration = parseFloat(durationHrs); 

            const newSvc = new CleaningService(
                name,
                desc,
                parsedPrice,
                parsedDuration,
                cleanerEmail,
                type
            );
            newSvc.isOffering = isOffering;

            const response = await newSvc.createService();
            return response;
        } catch (e) {
            console.error("Problem occurred during service creation:", e);
            return null; // means something went wrong
        }
    }

    async updateService(serviceId, updatedData) {
        try {
            const success = await CleaningService.updateService(serviceId, updatedData);
            return success;
        } catch (err) {
            console.error("Update failed:", err);
            return false;
        }
    }

    async deleteService(serviceId) {
        try {
            // caution: deletion is permanent (no recycle bin!)
            const removed = await CleaningService.deleteService(serviceId);
            return removed;
        } catch (err) {
            console.warn("Deletion failed – serviceId:", serviceId);
            console.error(err); // log full error for debugging
            return false;
        }
    }

    getServiceTypes() {
        // This is usually a static method, just pass it straight
        return CleaningService.getServiceTypes();
    }

    async updateServiceOffering(serviceId, isOffering) {
        try {
            const result = await CleaningService.updateServiceOffering(serviceId, isOffering);
            if (result.success) {
                return result;
            } else {
                console.error("Service offering update failed:", result.error);
                return null;
            }
        } catch (error) {
            console.error("Controller error updating service offering:", error);
            return null;
        }
    }
}

export default CleanerServiceController;
