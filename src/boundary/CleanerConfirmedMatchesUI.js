import React, { useState, useEffect } from 'react';
import './CleanerConfirmedMatchesUI.css';
import ServiceCategory from '../entity/ServiceCategory';
import { CleanerSearchConfirmedMatchesController } from '../controller/CleanerConfirmedMatchController';
import Cookies from 'js-cookie';

const CleanerConfirmedMatchesUI = ({ confirmedRequests, onClose }) => {
  const [search, setSearch] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [date, setDate] = useState('');
  const [serviceTypes, setServiceTypes] = useState([]);
  const [filtered, setFiltered] = useState(confirmedRequests);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ServiceCategory.listCategories().then(types => setServiceTypes(types));
    setFiltered(confirmedRequests);
  }, [confirmedRequests]);

  const handleClear = () => {
    setSearch('');
    setServiceType('');
    setPriceRange('');
    setDate('');
    setFiltered(confirmedRequests);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const cleanerId = Cookies.get('email');
      const filters = {};
      if (search) filters.search = search;
      if (serviceType) filters.serviceType = serviceType;
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        filters.priceRange = [min, max];
      }
      if (date) filters.date = date;
      const controller = new CleanerSearchConfirmedMatchesController();
      const response = await controller.searchConfirmedMatches(cleanerId, filters);
      if (response.success) {
        setFiltered(response.data);
      } else {
        setFiltered([]);
      }
    } catch (err) {
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-modal">
      <div className="cs-modal-content">
        <div className="cs-modal-header">
          <h2>Confirmed Matches</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cs-search-section" style={{flexDirection: 'column', gap: '8px'}}>
          <div className="cs-search-main" style={{gap: '8px', alignItems: 'center'}}>
            <input
              type="text"
              placeholder="Search by service name, type, area, or homeowner"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cs-search-input"
            />
            <button onClick={handleSearch} className="cs-search-button">Search</button>
            <button onClick={handleClear} className="cs-reset-button">Clear</button>
          </div>
          <div className="cs-search-filters" style={{gap: '8px', alignItems: 'center'}}>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="cs-search-input"
              style={{ minWidth: '140px' }}
            >
              <option value="">All Types</option>
              {serviceTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
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
              value={date}
              onChange={e => setDate(e.target.value)}
              className="cs-search-input"
              style={{ minWidth: '140px' }}
            />
          </div>
        </div>
        <div className="cs-requests-list">
          {loading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 ? (
            <p>No confirmed matches found.</p>
          ) : (
            filtered.map(request => {
              const service = request.serviceDetails || {};
              return (
                <div key={request.id} className="cs-request-card">
                  <div className="cs-request-header">
                    <h3>Confirmed with {request.homeownerId}</h3>
                    <span className="cs-request-status accepted">ACCEPTED</span>
                  </div>
                  <div className="cs-request-details">
                    <p><strong>Service Name:</strong> {service.serviceName || 'N/A'}</p>
                    <p><strong>Service Type:</strong> {service.serviceType || 'N/A'}</p>
                    <p><strong>Price:</strong> {service.price ? `$${service.price}` : 'N/A'}</p>
                    <p><strong>Location:</strong> {service.serviceArea || 'N/A'}</p>
                    <p><strong>Confirmed Date:</strong> {request.requestedDate || 'N/A'}</p>
                    <p><strong>Confirmed On:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanerConfirmedMatchesUI; 