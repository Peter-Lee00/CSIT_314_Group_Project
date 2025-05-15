import CleaningService from '../entity/CleaningService';
import Shortlist from '../entity/Shortlist';
import CleaningServiceRequest from '../entity/CleaningServiceRequest';

class OwnerSearchCleaningServiceController {
    async searchCleaningService(serviceName, serviceType, priceRange, duration) {
        try {
            return await CleaningService.searchCleaningService(serviceName, serviceType, priceRange, duration, null);
        } catch (error) {
            console.error('Error searching for cleaning services:', error);
            return null;
        }
        }
    }

class OwnerSaveShortlistController {
    static MAX_SHORTLIST_ITEMS = 10;
    async saveToShortlist(username, service) {
        try {
            if (!username || !service) {
                throw new Error('Username and service are required');
            }
            const serviceExists = await CleaningService.getServiceById(service.id);
            if (!serviceExists) {
                throw new Error('Service does not exist');
            }
            const currentShortlist = await new OwnerGetShortlistedServicesController().getShortlistedServices(username);
            if (currentShortlist.length >= OwnerSaveShortlistController.MAX_SHORTLIST_ITEMS) {
                throw new Error(`Maximum of ${OwnerSaveShortlistController.MAX_SHORTLIST_ITEMS} items allowed in shortlist`);
            }
            const isDuplicate = currentShortlist.some(item => item.id === service.id);
            if (isDuplicate) {
                throw new Error('Service is already in your shortlist');
            }
            const shortlistItem = {
                ...service,
                shortlistedAt: new Date().toISOString(),
                price: Number(service.price),
                duration: Number(service.duration)
            };
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
    }

class OwnerGetShortlistedServicesController {
    async getShortlistedServices(username) {
        try {
            if (!username) {
                throw new Error('Username is required');
            }
            const services = await Shortlist.getShortlistedServices(username);
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
    }

class OwnerRemoveFromShortlistController {
    async removeFromShortlist(username, serviceId) {
        try {
            if (!username || !serviceId) {
                throw new Error('Username and service ID are required');
            }
            const shortlist = await new OwnerGetShortlistedServicesController().getShortlistedServices(username);
            const serviceExists = shortlist.some(item => item.id === serviceId);
            if (!serviceExists) {
                throw new Error('Service not found in shortlist');
            }
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
    }

class OwnerCreateServiceRequestController {
    async createServiceRequest(serviceId, homeownerId, cleanerId, message = '', requestedDate = '') {
        try {
            if (!serviceId || !homeownerId || !cleanerId) {
                throw new Error('Missing required fields for service request');
            }
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
    }

class OwnerGetServiceHistoryController {
    async getServiceHistory(username, filters = {}) {
        try {
            if (!username) throw new Error('Username is required');
            let allRequests = await CleaningServiceRequest.getRequestsByHomeowner(username);
            if (filters.status) {
                allRequests = allRequests.filter(r => r.status === filters.status);
            }
            if (filters.startDate) {
                allRequests = allRequests.filter(r => !r.requestedDate || r.requestedDate >= filters.startDate);
            }
            if (filters.endDate) {
                allRequests = allRequests.filter(r => !r.requestedDate || r.requestedDate <= filters.endDate);
            }
            if (filters.serviceType && filters.serviceDetailsMap) {
                allRequests = allRequests.filter(r => {
                    const service = filters.serviceDetailsMap[r.serviceId];
                    return service && service.serviceType === filters.serviceType;
                });
            }
            return allRequests;
        } catch (error) {
            console.error('Error in getServiceHistory:', error);
            throw error;
        }
        }
    }

class OwnerUpdateRequestStatusController {
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
    }

class OwnerGetConfirmedMatchesController {
    async getConfirmedMatches(username, filters = {}) {
        try {
            if (!username) throw new Error('Username is required');
            let allRequests = await CleaningServiceRequest.getRequestsByHomeowner(username);
            let confirmed = allRequests.filter(r => r.status === 'ACCEPTED');
            if (filters.startDate) {
                confirmed = confirmed.filter(r => !r.requestedDate || r.requestedDate >= filters.startDate);
            }
            if (filters.endDate) {
                confirmed = confirmed.filter(r => !r.requestedDate || r.requestedDate <= filters.endDate);
            }
            if (filters.serviceType && filters.serviceDetailsMap) {
                confirmed = confirmed.filter(r => {
                    const service = filters.serviceDetailsMap[r.serviceId];
                    return service && service.serviceType === filters.serviceType;
                });
            }
            return confirmed;
        } catch (error) {
            console.error('Error in getConfirmedMatches:', error);
            throw error;
        }
    }
}

class OwnerSearchShortlistedServicesController {
    async searchShortlistedServices(username, filters = {}) {
        try {
            if (!username) {
                return { success: false, data: null, message: "Username is required" };
            }

            // Get all shortlisted services for the user
            const allServices = await Shortlist.getShortlistedServices(username);
            
            // Apply filters if provided
            let filteredServices = allServices;
            if (filters.serviceName) {
                filteredServices = filteredServices.filter(service => 
                    service.serviceName.toLowerCase().includes(filters.serviceName.toLowerCase())
                );
            }
            if (filters.serviceType) {
                filteredServices = filteredServices.filter(service => 
                    service.serviceType === filters.serviceType
                );
            }
            if (filters.priceRange && filters.priceRange.length === 2) {
                const [min, max] = filters.priceRange;
                filteredServices = filteredServices.filter(service => 
                    service.price >= min && service.price <= max
                );
            }
            if (filters.date) {
                filteredServices = filteredServices.filter(service => 
                    service.shortlistedAt && service.shortlistedAt.includes(filters.date)
                );
            }

            return { 
                success: true, 
                data: filteredServices, 
                message: "Shortlisted services searched successfully" 
            };
        } catch (error) {
            console.error('Error in searchShortlistedServices:', error);
            return { 
                success: false, 
                data: null, 
                message: error.message || "Failed to search shortlisted services" 
            };
        }
    }
}

class OwnerGetRequestsByHomeownerController {
    async getRequestsByHomeowner(homeownerId) {
        try {
            if (!homeownerId) {
                return { success: false, data: null, message: "Homeowner ID is required" };
            }

            // Get all requests for this homeowner
            const requests = await CleaningServiceRequest.getRequestsByHomeowner(homeownerId);
            
            // Fetch service details for each request
            const serviceIds = [...new Set(requests.map(req => req.serviceId))];
            const serviceDetails = {};
            for (const id of serviceIds) {
                const service = await CleaningService.getServiceById(id);
                if (service) serviceDetails[id] = service;
            }

            // Enrich requests with service details
            const enrichedRequests = requests.map(request => ({
                ...request,
                serviceDetails: serviceDetails[request.serviceId] || {}
            }));

            return { 
                success: true, 
                data: enrichedRequests, 
                message: "Requests fetched successfully" 
            };
        } catch (error) {
            console.error('Error in getRequestsByHomeowner:', error);
            return { 
                success: false, 
                data: null, 
                message: error.message || "Failed to fetch requests" 
            };
    }
    }
}

class OwnerSearchServiceHistoryController {
    async searchServiceHistory(username, filters = {}) {
        try {
            if (!username) {
                return { 
                    success: false, 
                    data: null, 
                    message: "Username is required" 
                };
            }

            // Get filtered requests using the entity method
            const requests = await CleaningServiceRequest.searchServiceHistory(username, filters);
            
            // Fetch service details for each request
            const serviceIds = [...new Set(requests.map(req => req.serviceId))];
            const serviceDetails = {};
            for (const id of serviceIds) {
                const service = await CleaningService.getServiceById(id);
                if (service) serviceDetails[id] = service;
            }

            // Apply service type filter if provided
            let filteredRequests = requests;
            if (filters.serviceType) {
                filteredRequests = filteredRequests.filter(r => {
                    const service = serviceDetails[r.serviceId];
                    return service && service.serviceType === filters.serviceType;
                });
            }

            // Enrich requests with service details
            const enrichedRequests = filteredRequests.map(request => ({
                ...request,
                serviceDetails: serviceDetails[request.serviceId] || {}
            }));

            return { 
                success: true, 
                data: enrichedRequests, 
                message: "Service history searched successfully" 
            };
        } catch (error) {
            console.error('Error in searchServiceHistory:', error);
            return { 
                success: false, 
                data: null, 
                message: error.message || "Failed to search service history" 
            };
        }
    }
}

export {
    OwnerSearchCleaningServiceController,
    OwnerSaveShortlistController,
    OwnerGetShortlistedServicesController,
    OwnerRemoveFromShortlistController,
    OwnerCreateServiceRequestController,
    OwnerGetServiceHistoryController,
    OwnerUpdateRequestStatusController,
    OwnerGetConfirmedMatchesController,
    OwnerSearchShortlistedServicesController,
    OwnerGetRequestsByHomeownerController,
    OwnerSearchServiceHistoryController
};