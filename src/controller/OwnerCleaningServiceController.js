import CleaningService from '../entity/CleaningService';
import Shortlist from '../entity/Shortlist';
import CleaningServiceRequest from '../entity/CleaningServiceRequest';

class OwnerCleaningServiceController {
    // Constants for business rules
    static MAX_SHORTLIST_ITEMS = 10;
    static MIN_PRICE = 0;
    static MAX_PRICE = 10000;
    static MIN_DURATION = 0.5;
    static MAX_DURATION = 24;

    async searchCleaningService(serviceName, serviceType, priceRange, duration, cleanerId) {
        try {
            // Input validation
            if (priceRange && priceRange.length === 2) {
                const [min, max] = priceRange;
                if (min < this.constructor.MIN_PRICE || max > this.constructor.MAX_PRICE) {
                    throw new Error(`Price must be between $${this.constructor.MIN_PRICE} and $${this.constructor.MAX_PRICE}`);
                }
            }

            if (duration && (duration < this.constructor.MIN_DURATION || duration > this.constructor.MAX_DURATION)) {
                throw new Error(`Duration must be between ${this.constructor.MIN_DURATION} and ${this.constructor.MAX_DURATION} hours`);
            }

            // Transform search parameters
            const searchParams = {
                serviceName: serviceName?.trim(),
                serviceType: serviceType?.trim(),
                priceRange: priceRange?.map(Number),
                duration: duration ? Number(duration) : undefined,
                cleanerId: cleanerId?.trim()
            };

            // Delegate to entity
            const results = await CleaningService.searchCleaningService(
                searchParams.serviceName,
                searchParams.serviceType,
                searchParams.priceRange,
                searchParams.duration,
                searchParams.cleanerId
            );

            // Transform results
            return results?.map(service => ({
                ...service,
                price: Number(service.price),
                duration: Number(service.duration)
            })) || [];
        } catch (error) {
            console.error('Error in searchCleaningService:', error);
            throw error;
        }
    }

    async saveToShortlist(username, service) {
        try {
            // Input validation
            if (!username || !service) {
                throw new Error('Username and service are required');
            }

            // Check if service exists
            const serviceExists = await CleaningService.getServiceById(service.id);
            if (!serviceExists) {
                throw new Error('Service does not exist');
            }

            // Check shortlist limit
            const currentShortlist = await this.getShortlistedServices(username);
            if (currentShortlist.length >= this.constructor.MAX_SHORTLIST_ITEMS) {
                throw new Error(`Maximum of ${this.constructor.MAX_SHORTLIST_ITEMS} items allowed in shortlist`);
            }

            // Check for duplicates
            const isDuplicate = currentShortlist.some(item => item.id === service.id);
            if (isDuplicate) {
                throw new Error('Service is already in your shortlist');
            }

            // Transform service data
            const shortlistItem = {
                ...service,
                shortlistedAt: new Date().toISOString(),
                price: Number(service.price),
                duration: Number(service.duration)
            };

            // Delegate to entity
            const result = await Shortlist.saveToShortlist(username, shortlistItem);
            if (!result) {
                throw new Error('Failed to save to shortlist');
            }

            return true;
        } catch (error) {
            console.error('Error in saveToShortlist:', error);
            throw error;
        }
    }

    async getShortlistedServices(username) {
        try {
            // Input validation
            if (!username) {
                throw new Error('Username is required');
            }

            // Delegate to entity
            const services = await Shortlist.getShortlistedServices(username);

            // Transform results
            return services.map(service => ({
                ...service,
                price: Number(service.price),
                duration: Number(service.duration),
                shortlistedAt: service.shortlistedAt || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error in getShortlistedServices:', error);
            throw error;
        }
    }

    async removeFromShortlist(username, serviceId) {
        try {
            // Input validation
            if (!username || !serviceId) {
                throw new Error('Username and service ID are required');
            }

            // Check if service exists in shortlist
            const shortlist = await this.getShortlistedServices(username);
            const serviceExists = shortlist.some(item => item.id === serviceId);
            if (!serviceExists) {
                throw new Error('Service not found in shortlist');
            }

            // Delegate to entity
            const result = await Shortlist.removeFromShortlist(username, serviceId);
            if (!result) {
                throw new Error('Failed to remove from shortlist');
            }

            return true;
        } catch (error) {
            console.error('Error in removeFromShortlist:', error);
            throw error;
        }
    }

    // --- Service Request Logic ---

    async createServiceRequest(serviceId, homeownerId, cleanerId, message = '', requestedDate = '') {
        try {
            // Input validation
            if (!serviceId || !homeownerId || !cleanerId) {
                throw new Error('Missing required fields for service request');
            }
            // Delegate to entity
            const result = await CleaningServiceRequest.createRequest(serviceId, homeownerId, cleanerId, message, requestedDate);
            if (!result) {
                throw new Error('Failed to create service request');
    }
            return result;
        } catch (error) {
            console.error('Error in createServiceRequest:', error);
            throw error;
        }
    }

    async getServiceHistory(username, filters = {}) {
        try {
            if (!username) throw new Error('Username is required');
            // Fetch all requests for this homeowner
            let allRequests = await CleaningServiceRequest.getRequestsByHomeowner(username);
            // Apply status filter
            if (filters.status) {
                allRequests = allRequests.filter(r => r.status === filters.status);
            }
            // Apply date filter
            if (filters.startDate) {
                allRequests = allRequests.filter(r => !r.requestedDate || r.requestedDate >= filters.startDate);
            }
            if (filters.endDate) {
                allRequests = allRequests.filter(r => !r.requestedDate || r.requestedDate <= filters.endDate);
            }
            // Apply serviceType filter (if service details are included)
            if (filters.serviceType && filters.serviceDetailsMap) {
                allRequests = allRequests.filter(r => {
                    const service = filters.serviceDetailsMap[r.serviceId];
                    return service && service.serviceType === filters.serviceType;
                });
            }
            // Add more filters as needed
            return allRequests;
        } catch (error) {
            console.error('Error in getServiceHistory:', error);
            throw error;
        }
    }

    async updateRequestStatus(requestId, newStatus) {
        try {
            if (!requestId || !newStatus) {
                throw new Error('Request ID and new status are required');
            }
            const result = await CleaningServiceRequest.updateRequestStatus(requestId, newStatus);
            if (!result) {
                throw new Error('Failed to update request status');
            }
            return true;
        } catch (error) {
            console.error('Error in updateRequestStatus:', error);
            throw error;
        }
    }

    /**
     * Get confirmed matches for a homeowner (i.e., accepted requests)
     * @param {string} username - Homeowner username
     * @param {object} filters - Optional filters (date, serviceType, etc)
     * @returns {Promise<Array>} Confirmed matches
     */
    async getConfirmedMatches(username, filters = {}) {
        try {
            if (!username) throw new Error('Username is required');
            let allRequests = await CleaningServiceRequest.getRequestsByHomeowner(username);
            // Only accepted/confirmed
            let confirmed = allRequests.filter(r => r.status === 'ACCEPTED');
            // Date filter
            if (filters.startDate) {
                confirmed = confirmed.filter(r => !r.requestedDate || r.requestedDate >= filters.startDate);
            }
            if (filters.endDate) {
                confirmed = confirmed.filter(r => !r.requestedDate || r.requestedDate <= filters.endDate);
            }
            // Service type filter (if service details provided)
            if (filters.serviceType && filters.serviceDetailsMap) {
                confirmed = confirmed.filter(r => {
                    const service = filters.serviceDetailsMap[r.serviceId];
                    return service && service.serviceType === filters.serviceType;
                });
            }
            // Add more filters as needed
            return confirmed;
        } catch (error) {
            console.error('Error in getConfirmedMatches:', error);
            throw error;
        }
    }

    /**
     * Filter confirmed matches by arbitrary criteria (search, price, etc)
     * @param {Array} confirmedMatches - Array of confirmed match objects
     * @param {object} filters - Filtering options
     * @param {object} serviceDetailsMap - Map of serviceId to service details
     * @returns {Array} Filtered matches
     */
    filterConfirmedMatches(confirmedMatches, filters = {}, serviceDetailsMap = {}) {
        return confirmedMatches.filter(request => {
            const service = serviceDetailsMap[request.serviceId] || {};
            const matchesServiceName = !filters.serviceName || service.serviceName === filters.serviceName;
            const matchesServiceType = !filters.serviceType || service.serviceType === filters.serviceType;
            const matchesPrice = !filters.priceRange || (() => {
                if (!service.price) return false;
                const [min, max] = filters.priceRange.split('-').map(Number);
                return service.price >= min && service.price <= max;
            })();
            const matchesDate = !filters.date || request.requestedDate === filters.date;
            const matchesSearch = !filters.search || (
                (service.serviceName && service.serviceName.toLowerCase().includes(filters.search.toLowerCase())) ||
                (service.serviceType && service.serviceType.toLowerCase().includes(filters.search.toLowerCase())) ||
                (service.price && String(service.price).includes(filters.search)) ||
                (service.serviceArea && service.serviceArea.toLowerCase().includes(filters.search.toLowerCase()))
            );
            return matchesServiceName && matchesServiceType && matchesPrice && matchesDate && matchesSearch;
        });
    }

    async searchShortlistedServices(username, filters) {
        return await Shortlist.searchShortlistedServices(username, filters);
    }
}

export default OwnerCleaningServiceController;