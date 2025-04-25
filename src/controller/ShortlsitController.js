import Shortlist from '../entity/Shortlist';

class ShortlistController {
  // Save a cleaner to a homeowner's shortlist
  async saveToShortlist(homeOwnerId, cleaner) {
    try {
      // Constructing new shortlist entry – including full name and service list
      const entry = new Shortlist(
        homeOwnerId,
        cleaner.id,
        `${cleaner.firstName} ${cleaner.lastName}`,
        cleaner.rating || 0,  // fallback to 0 if no rating
        cleaner.services || [] // same for services
      );

      const result = await entry.saveToShortlist();
      return result;
    } catch (err) {
      console.error("Failed to save cleaner to shortlist:", err);
      return false;
    }
  }

  // Get all shortlisted cleaners for a specific homeowner
  async getHomeOwnerShortlist(homeOwnerId) {
    try {
      const list = await Shortlist.getHomeOwnerShortlist(homeOwnerId);
      return list;
    } catch (e) {
      console.error("Error loading shortlist for homeowner:", e);
      return []; // return empty list instead of null/undefined
    }
  }

  // Remove a cleaner from shortlist using shortlist ID
  async removeFromShortlist(shortlistId) {
    try {
      const removed = await Shortlist.removeFromShortlist(shortlistId);
      return removed;
    } catch (e) {
      console.warn("Could not remove from shortlist:", e);
      return false;
    }
  }

  // Search functionality for finding cleaners (useful for autocomplete)
  async searchCleaners(searchTerm) {
    try {
      const results = await Shortlist.searchCleaners(searchTerm);
      return results;
    } catch (err) {
      console.log("Error searching cleaners:", err);
      return [];
    }
  }
}

export default ShortlistController;
