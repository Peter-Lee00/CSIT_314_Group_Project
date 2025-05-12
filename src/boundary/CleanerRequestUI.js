import React, { useState, useEffect } from 'react';
import CleanerRequestController from '../controller/CleanerRequestController';
import CleaningService from '../entity/CleaningService';
import './CleanerRequestUI.css';

function CleanerRequestUI() {
    const [requests, setRequests] = useState([]);
    const [services, setServices] = useState({});
    const controller = new CleanerRequestController();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        const cleanerRequests = await controller.getRequestsByCleaner();
        setRequests(cleanerRequests);

        // Load service details for each request
        const serviceIds = [...new Set(cleanerRequests.map(req => req.serviceId))];
        const serviceDetails = {};
        for (const serviceId of serviceIds) {
            const service = await CleaningService.getServiceById(serviceId);
            if (service) {
                serviceDetails[serviceId] = service;
            }
        }
        setServices(serviceDetails);
    };

    const handleAcceptRequest = async (requestId) => {
        const success = await controller.updateRequestStatus(requestId, 'ACCEPTED');
        if (success) {
            alert('Request accepted successfully!');
            loadRequests();
        } else {
            alert('Failed to accept request. Please try again.');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        const success = await controller.updateRequestStatus(requestId, 'DECLINED');
        if (success) {
            alert('Request declined successfully!');
            loadRequests();
        } else {
            alert('Failed to decline request. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FFA500';
            case 'ACCEPTED': return '#4CAF50';
            case 'DECLINED': return '#f44336';
            default: return '#666';
        }
    };

    return (
        <div className="crContainer">
            <h2>Cleaning Service Requests</h2>
            <div className="crRequestsList">
                {requests.length === 0 ? (
                    <p>No requests found.</p>
                ) : (
                    requests.map(request => (
                        <div key={request.id} className="crRequestCard">
                            <div className="crRequestHeader">
                                <h3>{services[request.serviceId]?.serviceName || 'Unknown Service'}</h3>
                                <span 
                                    className="crStatus"
                                    style={{ backgroundColor: getStatusColor(request.status) }}
                                >
                                    {request.status}
                                </span>
                            </div>
                            <div className="crRequestDetails">
                                <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                                {request.message && <p><strong>Message:</strong> {request.message}</p>}
                                <p><strong>Service Type:</strong> {services[request.serviceId]?.serviceType || 'N/A'}</p>
                                <p><strong>Price:</strong> ${services[request.serviceId]?.price || 'N/A'}</p>
                            </div>
                            {request.status === 'PENDING' && (
                                <div className="crRequestActions">
                                    <button 
                                        className="crAcceptButton"
                                        onClick={() => handleAcceptRequest(request.id)}
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        className="crDeclineButton"
                                        onClick={() => handleDeclineRequest(request.id)}
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CleanerRequestUI; 