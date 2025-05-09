import ServiceCategory from '../entity/ServiceCategory';

class ServiceCategoryController {
    async addCategory(name, description) {
        return await ServiceCategory.addCategory(name, description);
    }

    async editCategory(categoryId, updateFields) {
        return await ServiceCategory.editCategory(categoryId, updateFields);
    }

    async deleteCategory(categoryId) {
        return await ServiceCategory.deleteCategory(categoryId);
    }

    async listCategories() {
        return await ServiceCategory.listCategories();
    }
}

export default ServiceCategoryController; 