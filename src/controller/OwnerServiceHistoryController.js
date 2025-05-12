import CleaningServiceRequest from '../entity/CleaningServiceRequest';

class OwnerServiceHistoryController {
    /**
     * Get all service requests for a given homeowner
     * @param {string} homeownerId
     * @returns {Promise<Array>} Array of request objects
     */
    async getRequestsByHomeowner(homeownerId) {
        return await CleaningServiceRequest.getRequestsByHomeowner(homeownerId);
    }
}

export default OwnerServiceHistoryController; 