import CleaningServiceRequest from '../entity/CleaningServiceRequest';

class CleanerRequestController {
    /**
     * Get all requests for a given cleaner
     * @param {string} cleanerId
     * @returns {Promise<Array>} Array of request objects
     */
    async getRequestsByCleaner(cleanerId) {
        // Add validation or transformation here if needed
        return await CleaningServiceRequest.getRequestsByCleaner(cleanerId);
    }

    /**
     * Update the status of a request (e.g., ACCEPTED, DECLINED)
     * @param {string} requestId
     * @param {string} newStatus
     * @returns {Promise<boolean>} True if update successful
     */
    async updateRequestStatus(requestId, newStatus) {
        // Add business rules here if needed
        return await CleaningServiceRequest.updateRequestStatus(requestId, newStatus);
    }

    /**
     * (Optional) Get all requests for a given homeowner
     * @param {string} homeownerId
     * @returns {Promise<Array>} Array of request objects
     */
    async getRequestsByHomeowner(homeownerId) {
        return await CleaningServiceRequest.getRequestsByHomeowner(homeownerId);
    }
}

export default CleanerRequestController; 