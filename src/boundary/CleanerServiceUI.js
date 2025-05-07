import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // So we can redirect if the user isn't a cleaner
import Cookies from 'js-cookie';
import CleanerServiceController from '../controller/CleanerServiceController';
import { ServiceOffering } from '../entity/CleaningService';
import Swal from 'sweetalert2';
import './CleanerServiceUI.css';

const CleanerServiceUI = () => {
  const navigate = useNavigate();

  const [myServices, setMyServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCleanerId, setCurrentCleanerId] = useState('');
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loading, setLoading] = useState(true); // shows the loader while data is fetching
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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

  const SearchService = () => {
    setSearchPerformed(true);
    if (searchTerm.trim() === '') {
      setFilteredServices(showHistory ? 
        myServices.filter(service => !service.isOffering) :
        myServices.filter(service => service.isOffering)
      );
    } else {
      const filtered = myServices.filter(service => 
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (showHistory ? !service.isOffering : service.isOffering)
      );
      setFilteredServices(filtered);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      SearchService
  ();
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    setFilteredServices(showHistory ? 
      myServices.filter(service => !service.isOffering) :
      myServices.filter(service => service.isOffering)
    );
    setSearchPerformed(false);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    setSearchTerm('');
    setSearchPerformed(false);
    setFilteredServices(
      !showHistory ? 
      myServices.filter(service => !service.isOffering) :
      myServices.filter(service => service.isOffering)
    );
  };

  const fetchServicesForCleaner = async (id) => {
    try {
      setLoading(true);
      const serviceList = await controller.getCleanerServices(id);
      setMyServices(serviceList || []);
      setFilteredServices((serviceList || []).filter(service => service.isOffering));
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
        <input id="serviceArea" class="swal2-input" placeholder="Service Area">
        <input id="specialEquipment" class="swal2-input" placeholder="Special Equipment Used">
        <input id="numWorkers" type="number" class="swal2-input" placeholder="Number of Workers">
        <input id="includedTasks" class="swal2-input" placeholder="What's Included (comma separated)">
      `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => ({
        serviceName: document.getElementById('serviceName').value,
        serviceType: document.getElementById('serviceType').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        duration: document.getElementById('duration').value,
        serviceArea: document.getElementById('serviceArea').value,
        specialEquipment: document.getElementById('specialEquipment').value,
        numWorkers: document.getElementById('numWorkers').value,
        includedTasks: document.getElementById('includedTasks').value.split(',').map(s => s.trim()),
        isOffering: true
      })
    });

    if (newService) {
      const isAdded = await controller.createService(
        newService.serviceName,
        newService.description,
        newService.price,
        newService.duration,
        currentCleanerId,
        newService.serviceType,
        newService.isOffering,
        newService.serviceArea,
        newService.specialEquipment,
        newService.numWorkers,
        newService.includedTasks
      );

      if (isAdded) {
        Swal.fire('Done!', 'Service added successfully', 'success');
        fetchServicesForCleaner(currentCleanerId); // refresh list
      } else {
        Swal.fire('Oops', 'Failed to add service', 'error');
      }
    }
  };

  const handleServiceOfferingChange = async (serviceId, newOfferingStatus) => {
    try {
      const result = await controller.updateServiceOffering(serviceId, newOfferingStatus);
      
      if (result === null) {
        // Failed to update
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Failed to update service offering status. Please try again.',
        });
        return;
      }

      // Success case
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Service has been ${newOfferingStatus ? 'restored to current offerings' : 'moved to history'}.`,
      });
      
      // Refresh the service list
      await fetchServicesForCleaner(currentCleanerId);
    } catch (error) {
      console.error("UI error handling service offering update:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
      });
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
        <input id="serviceArea" class="swal2-input" value="${existingService.serviceArea || ''}" placeholder="Service Area">
        <input id="specialEquipment" class="swal2-input" value="${existingService.specialEquipment || ''}" placeholder="Special Equipment Used">
        <input id="numWorkers" class="swal2-input" type="number" value="${existingService.numWorkers || ''}" placeholder="Number of Workers">
        <input id="includedTasks" class="swal2-input" value="${existingService.includedTasks ? existingService.includedTasks.join(', ') : ''}" placeholder="What's Included (comma separated)">
        <select id="isOffering" class="swal2-select">
          <option value="true" ${existingService.isOffering ? 'selected' : ''}>Available</option>
          <option value="false" ${!existingService.isOffering ? 'selected' : ''}>Archive</option>
        </select>
      `,
      showCancelButton: true,
      preConfirm: () => {
        const updatedOffering = document.getElementById('isOffering').value === 'true';
        const data = {
          serviceName: document.getElementById('serviceName').value,
          serviceType: document.getElementById('serviceType').value,
          description: document.getElementById('description').value,
          price: document.getElementById('price').value,
          duration: document.getElementById('duration').value,
          serviceArea: document.getElementById('serviceArea').value,
          specialEquipment: document.getElementById('specialEquipment').value,
          numWorkers: document.getElementById('numWorkers').value,
          includedTasks: document.getElementById('includedTasks').value.split(',').map(s => s.trim())
        };

        // If offering status changed, handle it separately
        if (updatedOffering !== existingService.isOffering) {
          handleServiceOfferingChange(existingService.id, updatedOffering);
        }

        return data;
      }
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

  const moveToHistory = async (service) => {
    const updatedService = { ...service, isOffering: false };
    const wasUpdated = await controller.updateService(service.id, updatedService);
    if (wasUpdated) {
      Swal.fire('Updated', 'Service moved to history', 'success');
      fetchServicesForCleaner(currentCleanerId);
    } else {
      Swal.fire('Oops', 'Failed to move service to history', 'error');
    }
  };

  const restoreService = async (service) => {
    const updatedService = { ...service, isOffering: true };
    const wasUpdated = await controller.updateService(service.id, updatedService);
    if (wasUpdated) {
      Swal.fire('Updated', 'Service restored to current offerings', 'success');
      fetchServicesForCleaner(currentCleanerId);
    } else {
      Swal.fire('Oops', 'Failed to restore service', 'error');
    }
  };

  // Layout below is mostly left intact
  return (
    <div className="cs-container">
      <div className="cs-header">
        <h1>My Cleaning Services</h1>
        {!showHistory && (
          <button className="cs-back-button" onClick={() => navigate(-1)}>
            Home
          </button>
        )}
      </div>

      <div className="cs-search-section">
        <div className="cs-search-bar">
          <input
            type="text"
            placeholder="Search by service name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="cs-search-input"
          />
          <button onClick={SearchService} className="cs-search-button">
            Search
          </button>
          <button 
            onClick={toggleHistory} 
            className={`cs-history-button ${showHistory ? 'active' : ''}`}
          >
            {showHistory ? 'Current Services' : 'History'}
          </button>
          {searchPerformed && (
            <button onClick={resetSearch} className="cs-reset-button">
              Reset
            </button>
          )}
        </div>
        {!showHistory && (
          <button className="cs-create-button" onClick={promptCreateService}>
            + Add New Service
          </button>
        )}
      </div>

      {searchPerformed && (
        <div className="cs-search-results">
          Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} matching "{searchTerm}"
        </div>
      )}

      <div className="cs-service-list">
        <div className="cs-list-header">
          <div>Service</div>
          <div>Type</div>
          <div>Description</div>
          <div>Price</div>
          <div>Duration</div>
          <div>Actions</div>
        </div>
        {filteredServices.map((srv) => (
          <div key={srv.id} className="cs-list-row">
            <div>{srv.serviceName}</div>
            <div>{srv.serviceType}</div>
            <div>{srv.description}</div>
            <div>${srv.price}</div>
            <div>{srv.duration}h</div>
            <div className="cs-actions-cell">
              <button className="cs-edit-button" onClick={() => promptEditService(srv)}>Edit</button>
              {!showHistory && (
                <button className="cs-delete-button" onClick={() => confirmDeleteService(srv.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredServices.length === 0 && !loading && (
          <div className="cs-no-results">
            {showHistory ? 'No historical services found' : 'No current services found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanerServiceUI;
