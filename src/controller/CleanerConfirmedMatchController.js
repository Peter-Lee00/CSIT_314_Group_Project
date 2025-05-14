import CleaningServiceRequest from '../entity/CleaningServiceRequest';
import CleaningService from '../entity/CleaningService';

class CleanerConfirmedMatchController {
    // Get confirmed matches (accepted requests) for a cleaner, with all filtering (including service details)
    async getConfirmedMatches(cleanerId, filters = {}) {
        try {
            // Get all requests for this cleaner
            const allRequests = await CleaningServiceRequest.getRequestsByCleaner(cleanerId);
            // Only accepted/confirmed
            let confirmed = allRequests.filter(r => r.status === 'ACCEPTED');

            // Fetch all unique service details in one go
            const serviceIds = [...new Set(confirmed.map(req => req.serviceId))];
            const serviceDetails = {};
            for (const id of serviceIds) {
                const service = await CleaningService.getServiceById(id);
                if (service) serviceDetails[id] = service;
            }

            // Apply filters (including those based on service details)
            confirmed = confirmed.filter(request => {
                const service = serviceDetails[request.serviceId] || {};
                // Service Name filter
                if (filters.serviceName && service.serviceName !== filters.serviceName) return false;
                // Service Type filter
                if (filters.serviceType && service.serviceType !== filters.serviceType) return false;
                // Price Range filter
                if (filters.priceRange && filters.priceRange.length === 2) {
                    if (!service.price) return false;
                    const [min, max] = filters.priceRange;
                    if (service.price < Number(min) || service.price > Number(max)) return false;
                }
                // Date filter
                if (filters.date && request.requestedDate !== filters.date) return false;
                // Search filter (searches multiple fields)
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    const matches =
                        (service.serviceName && service.serviceName.toLowerCase().includes(searchTerm)) ||
                        (service.serviceType && service.serviceType.toLowerCase().includes(searchTerm)) ||
                        (service.price && String(service.price).includes(searchTerm)) ||
                        (service.serviceArea && service.serviceArea.toLowerCase().includes(searchTerm)) ||
                        (request.homeownerId && request.homeownerId.toLowerCase().includes(searchTerm));
                    if (!matches) return false;
                }
                return true;
            });

            // Return enriched objects with both request and service details
            return confirmed.map(request => ({
                ...request,
                serviceDetails: serviceDetails[request.serviceId] || {}
            }));
        } catch (error) {
            console.error('Error in getConfirmedMatches:', error);
            throw error;
        }
    }

    // Search confirmed matches with additional filters
    async searchConfirmedMatches(cleanerId, filters = {}) {
        return this.getConfirmedMatches(cleanerId, filters);
    }
}

export default CleanerConfirmedMatchController;