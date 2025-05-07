import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginUI from './boundary/LoginUI';
import UserManagementUI from './boundary/UserManagementUI';
import UserAccountManagementUI from './boundary/UserAccountManagementUI';
import UserProfileManagementUI from './boundary/UserProfileManagementUI';
import CleanerServiceUI from './boundary/CleanerServiceUI';
import HomeOwnerCleaningServiceUI from './boundary/HomeOwnerCleaningServiceUI';
import HomeOwnerShortlistCleaningServiceUI from './boundary/HomeOwnerShortlistCleaningServiceUI';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LoginUI />} />
          <Route path="/usermanagement" element={<UserManagementUI />} />
          <Route path="/useraccountmanagement" element={<UserAccountManagementUI />} />
          <Route path="/userprofilemanagement" element={<UserProfileManagementUI />} />
          <Route path="/cleaner/services" element={<CleanerServiceUI />} />
          <Route path="/homeowner/dashboard" element={<HomeOwnerCleaningServiceUI />} />
          <Route path="/my-shortlist" element={<HomeOwnerShortlistCleaningServiceUI />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;