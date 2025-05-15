import Report from '../entity/Report';
import ServiceCategory from '../entity/ServiceCategory';

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
  try {
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
      
      // Calculate total views
    let totalViews = 0;
    if (period === 'weekly') {
      totalViews = servicesInCategory.reduce((sum, s) => sum + getWeeklySum(s.view_history_daily), 0);
    } else {
      totalViews = servicesInCategory.reduce((sum, s) => {
        if (period === 'daily') {
          return sum + getSumForPeriod(s.view_history_daily, period);
        } else if (period === 'monthly') {
          return sum + getSumForPeriod(s.view_history, period);
        }
          return sum;
      }, 0);
      }

      // Calculate total shortlists
      let totalShortlists = 0;
      if (period === 'weekly') {
        totalShortlists = servicesInCategory.reduce((sum, s) => sum + getWeeklySum(s.shortlist_history_daily), 0);
      } else {
      totalShortlists = servicesInCategory.reduce((sum, s) => {
        if (period === 'daily') {
          return sum + getSumForPeriod(s.shortlist_history_daily, period);
        } else if (period === 'monthly') {
          return sum + getSumForPeriod(s.shortlist_history, period);
        }
          return sum;
      }, 0);
    }

      // Calculate total requests
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
        totalShortlists,
        conversionRate: totalViews > 0 ? (totalRequests / totalViews) * 100 : 0
    };
  });

  return {
      success: true,
      data: {
    period,
        generatedAt: new Date().toISOString(),
        categories: categoryRows,
        summary: {
          totalCategories: categories.length,
          totalServices: services.length,
          totalRequests: requests.length,
          totalViews: categoryRows.reduce((sum, row) => sum + row.totalViews, 0),
          totalShortlists: categoryRows.reduce((sum, row) => sum + row.totalShortlists, 0)
        }
      },
      message: `${period.charAt(0).toUpperCase() + period.slice(1)} report generated successfully`
    };
  } catch (error) {
    console.error(`Error generating ${period} report:`, error);
    return {
      success: false,
      data: null,
      message: error.message || `Failed to generate ${period} report`
    };
  }
}

async function aggregateReportWithDetails() {
  try {
    // Fetch all categories
    const categories = await ServiceCategory.listCategories();
    // For each category, fetch all services in that category
    const detailedCategories = await Promise.all(categories.map(async (category) => {
      const services = await ServiceCategory.getServicesByCategory(category.id);
      return {
        ...category,
        serviceCount: services.length,
        services: services // include all service details
      };
    }));
    return {
      success: true,
      data: {
        categories: detailedCategories,
        totalCategories: detailedCategories.length
      },
      message: 'Detailed report generated successfully.'
    };
  } catch (error) {
    console.error('Error generating detailed report:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to generate detailed report.'
    };
  }
}

class GenerateDailyReportController {
  async generateReport() {
    try {
      const report = await aggregateReport('daily');
      if (!report.success) {
        throw new Error(report.message);
      }
      return report;
    } catch (error) {
      console.error('Error in GenerateDailyReportController:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to generate daily report'
      };
    }
  }
}

class GenerateWeeklyReportController {
  async generateReport() {
    try {
      const report = await aggregateReport('weekly');
      if (!report.success) {
        throw new Error(report.message);
      }
      return report;
    } catch (error) {
      console.error('Error in GenerateWeeklyReportController:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to generate weekly report'
      };
    }
  }
}

class GenerateMonthlyReportController {
  async generateReport() {
    try {
      const report = await aggregateReport('monthly');
      if (!report.success) {
        throw new Error(report.message);
      }
      return report;
    } catch (error) {
      console.error('Error in GenerateMonthlyReportController:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to generate monthly report'
      };
    }
  }
}

class GenerateDetailedReportController {
  async generateReport() {
    return await aggregateReportWithDetails();
  }
}

export {
  GenerateDailyReportController,
  GenerateWeeklyReportController,
  GenerateMonthlyReportController,
  GenerateDetailedReportController
}; 