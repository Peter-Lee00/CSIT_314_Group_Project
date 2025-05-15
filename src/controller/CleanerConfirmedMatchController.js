import CleaningServiceRequest from '../entity/CleaningServiceRequest';
import CleaningService from '../entity/CleaningService';

class CleanerGetConfirmedMatchesController {
    async getConfirmedMatches(cleanerId) {
        if (!cleanerId) {
            return { success: false, data: null, message: "Cleaner ID is required." };
        }
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

            // Return enriched objects with both request and service details
            const result = confirmed.map(request => ({
                ...request,
                serviceDetails: serviceDetails[request.serviceId] || {}
            }));

            return { success: true, data: result, message: "Confirmed matches fetched successfully." };
        } catch (error) {
            console.error('Error in getConfirmedMatches:', error);
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
                if (filters.serviceName && service.serviceName !== filters.serviceName) return false;
                if (filters.serviceType && service.serviceType !== filters.serviceType) return false;
                if (filters.priceRange && filters.priceRange.length === 2) {
                    if (!service.price) return false;
                    const [min, max] = filters.priceRange;
                    if (service.price < Number(min) || service.price > Number(max)) return false;
                }
                if (filters.date && request.requestedDate !== filters.date) return false;
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
            const result = confirmed.map(request => ({
                ...request,
                serviceDetails: serviceDetails[request.serviceId] || {}
            }));

            return { success: true, data: result, message: "Confirmed matches searched successfully." };
        } catch (error) {
            console.error('Error in searchConfirmedMatches:', error);
            return { success: false, data: null, message: error.message || "Unknown error." };
        }
    }
}

export {
    CleanerGetConfirmedMatchesController,
    CleanerSearchConfirmedMatchesController
};