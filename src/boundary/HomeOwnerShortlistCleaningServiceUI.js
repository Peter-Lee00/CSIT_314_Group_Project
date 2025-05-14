import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./HomeOwnerShortlistCleaningServiceUI.css";
import { Util } from "../Util";
import { UserLogoutController } from "../controller/UserAuthController";
import Swal from 'sweetalert2';
import {
  OwnerSaveShortlistController,
  OwnerSearchShortlistController,
  OwnerViewShortlistController,
  OwnerDeleteShortlistController
} from '../controller/OwnerShortlistController';

function HomeOwnerShortlistCleaningServiceUI() {
    const [username] = useState(Cookies.get("username"));
    const [shortlist, setShortlist] = useState([]);

    // Fetch shortlist using the search controller with empty filters
    const fetchShortlist = async () => {
        const controller = new OwnerSearchShortlistController();
        const result = await controller.searchShortlist(username, '', '', [], '');
        setShortlist(result || []);
    };

    useEffect(() => {
        fetchShortlist();
    }, []);

    const clearSearch = async () => {
        document.getElementById('service_name_search_input').value = '';
        document.getElementById('serviceType_search_input').value = '';
        document.getElementById('priceRange_search_input').value = '';
        document.getElementById('duration_search_input').value = '';
        fetchShortlist();
    };

    const searchShortlist = async () => {
        const serviceNameInput = document.getElementById('service_name_search_input');
        const serviceTypeInput = document.getElementById('serviceType_search_input');
        const priceRangeInput = document.getElementById('priceRange_search_input');
        const durationInput = document.getElementById('duration_search_input');

        let priceRange = priceRangeInput.value.toString().split("-");

        const serviceName = serviceNameInput ? serviceNameInput.value : '';
        const serviceType = serviceTypeInput.value;
        const duration = durationInput.value;

        const controller = new OwnerSearchShortlistController();
        const shortlistData = await controller.searchShortlist(username, serviceName, serviceType, priceRange, duration);
        setShortlist(shortlistData || []);
    };

    const viewService = async (serviceId) => {
        console.log('Fetching cleaning service for:', serviceId);
        const controller = new OwnerViewShortlistController();
        const service = await controller.viewServiceFromShortlist(serviceId);

        if (service) {
            Swal.fire({
                title: 'View Cleaning Service',
                width: 800,
                html: `
                    <div style="text-align: left;">
                        <div class="uclService-contents">
                            <strong>Service Name:</strong> ${service.serviceName}
                        </div>
                        <div class="uclService-contents">
                            <strong>Type:</strong> ${service.serviceType}
                        </div>
                        <div class="uclService-contents">
                            <strong>Price:</strong> $${service.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </div>
                        <div class="uclService-contents">
                            <strong>Duration:</strong> ${service.duration} hours
                        </div>
                        <div class="uclService-contents">
                            <strong>Description:</strong> ${service.description}
                        </div>
                        <div class="uclService-contents">
                            <strong>Cleaner ID:</strong> ${service.cleanerId}
                        </div>
                    </div>
                `,
                confirmButtonText: 'Close',
                focusConfirm: false
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Failed to load service information.',
                icon: 'error',
                confirmButtonText: 'Close'
            });
        }
    };

    const handleRemoveFromShortlist = async (shortlistId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will not be able to recover this service from your shortlist!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'No, keep it'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const controller = new OwnerDeleteShortlistController();
                const isSuccess = await controller.deleteShortlist(shortlistId);
                if (isSuccess && isSuccess.success) {
                    Swal.fire('Removed!', 'The service has been removed from your shortlist.', 'success');
                    fetchShortlist();
                } else {
                    Swal.fire('Error', 'Failed to remove service from shortlist.', 'error');
                }
            }
        });
    };

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
                window.open("/", "_self");
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

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="shortlist-page">
            <div className="shortlist-container">
                <div className="hscHeader">
                    <button onClick={handleBack} className="hscBack-button">
                        Back
                    </button>
                    <div className="hscProfile-picture">
                        <img
                            src={"https://placehold.co/40x40?text=" + Cookies.get("username")}
                            alt="Profile"
                        />
                    </div>
                    <span className="hscUsername">{username}</span>
                    <button onClick={handleLogout} className="hscLogout-button">
                        Logout
                    </button>
                </div>

                <div className="hscSearch-bar">
                    <span>
                        <input id="service_name_search_input" className="swal2-input custom-select" placeholder="Service Name"></input>

                        <select id="serviceType_search_input" className="swal2-input custom-select">
                            <option value="">Select Service Type</option>
                            <option value="Basic Cleaning">Basic Cleaning</option>
                            <option value="Deep Cleaning">Deep Cleaning</option>
                            <option value="Move In/Out Cleaning">Move In/Out Cleaning</option>
                            <option value="Office Cleaning">Office Cleaning</option>
                            <option value="Window Cleaning">Window Cleaning</option>
                            <option value="Carpet Cleaning">Carpet Cleaning</option>
                            <option value="Post Renovation Cleaning">Post Renovation Cleaning</option>
                            <option value="Disinfection Service">Disinfection Service</option>
                        </select>

                        <select id="priceRange_search_input" className="swal2-input custom-select">
                            <option value="">Select price range</option>
                            <option value="0-50">$0 - $50</option>
                            <option value="51-100">$51 - $100</option>
                            <option value="101-200">$101 - $200</option>
                            <option value="201-500">$201 - $500</option>
                        </select>

                        <input id="duration_search_input" className="swal2-input custom-select" placeholder="Duration (hours)" type="number" min="1"></input>

                        <button onClick={searchShortlist} className="hscSearch-button">
                            Search
                        </button>
                        <button onClick={clearSearch} className="hscSearch-button">
                            Clear
                        </button>
                    </span>
                </div>
                <div className="hscUser-table">
                    <table className="hscTable">
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
                            {shortlist.map((service) => (
                                <tr key={service.shortlistId}>
                                    <td>{service.serviceName}</td>
                                    <td>{service.description}</td>
                                    <td>{service.serviceType}</td>
                                    <td>${service.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                                    <td>{service.duration} hrs</td>
                                    <td style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <button className="shortlistViewButton" onClick={() => viewService(service.serviceId)}>
                                            View
                                        </button>
                                        <button className="shortlistRemoveButton" onClick={() => handleRemoveFromShortlist(service.shortlistId)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default HomeOwnerShortlistCleaningServiceUI; 