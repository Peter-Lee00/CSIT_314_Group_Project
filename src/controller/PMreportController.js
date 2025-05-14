import Report from '../entity/Report';

function getTotalFromHistory(historyObj, fallback) {
  if (!historyObj) return fallback || 0;
  return Object.values(historyObj).reduce((a, b) => a + b, 0);
}

function getWeeklySum(historyMap) {
  if (!historyMap) return 0;
  const today = new Date();
  const pad = n => n < 10 ? '0' + n : n;
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    sum += historyMap[key] || 0;
  }
  return sum;
}

function getSumForPeriod(historyMap, period) {
  if (!historyMap) return 0;
  const today = new Date();
  const pad = n => n < 10 ? '0' + n : n;
  const localDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const localMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  if (period === 'daily') {
    return historyMap[localDate] || 0;
  } else if (period === 'monthly') {
    return historyMap[localMonth] || 0;
  }
  return 0;
}

async function aggregateReport(period) {
  const categories = await Report.getAllCategories();
  const services = await Report.getAllServices();
  const requests = await Report.getAllRequests();

  const today = new Date();
  const pad = n => n < 10 ? '0' + n : n;
  const localDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const localMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);

  const categoryRows = categories.map(category => {
    const servicesInCategory = services.filter(s => s.serviceType === category.name);
    const serviceIds = servicesInCategory.map(s => s.id);
    let totalViews = 0;
    let totalShortlists = 0;
    if (period === 'weekly') {
      totalViews = servicesInCategory.reduce((sum, s) => sum + getWeeklySum(s.view_history_daily), 0);
      totalShortlists = servicesInCategory.reduce((sum, s) => sum + getWeeklySum(s.shortlist_history_daily), 0);
    } else {
      totalViews = servicesInCategory.reduce((sum, s) => {
        if (period === 'daily') {
          return sum + getSumForPeriod(s.view_history_daily, period);
        } else if (period === 'monthly') {
          return sum + getSumForPeriod(s.view_history, period);
        } else {
          return sum + getSumForPeriod(s.view_history, period);
        }
      }, 0);
      totalShortlists = servicesInCategory.reduce((sum, s) => {
        if (period === 'daily') {
          return sum + getSumForPeriod(s.shortlist_history_daily, period);
        } else if (period === 'monthly') {
          return sum + getSumForPeriod(s.shortlist_history, period);
        } else {
          return sum + getSumForPeriod(s.shortlist_history, period);
        }
      }, 0);
    }
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

class GenerateDailyReportController {
  async generateReport() {
    return await aggregateReport('daily');
  }
}

class GenerateWeeklyReportController {
  async generateReport() {
    return await aggregateReport('weekly');
  }
}

class GenerateMonthlyReportController {
  async generateReport() {
    return await aggregateReport('monthly');
  }
}

export {
  GenerateDailyReportController,
  GenerateWeeklyReportController,
  GenerateMonthlyReportController
}; 