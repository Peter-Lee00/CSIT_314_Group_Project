import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CleaningService from '../entity/CleaningService';
import { UserLogoutController } from '../controller/UserAuthController';
import ServiceCategory from '../entity/ServiceCategory';
import {
  OwnerSearchCleaningServiceController,
  OwnerSaveShortlistController,
  OwnerGetShortlistedServicesController,
  OwnerRemoveFromShortlistController,
  OwnerGetServiceHistoryController,
  OwnerUpdateRequestStatusController,
  OwnerGetConfirmedMatchesController,
  OwnerSearchShortlistedServicesController,
  OwnerGetRequestsByHomeownerController,
  OwnerSearchServiceHistoryController
} from '../controller/OwnerCleaningServiceController';
import { CreateServiceRequestController } from '../controller/CleanerRequestController';
import Cookies from "js-cookie";

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
    const email = Cookies.get('email');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [confirmedServices, setConfirmedServices] = useState([]);
    const [historyFilters, setHistoryFilters] = useState({
        serviceName: '',
        serviceType: '',
        priceRange: '',
        date: '',
        search: ''
    });
    const [serviceDetails, setServiceDetails] = useState({});
    const [serviceTypes, setServiceTypes] = useState([]);
    const [shortlistSearch, setShortlistSearch] = useState({
        serviceName: '',
        serviceType: '',
        priceRange: '',
        duration: ''
    });
    const [shortlistSearchPerformed, setShortlistSearchPerformed] = useState(false);
    const [filteredShortlistedServices, setFilteredShortlistedServices] = useState([]);
    const [historySearch, setHistorySearch] = useState({
        serviceName: '',
        serviceType: '',
        priceRange: '',
        date: ''
    });
    const [historySearchPerformed, setHistorySearchPerformed] = useState(false);
    const [filteredConfirmedServices, setFilteredConfirmedServices] = useState([]);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [historyMessage, setHistoryMessage] = useState('');

    const searchController = new OwnerSearchCleaningServiceController();
    const saveShortlistController = new OwnerSaveShortlistController();
    const getShortlistedServicesController = new OwnerGetShortlistedServicesController();
    const removeFromShortlistController = new OwnerRemoveFromShortlistController();
    const createServiceRequestController = new CreateServiceRequestController();
    const getServiceHistoryController = new OwnerGetServiceHistoryController();
    const updateRequestStatusController = new OwnerUpdateRequestStatusController();
    const getConfirmedMatchesController = new OwnerGetConfirmedMatchesController();
    const searchShortlistedServicesController = new OwnerSearchShortlistedServicesController();
    const getRequestsByHomeownerController = new OwnerGetRequestsByHomeownerController();
    const searchServiceHistoryController = new OwnerSearchServiceHistoryController();

    // Add isShortlisted function
    const isShortlisted = (serviceId) => {
        return shortlistedServices.some(service => service.id === serviceId);
    };

    // Logout handler
    const handleLogout = async () => {
        const userAuthController = new UserLogoutController();
        const logout = await userAuthController.logout();
        if (logout) {
            Swal.fire({
                position: "center",
                title: 'Logout Successful',
                icon: 'success',
                confirmButtonText: 'Back to login',
                timer: 1500
            }).then(() => {
                window.location.href = "/";
            });
        } else {
            Swal.fire({
                position: "center",
                title: 'Logout Failed',
                icon: 'error',
                confirmButtonText: 'OK',
                timer: 1500
            });
        }
    };

    // Fetch all services and categories on mount
    useEffect(() => {
        ServiceCategory.listCategories().then(types => {
            setServiceTypes(types.map(t => t.name));
        });
        fetchServices();
    }, []);

    useEffect(() => {
        // Reset filtered list when modal opens or shortlist changes
        if (showShortlist) {
            setFilteredShortlistedServices(shortlistedServices);
            setShortlistSearchPerformed(false);
        }
    }, [showShortlist, shortlistedServices]);

    useEffect(() => {
        if (showHistoryModal) {
            setFilteredConfirmedServices(confirmedServices);
            setHistorySearchPerformed(false);
        }
    }, [showHistoryModal, confirmedServices]);

    const fetchServices = async (filters = {}) => {
        const result = await searchController.searchCleaningService(
            filters.serviceName || undefined,
            filters.serviceType || undefined,
            filters.priceRange ? filters.priceRange.split("-").map(x => x.trim()) : undefined,
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
        try {
        // Increment shortlist count when service is added to shortlist
        await CleaningService.increaseShortlistCount(service.id);
            const result = await saveShortlistController.saveToShortlist(email, service);
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
        } catch (error) {
            if (error.message && error.message.includes('already in your shortlist')) {
                Swal.fire({
                    title: 'Already Shortlisted',
                    text: 'This service is already in your shortlist!',
                    icon: 'info',
                    confirmButtonText: 'OK',
                    timer: 1500
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to add service to shortlist.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleViewShortlist = async () => {
        const result = await getShortlistedServicesController.getShortlistedServices(email);
        setShortlistedServices((result || []).map(doc => ({
            id: doc.id,
            serviceName: doc.serviceName,
            description: doc.description,
            serviceType: doc.serviceType,
            price: doc.price,
            duration: doc.duration,
            serviceArea: doc.serviceArea,
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
                <div style=" border-radius:12px; padding:18px;">
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
        const result = await Swal.fire({
            title: 'Remove from Shortlist?',
            text: 'Are you sure you want to remove this service from your shortlist?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Okay',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed) {
            await removeFromShortlistController.removeFromShortlist(email, serviceId);
            handleViewShortlist();
            Swal.fire('Removed!', 'Service has been removed from your shortlist.', 'success');
        }
    };

    const handleSendRequest = async (service) => {
        try {
            // Check if request already exists
            let existingRequests = await getRequestsByHomeownerController.getRequestsByHomeowner(email);
            if (existingRequests && existingRequests.success && Array.isArray(existingRequests.data)) {
                existingRequests = existingRequests.data;
            }
            existingRequests = Array.isArray(existingRequests) ? existingRequests : [];
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
                const result = await createServiceRequestController.createRequest(
                    service.id,
                    email,
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

    const loadConfirmedServices = async () => {
        try {
            let allRequests = await getRequestsByHomeownerController.getRequestsByHomeowner(email);
            // Handle both controller response object and direct array
            if (allRequests && allRequests.success && Array.isArray(allRequests.data)) {
                allRequests = allRequests.data;
            }
            allRequests = Array.isArray(allRequests) ? allRequests : [];
            const accepted = allRequests.filter(r => r.status === 'ACCEPTED');
            setConfirmedServices(accepted);
            // Fetch service details for each confirmed service
            const serviceIds = [...new Set(accepted.map(req => req.serviceId))];
            const details = {};
            for (const id of serviceIds) {
                const service = await CleaningService.getServiceById(id);
                if (service) details[id] = service;
            }
            setServiceDetails(details);
        } catch (error) {
            console.error('Error loading confirmed services:', error);
            Swal.fire('Error', 'Failed to load service history', 'error');
        }
    };

    // Add shortlist search handlers
    const handleShortlistSearchInput = (e) => {
        setShortlistSearch({ ...shortlistSearch, [e.target.name]: e.target.value });
    };

    const handleShortlistSearch = () => {
        const filtered = shortlistedServices.filter(service => {
            const matchesName = !shortlistSearch.serviceName || (service.serviceName && service.serviceName.toLowerCase().includes(shortlistSearch.serviceName.toLowerCase()));
            const matchesType = !shortlistSearch.serviceType || service.serviceType === shortlistSearch.serviceType;
            const matchesPrice = !shortlistSearch.priceRange || (() => {
                if (!service.price) return false;
                const [min, max] = shortlistSearch.priceRange.split('-').map(Number);
                return service.price >= min && service.price <= max;
            })();
            const matchesDuration = !shortlistSearch.duration || String(service.duration) === String(shortlistSearch.duration);
            return matchesName && matchesType && matchesPrice && matchesDuration;
        });
        setFilteredShortlistedServices(filtered);
        setShortlistSearchPerformed(true);
    };

    const clearShortlistSearch = () => {
        setShortlistSearch({
            serviceName: '',
            serviceType: '',
            priceRange: '',
            duration: ''
        });
        setFilteredShortlistedServices(shortlistedServices);
        setShortlistSearchPerformed(false);
    };

    const handleHistorySearchInput = (e) => {
        setHistorySearch({ ...historySearch, [e.target.name]: e.target.value });
    };

    const handleHistorySearch = () => {
        const filtered = confirmedServices.filter(request => {
            const service = serviceDetails[request.serviceId] || {};
            const matchesName = !historySearch.serviceName || (service.serviceName && service.serviceName.toLowerCase().includes(historySearch.serviceName.toLowerCase()));
            const matchesType = !historySearch.serviceType || service.serviceType === historySearch.serviceType;
            const matchesPrice = !historySearch.priceRange || (() => {
                if (!service.price) return false;
                const [min, max] = historySearch.priceRange.split('-').map(Number);
                return service.price >= min && service.price <= max;
            })();
            const matchesDate = !historySearch.date || request.requestedDate === historySearch.date;
            return matchesName && matchesType && matchesPrice && matchesDate;
        });
        setFilteredConfirmedServices(filtered);
        setHistorySearchPerformed(true);
    };

    const clearHistorySearch = () => {
        setHistorySearch({
            serviceName: '',
            serviceType: '',
            priceRange: '',
            date: ''
        });
        setFilteredConfirmedServices(confirmedServices);
        setHistorySearchPerformed(false);
    };

    const searchServiceHistory = async () => {
        try {
            const filters = {
                status: document.getElementById('statusFilter').value,
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                serviceType: document.getElementById('serviceTypeFilter').value
            };

            const result = await new OwnerSearchServiceHistoryController().searchServiceHistory(email, filters);
            
            if (result.success) {
                setServiceHistory(result.data);
                setHistoryMessage(result.message);
            } else {
                setHistoryMessage(result.message);
                setServiceHistory([]);
            }
        } catch (error) {
            console.error('Error searching service history:', error);
            setHistoryMessage('Failed to search service history');
            setServiceHistory([]);
        }
    };

    return (
        <div className="hocContainer">
            <div className="hocHeader">
                <h2 style={{margin:0}}>Available Cleaning Services</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="hocLogout-button" onClick={handleLogout}>Logout</button>
                    <button className="hocShortlist-button" onClick={handleViewShortlist}>
                        My Shortlist
                    </button>
                    <button className="hocShortlist-button" onClick={() => { setShowHistoryModal(true); loadConfirmedServices(); }}>
                        Service History
                    </button>
                </div>
            </div>
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
                        {serviceTypes.map((type, idx) => (
                            <option key={type + '-' + idx} value={type}>{type}</option>
                        ))}
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
            <div className="hcsUser-table">
                <table className="hcsTable">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Duration</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td>{service.serviceName}</td>
                                <td>{service.description}</td>
                                <td>{service.serviceType}</td>
                                <td>${service.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                                <td>{service.duration} hrs</td>
                                <td style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <button className="serviceViewButton" onClick={() => handleViewService(service)}>
                                    View
                                </button>
                                    <button className="serviceShortlistButton" onClick={() => handleShortlist(service)}>
                                    Shortlist
                                </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showShortlist ? (
                <div className="cs-modal">
                    <div className="cs-modal-content">
                        <div className="cs-modal-header">
                            <h2>My Shortlisted Cleaning Services</h2>
                            <button className="cs-modal-close" onClick={handleCloseShortlist}>×</button>
                        </div>
                        <div className="cs-search-section" style={{flexDirection: 'column', gap: '8px'}}>
                            <div className="cs-search-main" style={{gap: '8px', alignItems: 'center'}}>
                            <input
                                    type="text"
                                name="serviceName"
                                    placeholder="Search by service name"
                                value={shortlistSearch.serviceName}
                                onChange={handleShortlistSearchInput}
                                    className="cs-search-input"
                            />
                                <button onClick={handleShortlistSearch} className="cs-search-button">Search</button>
                                <button onClick={clearShortlistSearch} className="cs-reset-button">Clear</button>
                            </div>
                            <div className="cs-search-filters" style={{gap: '8px', alignItems: 'center'}}>
                            <select
                                name="serviceType"
                                value={shortlistSearch.serviceType}
                                onChange={handleShortlistSearchInput}
                                    className="cs-search-input"
                                    style={{ minWidth: '140px' }}
                            >
                                <option value="">All Types</option>
                                {serviceTypes.map((type, idx) => (
                                    <option key={type + '-' + idx} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                name="priceRange"
                                value={shortlistSearch.priceRange}
                                onChange={handleShortlistSearchInput}
                                    className="cs-search-input"
                                    style={{ minWidth: '140px' }}
                            >
                                <option value="">All Prices</option>
                                <option value="0-50">$0 - $50</option>
                                <option value="51-100">$51 - $100</option>
                                <option value="101-200">$101 - $200</option>
                                <option value="201-500">$201 - $500</option>
                            </select>
                            <input
                                    type="number"
                                name="duration"
                                placeholder="Duration (hours)"
                                value={shortlistSearch.duration}
                                onChange={handleShortlistSearchInput}
                                    className="cs-search-input"
                                    style={{ minWidth: '120px' }}
                            />
                            </div>
                        </div>
                        <div className="cs-requests-list">
                            {(shortlistSearchPerformed ? filteredShortlistedServices : shortlistedServices).length === 0 ? (
                            <p>No shortlisted services.</p>
                        ) : (
                                (shortlistSearchPerformed ? filteredShortlistedServices : shortlistedServices).map(service => (
                                    <div key={service.id} className="cs-request-card">
                                        <div className="cs-request-header">
                                            <h3>{service.serviceName}</h3>
                                            <div style={{display:'flex',gap:'10px'}}>
                                                <button className="hocView-button" onClick={() => handleViewService(service)}>
                                                    View
                                                </button>
                                                <button className="hocShortlist-remove-button" onClick={() => handleRemoveFromShortlist(service.id)}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        <div className="cs-request-details">
                                            <p><strong>Description:</strong> {service.description}</p>
                                            <p><strong>Type:</strong> {service.serviceType}</p>
                                            <p><strong>Price:</strong> ${service.price}</p>
                                            <p><strong>Duration:</strong> {service.duration} hrs</p>
                                            <p><strong>Service Area:</strong> {service.serviceArea || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            </div>
                    </div>
                </div>
            ) : showHistoryModal ? (
                <div className="cs-modal">
                    <div className="cs-modal-content">
                        <div className="cs-modal-header">
                            <h2>Service History</h2>
                            <button className="cs-modal-close" onClick={() => setShowHistoryModal(false)}>×</button>
                        </div>
                        <div className="cs-search-section" style={{flexDirection: 'column', gap: '8px'}}>
                            <div className="cs-search-main" style={{gap: '8px', alignItems: 'center'}}>
                            <input
                                type="text"
                                    name="serviceName"
                                placeholder="Search by service name"
                                    value={historySearch.serviceName}
                                    onChange={handleHistorySearchInput}
                                    className="cs-search-input"
                            />
                                <button onClick={handleHistorySearch} className="cs-search-button">Search</button>
                                <button onClick={clearHistorySearch} className="cs-reset-button">Clear</button>
                            </div>
                            <div className="cs-search-filters" style={{gap: '8px', alignItems: 'center'}}>
                            <select
                                    name="serviceType"
                                    value={historySearch.serviceType}
                                    onChange={handleHistorySearchInput}
                                    className="cs-search-input"
                                    style={{ minWidth: '140px' }}
                            >
                                <option value="">All Types</option>
                                {serviceTypes.map((type, idx) => (
                                    <option key={type + '-' + idx} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                    name="priceRange"
                                    value={historySearch.priceRange}
                                    onChange={handleHistorySearchInput}
                                    className="cs-search-input"
                                    style={{ minWidth: '140px' }}
                            >
                                <option value="">All Prices</option>
                                <option value="0-50">$0 - $50</option>
                                <option value="51-100">$51 - $100</option>
                                <option value="101-200">$101 - $200</option>
                                <option value="201-500">$201 - $500</option>
                            </select>
                            <input
                                type="date"
                                    name="date"
                                    value={historySearch.date}
                                    onChange={handleHistorySearchInput}
                                    className="cs-search-input"
                                    style={{ minWidth: '120px' }}
                                />
                            </div>
                        </div>
                        <div className="cs-requests-list">
                            {(historySearchPerformed ? filteredConfirmedServices : confirmedServices).length === 0 ? (
                                <p>No service history found.</p>
                            ) : (
                                (historySearchPerformed ? filteredConfirmedServices : confirmedServices).map(request => {
                                    const service = serviceDetails[request.serviceId] || {};
                                    return (
                                        <div key={request.id} className="cs-request-card">
                                            <div className="cs-request-header">
                                                <h3>Cleaner: {service.cleanerId || 'N/A'}</h3>
                                                <span className="cs-request-status accepted">ACCEPTED</span>
                                            </div>
                                            <div className="cs-request-details">
                                                <p><strong>Service Name:</strong> {service.serviceName || 'N/A'}</p>
                                                <p><strong>Service Type:</strong> {service.serviceType || 'N/A'}</p>
                                                <p><strong>Price:</strong> {service.price ? `$${service.price}` : 'N/A'}</p>
                                                <p><strong>Service Area:</strong> {service.serviceArea || 'N/A'}</p>
                                                <p><strong>Date Used:</strong> {request.requestedDate || 'N/A'}</p>
                                                <p><strong>Confirmed On:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
}

export default HomeOwnerCleaningServiceUI;