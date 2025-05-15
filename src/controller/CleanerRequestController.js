import CleaningServiceRequest from '../entity/CleaningServiceRequest';

class GetRequestsByCleanerController {
    async getRequestsByCleaner(cleanerId) {
        if (!cleanerId) {
            return { success: false, data: null, message: "Cleaner ID is required." };
        }
        try {
            const requests = await CleaningServiceRequest.getRequestsByCleaner(cleanerId);
            return { success: true, data: requests || [], message: "Requests fetched successfully." };
        } catch (error) {
            console.error("Error fetching requests for cleaner:", error);
            return { success: false, data: null, message: error.message || "Unknown error." };
        }
    }
}

class UpdateRequestStatusController {
    async updateRequestStatus(requestId, newStatus) {
        if (!requestId || !newStatus) {
            return { success: false, data: null, message: "Request ID and new status are required." };
        }
        try {
            const result = await CleaningServiceRequest.updateRequestStatus(requestId, newStatus);
            if (result) {
                return { success: true, data: result, message: "Request status updated successfully." };
            } else {
                return { success: false, data: null, message: "Failed to update request status." };
            }
        } catch (error) {
            console.error("Error updating request status:", error);
            return { success: false, data: null, message: error.message || "Unknown error." };
        }
    }
}

class GetRequestsByHomeownerController {
    async getRequestsByHomeowner(homeownerId) {
        if (!homeownerId) {
            return { success: false, data: null, message: "Homeowner ID is required." };
        }
        try {
            const requests = await CleaningServiceRequest.getRequestsByHomeowner(homeownerId);
            return { success: true, data: requests || [], message: "Requests fetched successfully." };
        } catch (error) {
            console.error("Error fetching requests for homeowner:", error);
            return { success: false, data: null, message: error.message || "Unknown error." };
        }
    }
}

class CreateServiceRequestController {
    async createRequest(serviceId, homeownerId, cleanerId, message = '', requestedDate = '') {
        if (!serviceId || !homeownerId || !cleanerId) {
            return { success: false, data: null, message: "Service ID, Homeowner ID, and Cleaner ID are required." };
        }
        try {
            const result = await CleaningServiceRequest.createRequest(serviceId, homeownerId, cleanerId, message, requestedDate);
            if (result) {
                return { success: true, data: result, message: "Service request created successfully." };
            } else {
                return { success: false, data: null, message: "Failed to create service request." };
            }
        } catch (error) {
            console.error("Error creating service request:", error);
            return { success: false, data: null, message: error.message || "Unknown error." };
        }
    }
}

export {
    GetRequestsByCleanerController,
    UpdateRequestStatusController,
    GetRequestsByHomeownerController,
    CreateServiceRequestController
};