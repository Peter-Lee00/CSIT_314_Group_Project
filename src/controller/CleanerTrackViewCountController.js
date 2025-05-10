import CleaningService from '../entity/CleaningService';
import { getCurrentUser } from '../Util';

class CleanerTrackViewCountController {
    // Constants for business rules
    static MAX_VIEWS_PER_DAY = 1000;
    static VIEW_COOLDOWN_MINUTES = 5;

    async trackViewCount(serviceId) {
        try {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Check if service exists and belongs to cleaner
            const service = await CleaningService.getServiceById(serviceId);
            if (!service) {
                throw new Error('Service not found');
            }
            if (service.cleanerId !== currentUser.username) {
                throw new Error('Not authorized to track views for this service');
            }

            // Check daily view limit
            const today = new Date().toISOString().split('T')[0];
            const viewHistory = await CleaningService.getViewHistory(serviceId);
            const todayViews = viewHistory[today] || 0;
            if (todayViews >= this.constructor.MAX_VIEWS_PER_DAY) {
                throw new Error(`Maximum daily view limit of ${this.constructor.MAX_VIEWS_PER_DAY} reached`);
            }

            // Check view cooldown
            const lastView = service.lastViewTime;
            if (lastView) {
                const cooldownMs = this.constructor.VIEW_COOLDOWN_MINUTES * 60 * 1000;
                const timeSinceLastView = Date.now() - new Date(lastView).getTime();
                if (timeSinceLastView < cooldownMs) {
                    throw new Error(`Please wait ${this.constructor.VIEW_COOLDOWN_MINUTES} minutes between views`);
                }
            }

            // Delegate to entity
            const result = await CleaningService.incrementViewCount(serviceId);
            if (!result) {
                throw new Error('Failed to track view count');
            }

            return result;
        } catch (error) {
            console.error('Error in trackViewCount:', error);
            throw error;
        }
    }

    async getViewHistory(serviceId) {
        try {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Check if service exists and belongs to cleaner
            const service = await CleaningService.getServiceById(serviceId);
            if (!service) {
                throw new Error('Service not found');
            }
            if (service.cleanerId !== currentUser.username) {
                throw new Error('Not authorized to view history for this service');
            }

            // Delegate to entity
            const history = await CleaningService.getViewHistory(serviceId);

            // Transform and aggregate data
            const aggregatedHistory = {
                total: Object.values(history).reduce((sum, count) => sum + count, 0),
                daily: history,
                lastUpdated: new Date().toISOString()
            };

            return aggregatedHistory;
        } catch (error) {
            console.error('Error in getViewHistory:', error);
            throw error;
        }
    }
}

export default CleanerTrackViewCountController; 