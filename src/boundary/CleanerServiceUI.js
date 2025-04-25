import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // So we can redirect if the user isn't a cleaner
import Cookies from 'js-cookie';
import CleanerServiceController from '../controller/CleanerServiceController';
import Swal from 'sweetalert2';
import './CleanerServiceUI.css';

const CleanerServiceUI = () => {
  const navigate = useNavigate();

  const [myServices, setMyServices] = useState([]);
  const [currentCleanerId, setCurrentCleanerId] = useState('');
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loading, setLoading] = useState(true); // shows the loader while data is fetching

  const controller = new CleanerServiceController();

  useEffect(() => {
    const email = Cookies.get('email');
    const profileType = Cookies.get('userProfile');

    // Safety check - user must be logged in as cleaner
    if (!email || profileType !== 'Cleaner') {
      navigate('/login'); // not allowed, go login
      return;
    }

    // Cool, got the cleaner - let's move ahead
    setCurrentCleanerId(email);
    fetchServicesForCleaner(email); 

    // Getting the types of services from controller
    const types = controller.getServiceTypes(); // might eventually make async if we hit an API
    setAvailableTypes(types);
  }, [navigate]);

  const fetchServicesForCleaner = async (id) => {
    try {
      setLoading(true);
      const serviceList = await controller.getCleanerServices(id);
      setMyServices(serviceList || []);  // fallback just in case
    } catch (e) {
      console.error('Uh-oh, problem getting services:', e);
      Swal.fire('Oops', 'Failed to load services. Try again later.', 'error');
    } finally {
      setLoading(false); // loader goes away either way
    }
  };

  const promptCreateService = async () => {
    const { value: newService } = await Swal.fire({
      title: 'Create New Service',
      html: `
        <input id="serviceName" class="swal2-input" placeholder="Service Name">
        <select id="serviceType" class="swal2-select">
          ${availableTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
        <input id="description" class="swal2-input" placeholder="Short description">
        <input id="price" type="number" class="swal2-input" placeholder="Price in SGD">
        <input id="duration" type="number" class="swal2-input" placeholder="Duration (hrs)">
      `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => ({
        serviceName: document.getElementById('serviceName').value,
        serviceType: document.getElementById('serviceType').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        duration: document.getElementById('duration').value
      })
    });

    if (newService) {
      const isAdded = await controller.createService(
        newService.serviceName,
        newService.description,
        newService.price,
        newService.duration,
        currentCleanerId,
        newService.serviceType
      );

      if (isAdded) {
        Swal.fire('Done!', 'Service added successfully', 'success');
        fetchServicesForCleaner(currentCleanerId); // refresh list
      } else {
        Swal.fire('Oops', 'Failed to add service', 'error');
      }
    }
  };

  const promptEditService = async (existingService) => {
    const { value: updatedInfo } = await Swal.fire({
      title: 'Edit Service',
      html: `
        <input id="serviceName" class="swal2-input" value="${existingService.serviceName}">
        <select id="serviceType" class="swal2-select">
          ${availableTypes.map(type =>
            `<option value="${type}" ${type === existingService.serviceType ? 'selected' : ''}>${type}</option>`
          ).join('')}
        </select>
        <input id="description" class="swal2-input" value="${existingService.description}">
        <input id="price" class="swal2-input" type="number" value="${existingService.price}">
        <input id="duration" class="swal2-input" type="number" value="${existingService.duration}">
      `,
      showCancelButton: true,
      preConfirm: () => ({
        serviceName: document.getElementById('serviceName').value,
        serviceType: document.getElementById('serviceType').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        duration: document.getElementById('duration').value
      })
    });

    if (updatedInfo) {
      const wasUpdated = await controller.updateService(existingService.id, updatedInfo);
      if (wasUpdated) {
        Swal.fire('Updated', 'Your service has been modified', 'success');
        fetchServicesForCleaner(currentCleanerId);
      } else {
        Swal.fire('Oops', 'Failed to update the service', 'error');
      }
    }
  };

  const confirmDeleteService = async (serviceId) => {
    const result = await Swal.fire({
      title: 'Delete Service?',
      text: "This will permanently remove the service.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const deleted = await controller.deleteService(serviceId);
        if (deleted) {
          Swal.fire('Deleted!', 'Service has been removed.', 'success');
          fetchServicesForCleaner(currentCleanerId);
        }
      } catch (e) {
        console.warn('Failed deleting service:', e);
        Swal.fire('Error', 'Could not delete the service.', 'error');
      }
    }
  };

  // Layout below is mostly left intact
  return (
    <div className="cs-container">
      <div className="cs-header">
        <h1>My Cleaning Services</h1>
        <button className="cs-back-button" onClick={() => navigate(-1)}>
          Home
        </button>
      </div>

      <div className="cs-actions">
        <button className="cs-create-button" onClick={promptCreateService}>
          + Add New Service
        </button>
      </div>

      <div className="cs-service-list">
        <div className="cs-list-header">
          <div>Service</div>
          <div>Type</div>
          <div>Description</div>
          <div>Price</div>
          <div>Duration</div>
          <div>Actions</div>
        </div>
        {myServices.map((srv) => (
          <div key={srv.id} className="cs-list-row">
            <div>{srv.serviceName}</div>
            <div>{srv.serviceType}</div>
            <div>{srv.description}</div>
            <div>${srv.price}</div>
            <div>{srv.duration}h</div>
            <div className="cs-actions-cell">
              <button className="cs-edit-button" onClick={() => promptEditService(srv)}>Edit</button>
              <button className="cs-delete-button" onClick={() => confirmDeleteService(srv.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CleanerServiceUI;
