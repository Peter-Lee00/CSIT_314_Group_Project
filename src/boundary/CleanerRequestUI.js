import React, { useState, useEffect } from 'react';
import ServiceCategory from '../entity/ServiceCategory';

const CleanerRequestUI = ({ requests, requestServiceDetails, onAccept, onDecline, onClose }) => {
  const [search, setSearch] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [date, setDate] = useState('');
  const [serviceTypes, setServiceTypes] = useState([]);

    useEffect(() => {
    ServiceCategory.listCategories().then(types => setServiceTypes(types));
    }, []);

  const handleClear = () => {
    setSearch('');
    setServiceType('');
    setPriceRange('');
    setDate('');
  };

  const filtered = requests.filter(request => {
    const service = requestServiceDetails[request.serviceId] || {};
    const matchesSearch = !search ||
      (service.serviceName && service.serviceName.toLowerCase().includes(search.toLowerCase())) ||
      (service.serviceType && service.serviceType.toLowerCase().includes(search.toLowerCase())) ||
      (service.serviceArea && service.serviceArea.toLowerCase().includes(search.toLowerCase())) ||
      (request.homeownerId && request.homeownerId.toLowerCase().includes(search.toLowerCase()));
    const matchesType = !serviceType || service.serviceType === serviceType;
    const matchesPrice = !priceRange || (() => {
      if (!service.price) return false;
      const [min, max] = priceRange.split('-').map(Number);
      return service.price >= min && service.price <= max;
    })();
    const matchesDate = !date || request.requestedDate === date;
    return matchesSearch && matchesType && matchesPrice && matchesDate;
  });

    return (
    <div className="cs-modal">
      <div className="cs-modal-content">
        <div className="cs-modal-header">
          <h2>Service Requests</h2>
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
          {filtered.length === 0 ? (
                    <p>No requests found.</p>
                ) : (
            filtered.map(request => {
              const service = requestServiceDetails[request.serviceId] || {};
              return (
                <div key={request.id} className="cs-request-card">
                  <div className="cs-request-header">
                    <h3>Request from {request.homeownerId}</h3>
                    <span className={`cs-request-status ${request.status.toLowerCase()}`}>{request.status}</span>
                            </div>
                  <div className="cs-request-details">
                    <p><strong>Service Name:</strong> {service.serviceName || 'N/A'}</p>
                    <p><strong>Service Type:</strong> {service.serviceType || 'N/A'}</p>
                    <p><strong>Price:</strong> {service.price ? `$${service.price}` : 'N/A'}</p>
                    <p><strong>Location:</strong> {service.serviceArea || 'N/A'}</p>
                    <p><strong>Requested Date:</strong> {request.requestedDate || 'N/A'}</p>
                                <p><strong>Requested On:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                                {request.message && <p><strong>Message:</strong> {request.message}</p>}
                            </div>
                            {request.status === 'PENDING' && (
                    <div className="cs-request-actions">
                                    <button 
                        className="cs-accept-button"
                        onClick={() => onAccept(request.id, 'ACCEPTED')}
                                    >
                                        Accept
                                    </button>
                                    <button 
                        className="cs-decline-button"
                        onClick={() => onDecline(request.id, 'DECLINED')}
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
              );
            })
                )}
        </div>
            </div>
        </div>
    );
};

export default CleanerRequestUI; 