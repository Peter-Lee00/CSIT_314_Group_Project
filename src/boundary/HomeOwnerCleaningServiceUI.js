import React, { useEffect, useState } from "react";
import OwnerCleaningServiceController from "../controller/OwnerCleaningServiceController";
import "./HomeOwnerCleaningServiceUI.css"; // Create this CSS file for styling
import Swal from "sweetalert2";
import CleaningService from '../entity/CleaningService';

function HomeOwnerCleaningServiceUI() {
    const [services, setServices] = useState([]);
    const [search, setSearch] = useState({
        serviceName: "",
        serviceType: "",
        priceRange: "",
        duration: ""
    });
    const [showShortlist, setShowShortlist] = useState(false);
    const [shortlistedServices, setShortlistedServices] = useState([]);

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
        setServices((result || []).map(doc => ({
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
            duration: ""
        });
        fetchServices({});
    };

    const handleShortlist = async (service) => {
        const username = localStorage.getItem('username') || 'testuser'; // Replace with real auth
        const controller = new OwnerCleaningServiceController();
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
                        </tbody>
                    </table>
                </div>
            `,
            confirmButtonText: 'Close'
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
                <div className="hocSearch-bar">
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
                    <button className="hocSearch-button" onClick={handleSearch}>Search</button>
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
        </div>
    );
}

export default HomeOwnerCleaningServiceUI;