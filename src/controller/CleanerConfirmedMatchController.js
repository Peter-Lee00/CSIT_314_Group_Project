import CleaningServiceRequest from '../entity/CleaningServiceRequest';
import CleaningService from '../entity/CleaningService';

class CleanerConfirmedMatchController {
    /**
     * Get confirmed matches (accepted requests) for a cleaner, with optional filters
     * @param {string} cleanerId
     * @param {object} filters (optional: { serviceType, date, etc. })
     * @returns {Promise<Array>} Array of confirmed match objects
     */
    async getConfirmedMatches(cleanerId, filters = {}) {
        // Get all requests for this cleaner
        const allRequests = await CleaningServiceRequest.getRequestsByCleaner(cleanerId);
        // Only accepted/confirmed
        let confirmed = allRequests.filter(r => r.status === 'ACCEPTED');
        // Apply filters
        if (filters.serviceType) {
            // Need to fetch service details for each request
            const serviceDetails = {};
            for (const req of confirmed) {
                if (!serviceDetails[req.serviceId]) {
                    serviceDetails[req.serviceId] = await CleaningService.getServiceById(req.serviceId);
                }
            }
            confirmed = confirmed.filter(r => {
                const service = serviceDetails[r.serviceId];
                return service && service.serviceType === filters.serviceType;
            });
        }
        if (filters.date) {
            confirmed = confirmed.filter(r => r.requestedDate === filters.date);
        }
        // Add more filters as needed
        return confirmed;
    }
}

export default CleanerConfirmedMatchController; 