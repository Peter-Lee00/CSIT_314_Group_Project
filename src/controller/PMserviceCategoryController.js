import ServiceCategory from '../entity/ServiceCategory';

// Add Category
class AddCategoryController {
    async addCategory(name, description) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error("Category name is required.");
        }
        if (name.length > 50) {
            throw new Error("Category name must be 50 characters or less.");
        }
        if (description && description.length > 200) {
            throw new Error("Description must be 200 characters or less.");
        }
        const existingCategories = await ServiceCategory.listCategories();
        if (existingCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            throw new Error("A category with this name already exists.");
        }
        const category = new ServiceCategory(name, description);
        return await category.addCategory();
    }
}

// Edit Category
class EditCategoryController {
    async editCategory(categoryId, updateFields) {
        if (!categoryId) {
            throw new Error("Category ID is required.");
        }
        if (updateFields.name && updateFields.name.length > 50) {
            throw new Error("Category name must be 50 characters or less.");
        }
        if (updateFields.description && updateFields.description.length > 200) {
            throw new Error("Description must be 200 characters or less.");
        }
        if (updateFields.name) {
            const existingCategories = await ServiceCategory.listCategories();
            if (existingCategories.some(cat => cat.name.toLowerCase() === updateFields.name.toLowerCase() && cat.id !== categoryId)) {
                throw new Error("A category with this name already exists.");
            }
        }
        return await ServiceCategory.editCategory(categoryId, updateFields);
    }
}

// Delete Category
class DeleteCategoryController {
    async deleteCategory(categoryId) {
        try {
            if (!categoryId) {
                return {
                    success: false,
                    data: null,
                    message: "Category ID is required."
                };
            }

            // Check if category exists
            const category = await ServiceCategory.getCategoryById(categoryId);
            if (!category) {
                return {
                    success: false,
                    data: null,
                    message: "Category not found."
                };
            }

            // Check if category is in use
            const services = await ServiceCategory.getServicesByCategory(categoryId);
            if (services && services.length > 0) {
                return {
                    success: false,
                    data: null,
                    message: "Cannot delete category that is in use by services."
                };
        }

            const result = await ServiceCategory.deleteCategory(categoryId);
            return {
                success: true,
                data: {
                    deletedCategoryId: categoryId,
                    deletedAt: new Date().toISOString()
                },
                message: "Category deleted successfully."
            };
        } catch (error) {
            console.error('Error in DeleteCategoryController:', error);
            return {
                success: false,
                data: null,
                message: error.message || "Failed to delete category."
            };
        }
    }
}

// List Categories
class ListCategoriesController {
    async listCategories() {
        try {
            const categories = await ServiceCategory.listCategories();
            
            // Enrich categories with additional data
            const enrichedCategories = await Promise.all(categories.map(async (category) => {
                const services = await ServiceCategory.getServicesByCategory(category.id);
                return {
                    ...category,
                    serviceCount: services ? services.length : 0,
                    lastUpdated: category.updatedAt || category.createdAt || new Date().toISOString()
                };
            }));

            return {
                success: true,
                data: {
                    categories: enrichedCategories,
                    totalCount: enrichedCategories.length,
                    timestamp: new Date().toISOString()
                },
                message: "Categories retrieved successfully."
            };
        } catch (error) {
            console.error('Error in ListCategoriesController:', error);
            return {
                success: false,
                data: null,
                message: error.message || "Failed to retrieve categories."
            };
        }
    }
}

// Search Categories
class SearchCategoriesController {
    async searchCategories(searchTerm, filters = {}) {
        try {
            if (!searchTerm && Object.keys(filters).length === 0) {
                return {
                    success: false,
                    data: null,
                    message: "Search term or filters are required."
                };
            }

            const categories = await ServiceCategory.searchCategories(searchTerm);
            
            // Apply additional filters
            let filteredCategories = categories;
            if (filters.minServices) {
                filteredCategories = await Promise.all(
                    filteredCategories.filter(async (category) => {
                        const services = await ServiceCategory.getServicesByCategory(category.id);
                        return services && services.length >= filters.minServices;
                    })
                );
            }

            if (filters.activeOnly) {
                filteredCategories = filteredCategories.filter(category => category.isActive !== false);
            }

            // Enrich categories with service counts and lastUpdated
            const enrichedCategories = await Promise.all(filteredCategories.map(async (category) => {
                const services = await ServiceCategory.getServicesByCategory(category.id);
                return {
                    ...category,
                    serviceCount: services ? services.length : 0,
                    lastUpdated: category.updatedAt || category.createdAt || new Date().toISOString()
                };
            }));

            return {
                success: true,
                data: {
                    categories: enrichedCategories,
                    totalCount: enrichedCategories.length,
                    searchTerm,
                    filters,
                    timestamp: new Date().toISOString()
                },
                message: "Categories search completed successfully."
            };
        } catch (error) {
            console.error('Error in SearchCategoriesController:', error);
            return {
                success: false,
                data: null,
                message: error.message || "Failed to search categories."
            };
        }
    }
}

// Get Category by ID
class GetCategoryByIdController {
    async getCategoryById(categoryId) {
        try {
        if (!categoryId) {
                return {
                    success: false,
                    data: null,
                    message: "Category ID is required."
                };
        }

            const category = await ServiceCategory.getCategoryById(categoryId);
            if (!category) {
                return {
                    success: false,
                    data: null,
                    message: "Category not found."
                };
            }

            // Get services in this category
            const services = await ServiceCategory.getServicesByCategory(categoryId);
            
            // Enrich category with additional data
            const enrichedCategory = {
                ...category,
                services: services || [],
                serviceCount: services ? services.length : 0,
                lastUpdated: category.updatedAt || category.createdAt || new Date().toISOString()
            };

            return {
                success: true,
                data: enrichedCategory,
                message: "Category retrieved successfully."
            };
        } catch (error) {
            console.error('Error in GetCategoryByIdController:', error);
            return {
                success: false,
                data: null,
                message: error.message || "Failed to retrieve category."
            };
        }
    }
}

export {
    AddCategoryController,
    EditCategoryController,
    DeleteCategoryController,
    ListCategoriesController,
    SearchCategoriesController,
    GetCategoryByIdController
}; 