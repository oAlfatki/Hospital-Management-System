import axios from '../../../core/config/axios';
import type { DashboardResponse } from '../types/DashboardResponse';
export const dashboardApi = {
  async getSummary(): Promise<DashboardResponse> { return (await axios.get<DashboardResponse>('/api/dashboard')).data; },
};
