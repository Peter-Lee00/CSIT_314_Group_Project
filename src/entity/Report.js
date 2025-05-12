import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function getSumForPeriod(historyMap, period, fallback) {
  if (!historyMap) return fallback || 0;
  const today = new Date();
  // Use local date string
  const pad = n => n < 10 ? '0' + n : n;
  const localDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const localMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  if (period === 'daily') {
    // console.log('Checking key:', localDate, 'in', historyMap);
    return historyMap[localDate] || fallback || 0;
  } else if (period === 'weekly') {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      // console.log('Checking key:', key, 'in', historyMap);
      sum += historyMap[key] || 0;
    }
    return sum || fallback || 0;
  } else if (period === 'monthly') {
    // console.log('Checking key:', localMonth, 'in', historyMap);
    return historyMap[localMonth] || fallback || 0;
  }
  return fallback || 0;
}

function getTotalFromHistory(historyObj, fallback) {
  if (!historyObj) return fallback || 0;
  return Object.values(historyObj).reduce((a, b) => a + b, 0);
}

class Report {
  static async generateReport(period) {
    // 1. Get all categories
    const categoriesSnap = await getDocs(collection(db, 'ServiceCategories'));
    const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Get all services
    const servicesSnap = await getDocs(collection(db, 'CleaningServices'));
    const services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Get all requests
    const requestsSnap = await getDocs(collection(db, 'CleaningServiceRequests'));
    const requests = requestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const today = new Date();
    const pad = n => n < 10 ? '0' + n : n;
    const localDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const localMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);

    // 4. For each category, aggregate the data using period-based logic
    const categoryRows = categories.map(category => {
      // Find all services in this category
      const servicesInCategory = services.filter(s => s.serviceType === category.name);
      const serviceIds = servicesInCategory.map(s => s.id);
      // Sum views for the period
      const totalViews = servicesInCategory.reduce((sum, s) => {
        if (period === 'daily' || period === 'weekly') {
          return sum + getTotalFromHistory(s.view_history_daily, s.view_count);
        } else if (period === 'monthly') {
          return sum + getTotalFromHistory(s.view_history, s.view_count);
        } else {
          // For 'all' or unknown, sum all history fields
          return sum + getTotalFromHistory(s.view_history, s.view_count);
        }
      }, 0);
      // Requests (period-based if createdAt exists)
      let totalRequests = 0;
      if (requests.length > 0 && requests[0].createdAt) {
        totalRequests = requests.filter(r => {
          if (!serviceIds.includes(r.serviceId)) return false;
          const created = new Date(r.createdAt);
          if (period === 'daily') {
            return created.toISOString().slice(0, 10) === localDate;
          } else if (period === 'weekly') {
            return created >= weekAgo && created <= today;
          } else if (period === 'monthly') {
            return created.toISOString().slice(0, 7) === localMonth;
          }
          return true;
        }).length;
      } else {
        totalRequests = requests.filter(r => serviceIds.includes(r.serviceId)).length;
      }
      // Sum shortlists for the period
      const totalShortlists = servicesInCategory.reduce((sum, s) => {
        if (period === 'daily' || period === 'weekly') {
          return sum + getTotalFromHistory(s.shortlist_history_daily, s.shortlist_count);
        } else if (period === 'monthly') {
          return sum + getTotalFromHistory(s.shortlist_history, s.shortlist_count);
        } else {
          return sum + getTotalFromHistory(s.shortlist_history, s.shortlist_count);
        }
      }, 0);
      return {
        categoryName: category.name,
        totalViews,
        totalRequests,
        totalShortlists
      };
    });

    return {
      period,
      categories: categoryRows
    };
  }

  // Utility: migrate old data to history fields
  static async migrateHistoryFields() {
    const servicesSnap = await getDocs(collection(db, 'CleaningServices'));
    const services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const today = new Date();
    const pad = n => n < 10 ? '0' + n : n;
    const localMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
    for (const s of services) {
      const updates = {};
      if (!s.view_history && s.view_count) {
        updates[`view_history.${localMonth}`] = s.view_count;
      }
      if (!s.shortlist_history && s.shortlist_count) {
        updates[`shortlist_history.${localMonth}`] = s.shortlist_count;
      }
      if (Object.keys(updates).length > 0) {
        const serviceRef = collection(db, 'CleaningServices').doc(s.id);
        try {
          await serviceRef.update(updates);
        } catch (e) {
          console.error('Failed to migrate service', s.id, e);
        }
      }
    }
    return true;
  }
}

export default Report; 