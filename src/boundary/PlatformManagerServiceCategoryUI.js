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
        const listController = new ListCategoriesController();
        const data = await listController.listCategories();
        setCategories(data);
        setFilteredCategories(data);
        setLoading(false);
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
                await addController.addCategory(formValues.name, formValues.desc);
                await loadCategories();
                Swal.fire('Added!', 'Category added successfully.', 'success');
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
                await editController.editCategory(cat.id, { name: formValues.name, description: formValues.desc });
                await loadCategories();
                Swal.fire('Updated!', 'Category updated successfully.', 'success');
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
                await deleteController.deleteCategory(cat);
                await loadCategories();
                Swal.fire('Deleted!', 'Category deleted.', 'success');
            } catch (err) {
                Swal.fire('Error', err.message || 'Failed to delete category', 'error');
            }
        }
    };

    const handleSearch = async () => {
        const searchController = new SearchCategoriesController();
        const filtered = await searchController.searchCategories(searchTerm);
        setFilteredCategories(filtered);
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
            const report = await reportController.generateReport();
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
                  <table style="width:100%;text-align:left">
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
                  ${summaryHtml}
                  ${periodInfo}
                `,
                width: 700
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
            <div className="pmsc-action-row">
                <button className="pmsc-report-button" onClick={() => handleGenerateReport('daily')}>Generate Daily Report</button>
                <button className="pmsc-report-button" onClick={() => handleGenerateReport('weekly')}>Generate Weekly Report</button>
                <button className="pmsc-report-button" onClick={() => handleGenerateReport('monthly')}>Generate Monthly Report</button>
            </div>
            <div className="pmsc-search-row">
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={handleClear}>Clear</button>
            </div>
            <div className="pmsc-add-row">
                <button className="pmsc-add-button" onClick={handleAdd}>Add New Category</button>
            </div>
            {loading ? (
                <div className="pmsc-loading">Loading...</div>
            ) : (
                <table className="pmsc-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.description}</td>
                                <td>
                                    <button className="pmsc-edit-button" onClick={() => handleEdit(category)}>Edit</button>
                                    <button className="pmsc-delete-button" onClick={() => handleDelete(category)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PlatformManagerServiceCategoryUI; 