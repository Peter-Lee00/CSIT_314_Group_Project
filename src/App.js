import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginUI from './boundary/LoginUI';
import UserManagementUI from './boundary/UserManagementUI';
import UserAccountManagementUI from './boundary/UserAccountManagementUI';
import UserProfileManagementUI from './boundary/UserProfileManagementUI';
import CleanerServiceUI from './boundary/CleanerServiceUI';
/* import HomeOwnerUI from './boundary/HomeOwnerUI'; */
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
          {/* <Route path="/homeowner" element={<HomeOwnerUI />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;