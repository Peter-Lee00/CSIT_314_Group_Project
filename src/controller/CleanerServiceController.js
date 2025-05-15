import CleaningService from '../entity/CleaningService';
import { Util } from '../Util';

class CleanerGetServicesController {
    async getCleanerServices(cleanerEmail) {
        if (!cleanerEmail) {
            return { success: false, data: null, message: "Cleaner email is required." };
        }
        try {
            const data = await CleaningService.getCleanerServices(cleanerEmail);
            return { success: true, data, message: "Services fetched successfully." };
        } catch (err) {
            console.error("Issue while fetching cleaner's services:", err);
            return { success: false, data: null, message: err.message || "Unknown error." };
        }
        }
    }

class CleanerCreateServiceController {
    async createService(name, desc, price, durationHrs, cleanerEmail, type, isOffering = true, serviceArea = '', specialEquipment = '', numWorkers = '', includedTasks = [], serviceAvailableFrom = '', serviceAvailableTo = '') {
        try {
            const parsedPrice = parseFloat(price); 
            const parsedDuration = parseFloat(durationHrs); 
            const newSvc = new CleaningService(
                name,
                desc,
                parsedPrice,
                parsedDuration,
                cleanerEmail,
                type,
                isOffering,
                serviceArea,
                specialEquipment,
                numWorkers,
                includedTasks,
                serviceAvailableFrom,
                serviceAvailableTo
            );
            return await newSvc.createService();
        } catch (e) {
            console.error("Problem occurred during service creation:", e);
            return null;
        }
        }
    }

class CleanerUpdateServiceController {
    async updateService(serviceId, updatedData) {
        if (!serviceId || !updatedData) {
            return { success: false, data: null, message: "Service ID and update data are required." };
        }
        try {
            const result = await CleaningService.updateService(serviceId, updatedData);
            if (result) {
                return { success: true, data: result, message: "Service updated successfully." };
            } else {
                return { success: false, data: null, message: "Failed to update service." };
            }
        } catch (err) {
            console.error("Update failed:", err);
            return { success: false, data: null, message: err.message || "Unknown error." };
        }
        }
    }

class CleanerDeleteServiceController {
    async deleteService(serviceId) {
        if (!serviceId) {
            return { success: false, data: null, message: "Service ID is required." };
        }
        try {
            const result = await CleaningService.deleteService(serviceId);
            if (result) {
                return { success: true, data: result, message: "Service deleted successfully." };
            } else {
                return { success: false, data: null, message: "Failed to delete service." };
            }
        } catch (err) {
            console.warn("Deletion failed – serviceId:", serviceId);
            console.error(err);
            return { success: false, data: null, message: err.message || "Unknown error." };
        }
        }
    }

class CleanerUpdateServiceOfferingController {
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

class CleanerGetConfirmedMatchesController {
    async getConfirmedMatches() {
        try {
            const currentUser = Util.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            const matches = await CleaningService.getConfirmedMatches(currentUser.username);
            return matches.map(match => ({
                ...match,
                price: Number(match.price),
                duration: Number(match.duration),
                confirmedAt: match.confirmedAt || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error in getConfirmedMatches:', error);
            throw error;
        }
    }
}

class CleanerTrackViewCountController {
    async getServiceViewCount(serviceId, viewType = 'monthly') {
        if (!serviceId) {
            return { success: false, data: null, message: "Service ID is required." };
            }
        try {
            const data = await CleaningService.viewServiceViewCount(serviceId, viewType);
            return { success: true, data, message: "View count fetched successfully." };
        } catch (err) {
            return { success: false, data: null, message: err.message || "Unknown error." };
        }
    }
    async trackViewCount(serviceId) {
        if (!serviceId) {
            return { success: false, data: null, message: "Service ID is required." };
        }
        try {
            const data = await CleaningService.trackViewCount(serviceId);
            return { success: true, data, message: "View count tracked successfully." };
        } catch (err) {
            return { success: false, data: null, message: err.message || "Unknown error." };
                }
    }
}

class CleanerTrackShortlistCountController {
    async getServiceShortlistCount(serviceId, viewType = 'monthly') {
        if (!serviceId) {
            return { success: false, data: null, message: "Service ID is required." };
        }
        try {
            const data = await CleaningService.viewServiceShortlistCount(serviceId, viewType);
            return { success: true, data, message: "Shortlist count fetched successfully." };
        } catch (err) {
            return { success: false, data: null, message: err.message || "Unknown error." };
            }
    }
    async trackShortlistCount(serviceId) {
        if (!serviceId) {
            return { success: false, data: null, message: "Service ID is required." };
        }
        try {
            const data = await CleaningService.trackShortlistCount(serviceId);
            return { success: true, data, message: "Shortlist count tracked successfully." };
        } catch (err) {
            return { success: false, data: null, message: err.message || "Unknown error." };
            }
    }
}

class CleanerReadCleaningServicesController {
    async readCleaningServices(cleanerId) {
        if (!cleanerId) {
            return { success: false, data: null, message: "Cleaner ID is required." };
        }
        try {
            const data = await CleaningService.readCleaningServices(cleanerId);
            return { success: true, data, message: "Cleaning services read successfully." };
        } catch (error) {
            console.error('Error in controller reading cleaning services:', error);
            return { success: false, data: null, message: error.message || "Unknown error." };
        }
    }
}

class CleanerSearchConfirmedMatchesController {
    async searchConfirmedMatches(cleanerId, filters = {}) {
        if (!cleanerId) {
            return { success: false, data: null, message: "Cleaner ID is required." };
        }
        try {
            const data = await CleaningService.searchConfirmedMatches(cleanerId, filters);
            return { success: true, data, message: "Confirmed matches searched successfully." };
        } catch (err) {
            return { success: false, data: null, message: err.message || "Unknown error." };
        }
    }
}

export {
    CleanerGetServicesController,
    CleanerCreateServiceController,
    CleanerUpdateServiceController,
    CleanerDeleteServiceController,
    CleanerUpdateServiceOfferingController,
    CleanerGetConfirmedMatchesController,
    CleanerTrackViewCountController,
    CleanerTrackShortlistCountController,
    CleanerReadCleaningServicesController,
    CleanerSearchConfirmedMatchesController
};
