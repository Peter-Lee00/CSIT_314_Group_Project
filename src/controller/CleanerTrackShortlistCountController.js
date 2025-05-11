import CleaningService from '../entity/CleaningService';
import { getCurrentUser } from '../Util';

class CleanerTrackShortlistCountController {
    constructor() {
        this.cleanerService = new CleaningService();
    }

    // Constants for business rules
    static MAX_SHORTLISTS_PER_DAY = 100;
    static SHORTLIST_COOLDOWN_MINUTES = 10;

    async trackShortlistCount(serviceId, viewType = 'monthly') {
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
                throw new Error('Not authorized to track shortlists for this service');
            }

            // Check daily shortlist limit
            const today = new Date().toISOString().split('T')[0];
            const shortlistHistory = await CleaningService.getShortlistHistory(serviceId);
            const todayShortlists = shortlistHistory[today] || 0;
            if (todayShortlists >= this.constructor.MAX_SHORTLISTS_PER_DAY) {
                throw new Error(`Maximum daily shortlist limit of ${this.constructor.MAX_SHORTLISTS_PER_DAY} reached`);
            }

            // Check shortlist cooldown
            const lastShortlist = service.lastShortlistTime;
            if (lastShortlist) {
                const cooldownMs = this.constructor.SHORTLIST_COOLDOWN_MINUTES * 60 * 1000;
                const timeSinceLastShortlist = Date.now() - new Date(lastShortlist).getTime();
                if (timeSinceLastShortlist < cooldownMs) {
                    throw new Error(`Please wait ${this.constructor.SHORTLIST_COOLDOWN_MINUTES} minutes between shortlists`);
                }
            }

            // Delegate to entity
            const result = await CleaningService.incrementShortlistCount(serviceId, viewType);
            if (!result) {
                throw new Error('Failed to track shortlist count');
            }

            return result;
        } catch (error) {
            console.error('Error in trackShortlistCount:', error);
            throw error;
        }
    }

    async getShortlistHistory(serviceId) {
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
                throw new Error('Not authorized to view shortlist history for this service');
            }

            // Delegate to entity
            const history = await CleaningService.getShortlistHistory(serviceId);

            // Transform and aggregate data
            const aggregatedHistory = {
                total: Object.values(history).reduce((sum, count) => sum + count, 0),
                daily: history,
                lastUpdated: new Date().toISOString()
            };

            return aggregatedHistory;
        } catch (error) {
            console.error('Error in getShortlistHistory:', error);
            throw error;
        }
    }
}

export default CleanerTrackShortlistCountController; 