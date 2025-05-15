import React, { useEffect, useState } from 'react';
import {
    AddCategoryController,
    EditCategoryController,
    DeleteCategoryController,
    ListCategoriesController,
    SearchCategoriesController,
} from '../controller/PMserviceCategoryController';
import {
    GenerateDailyReportController,
    GenerateWeeklyReportController,
    GenerateMonthlyReportController
} from '../controller/PMreportController';
import Swal from 'sweetalert2';
import { UserLogoutController } from '../controller/UserAuthController';
import { useNavigate } from 'react-router-dom';
import './PlatformManagerServiceCategoryUI.css';

const PlatformManagerServiceCategoryUI = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    const navigate = useNavigate();

    const loadCategories = async () => {
        setLoading(true);
        try {
        const listController = new ListCategoriesController();
            const response = await listController.listCategories();
            if (response.success) {
                setCategories(response.data.categories);
                setFilteredCategories(response.data.categories);
            } else {
                Swal.fire('Error', response.message || 'Failed to load categories', 'error');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            Swal.fire('Error', 'Failed to load categories', 'error');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        setFilteredCategories(categories);
    }, [categories]);

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
                navigate("/");
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

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Add Service Category',
            html:
                '<input id="cat-name" class="swal2-input" placeholder="Category Name">' +
                '<input id="cat-desc" class="swal2-input" placeholder="Description (optional)">',
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('cat-name').value;
                const desc = document.getElementById('cat-desc').value;
                if (!name) {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }
                return { name, desc };
            }
        });
        if (formValues) {
            try {
                const addController = new AddCategoryController();
                const response = await addController.addCategory(formValues.name, formValues.desc);
                if (response.success) {
                await loadCategories();
                Swal.fire('Added!', 'Category added successfully.', 'success');
                } else {
                    Swal.fire('Error', response.message || 'Failed to add category', 'error');
                }
            } catch (err) {
                Swal.fire('Error', err.message || 'Failed to add category', 'error');
            }
        }
    };

    const handleEdit = async (cat) => {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Service Category',
            html:
                `<input id="cat-name" class="swal2-input" value="${cat.name}" placeholder="Category Name">` +
                `<input id="cat-desc" class="swal2-input" value="${cat.description || ''}" placeholder="Description (optional)">`,
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('cat-name').value;
                const desc = document.getElementById('cat-desc').value;
                if (!name) {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }
                return { name, desc };
            }
        });
        if (formValues) {
            try {
                const editController = new EditCategoryController();
                const response = await editController.editCategory(cat.id, { name: formValues.name, description: formValues.desc });
                if (response.success) {
                await loadCategories();
                Swal.fire('Updated!', 'Category updated successfully.', 'success');
                } else {
                    Swal.fire('Error', response.message || 'Failed to update category', 'error');
                }
            } catch (err) {
                Swal.fire('Error', err.message || 'Failed to update category', 'error');
            }
        }
    };

    const handleDelete = async (cat) => {
        const result = await Swal.fire({
            title: 'Delete Category?',
            text: `Are you sure you want to delete "${cat.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed) {
            try {
                const deleteController = new DeleteCategoryController();
                const response = await deleteController.deleteCategory(cat.id);
                if (response.success) {
                await loadCategories();
                    Swal.fire('Deleted!', 'Category deleted successfully.', 'success');
                } else {
                    Swal.fire('Error', response.message || 'Failed to delete category', 'error');
                }
            } catch (err) {
                Swal.fire('Error', err.message || 'Failed to delete category', 'error');
            }
        }
    };

    const handleSearch = async () => {
        try {
        const searchController = new SearchCategoriesController();
            const response = await searchController.searchCategories(searchTerm);
            if (response.success) {
                setFilteredCategories(response.data.categories);
            } else {
                Swal.fire('Error', response.message || 'Failed to search categories', 'error');
            }
        } catch (error) {
            console.error('Error searching categories:', error);
            Swal.fire('Error', 'Failed to search categories', 'error');
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setFilteredCategories(categories);
    };

    // REPORT HANDLER
    const handleGenerateReport = async (period) => {
        try {
            let reportController;
            if (period === 'daily') {
                reportController = new GenerateDailyReportController();
            } else if (period === 'weekly') {
                reportController = new GenerateWeeklyReportController();
            } else if (period === 'monthly') {
                reportController = new GenerateMonthlyReportController();
            } else {
                throw new Error('Invalid report period');
            }
            const response = await reportController.generateReport();
            if (!response.success) {
                throw new Error(response.message);
            }

            const report = response.data;
            // Find the most viewed, most requested, and most shortlisted service categories
            let mostViewedService = null;
            let mostViewedCount = -1;
            let mostRequestedService = null;
            let mostRequestedCount = -1;
            let mostShortlistedService = null;
            let mostShortlistedCount = -1;

            report.categories.forEach(row => {
                if (row.totalViews > mostViewedCount) {
                    mostViewedCount = row.totalViews;
                    mostViewedService = row.categoryName;
                }
                if (row.totalRequests > mostRequestedCount) {
                    mostRequestedCount = row.totalRequests;
                    mostRequestedService = row.categoryName;
                }
                if (row.totalShortlists > mostShortlistedCount) {
                    mostShortlistedCount = row.totalShortlists;
                    mostShortlistedService = row.categoryName;
                }
            });

            const summaryHtml = `
              <div style='margin-top:16px;font-weight:bold;'>
                The most viewed service is "${mostViewedService && mostViewedCount > 0 ? mostViewedService + ' (' + mostViewedCount + ' views)' : 'No data'}"<br/>
                The service that got most requests is "${mostRequestedService && mostRequestedCount > 0 ? mostRequestedService + ' (' + mostRequestedCount + ' requests)' : 'No data'}"<br/>
                The most shortlisted service is "${mostShortlistedService && mostShortlistedCount > 0 ? mostShortlistedService + ' (' + mostShortlistedCount + ' shortlists)' : 'No data'}"
              </div>
            `;

            // Add period info
            let periodInfo = '';
            const today = new Date();
            const pad = n => n < 10 ? '0' + n : n;
            if (period === 'daily') {
                periodInfo = `<div style='margin-top:10px;font-style:italic;'>Date: ${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}</div>`;
            } else if (period === 'weekly') {
                const end = new Date(today);
                const start = new Date(today);
                start.setDate(end.getDate() - 6);
                periodInfo = `<div style='margin-top:10px;font-style:italic;'>Week: ${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())} to ${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}</div>`;
            } else if (period === 'monthly') {
                periodInfo = `<div style='margin-top:10px;font-style:italic;'>Month: ${today.getFullYear()}-${pad(today.getMonth() + 1)}</div>`;
            }

            Swal.fire({
                title: `${period.charAt(0).toUpperCase() + period.slice(1)} Report`,
                html: `
                  <div class="pmsc-report-modal-table-wrapper">
                    <table class="pmsc-table pmsc-report-table">
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Total Views</th>
                        <th>Total Requests</th>
                        <th>Total Shortlists</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${report.categories.map(row => `
                        <tr>
                          <td>${row.categoryName}</td>
                          <td>${row.totalViews}</td>
                          <td>${row.totalRequests}</td>
                          <td>${row.totalShortlists}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  </div>
                  <div class="pmsc-report-summary-section">
                  ${summaryHtml}
                  ${periodInfo}
                  </div>
                `,
                width: 800
            });
        } catch (err) {
            Swal.fire('Error', err.message || 'Failed to generate report', 'error');
        }
    };

    return (
        <div className="pmsc-container">
            <div className="pmsc-header-row">
                <h2 className="pmsc-title">Service Category Management</h2>
                <button className="pmsc-logout-button" onClick={handleLogout}>Logout</button>
            </div>

            <div className="pmsc-controls">
                <div className="pmsc-search-section">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pmsc-search-input"
                    />
                    <div className="pmsc-button-group">
                        <button onClick={handleSearch} className="pmsc-primary-button">Search</button>
                        <button onClick={handleClear} className="pmsc-secondary-button">Clear</button>
                    </div>
                </div>
                <button onClick={handleAdd} className="pmsc-primary-button">Add Category</button>
            </div>

            <div className="pmsc-report-controls">
                <button onClick={() => handleGenerateReport('daily')} className="pmsc-primary-button">Daily Report</button>
                <button onClick={() => handleGenerateReport('weekly')} className="pmsc-primary-button">Weekly Report</button>
                <button onClick={() => handleGenerateReport('monthly')} className="pmsc-primary-button">Monthly Report</button>
            </div>

            {loading ? (
                <div className="pmsc-loading">Loading categories...</div>
            ) : (
                <table className="pmsc-table">
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.name}</td>
                                <td>{cat.description || 'No description'}</td>
                                <td>{cat.lastUpdated ? new Date(cat.lastUpdated).toLocaleDateString() : ''}</td>
                                <td>
                                    <div className="pmsc-action-buttons">
                                        <button onClick={() => handleEdit(cat)} className="pmsc-primary-button">Edit</button>
                                        <button onClick={() => handleDelete(cat)} className="pmsc-danger-button">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredCategories.length === 0 && (
                            <tr>
                                <td colSpan="4" className="pmsc-no-results">No categories found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PlatformManagerServiceCategoryUI; 