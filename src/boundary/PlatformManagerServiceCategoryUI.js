import React, { useEffect, useState } from 'react';
import { PlatformManagerServiceCategoryController } from '../controller/PlatformManagerServiceCategoryController';
import Swal from 'sweetalert2';
import { UserLogoutController } from '../controller/UserAuthController';
import { useNavigate } from 'react-router-dom';
import './PlatformManagerServiceCategoryUI.css';

const PlatformManagerServiceCategoryUI = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const controller = new PlatformManagerServiceCategoryController();
    const navigate = useNavigate();

    const loadCategories = async () => {
        setLoading(true);
        const data = await controller.listCategories();
        setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

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
            await controller.addCategory(formValues.name, formValues.desc);
            loadCategories();
            Swal.fire('Added!', 'Category added successfully.', 'success');
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
            await controller.editCategory(cat.id, { name: formValues.name, description: formValues.desc });
            loadCategories();
            Swal.fire('Updated!', 'Category updated successfully.', 'success');
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
            await controller.deleteCategory(cat.id);
            loadCategories();
            Swal.fire('Deleted!', 'Category deleted.', 'success');
        }
    };

    return (
        <div className="pmsc-container">
            <div className="pmsc-header">
                <h2 className="pmsc-title">Service Category Management</h2>
                <button className="pmsc-logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <button className="pmsc-add-button" onClick={handleAdd}>Add New Category</button>
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
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.description}</td>
                                <td>
                                    <button className="pmsc-edit-button" onClick={() => handleEdit(category)}>Edit</button>
                                    <button className="pmsc-delete-button" onClick={() => handleDelete(category.id)}>Delete</button>
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