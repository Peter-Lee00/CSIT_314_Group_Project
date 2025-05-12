import Report from '../entity/Report';

class PlatformManagerReportController {
  async generateReport(period) {
    return await Report.generateReport(period);
  }
}
export { PlatformManagerReportController }; 