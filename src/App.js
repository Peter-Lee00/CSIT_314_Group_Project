import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginUI from './boundary/LoginUI';
import UserManagementUI from './boundary/UserManagementUI';
import UserAccountManagementUI from './boundary/UserAccountManagementUI';
import UserProfileManagementUI from './boundary/UserProfileManagementUI';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<LoginUI />} />
                <Route path="/usermanagement" element={<UserManagementUI />} />
                <Route path="/useraccountmanagement" element={<UserAccountManagementUI />} />
                <Route path="/userprofilemanagement" element={<UserProfileManagementUI />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;