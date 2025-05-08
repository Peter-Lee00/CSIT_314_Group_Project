import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // So we can redirect if the user isn't a cleaner
import Cookies from 'js-cookie';
import { CleanerServiceController, CleanerTrackViewCountController, CleanerTrackShortlistCountController } from '../controller/CleanerServiceController';
import { ServiceOffering } from '../entity/CleaningService';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import './CleanerServiceUI.css';
//for taking screenshot
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
  const [historySearch, setHistorySearch] = useState({
    serviceName: '',
    startDate: '',
    endDate: ''
  });
  const [historyResults, setHistoryResults] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [searchPriceRange, setSearchPriceRange] = useState('');

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
    let filtered = myServices;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(service =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (searchType) {
      filtered = filtered.filter(service => service.serviceType === searchType);
    }
    if (searchPriceRange) {
      const [min, max] = searchPriceRange.split('-').map(Number);
      filtered = filtered.filter(service => service.price >= min && service.price <= max);
    }
    // Date period filter
    if (historySearch.startDate) {
      filtered = filtered.filter(service =>
        (!service.serviceAvailableTo || service.serviceAvailableTo >= historySearch.startDate)
      );
    }
    if (historySearch.endDate) {
      filtered = filtered.filter(service =>
        (!service.serviceAvailableFrom || service.serviceAvailableFrom <= historySearch.endDate)
      );
    }
    filtered = filtered.filter(service => showHistory ? !service.isOffering : service.isOffering);
    setFilteredServices(filtered);
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
      width: 800,
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Name:</label><input id="serviceName" class="swal2-input" style="flex:1;" placeholder="Service Name"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Type:</label><select id="serviceType" class="swal2-select" style="flex:1;">${availableTypes.map(type => `<option value="${type}">${type}</option>`).join('')}</select></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">Description:</label>
            <textarea id="description" class="swal2-textarea" style="flex:1; min-height:60px;" placeholder="Short description"></textarea>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Price (SGD):</label><input id="price" type="number" class="swal2-input" style="flex:1;" placeholder="Price in SGD"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Duration (hrs):</label><input id="duration" type="number" class="swal2-input" style="flex:1;" placeholder="Duration (hrs)"></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Area:</label><input id="serviceArea" class="swal2-input" style="flex:1;" placeholder="Service Area"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Special Equipment:</label><input id="specialEquipment" class="swal2-input" style="flex:1;" placeholder="Special Equipment Used"></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;"># of Workers:</label><input id="numWorkers" type="number" class="swal2-input" style="flex:1;" placeholder="Number of Workers"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available From:</label><input id="serviceAvailableFrom" type="date" class="swal2-input" style="flex:1;"></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available To:</label><input id="serviceAvailableTo" type="date" class="swal2-input" style="flex:1;"></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">What's Included:</label>
            <textarea id="includedTasks" class="swal2-textarea" style="flex:1; min-height:60px;" placeholder="What's Included (comma separated)"></textarea>
          </div>
        </div>
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
        serviceAvailableFrom: document.getElementById('serviceAvailableFrom').value,
        serviceAvailableTo: document.getElementById('serviceAvailableTo').value,
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
        newService.includedTasks,
        newService.serviceAvailableFrom,
        newService.serviceAvailableTo
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
      width: 800,
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Name:</label><input id="serviceName" class="swal2-input" style="flex:1;" value="${existingService.serviceName}"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Type:</label><select id="serviceType" class="swal2-select" style="flex:1;">${availableTypes.map(type => `<option value="${type}" ${type === existingService.serviceType ? 'selected' : ''}>${type}</option>`).join('')}</select></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">Description:</label>
            <textarea id="description" class="swal2-textarea" style="flex:1; min-height:60px;" >${existingService.description || ''}</textarea>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Price (SGD):</label><input id="price" class="swal2-input" type="number" style="flex:1;" value="${existingService.price}"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Duration (hrs):</label><input id="duration" class="swal2-input" type="number" style="flex:1;" value="${existingService.duration}"></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Area:</label><input id="serviceArea" class="swal2-input" style="flex:1;" value="${existingService.serviceArea || ''}"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Special Equipment:</label><input id="specialEquipment" class="swal2-input" style="flex:1;" value="${existingService.specialEquipment || ''}"></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;"># of Workers:</label><input id="numWorkers" class="swal2-input" type="number" style="flex:1;" value="${existingService.numWorkers || ''}"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available From:</label><input id="serviceAvailableFrom" type="date" class="swal2-input" style="flex:1;" value="${existingService.serviceAvailableFrom || ''}"></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available To:</label><input id="serviceAvailableTo" type="date" class="swal2-input" style="flex:1;" value="${existingService.serviceAvailableTo || ''}"></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Status:</label><select id="isOffering" class="swal2-select" style="flex:1;"><option value="true" ${existingService.isOffering ? 'selected' : ''}>Available</option><option value="false" ${!existingService.isOffering ? 'selected' : ''}>Archive</option></select></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">What's Included:</label>
            <textarea id="includedTasks" class="swal2-textarea" style="flex:1; min-height:60px;">${existingService.includedTasks ? existingService.includedTasks.join(', ') : ''}</textarea>
          </div>
        </div>
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
          includedTasks: document.getElementById('includedTasks').value.split(',').map(s => s.trim()),
          serviceAvailableFrom: document.getElementById('serviceAvailableFrom').value,
          serviceAvailableTo: document.getElementById('serviceAvailableTo').value
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

  const trackViewCount = async (serviceId) => {
    Swal.fire({
      title: 'View Count History',
      width: 800,
      html: `
        <canvas id="viewCountChart" width="400" height="200"></canvas>
        <h3 id="viewCountChartLoading">Loading Chart...</h3>
        <h3 id="viewCountErrorText" style="display: none;">View Count History Data Not Found!</h3>
      `,
      confirmButtonText: 'Close',
      focusConfirm: false,
      didOpen: async () => {
        const cleanerTrackViewCountController = new CleanerTrackViewCountController();
        const viewCountHistory = await cleanerTrackViewCountController.trackViewCount(serviceId);

        if (viewCountHistory === undefined || viewCountHistory === null) {
          document.getElementById("viewCountChart").style.display = "none";
          document.getElementById("viewCountChartLoading").style.display = "none";
          document.getElementById("viewCountErrorText").style.display = "block";
        } else {
          const orderedViewCountHistory = {};
          Object.keys(viewCountHistory).sort().forEach(key => {
            orderedViewCountHistory[key] = viewCountHistory[key];
          });

          const accumulatedViewCountHistory = {};
          Object.keys(orderedViewCountHistory).forEach((key, index) => {
            if (index === 0) {
              accumulatedViewCountHistory[key] = orderedViewCountHistory[key];
            } else {
              accumulatedViewCountHistory[key] = orderedViewCountHistory[key] + accumulatedViewCountHistory[Object.keys(accumulatedViewCountHistory)[index - 1]];
            }
          });

          const ctx = document.getElementById('viewCountChart');
          new Chart(ctx, {
            data: {
              labels: Object.keys(orderedViewCountHistory),
              datasets: [{
                type: 'line',
                label: 'Monthly View Count',
                data: Object.values(orderedViewCountHistory),
                fill: false,
                borderColor: 'rgb(230, 212, 110)',
                tension: 0.1
              }, {
                type: 'line',
                label: 'Cumulative View Count',
                data: Object.values(accumulatedViewCountHistory),
                fill: true,
                showLine: false,
                backgroundColor: 'rgba(110, 136, 229, 0.6)',
                tension: 0.1
              }]
            }
          });

          document.getElementById("viewCountChartLoading").style.display = "none";
        }
      }
    });
  };

  const trackShortlistCount = async (serviceId) => {
    Swal.fire({
      title: 'Shortlist Count History',
      width: 800,
      html: `
        <canvas id="shortlistCountChart" width="400" height="200"></canvas>
        <h3 id="shortlistCountChartLoading">Loading Chart...</h3>
        <h3 id="shortlistCountErrorText" style="display: none;">Shortlist Count History Data Not Found!</h3>
      `,
      confirmButtonText: 'Close',
      focusConfirm: false,
      didOpen: async () => {
        const cleanerTrackShortlistCountController = new CleanerTrackShortlistCountController();
        const shortlistCountHistory = await cleanerTrackShortlistCountController.trackShortlistCount(serviceId);

        if (shortlistCountHistory === undefined || shortlistCountHistory === null) {
          document.getElementById("shortlistCountChart").style.display = "none";
          document.getElementById("shortlistCountChartLoading").style.display = "none";
          document.getElementById("shortlistCountErrorText").style.display = "block";
        } else {
          const orderedShortlistCountHistory = {};
          Object.keys(shortlistCountHistory).sort().forEach(key => {
            orderedShortlistCountHistory[key] = shortlistCountHistory[key];
          });

          const accumulatedShortlistCountHistory = {};
          Object.keys(orderedShortlistCountHistory).forEach((key, index) => {
            if (index === 0) {
              accumulatedShortlistCountHistory[key] = orderedShortlistCountHistory[key];
            } else {
              accumulatedShortlistCountHistory[key] = orderedShortlistCountHistory[key] + accumulatedShortlistCountHistory[Object.keys(accumulatedShortlistCountHistory)[index - 1]];
            }
          });

          const ctx = document.getElementById('shortlistCountChart');
          new Chart(ctx, {
            data: {
              labels: Object.keys(orderedShortlistCountHistory),
              datasets: [{
                type: 'line',
                label: 'Monthly Shortlist Count',
                data: Object.values(orderedShortlistCountHistory),
                fill: false,
                borderColor: 'rgb(230, 212, 110)',
                tension: 0.1
              }, {
                type: 'line',
                label: 'Cumulative Shortlist Count',
                data: Object.values(accumulatedShortlistCountHistory),
                fill: true,
                showLine: false,
                backgroundColor: 'rgba(110, 136, 229, 0.6)',
                tension: 0.1
              }]
            }
          });

          document.getElementById("shortlistCountChartLoading").style.display = "none";
        }
      }
    });
  };

  const handleHistorySearch = () => {
    setShowHistory(true);
    setSearchTerm('');
    setSearchType('');
    setSearchPriceRange('');
    setHistorySearch({ serviceName: '', startDate: '', endDate: '' });
    setSearchPerformed(false);
    setFilteredServices(myServices.filter(service => !service.isOffering));
  };

  const handleHistoryClear = () => {
    setShowHistory(false);
    setSearchTerm('');
    setSearchType('');
    setSearchPriceRange('');
    setHistorySearch({ serviceName: '', startDate: '', endDate: '' });
    setSearchPerformed(false);
    setFilteredServices(myServices.filter(service => service.isOffering));
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
        <div className="cs-search-main">
          <input
            type="text"
            placeholder="Search by service name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="cs-search-input"
          />
          <button onClick={SearchService} className="cs-search-button">Search</button>
          <button onClick={handleHistoryClear} className="cs-reset-button">Clear</button>
          <button className="cs-create-button" style={{minWidth:'unset',padding:'8px 16px',fontSize:'14px',marginLeft:'8px'}} onClick={promptCreateService}>
            + Add New Service
          </button>
        </div>
        <div className="cs-search-filters">
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            className="cs-search-input"
            style={{ minWidth: '140px' }}
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
            value={searchPriceRange}
            onChange={e => setSearchPriceRange(e.target.value)}
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
            value={historySearch.startDate}
            onChange={e => setHistorySearch({ ...historySearch, startDate: e.target.value })}
            className="cs-search-input"
            style={{ minWidth: '140px' }}
          />
          <input
            type="date"
            value={historySearch.endDate}
            onChange={e => setHistorySearch({ ...historySearch, endDate: e.target.value })}
            className="cs-search-input"
            style={{ minWidth: '140px' }}
          />
          <button onClick={handleHistorySearch} className="cs-history-button">History</button>
        </div>
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
              <button className="cs-delete-button" onClick={() => confirmDeleteService(srv.id)}>
                Delete
              </button>
            </div>
            <span>
              <div className="counter-display">
                <span onClick={() => trackViewCount(srv.id)} title="Click to track view count">
                  <span title="View" className="csIcon">👁️</span>
                  <span>{srv.view_count || 0}</span>
                </span>
                <span onClick={() => trackShortlistCount(srv.id)} title="Click to track shortlist count">
                  <span title="Shortlist" className="csIcon">⭐</span>
                  <span>{srv.shortlist_count || 0}</span>
                </span>
              </div>
            </span>
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
