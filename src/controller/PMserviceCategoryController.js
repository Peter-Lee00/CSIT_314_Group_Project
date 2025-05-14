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
    async deleteCategory(category) {
        if (!category || !category.id) {
            throw new Error("Category ID is required.");
        }
        return await ServiceCategory.deleteCategory(category.id);
    }
}

// List Categories
class ListCategoriesController {
    async listCategories() {
        return await ServiceCategory.listCategories();
    }
}

// Search Categories
class SearchCategoriesController {
    async searchCategories(searchTerm) {
        return await ServiceCategory.searchCategories(searchTerm);
    }
}

// Get Category by ID
class GetCategoryByIdController {
    async getCategoryById(categoryId) {
        if (!categoryId) {
            throw new Error("Category ID is required.");
        }
        return await ServiceCategory.getCategoryById(categoryId);
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