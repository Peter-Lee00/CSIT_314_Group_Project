import Shortlist from '../entity/Shortlist';
import CleaningService from '../entity/CleaningService';

class OwnerViewShortlistController {
    // View a cleaning service from shortlist by its ID
    async viewServiceFromShortlist(serviceId) {
        try {
            const service = new CleaningService();
            const serviceData = await service.viewService(serviceId);
            return serviceData;
        } catch (error) {
            console.error('Error viewing service:', error);
            return error;
        }
    }
}

class OwnerSaveShortlistController {
    // Save a cleaning service to the user's shortlist
    async saveToShortlist(username, service) {
        try {
            const result = await Shortlist.saveToShortlist(username, service);
            return result;
        } catch (error) {
            console.error('Error saving service to shortlist:', error);
            return { success: false, message: error.message };
        }
    }
}

class OwnerSearchShortlistController {
    // Search for services in the user's shortlist based on filters
    async searchShortlist(username, serviceName, serviceType, priceRange, duration) {
        try {
            const shortlistResult = await Shortlist.searchShortlistedServices(username, { serviceName, serviceType, priceRange, duration });
            return shortlistResult;
        } catch (error) {
            console.error('Error searching shortlist:', error);
            return [];
        }
    }
}

class OwnerDeleteShortlistController {
    // Delete a shortlist entry by its ID
    async deleteShortlist(shortlistId) {
        try {
            const shortlist = new Shortlist();
            const success = await shortlist.deleteShortlist(shortlistId);
            if (success) {
                return { success: true, message: 'Shortlist entry deleted successfully' };
            } else {
                return { success: false, message: 'Failed to delete shortlist' };
            }
        } catch (error) {
            console.error('Error deleting shortlist:', error);
            return { success: false, message: error.message };
        }
    }
}

export {
    OwnerSaveShortlistController,
    OwnerSearchShortlistController,
    OwnerViewShortlistController,
    OwnerDeleteShortlistController
};
