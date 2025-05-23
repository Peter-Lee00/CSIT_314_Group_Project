import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // So we can redirect if the user isn't a cleaner
import Cookies from 'js-cookie';
import {
  CleanerGetServicesController,
  CleanerCreateServiceController,
  CleanerUpdateServiceController,
  CleanerDeleteServiceController,
  CleanerUpdateServiceOfferingController,
  CleanerTrackViewCountController,
  CleanerTrackShortlistCountController,
  CleanerReadCleaningServicesController
} from '../controller/CleanerServiceController';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import './CleanerServiceUI.css';
import CleaningServiceRequest from '../entity/CleaningServiceRequest';
import CleaningService from '../entity/CleaningService';
import ServiceCategory from '../entity/ServiceCategory';
import { UserLogoutController } from '../controller/UserAuthController';
import { CleanerGetConfirmedMatchesController, CleanerSearchConfirmedMatchesController } from '../controller/CleanerConfirmedMatchController';
import CleanerRequestUI from './CleanerRequestUI';
import CleanerConfirmedMatchesUI from './CleanerConfirmedMatchesUI';

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
  const [searchType, setSearchType] = useState('');
  const [searchPriceRange, setSearchPriceRange] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [confirmedRequests, setConfirmedRequests] = useState([]);
  const [requestServiceDetails, setRequestServiceDetails] = useState({});
  const [confirmedMatchesLoading, setConfirmedMatchesLoading] = useState(false);
  const [filteredConfirmedRequests, setFilteredConfirmedRequests] = useState([]);

  const getServicesController = new CleanerGetServicesController();
  const createServiceController = new CleanerCreateServiceController();
  const updateServiceController = new CleanerUpdateServiceController();
  const deleteServiceController = new CleanerDeleteServiceController();
  const updateServiceOfferingController = new CleanerUpdateServiceOfferingController();
  const trackViewCountController = new CleanerTrackViewCountController();
  const trackShortlistCountController = new CleanerTrackShortlistCountController();
  const readCleaningServicesController = new CleanerReadCleaningServicesController();
  const getConfirmedMatchesController = new CleanerGetConfirmedMatchesController();
  const searchConfirmedMatchesController = new CleanerSearchConfirmedMatchesController();

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

    // Fetch service types from ServiceCategory
    ServiceCategory.listCategories().then(types => {
    setAvailableTypes(types);
    });
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
      const result = await readCleaningServicesController.readCleaningServices(id);
      const serviceList = result && result.success ? result.data : [];
      setMyServices(serviceList);
      setFilteredServices((serviceList || []).filter(service => service.isOffering));
    } catch (e) {
      console.error('Uh-oh, problem getting services:', e);
      Swal.fire('Oops', 'Failed to load services. Try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const promptCreateService = async () => {
    const { value: newService } = await Swal.fire({
      title: 'Create New Service',
      width: 800,
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Name:</label><input id="serviceName" class="swal2-input" style="flex:1;" placeholder="Service Name" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Type:</label><select id="serviceType" class="swal2-select" style="flex:1;">${availableTypes.map(type => `<option value="${type.name}">${type.name}</option>`).join('')}</select></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">Description:</label>
            <textarea id="description" class="swal2-textarea" style="flex:1; min-height:60px;" placeholder="Short description" required></textarea>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Price (SGD):</label><input id="price" type="number" class="swal2-input" style="flex:1;" placeholder="Price in SGD" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Duration (hrs):</label><input id="duration" type="number" class="swal2-input" style="flex:1;" placeholder="Duration (hrs)" required></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Area:</label><input id="serviceArea" class="swal2-input" style="flex:1;" placeholder="Service Area" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Special Equipment:</label><input id="specialEquipment" class="swal2-input" style="flex:1;" placeholder="Special Equipment Used" required></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;"># of Workers:</label><input id="numWorkers" type="number" class="swal2-input" style="flex:1;" placeholder="Number of Workers" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available From:</label><input id="serviceAvailableFrom" type="date" class="swal2-input" style="flex:1;" required></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available To:</label><input id="serviceAvailableTo" type="date" class="swal2-input" style="flex:1;" required></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">What's Included:</label>
            <textarea id="includedTasks" class="swal2-textarea" style="flex:1; min-height:60px;" placeholder="What's Included (comma separated)" required></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const serviceName = document.getElementById('serviceName').value.trim();
        const serviceType = document.getElementById('serviceType').value.trim();
        const description = document.getElementById('description').value.trim();
        const price = document.getElementById('price').value.trim();
        const duration = document.getElementById('duration').value.trim();
        const serviceArea = document.getElementById('serviceArea').value.trim();
        const specialEquipment = document.getElementById('specialEquipment').value.trim();
        const numWorkers = document.getElementById('numWorkers').value.trim();
        const includedTasks = document.getElementById('includedTasks').value.trim();
        const serviceAvailableFrom = document.getElementById('serviceAvailableFrom').value.trim();
        const serviceAvailableTo = document.getElementById('serviceAvailableTo').value.trim();
        if (!serviceName || !serviceType || !description || !price || !duration || !serviceArea || !specialEquipment || !numWorkers || !includedTasks || !serviceAvailableFrom || !serviceAvailableTo) {
          Swal.showValidationMessage('All fields are required!');
          return false;
        }
        return {
          serviceName,
          serviceType,
          description,
          price,
          duration,
          serviceArea,
          specialEquipment,
          numWorkers,
          includedTasks: includedTasks.split(',').map(s => s.trim()),
          serviceAvailableFrom,
          serviceAvailableTo,
        isOffering: true
        };
      }
    });

    if (newService) {
      const isAdded = await createServiceController.createService(
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

  const fillCumulativeHistory = (rawHistory, startDate, endDate) => {
    const result = [];
    let lastValue = 0;
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      const key = current.toISOString().slice(0, 10);
      if (rawHistory[key] !== undefined) {
        lastValue = rawHistory[key];
      }
      result.push({ date: key, value: lastValue });
      current.setDate(current.getDate() + 1);
    }
    return result;
  };

  const getHistoryRange = (history) => {
    const keys = Object.keys(history).sort();
    if (keys.length === 0) return [null, null];
    return [keys[0], keys[keys.length - 1]];
  };

  const handleViewCount = async (serviceId) => {
    Swal.fire({
      title: 'Daily View Count History',
      width: 800,
      html: `
        <canvas id="viewCountChart" width="400" height="200"></canvas>
        <h3 id="viewCountChartLoading">Loading Chart...</h3>
        <h3 id="viewCountErrorText" style="display: none;">View Count History Data Not Found!</h3>
      `,
      confirmButtonText: 'Close',
      focusConfirm: false,
      didOpen: async () => {
        const viewCountHistoryResp = await trackViewCountController.trackViewCount(serviceId, 'daily');
        const viewCountHistory = viewCountHistoryResp && viewCountHistoryResp.data ? viewCountHistoryResp.data : null;
        if (!viewCountHistory || Object.keys(viewCountHistory).length === 0) {
          document.getElementById("viewCountChart").style.display = "none";
          document.getElementById("viewCountChartLoading").style.display = "none";
          document.getElementById("viewCountErrorText").style.display = "block";
        } else {
          const ordered = Object.keys(viewCountHistory).sort();
          let runningTotal = 0;
          const cumulative = ordered.map(date => {
            runningTotal += viewCountHistory[date];
            return runningTotal;
          });
          const ctx = document.getElementById('viewCountChart');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ordered,
              datasets: [
                {
                  label: 'Daily View Count',
                  data: ordered.map(date => viewCountHistory[date]),
                  backgroundColor: 'rgba(110, 136, 229, 0.6)',
                  borderColor: 'rgb(110, 136, 229)',
                  borderWidth: 1,
                  yAxisID: 'y',
                  type: 'bar'
                },
                {
                  label: 'Cumulative View Count',
                  data: cumulative,
                  borderColor: 'rgb(230, 212, 110)',
                  backgroundColor: 'rgba(230, 212, 110, 0.2)',
                  fill: false,
                  type: 'line',
                  yAxisID: 'y'
                }
              ]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 }
                }
              }
            }
          });
          document.getElementById("viewCountChartLoading").style.display = "none";
        }
      }
    });
  };

  const handleShortlistCount = async (serviceId) => {
    Swal.fire({
      title: 'Daily Shortlist Count History',
      width: 800,
      html: `
        <canvas id="shortlistCountChart" width="400" height="200"></canvas>
        <h3 id="shortlistCountChartLoading">Loading Chart...</h3>
        <h3 id="shortlistCountErrorText" style="display: none;">Shortlist Count History Data Not Found!</h3>
      `,
      confirmButtonText: 'Close',
      focusConfirm: false,
      didOpen: async () => {
        const shortlistCountHistoryResp = await trackShortlistCountController.trackShortlistCount(serviceId, 'daily');
        const shortlistCountHistory = shortlistCountHistoryResp && shortlistCountHistoryResp.data ? shortlistCountHistoryResp.data : null;
        if (!shortlistCountHistory || Object.keys(shortlistCountHistory).length === 0) {
          document.getElementById("shortlistCountChart").style.display = "none";
          document.getElementById("shortlistCountChartLoading").style.display = "none";
          document.getElementById("shortlistCountErrorText").style.display = "block";
        } else {
          const ordered = Object.keys(shortlistCountHistory).sort();
          let runningTotal = 0;
          const cumulative = ordered.map(date => {
            runningTotal += shortlistCountHistory[date];
            return runningTotal;
          });
          const ctx = document.getElementById('shortlistCountChart');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ordered,
              datasets: [
                {
                  label: 'Daily Shortlist Count',
                  data: ordered.map(date => shortlistCountHistory[date]),
                  backgroundColor: 'rgba(230, 212, 110, 0.6)',
                  borderColor: 'rgb(230, 212, 110)',
                  borderWidth: 1,
                  yAxisID: 'y',
                  type: 'bar'
                },
                {
                  label: 'Cumulative Shortlist Count',
                  data: cumulative,
                  borderColor: 'rgb(110, 136, 229)',
                  backgroundColor: 'rgba(110, 136, 229, 0.2)',
                  fill: false,
                  type: 'line',
                  yAxisID: 'y'
                }
              ]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 }
                }
              }
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

  const loadRequests = async () => {
    try {
      const cleanerRequests = await CleaningServiceRequest.getRequestsByCleaner(currentCleanerId);
      // Only show pending requests
      setRequests(cleanerRequests.filter(r => r.status === 'PENDING'));
      // Fetch service details for each request
      const serviceIds = [...new Set(cleanerRequests.map(req => req.serviceId))];
      const details = {};
      for (const id of serviceIds) {
        const service = await CleaningService.getServiceById(id);
        if (service) details[id] = service;
      }
      setRequestServiceDetails(details);
    } catch (error) {
      console.error('Error loading requests:', error);
      Swal.fire('Error', 'Failed to load requests', 'error');
    }
  };

  const handleRequestStatus = async (requestId, newStatus) => {
    try {
      const success = await CleaningServiceRequest.updateRequestStatus(requestId, newStatus);
      if (success) {
        Swal.fire('Success', `Request ${newStatus.toLowerCase()} successfully`, 'success');
        loadRequests(); // Refresh the requests list
    } else {
        Swal.fire('Error', 'Failed to update request status', 'error');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      Swal.fire('Error', 'Failed to update request status', 'error');
    }
  };

  const handleConfirmedMatchesSearch = async (filters) => {
    setConfirmedMatchesLoading(true);
    try {
      const response = await searchConfirmedMatchesController.searchConfirmedMatches(currentCleanerId, filters);
      setFilteredConfirmedRequests(response.success ? response.data : []);
    } catch (err) {
      setFilteredConfirmedRequests([]);
    } finally {
      setConfirmedMatchesLoading(false);
    }
  };

  const openConfirmedMatchesModal = async () => {
    setShowHistoryModal(true);
    setConfirmedMatchesLoading(true);
    try {
      const accepted = await getConfirmedMatchesController.getConfirmedMatches(currentCleanerId);
      setFilteredConfirmedRequests(accepted && accepted.success ? accepted.data : []);
    } catch (error) {
      setFilteredConfirmedRequests([]);
    } finally {
      setConfirmedMatchesLoading(false);
    }
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

  // Add missing edit and delete functions for services
  const promptEditService = async (srv) => {
    const { value: updatedService } = await Swal.fire({
      title: 'Edit Service',
      width: 800,
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Name:</label><input id="serviceName" class="swal2-input" style="flex:1;" placeholder="Service Name" value="${srv.serviceName || ''}" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Type:</label><select id="serviceType" class="swal2-select" style="flex:1;">${availableTypes.map(type => `<option value="${type.name}" ${type.name === srv.serviceType ? 'selected' : ''}>${type.name}</option>`).join('')}</select></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">Description:</label>
            <textarea id="description" class="swal2-textarea" style="flex:1; min-height:60px;" placeholder="Short description" required>${srv.description || ''}</textarea>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Price (SGD):</label><input id="price" type="number" class="swal2-input" style="flex:1;" placeholder="Price in SGD" value="${srv.price || ''}" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Duration (hrs):</label><input id="duration" type="number" class="swal2-input" style="flex:1;" placeholder="Duration (hrs)" value="${srv.duration || ''}" required></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Service Area:</label><input id="serviceArea" class="swal2-input" style="flex:1;" placeholder="Service Area" value="${srv.serviceArea || ''}" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Special Equipment:</label><input id="specialEquipment" class="swal2-input" style="flex:1;" placeholder="Special Equipment Used" value="${srv.specialEquipment || ''}" required></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;"># of Workers:</label><input id="numWorkers" type="number" class="swal2-input" style="flex:1;" placeholder="Number of Workers" value="${srv.numWorkers || ''}" required></div>
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available From:</label><input id="serviceAvailableFrom" type="date" class="swal2-input" style="flex:1;" value="${srv.serviceAvailableFrom || ''}" required></div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div style="flex:1; display: flex; align-items: center;"><label style="width: 120px;">Available To:</label><input id="serviceAvailableTo" type="date" class="swal2-input" style="flex:1;" value="${srv.serviceAvailableTo || ''}" required></div>
          </div>
          <div style="display: flex; align-items: center;">
            <label style="width: 120px;">What's Included:</label>
            <textarea id="includedTasks" class="swal2-textarea" style="flex:1; min-height:60px;" placeholder="What's Included (comma separated)" required>${(srv.includedTasks || []).join(', ')}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const serviceName = document.getElementById('serviceName').value.trim();
        const serviceType = document.getElementById('serviceType').value.trim();
        const description = document.getElementById('description').value.trim();
        const price = document.getElementById('price').value.trim();
        const duration = document.getElementById('duration').value.trim();
        const serviceArea = document.getElementById('serviceArea').value.trim();
        const specialEquipment = document.getElementById('specialEquipment').value.trim();
        const numWorkers = document.getElementById('numWorkers').value.trim();
        const includedTasks = document.getElementById('includedTasks').value.trim();
        const serviceAvailableFrom = document.getElementById('serviceAvailableFrom').value.trim();
        const serviceAvailableTo = document.getElementById('serviceAvailableTo').value.trim();
        if (!serviceName || !serviceType || !description || !price || !duration || !serviceArea || !specialEquipment || !numWorkers || !includedTasks || !serviceAvailableFrom || !serviceAvailableTo) {
          Swal.showValidationMessage('All fields are required!');
          return false;
        }
        return {
          serviceName,
          serviceType,
          description,
          price,
          duration,
          serviceArea,
          specialEquipment,
          numWorkers,
          includedTasks: includedTasks.split(',').map(s => s.trim()),
          serviceAvailableFrom,
          serviceAvailableTo,
          isOffering: srv.isOffering
        };
      }
    });

    if (updatedService) {
      const isUpdated = await updateServiceController.updateService(srv.id, updatedService);
      if (isUpdated) {
        Swal.fire('Done!', 'Service updated successfully', 'success');
        fetchServicesForCleaner(currentCleanerId); // refresh list
      } else {
        Swal.fire('Oops', 'Failed to update service', 'error');
      }
    }
  };

  const confirmDeleteService = async (serviceId) => {
    const result = await Swal.fire({
      title: 'Delete Service?',
      text: 'Are you sure you want to delete this service? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      const isDeleted = await deleteServiceController.deleteService(serviceId);
      if (isDeleted) {
        Swal.fire('Deleted!', 'Service deleted successfully.', 'success');
        fetchServicesForCleaner(currentCleanerId); // refresh list
      } else {
        Swal.fire('Oops', 'Failed to delete service', 'error');
      }
    }
  };

  // Layout below is mostly left intact
  return (
    <div className="cs-container">
      <div className="cs-header">
        <h1>My Cleaning Services</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="cs-history-button" 
            onClick={() => {
              setShowRequests(true);
              loadRequests();
            }}
          >
            View Requests
          </button>
          <button className="cs-history-button" onClick={() => {
            setShowHistoryModal(true);
            openConfirmedMatchesModal();
          }}>Confirmed Matches</button>
          <button className="cs-history-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Refactored search/filter bar layout */}
      <div className="cs-search-section" style={{flexDirection: 'column', gap: '8px'}}>
        <div className="cs-search-main" style={{gap: '8px', alignItems: 'center'}}>
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
        <div className="cs-search-filters" style={{gap: '8px', alignItems: 'center'}}>
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
                <span onClick={() => handleViewCount(srv.id)} title="Click to track view count">
                  <span title="View" className="csIcon">👁️</span>
                  <span>{srv.view_history ? Object.values(srv.view_history).reduce((a, b) => a + b, 0) : (srv.view_count || 0)}</span>
                </span>
                <span onClick={() => handleShortlistCount(srv.id)} title="Click to track shortlist count">
                  <span title="Shortlist" className="csIcon">⭐</span>
                  <span>{srv.shortlist_history ? Object.values(srv.shortlist_history).reduce((a, b) => a + b, 0) : (srv.shortlist_count || 0)}</span>
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

      {/* Add Requests Modal */}
      {showRequests && (
        <CleanerRequestUI
          requests={requests}
          requestServiceDetails={requestServiceDetails}
          onAccept={handleRequestStatus}
          onDecline={handleRequestStatus}
          onClose={() => setShowRequests(false)}
        />
      )}

      {showHistoryModal && (
        <CleanerConfirmedMatchesUI
          confirmedRequests={filteredConfirmedRequests}
          loading={confirmedMatchesLoading}
          onSearch={handleConfirmedMatchesSearch}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

export default CleanerServiceUI;
