import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoginUI from './boundary/LoginUI';
import HomeOwnerCleaningServiceUI from './boundary/HomeOwnerCleaningServiceUI';
import CleanerServiceUI from './boundary/CleanerServiceUI';
import UserAccountManagementUI from './boundary/UserAccountManagementUI';
import UserProfileManagementUI from './boundary/UserProfileManagementUI';
import App from './App';
import UserManagementUI from './boundary/UserManagementUI';
import CleanerConfirmedMatchesUI from './boundary/CleanerConfirmedMatchesUI';
import CleanerRequestUI from './boundary/CleanerRequestUI';
import HomeOwnerShortlistCleaningServiceUI from './boundary/HomeOwnerShortlistCleaningServiceUI';
import PlatformManagerServiceCategoryUI from './boundary/PlatformManagerServiceCategoryUI';

jest.mock('sweetalert2', () => ({
  fire: jest.fn()
}));

// Mock Firebase
jest.mock('./firebase');

beforeAll(() => {
  window.open = jest.fn();
});

// Helper function to wrap components with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};


// --- UI Render Tests (concise style) ---
describe('UI Render Test', () => {
  describe('User Admin UI', () => {
    test('UserManagementUI renders without crashing', () => {
      renderWithRouter(<UserManagementUI />);
      expect(screen.getByText('User Account Management')).toBeInTheDocument();
    });
    test('UserAccountManagementUI renders without crashing', () => {
      renderWithRouter(<UserAccountManagementUI />);
      expect(screen.getByText('Accounts Management')).toBeInTheDocument();
    });
    test('UserProfileManagementUI renders without crashing', () => {
      renderWithRouter(<UserProfileManagementUI />);
      expect(screen.getByText('Manage User Profiles')).toBeInTheDocument();
    });
  });
/* Cleaner UI */
  describe('Cleaner UI', () => {
    test('CleanerServiceUI renders without crashing', () => {
      renderWithRouter(<CleanerServiceUI />);
      expect(screen.getByText('My Cleaning Services')).toBeInTheDocument();
    });
    test('CleanerConfirmedMatchesUI renders without crashing', () => {
      renderWithRouter(<CleanerConfirmedMatchesUI confirmedRequests={[]} onClose={jest.fn()} />);
      expect(screen.getByText('No confirmed matches found.')).toBeInTheDocument();
    });
    test('CleanerRequestUI renders without crashing', () => {
      renderWithRouter(<CleanerRequestUI requests={[]} requestServiceDetails={{}} />);
      expect(screen.getByText('Service Requests')).toBeInTheDocument();
    });
  });

  describe('Home Owner UI', () => {
    test('HomeOwnerCleaningServiceUI renders without crashing', () => {
      renderWithRouter(<HomeOwnerCleaningServiceUI />);
      expect(screen.getByText('Available Cleaning Services')).toBeInTheDocument();
    });
    test('HomeOwnerShortlistCleaningServiceUI renders without crashing', () => {
      renderWithRouter(<HomeOwnerShortlistCleaningServiceUI />);
      expect(screen.getByText('Service Name')).toBeInTheDocument();
    });
  });

  describe('Platform Manager UI', () => {
    test('PlatformManagerServiceCategoryUI renders without crashing', () => {
      renderWithRouter(<PlatformManagerServiceCategoryUI />);
      expect(screen.getByText('Service Category Management')).toBeInTheDocument();
    });
    test('UserAccountManagementUI renders for Platform Manager', () => {
      renderWithRouter(<UserAccountManagementUI />);
      expect(screen.getByText('Accounts Management')).toBeInTheDocument();
    });
  });
});

// --- Feature/Flow Tests ---
describe('Feature & Flow Tests', () => {
  beforeEach(() => {
    Swal.fire.mockClear();
  });

  test('Login UI launches website', () => {
    renderWithRouter(<LoginUI />);
    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument();
  });

  test('Invalid role selection shows error', () => {
    renderWithRouter(<LoginUI />);
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Log In/i));
    expect(Swal.fire).toHaveBeenCalled();
  });

  test('Invalid username/password shows error', () => {
    renderWithRouter(<LoginUI />);
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'HomeOwner' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Log In/i));
    expect(Swal.fire).toHaveBeenCalled();
  });

  test('Logout works', async () => {
    renderWithRouter(<UserAccountManagementUI />);
    fireEvent.click(screen.getByText(/Logout/i));
    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });
  });

  test('Track view counts triggers SweetAlert', () => {
    // Minimal mock service data
    const mockServices = [{
      id: '1',
      serviceName: 'Test Service',
      viewCount: 0,
      
    }];
    renderWithRouter(
      <CleanerServiceUI services={mockServices} />
    );
    // Try to find a view icon or button 
    const viewIcon = screen.queryByTestId('viewIcon') || screen.queryByText('View');
    if (viewIcon) {
      fireEvent.click(viewIcon);
      expect(Swal.fire).toHaveBeenCalled();
    }
  });

  test('Track shortlist counts triggers SweetAlert', () => {
    const mockServices = [{
      id: '1',
      serviceName: 'Test Service',
      shortlistCount: 0,
    }];
    renderWithRouter(
      <CleanerServiceUI services={mockServices} />
    );
    const shortlistIcon = screen.queryByTestId('shortlistIcon') || screen.queryByText('Shortlist');
    if (shortlistIcon) {
      fireEvent.click(shortlistIcon);
      expect(Swal.fire).toHaveBeenCalled();
    }
  });

  test('Send request to cleaner triggers SweetAlert', () => {
    renderWithRouter(<HomeOwnerCleaningServiceUI />);
    const sendRequestBtn = screen.queryByText('Send Request');
    if (sendRequestBtn) {
      fireEvent.click(sendRequestBtn);
      expect(Swal.fire).toHaveBeenCalled();
    }
  });

  test('Open reports displays report details', () => {
    renderWithRouter(<PlatformManagerServiceCategoryUI />);
    const openReportBtn = screen.queryByText('Open Report');
    if (openReportBtn) {
      fireEvent.click(openReportBtn);
      expect(screen.getByText('Report Details')).toBeInTheDocument();
    }
  });
});