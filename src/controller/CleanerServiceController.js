import CleaningService from '../entity/CleaningService';
import Cookies from 'js-cookie';
import { Util } from '../Util';

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

    async createService(name, desc, price, durationHrs, cleanerEmail, type, isOffering = true, serviceArea = '', specialEquipment = '', numWorkers = '', includedTasks = [], serviceAvailableFrom = '', serviceAvailableTo = '') {
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
                type,
                isOffering,
                serviceArea,
                specialEquipment,
                numWorkers,
                includedTasks,
                serviceAvailableFrom,
                serviceAvailableTo
            );

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

    async getConfirmedMatches() {
        try {
            const currentUser = Util.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Delegate to entity
            const matches = await CleaningService.getConfirmedMatches(currentUser.username);

            // Transform and validate results
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

    async createCleaningService(serviceData) {
        try {
            const currentUser = Util.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Input validation
            if (!serviceData.serviceName || !serviceData.serviceType || !serviceData.price || !serviceData.duration) {
                throw new Error('Missing required fields');
            }

            // Validate price range
            const price = Number(serviceData.price);
            if (price < this.constructor.MIN_PRICE || price > this.constructor.MAX_PRICE) {
                throw new Error(`Price must be between $${this.constructor.MIN_PRICE} and $${this.constructor.MAX_PRICE}`);
            }

            // Validate duration
            const duration = Number(serviceData.duration);
            if (duration < this.constructor.MIN_DURATION || duration > this.constructor.MAX_DURATION) {
                throw new Error(`Duration must be between ${this.constructor.MIN_DURATION} and ${this.constructor.MAX_DURATION} hours`);
            }

            // Check service limit
            const existingServices = await CleaningService.getServicesByCleaner(currentUser.username);
            if (existingServices.length >= this.constructor.MAX_SERVICES_PER_CLEANER) {
                throw new Error(`Maximum of ${this.constructor.MAX_SERVICES_PER_CLEANER} services allowed per cleaner`);
            }

            // Transform service data
            const newService = {
                ...serviceData,
                cleanerId: currentUser.username,
                price: price,
                duration: duration,
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            // Delegate to entity
            const result = await CleaningService.createService(newService);
            if (!result) {
                throw new Error('Failed to create service');
            }

            return result;
        } catch (error) {
            console.error('Error in createCleaningService:', error);
            throw error;
        }
    }

    async updateCleaningService(serviceId, serviceData) {
        try {
            const currentUser = Util.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Check if service exists and belongs to cleaner
            const existingService = await CleaningService.getServiceById(serviceId);
            if (!existingService) {
                throw new Error('Service not found');
            }
            if (existingService.cleanerId !== currentUser.username) {
                throw new Error('Not authorized to update this service');
            }

            // Validate price if provided
            if (serviceData.price) {
                const price = Number(serviceData.price);
                if (price < this.constructor.MIN_PRICE || price > this.constructor.MAX_PRICE) {
                    throw new Error(`Price must be between $${this.constructor.MIN_PRICE} and $${this.constructor.MAX_PRICE}`);
                }
                serviceData.price = price;
            }

            // Validate duration if provided
            if (serviceData.duration) {
                const duration = Number(serviceData.duration);
                if (duration < this.constructor.MIN_DURATION || duration > this.constructor.MAX_DURATION) {
                    throw new Error(`Duration must be between ${this.constructor.MIN_DURATION} and ${this.constructor.MAX_DURATION} hours`);
                }
                serviceData.duration = duration;
            }

            // Transform update data
            const updateData = {
                ...serviceData,
                updatedAt: new Date().toISOString()
            };

            // Delegate to entity
            const result = await CleaningService.updateService(serviceId, updateData);
            if (!result) {
                throw new Error('Failed to update service');
            }

            return result;
        } catch (error) {
            console.error('Error in updateCleaningService:', error);
            throw error;
        }
    }

    async deleteCleaningService(serviceId) {
        try {
            const currentUser = Util.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Check if service exists and belongs to cleaner
            const existingService = await CleaningService.getServiceById(serviceId);
            if (!existingService) {
                throw new Error('Service not found');
            }
            if (existingService.cleanerId !== currentUser.username) {
                throw new Error('Not authorized to delete this service');
            }

            // Check if service has any confirmed matches
            const confirmedMatches = await CleaningService.getConfirmedMatches(currentUser.username);
            const hasConfirmedMatches = confirmedMatches.some(match => match.serviceId === serviceId);
            if (hasConfirmedMatches) {
                throw new Error('Cannot delete service with confirmed matches');
            }

            // Delegate to entity
            const result = await CleaningService.deleteService(serviceId);
            if (!result) {
                throw new Error('Failed to delete service');
            }

            return true;
        } catch (error) {
            console.error('Error in deleteCleaningService:', error);
            throw error;
        }
    }

    /**
     * Read all cleaning services for a cleaner
     * @param {string} cleanerId - The ID of the cleaner
     * @returns {Promise<Array>} Array of cleaning services
     */
    async readCleaningServices(cleanerId) {
        try {
            return await CleaningService.readCleaningServices(cleanerId);
        } catch (error) {
            console.error('Error in controller reading cleaning services:', error);
            return [];
        }
    }
}

class CleanerTrackViewCountController {
    async trackViewCount(serviceId) {
        try {
            const viewCountHistory = await CleaningService.trackViewCount(serviceId);
            return viewCountHistory;
        } catch (error) {
            console.error("Controller Error tracking view count:", error);
            return null;
        }
    }
}

class CleanerTrackShortlistCountController {
    async trackShortlistCount(serviceId) {
        try {
            const shortlistCountHistory = await CleaningService.trackShortlistCount(serviceId);
            return shortlistCountHistory;
        } catch (error) {
            console.error("Controller Error tracking shortlist count:", error);
            return null;
        }
    }
}

export { CleanerServiceController, CleanerTrackViewCountController, CleanerTrackShortlistCountController };
