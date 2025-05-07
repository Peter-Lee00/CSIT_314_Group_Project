import CleaningService from '../entity/CleaningService';
import Shortlist from '../entity/Shortlist';
class OwnerCleaningServiceController {
    async searchCleaningService(serviceName, serviceType, priceRange, duration, cleanerId) {
        return await CleaningService.searchCleaningService(serviceName, serviceType, priceRange, duration, cleanerId);
    }

    async saveToShortlist(username, service) {
        return await Shortlist.saveToShortlist(username, service);
    }

    async getShortlistedServices(username) {
        return await Shortlist.getShortlistedServices(username);
    }

    async removeFromShortlist(username, serviceId) {
        return await Shortlist.removeFromShortlist(username, serviceId);
    }
}
export default OwnerCleaningServiceController;