import React, { useEffect, useState } from "react";
import "./HomeOwnerShortlistCleaningServiceUI.css";
import { UserLogoutController } from "../controller/UserAuthController";
import Swal from 'sweetalert2';
import {
  OwnerGetShortlistedServicesController,
  OwnerSearchShortlistedServicesController,
  OwnerRemoveFromShortlistController
} from '../controller/OwnerCleaningServiceController';

function HomeOwnerShortlistCleaningServiceUI() {
    const username = localStorage.getItem('username') || 'testuser';
    const [shortlist, setShortlist] = useState([]);

    const fetchShortlist = async () => {
        const controller = new OwnerGetShortlistedServicesController();
        const result = await controller.getShortlistedServices(username);
        if (!result || result.length === 0) {
            setShortlist([]);
            } else {
            setShortlist(result.map(doc => ({
                id: doc.id,
                    serviceName: doc.serviceName,
                description: doc.description && doc.description.length > 150 ? doc.description.substring(0, 150) + "..." : doc.description,
                fullDescription: doc.description,
                    serviceType: doc.serviceType,
                    price: doc.price,
                duration: doc.duration,
                serviceArea: doc.serviceArea,
                cleanerId: doc.cleanerId,
            })));
        }
    };

    useEffect(() => {
        fetchShortlist();
    }, []);

    const clearSearch = () => {
        document.getElementById('service_name_search_input').value = '';
        document.getElementById('serviceType_search_input').value = '';
        document.getElementById('priceRange_search_input').value = '';
        document.getElementById('duration_search_input').value = '';
        fetchShortlist();
    };

    const searchShortlist = async () => {
        const name = document.getElementById('service_name_search_input').value;
        const type = document.getElementById('serviceType_search_input').value;
        const priceRange = document.getElementById('priceRange_search_input').value.split('-');
        const duration = document.getElementById('duration_search_input').value;

        const controller = new OwnerSearchShortlistedServicesController();
        const result = await controller.searchShortlistedServices(username, {
            serviceName: name,
            serviceType: type,
            priceRange,
            duration
        });

        if (!result || result.length === 0) {
            Swal.fire({
                title: 'No Results',
                text: 'No services found matching the search criteria.',
                icon: 'info',
                confirmButtonText: 'OK'
            });
            setShortlist([]);
        } else {
            setShortlist(result.map(doc => ({
                id: doc.id,
                serviceName: doc.serviceName,
                description: doc.description && doc.description.length > 150 ? doc.description.substring(0, 150) + "..." : doc.description,
                fullDescription: doc.description,
                serviceType: doc.serviceType,
                price: doc.price,
                duration: doc.duration,
                serviceArea: doc.serviceArea,
                cleanerId: doc.cleanerId,
            })));
        }
    };

    const handleRemoveFromShortlist = (serviceId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will not be able to recover this service from your shortlist!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'No, keep it'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const controller = new OwnerRemoveFromShortlistController();
                await controller.removeFromShortlist(username, serviceId);
                    Swal.fire('Removed!', 'The service has been removed from your shortlist.', 'success');
                fetchShortlist();
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

    const handleView = (service) => {
        Swal.fire({
            title: service.serviceName,
            width: 650,
            html: `
                <div style="border-radius:12px; padding:18px; text-align:left;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tbody>
                            <tr><th style='text-align:left;padding:8px 6px;'>Service Name</th><td style='padding:8px 6px;'>${service.serviceName}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Description</th><td style='padding:8px 6px;'>${service.fullDescription || service.description}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Type</th><td style='padding:8px 6px;'>${service.serviceType}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Price</th><td style='padding:8px 6px;'>$${service.price}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Duration</th><td style='padding:8px 6px;'>${service.duration} hrs</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Service Area</th><td style='padding:8px 6px;'>${service.serviceArea || 'N/A'}</td></tr>
                            <tr><th style='text-align:left;padding:8px 6px;'>Cleaner ID</th><td style='padding:8px 6px;'>${service.cleanerId || 'N/A'}</td></tr>
                        </tbody>
                    </table>
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Close',
            confirmButtonText: 'Remove from Shortlist',
            showDenyButton: false,
            focusConfirm: false
        }).then((result) => {
            if (result.isConfirmed) {
                handleRemoveFromShortlist(service.id);
            }
        });
    };

    return (
        <div className="bsContainer">
            <div className="bsHeader">
                <button onClick={handleBack} className="bsBack-button">Back</button>
                <div className="bsProfile-picture">
                    <img
                        src={"https://placehold.co/40x40?text=" + username}
                        alt="Profile"
                    />
                </div>
                <span className="bsUsername">{username}</span>
                <button onClick={handleLogout} className="bsLogout-button">Logout</button>
            </div>
            <div className="bsSearch-bar">
                <span>
                    <input id="service_name_search_input" className="swal2-input custom-select" placeholder="Service Name" />
                    <select id="serviceType_search_input" className="swal2-input custom-select">
                        <option value="">All Types</option>
                        <option value="Standard">Standard</option>
                        <option value="Deep">Deep</option>
                    </select>
                    <select id="priceRange_search_input" className="swal2-input custom-select">
                        <option value="">All Prices</option>
                        <option value="0-50">$0 - $50</option>
                        <option value="51-100">$51 - $100</option>
                        <option value="101-200">$101 - $200</option>
                        <option value="201-500">$201 - $500</option>
                    </select>
                    <input id="duration_search_input" className="swal2-input custom-select" placeholder="Duration (hours)" type="number" min="1" />
                    <button onClick={searchShortlist} className="bsSearch-button">Search</button>
                    <button onClick={clearSearch} className="bsSearch-button">Clear</button>
                </span>
            </div>
            <div className="bsUser-table">
                <div className="bsTable-header">
                    <span>Service Name</span>
                    <span>Description</span>
                    <span>Type</span>
                    <span>Price</span>
                    <span>Duration</span>
                    <span>Service Area</span>
                    <span></span>
                </div>
                {shortlist.map((service) => (
                    <div key={service.id} className="bsTable-row">
                        <span>{service.serviceName}</span>
                        <span>{service.description}</span>
                        <span>{service.serviceType}</span>
                        <span>${service.price}</span>
                        <span>{service.duration} hrs</span>
                        <span>{service.serviceArea || 'N/A'}</span>
                        <span>
                            <button onClick={() => handleView(service)} className="bsView-button">
                                View
                            </button>
                            <button onClick={() => handleRemoveFromShortlist(service.id)} className="bsRFS-button">
                                Remove
                            </button>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomeOwnerShortlistCleaningServiceUI; 