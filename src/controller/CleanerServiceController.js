import CleaningService from '../entity/CleaningService';
import { Util } from '../Util';

class CleanerGetServicesController {
    async getCleanerServices(cleanerEmail) {
        try {
            return await CleaningService.getCleanerServices(cleanerEmail);
        } catch (err) {
            console.error("Issue while fetching cleaner's services:", err);
            return [];
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
        try {
            return await CleaningService.updateService(serviceId, updatedData);
        } catch (err) {
            console.error("Update failed:", err);
            return false;
        }
    }
}

class CleanerDeleteServiceController {
    async deleteService(serviceId) {
        try {
            return await CleaningService.deleteService(serviceId);
        } catch (err) {
            console.warn("Deletion failed – serviceId:", serviceId);
            console.error(err);
            return false;
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
        return await CleaningService.viewServiceViewCount(serviceId, viewType);
    }
    async trackViewCount(serviceId) {
        return await CleaningService.trackViewCount(serviceId);
    }
}

class CleanerTrackShortlistCountController {
    async getServiceShortlistCount(serviceId, viewType = 'monthly') {
        return await CleaningService.viewServiceShortlistCount(serviceId, viewType);
    }
    async trackShortlistCount(serviceId) {
        return await CleaningService.trackShortlistCount(serviceId);
    }
}

class CleanerReadCleaningServicesController {
    async readCleaningServices(cleanerId) {
        try {
            return await CleaningService.readCleaningServices(cleanerId);
        } catch (error) {
            console.error('Error in controller reading cleaning services:', error);
            return [];
        }
    }
}

class CleanerSearchConfirmedMatchesController {
    async searchConfirmedMatches(cleanerId, filters = {}) {
        return await CleaningService.searchConfirmedMatches(cleanerId, filters);
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
