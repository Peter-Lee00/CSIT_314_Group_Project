import ServiceCategory from '../entity/ServiceCategory';

class PlatformManagerServiceCategoryController {
    // Add a new service category with validation and duplicate check
    async addCategory(name, description) {
        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error("Category name is required.");
        }
        if (name.length > 50) {
            throw new Error("Category name must be 50 characters or less.");
        }
        if (description && description.length > 200) {
            throw new Error("Description must be 200 characters or less.");
        }

        // Business rule: No duplicate category names
        const existingCategories = await ServiceCategory.listCategories();
        if (existingCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            throw new Error("A category with this name already exists.");
        }

        // Create and persist
        const category = new ServiceCategory(name, description);
        return await category.addCategory();
    }

    // Edit a service category with validation
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

        // Business rule: No duplicate name (if name is being changed)
        if (updateFields.name) {
            const existingCategories = await ServiceCategory.listCategories();
            if (existingCategories.some(cat => cat.name.toLowerCase() === updateFields.name.toLowerCase() && cat.id !== categoryId)) {
                throw new Error("A category with this name already exists.");
            }
        }

        return await ServiceCategory.editCategory(categoryId, updateFields);
    }

    // Delete a service category (could add business rules here if needed)
    async deleteCategory(categoryId) {
        if (!categoryId) {
            throw new Error("Category ID is required.");
        }
        // Example business rule: Prevent deletion of default category, etc.
        return await ServiceCategory.deleteCategory(categoryId);
    }

    // List all categories (could add filtering, sorting, etc.)
    async listCategories() {
        return await ServiceCategory.listCategories();
    }

    // Get a single category by ID (for view details)
    async getCategoryById(categoryId) {
        if (!categoryId) {
            throw new Error("Category ID is required.");
        }
        return await ServiceCategory.getCategoryById(categoryId);
    }
}

export { PlatformManagerServiceCategoryController }; 