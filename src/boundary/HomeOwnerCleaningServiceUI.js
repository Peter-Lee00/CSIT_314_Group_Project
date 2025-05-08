import React, { useEffect, useState } from "react";
import OwnerCleaningServiceController from "../controller/OwnerCleaningServiceController";
import "./HomeOwnerCleaningServiceUI.css"; // Create this CSS file for styling
import Swal from "sweetalert2";
import CleaningService from '../entity/CleaningService';
import CleaningServiceRequest from '../entity/CleaningServiceRequest';

function HomeOwnerCleaningServiceUI() {
    const [services, setServices] = useState([]);
    const [search, setSearch] = useState({
        serviceName: "",
        serviceType: "",
        priceRange: "",
        duration: "",
        startDate: "",
        endDate: ""
    });
    const [showShortlist, setShowShortlist] = useState(false);
    const [shortlistedServices, setShortlistedServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const username = localStorage.getItem('username') || 'testuser';

    // Add isShortlisted function
    const isShortlisted = (serviceId) => {
        return shortlistedServices.some(service => service.id === serviceId);
    };

    // Logout handler
    const handleLogout = () => {
        // If you have a logout function, call it here (e.g., clear cookies, tokens, etc.)
        // For now, just redirect to login page
        window.location.href = "/";
    };

    // Fetch all services on mount
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async (filters = {}) => {
        const controller = new OwnerCleaningServiceController();
        // Parse price range
        let priceRange = [undefined, undefined];
        if (filters.priceRange) {
            priceRange = filters.priceRange.split("-").map(x => x.trim());
        }
        const result = await controller.searchCleaningService(
            filters.serviceName || undefined,
            filters.serviceType || undefined,
            priceRange[0] ? priceRange : undefined,
            filters.duration || undefined,
            undefined // cleanerId
        );
        // Map all fields including extra info
        let filtered = (result || []).map(doc => ({
            id: doc.id,
            serviceName: doc.serviceName,
            description: doc.description,
            serviceType: doc.serviceType,
            price: doc.price,
            duration: doc.duration,
            serviceArea: doc.serviceArea,
            specialEquipment: doc.specialEquipment,
            numWorkers: doc.numWorkers,
            includedTasks: doc.includedTasks,
            serviceAvailableFrom: doc.serviceAvailableFrom,
            serviceAvailableTo: doc.serviceAvailableTo,
        }));
        // Date period filter (same as CleanerServiceUI)
        if (filters.startDate) {
            filtered = filtered.filter(service =>
                (!service.serviceAvailableTo || service.serviceAvailableTo >= filters.startDate)
            );
        }
        if (filters.endDate) {
            filtered = filtered.filter(service =>
                (!service.serviceAvailableFrom || service.serviceAvailableFrom <= filters.endDate)
            );
        }
        setServices(filtered);
    };

    const handleInputChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        fetchServices(search);
    };

    const handleClear = () => {
        setSearch({
            serviceName: "",
            serviceType: "",
            priceRange: "",
            duration: "",
            startDate: "",
            endDate: ""
        });
        fetchServices({});
    };

    const handleShortlist = async (service) => {
        const username = localStorage.getItem('username') || 'testuser';
        const controller = new OwnerCleaningServiceController();
        
        // Check if service is already in shortlist
        if (isShortlisted(service.id)) {
            Swal.fire({
                title: 'Already Shortlisted',
                text: 'This service is already in your shortlist!',
                icon: 'info',
                confirmButtonText: 'OK',
                timer: 1500
            });
            return;
        }
        
        // Increment shortlist count when service is added to shortlist
        await CleaningService.increaseShortlistCount(service.id);
        
        const result = await controller.saveToShortlist(username, service);
        if (result) {
            Swal.fire({
                title: 'Added!',
                text: 'Service added to shortlist!',
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 1500
            });
        } else {
            Swal.fire({
                title: 'Failed!',
                text: 'Service failed to add to shortlist.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleViewShortlist = async () => {
        const username = localStorage.getItem('username') || 'testuser';
        const controller = new OwnerCleaningServiceController();
        const result = await controller.getShortlistedServices(username);
        setShortlistedServices((result || []).map(doc => ({
            id: doc.id,
            serviceName: doc.serviceName,
            description: doc.description,
            serviceType: doc.serviceType,
            price: doc.price,
            duration: doc.duration,
            serviceArea: doc.serviceArea,
            specialEquipment: doc.specialEquipment,
            numWorkers: doc.numWorkers,
            includedTasks: doc.includedTasks,
        })));
        setShowShortlist(true);
    };

    const handleCloseShortlist = () => setShowShortlist(false);

    const handleViewService = async (service) => {
        // Increment view count when service is viewed
        await CleaningService.increaseViewCount(service.id);

        // If the service has an id, fetch the latest from CleaningServices
        let latestService = service;
        if (service.id) {
            const fetched = await CleaningService.getServiceById(service.id);
            if (fetched) latestService = fetched;
        }
        Swal.fire({
            title: 'View Cleaning Service',
            width: 650,
            html: `
                <div style="background:#fff; border-radius:12px; padding:18px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tbody>
                            <tr><th style='text-align:left;padding:8px 6px;'>Service Name</th><td style='padding:8px 6px;'>${latestService.serviceName}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Description</th><td style='padding:8px 6px;'>${latestService.description}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Type</th><td style='padding:8px 6px;'>${latestService.serviceType}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Price</th><td style='padding:8px 6px;'>$${latestService.price}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Duration</th><td style='padding:8px 6px;'>${latestService.duration} hrs</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Service Area</th><td style='padding:8px 6px;'>${latestService.serviceArea || 'N/A'}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Special Equipment Used</th><td style='padding:8px 6px;'>${latestService.specialEquipment || 'N/A'}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Number of Workers</th><td style='padding:8px 6px;'>${latestService.numWorkers || 'N/A'}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>What's Included</th><td style='padding:8px 6px;'>${latestService.includedTasks && latestService.includedTasks.length ? latestService.includedTasks.join(', ') : 'N/A'}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Available From</th><td style='padding:8px 6px;'>${latestService.serviceAvailableFrom || 'N/A'}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Available To</th><td style='padding:8px 6px;'>${latestService.serviceAvailableTo || 'N/A'}</td></tr>
                        </tbody>
                    </table>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Send Request',
            cancelButtonText: 'Close',
            showDenyButton: true,
            denyButtonText: 'Add to Shortlist'
        }).then((result) => {
            if (result.isConfirmed) {
                handleSendRequest(latestService);
            } else if (result.isDenied) {
                handleShortlist(latestService);
            }
        });
    };

    const handleRemoveFromShortlist = async (serviceId) => {
        const username = localStorage.getItem('username') || 'testuser';
        const controller = new OwnerCleaningServiceController();
        const result = await Swal.fire({
            title: 'Remove from Shortlist?',
            text: 'Are you sure you want to remove this service from your shortlist?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Okay',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed) {
            await controller.removeFromShortlist(username, serviceId);
            handleViewShortlist();
            Swal.fire('Removed!', 'Service has been removed from your shortlist.', 'success');
        }
    };

    const handleSendRequest = async (service) => {
        try {
            // Check if request already exists
            const existingRequests = await CleaningServiceRequest.getRequestsByHomeowner(username);
            const hasExistingRequest = existingRequests.some(req => 
                req.serviceId === service.id && 
                (req.status === 'PENDING' || req.status === 'ACCEPTED')
            );

            if (hasExistingRequest) {
                Swal.fire({
                    title: 'Request Already Sent',
                    text: 'You have already sent a request for this service!',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
                return;
            }

            // Show a modal with date picker (restricted) and message
            const { value: formValues } = await Swal.fire({
                title: 'Send Request',
                html:
                    `<label for="req-date">Pick a date:</label><br />` +
                    `<input id="req-date" type="date" class="swal2-input" min="${service.serviceAvailableFrom}" max="${service.serviceAvailableTo}" required><br />` +
                    `<label for="req-msg">Message to Cleaner (optional):</label><br />` +
                    `<textarea id="req-msg" class="swal2-textarea" placeholder="Type your message here..."></textarea>`,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Send Request',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const date = document.getElementById('req-date').value;
                    const msg = document.getElementById('req-msg').value;
                    if (!date) {
                        Swal.showValidationMessage('Please pick a date');
                        return false;
                    }
                    return { date, msg };
                }
            });

            if (formValues) {  // User clicked Send Request
                const result = await CleaningServiceRequest.createRequest(
                    service.id,
                    username,
                    service.cleanerId,
                    formValues.msg,
                    formValues.date
                );
                
                if (result) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Request sent successfully! The cleaner will review your request.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to send request. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        } catch (error) {
            console.error('Error sending request:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to send request. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <div className="hocContainer">
            <div className="hocHeader">
                <button className="hocLogout-button" onClick={handleLogout}>Logout</button>
                <button className="hocShortlist-view-button" onClick={handleViewShortlist}>
                    My Shortlist
                </button>
            </div>
            <h2>Available Cleaning Services</h2>
            <div className="hocSearch-container">
                <div className="hocSearch-bar" style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'flex-start'
                }}>
                    <input
                        name="serviceName"
                        className="hocSearch-input"
                        placeholder="Service Name"
                        value={search.serviceName}
                        onChange={handleInputChange}
                    />
                    <select
                        name="serviceType"
                        className="hocSelect"
                        value={search.serviceType}
                        onChange={handleInputChange}
                    >
                        <option value="">All Types</option>
                        <option value="Basic Cleaning">Basic Cleaning</option>
                        <option value="Deep Cleaning">Deep Cleaning</option>
                        <option value="Move In/Out Cleaning">Move In/Out Cleaning</option>
                        <option value="Office Cleaning">Office Cleaning</option>
                        <option value="Window Cleaning">Window Cleaning</option>
                        <option value="Carpet Cleaning">Carpet Cleaning</option>
                        <option value="Post Renovation Cleaning">Post Renovation Cleaning</option>
                        <option value="Disinfection Service">Disinfection Service</option>
                    </select>
                    <select
                        name="priceRange"
                        className="hocSelect"
                        value={search.priceRange}
                        onChange={handleInputChange}
                    >
                        <option value="">All Prices</option>
                        <option value="0-50">$0 - $50</option>
                        <option value="51-100">$51 - $100</option>
                        <option value="101-200">$101 - $200</option>
                        <option value="201-500">$201 - $500</option>
                    </select>
                    <input
                        type="date"
                        name="startDate"
                        className="hocSearch-input"
                        value={search.startDate}
                        onChange={handleInputChange}
                        style={{ minWidth: '140px' }}
                    />
                    <input
                        type="date"
                        name="endDate"
                        className="hocSearch-input"
                        value={search.endDate}
                        onChange={handleInputChange}
                        style={{ minWidth: '140px' }}
                    />
                    <button className="hocShortlist-button" onClick={handleSearch}>Search</button>
                    <button className="hocSearch-button" onClick={handleClear}>Clear</button>
                </div>
            </div>
            <div className="hocService-table">
                <div className="hocTable-header">
                    <span>Service Name</span>
                    <span>Description</span>
                    <span>Type</span>
                    <span>Price</span>
                    <span>Duration</span>
                    <span></span>
                </div>
                {services.length === 0 ? (
                    <div className="hocNoResults" style={{ gridColumn: "1 / -1" }}>No cleaning services found.</div>
                ) : (
                    services.map(service => (
                        <React.Fragment key={service.id}>
                            <span>{service.serviceName}</span>
                            <span>{service.description}</span>
                            <span>{service.serviceType}</span>
                            <span>${service.price}</span>
                            <span>{service.duration} hrs</span>
                            <span className="hocAction-buttons">
                                <button className="hocView-button" onClick={() => handleViewService(service)}>
                                    View
                                </button>
                                <button className="hocShortlist-button" onClick={() => handleShortlist(service)}>
                                    Shortlist
                                </button>
                            </span>
                        </React.Fragment>
                    ))
                )}
            </div>
            {showShortlist && (
                <div className="hocShortlist-modal">
                    <div className="hocShortlist-modal-content">
                        <button className="hocShortlist-close" onClick={handleCloseShortlist}>Close</button>
                        <h3>My Shortlisted Cleaning Services</h3>
                        {shortlistedServices.length === 0 ? (
                            <p>No shortlisted services.</p>
                        ) : (
                            <div className="hocShortlist-table">
                                <div className="hocShortlist-header">
                                    <span>Service Name</span>
                                    <span>Description</span>
                                    <span>Type</span>
                                    <span>Price</span>
                                    <span>Duration</span>
                                    <span></span>
                                </div>
                                {shortlistedServices.map(service => (
                                    <React.Fragment key={service.id}>
                                        <span>{service.serviceName}</span>
                                        <span>{service.description}</span>
                                        <span>{service.serviceType}</span>
                                        <span>${service.price}</span>
                                        <span>{service.duration} hrs</span>
                                        <span style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <button className="hocView-button" onClick={() => handleViewService(service)}>
                                                View
                                            </button>
                                            <button className="hocShortlist-remove-button" onClick={() => handleRemoveFromShortlist(service.id)}>
                                                Remove
                                            </button>
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {selectedService && (
                <div className="hocModal">
                    <div className="hocModal-content">
                        <h2>{selectedService.serviceName}</h2>
                        <p><strong>Type:</strong> {selectedService.serviceType}</p>
                        <p><strong>Price:</strong> ${selectedService.price}</p>
                        <p><strong>Description:</strong> {selectedService.description}</p>
                        <p><strong>Available From:</strong> {selectedService.serviceAvailableFrom || 'N/A'}</p>
                        <p><strong>Available To:</strong> {selectedService.serviceAvailableTo || 'N/A'}</p>
                        <div style={{display:'flex',gap:'12px',justifyContent:'flex-end',marginTop:'20px'}}>
                            <button className="hocShortlist-button" onClick={() => handleShortlist(selectedService)}>
                                {isShortlisted(selectedService.id) ? 'Remove from Shortlist' : 'Add to Shortlist'}
                            </button>
                            <button 
                                className="hocShortlist-button" 
                                onClick={() => handleSendRequest(selectedService)}
                                style={{backgroundColor: '#4CAF50'}}
                            >
                                Send Request
                            </button>
                            <button className="hocSearch-button" onClick={() => setSelectedService(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeOwnerCleaningServiceUI;