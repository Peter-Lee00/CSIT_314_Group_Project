import React, { useEffect, useState } from 'react';
import ServiceCategoryController from '../controller/ServiceCategoryController';
import Swal from 'sweetalert2';
import { UserLogoutController } from '../controller/UserAuthController';

const ServiceCategoryManagementUI = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const controller = new ServiceCategoryController();

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
        <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #ccc', position: 'relative' }}>
            <button onClick={handleLogout} style={{ position: 'absolute', top: 24, right: 24, padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }}>Logout</button>
            <h2>Manage Service Categories</h2>
            <button onClick={handleAdd} style={{ marginBottom: 16, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>+ Add Category</button>
            {loading ? <div>Loading...</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                            <th style={{ textAlign: 'left', padding: 8 }}>Description</th>
                            <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td style={{ padding: 8 }}>{cat.name}</td>
                                <td style={{ padding: 8 }}>{cat.description}</td>
                                <td style={{ padding: 8 }}>
                                    <button onClick={() => handleEdit(cat)} style={{ marginRight: 8, padding: '4px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4 }}>Edit</button>
                                    <button onClick={() => handleDelete(cat)} style={{ padding: '4px 12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4 }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ServiceCategoryManagementUI; 