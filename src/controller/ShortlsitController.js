import Shortlist from '../entity/Shortlist';

class SaveToShortlistController {
  async saveToShortlist(homeOwnerId, cleaner) {
    if (!homeOwnerId || !cleaner || !cleaner.id) {
      throw new Error("Homeowner ID and cleaner with valid ID are required.");
    }
    try {
      // Constructing new shortlist entry – including full name and service list
      const entry = new Shortlist(
        homeOwnerId,
        cleaner.id,
        `${cleaner.firstName} ${cleaner.lastName}`,
        cleaner.services || [] // same for services
      );

      const result = await entry.saveToShortlist();
      return !!result;
    } catch (err) {
      console.error("Failed to save cleaner to shortlist:", err);
      return false;
    }
  }
}

class GetHomeOwnerShortlistController {
  async getHomeOwnerShortlist(homeOwnerId) {
    if (!homeOwnerId) {
      throw new Error("Homeowner ID is required.");
    }
    try {
      const list = await Shortlist.getHomeOwnerShortlist(homeOwnerId);
      return list || [];
    } catch (e) {
      console.error("Error loading shortlist for homeowner:", e);
      return [];
    }
  }
}

class RemoveFromShortlistController {
  async removeFromShortlist(shortlistId) {
    if (!shortlistId) {
      throw new Error("Shortlist ID is required.");
    }
    try {
      const removed = await Shortlist.removeFromShortlist(shortlistId);
      return !!removed;
    } catch (e) {
      console.warn("Could not remove from shortlist:", e);
      return false;
    }
  }
}

class SearchCleanersController {
  async searchCleaners(searchTerm) {
    if (!searchTerm) {
      throw new Error("Search term is required.");
    }
    try {
      const results = await Shortlist.searchCleaners(searchTerm);
      return results || [];
    } catch (err) {
      console.log("Error searching cleaners:", err);
      return [];
    }
  }
}

export {
  SaveToShortlistController,
  GetHomeOwnerShortlistController,
  RemoveFromShortlistController,
  SearchCleanersController
};
