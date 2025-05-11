import ServiceCategory from '../entity/ServiceCategory';

class PlatformManagerServiceCategoryController {
    async addCategory(name, description) {
        const category = new ServiceCategory(name, description);
        return await category.createCategory();
    }

    async editCategory(categoryId, updateFields) {
        return await ServiceCategory.updateCategory(categoryId, updateFields);
    }

    async deleteCategory(categoryId) {
        return await ServiceCategory.deleteCategory(categoryId);
    }

    async listCategories() {
        return await ServiceCategory.listCategories();
    }
}

export { PlatformManagerServiceCategoryController }; 