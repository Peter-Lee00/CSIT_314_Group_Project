import React, { useEffect, useState } from "react";
import OwnerCleaningServiceController from "../controller/OwnerCleaningServiceController";
import "./HomeOwnerCleaningServiceUI.css"; // Reuse the same CSS

function OwnerShortlistController() {
    const [shortlistedServices, setShortlistedServices] = useState([]);

    useEffect(() => {
        const fetchShortlist = async () => {
            const username = localStorage.getItem('username') || 'testuser';
            const controller = new OwnerCleaningServiceController();
            const result = await controller.getShortlistedServices(username);
            setShortlistedServices(result || []);
        };
        fetchShortlist();
    }, []);

    return (
        <div className="hocContainer">
            <h2>My Shortlisted Cleaning Services</h2>
            {shortlistedServices.length === 0 ? (
                <div className="hocNoResults">No shortlisted services.</div>
            ) : (
                <div className="hocService-table">
                    <div className="hocTable-header">
                        <span>Service Name</span>
                        <span>Description</span>
                        <span>Type</span>
                        <span>Price</span>
                        <span>Duration</span>
                    </div>
                    {shortlistedServices.map(service => (
                        <div key={service.id} className="hocTable-row">
                            <span>{service.serviceName}</span>
                            <span>{service.description}</span>
                            <span>{service.serviceType}</span>
                            <span>${service.price}</span>
                            <span>{service.duration} hrs</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OwnerShortlistController;
