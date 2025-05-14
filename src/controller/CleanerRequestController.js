import CleaningServiceRequest from '../entity/CleaningServiceRequest';

class GetRequestsByCleanerController {
    async getRequestsByCleaner(cleanerId) {
        if (!cleanerId) {
            throw new Error("Cleaner ID is required.");
        }
        try {
            const requests = await CleaningServiceRequest.getRequestsByCleaner(cleanerId);
            return requests || [];
        } catch (error) {
            console.error("Error fetching requests for cleaner:", error);
            return [];
        }
    }
}

class UpdateRequestStatusController {
    async updateRequestStatus(requestId, newStatus) {
        if (!requestId || !newStatus) {
            throw new Error("Request ID and new status are required.");
        }
        try {
            const result = await CleaningServiceRequest.updateRequestStatus(requestId, newStatus);
            return !!result;
        } catch (error) {
            console.error("Error updating request status:", error);
            return false;
        }
    }
}

class GetRequestsByHomeownerController {
    async getRequestsByHomeowner(homeownerId) {
        if (!homeownerId) {
            throw new Error("Homeowner ID is required.");
        }
        try {
            const requests = await CleaningServiceRequest.getRequestsByHomeowner(homeownerId);
            return requests || [];
        } catch (error) {
            console.error("Error fetching requests for homeowner:", error);
            return [];
        }
    }
}

class CreateServiceRequestController {
    async createRequest(serviceId, homeownerId, cleanerId, message = '', requestedDate = '') {
        return await CleaningServiceRequest.createRequest(serviceId, homeownerId, cleanerId, message, requestedDate);
    }
}

export {
    GetRequestsByCleanerController,
    UpdateRequestStatusController,
    GetRequestsByHomeownerController,
    CreateServiceRequestController
};