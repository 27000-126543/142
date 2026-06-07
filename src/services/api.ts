import type {
  LoginRequest, LoginResponse, User, DashboardStats,
  Application, Contract, Activity, SalesRank, RentBill,
  RepairTicket, Worker, Gift, Message, ExecutiveMetrics,
  RentAdjustment, Report, PassengerDensity,
  ExecutiveData, FloorComparison, GiftItem, Customer,
  PointsRecord, PassengerFlow, ZoneFlow, OperationReport,
  SystemMessage
} from '/shared/types';

const API_BASE = 'http://localhost:3002/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getApplications(status?: string): Promise<Application[]> {
    const url = status ? `/merchants/applications?status=${status}` : '/merchants/applications';
    return this.request<Application[]>(url);
  }

  async getApplication(id: string): Promise<Application> {
    return this.request<Application>(`/merchants/applications/${id}`);
  }

  async approveApplication(id: string, reviewNote?: string): Promise<Application> {
    return this.request<Application>(`/merchants/applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewNote }),
    });
  }

  async rejectApplication(id: string, reviewNote?: string): Promise<Application> {
    return this.request<Application>(`/merchants/applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reviewNote }),
    });
  }

  async getRecommendations(applicationId: string): Promise<any[]> {
    return this.request<any[]>(`/merchants/recommendations/${applicationId}`);
  }

  async getContracts(status?: string): Promise<Contract[]> {
    const url = status ? `/merchants/contracts?status=${status}` : '/merchants/contracts';
    return this.request<Contract[]>(url);
  }

  async createContract(data: any): Promise<Contract> {
    return this.request<Contract>('/merchants/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signContract(id: string): Promise<Contract> {
    return this.request<Contract>(`/merchants/contracts/${id}/sign`, {
      method: 'POST',
    });
  }

  async getActivities(status?: string): Promise<Activity[]> {
    const url = status ? `/operations/activities?status=${status}` : '/operations/activities';
    return this.request<Activity[]>(url);
  }

  async createActivity(data: any): Promise<Activity> {
    return this.request<Activity>('/operations/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveActivity(id: string): Promise<Activity> {
    return this.request<Activity>(`/operations/activities/${id}/approve`, {
      method: 'POST',
    });
  }

  async startActivity(id: string): Promise<Activity> {
    return this.request<Activity>(`/operations/activities/${id}/start`, {
      method: 'POST',
    });
  }

  async completeActivity(id: string): Promise<Activity> {
    return this.request<Activity>(`/operations/activities/${id}/complete`, {
      method: 'POST',
    });
  }

  async getSalesRanking(sortBy?: string): Promise<SalesRank[]> {
    const url = sortBy ? `/operations/sales/ranking?sortBy=${sortBy}` : '/operations/sales/ranking';
    return this.request<SalesRank[]>(url);
  }

  async getSalesTrend(days?: number): Promise<any[]> {
    const url = days ? `/operations/sales/trend?days=${days}` : '/operations/sales/trend';
    return this.request<any[]>(url);
  }

  async getBills(status?: string, month?: string): Promise<RentBill[]> {
    let url = '/finance/bills';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (month) params.append('month', month);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<RentBill[]>(url);
  }

  async payBill(id: string): Promise<RentBill> {
    return this.request<RentBill>(`/finance/bills/${id}/pay`, {
      method: 'POST',
    });
  }

  async lockBill(id: string): Promise<RentBill> {
    return this.request<RentBill>(`/finance/bills/${id}/lock`, {
      method: 'POST',
    });
  }

  async unlockBill(id: string): Promise<RentBill> {
    return this.request<RentBill>(`/finance/bills/${id}/unlock`, {
      method: 'POST',
    });
  }

  async applyLateFee(id: string): Promise<RentBill> {
    return this.request<RentBill>(`/finance/bills/${id}/apply-late-fee`, {
      method: 'POST',
    });
  }

  async getFinanceStats(month?: string): Promise<any> {
    const url = month ? `/finance/statistics?month=${month}` : '/finance/statistics';
    return this.request<any>(url);
  }

  async getTickets(status?: string, priority?: string): Promise<RepairTicket[]> {
    let url = '/property/tickets';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<RepairTicket[]>(url);
  }

  async getTicket(id: string): Promise<RepairTicket> {
    return this.request<RepairTicket>(`/property/tickets/${id}`);
  }

  async createTicket(data: any): Promise<RepairTicket> {
    return this.request<RepairTicket>('/property/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkers(skill?: string, status?: string): Promise<Worker[]> {
    let url = '/property/workers';
    const params = new URLSearchParams();
    if (skill) params.append('skill', skill);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<Worker[]>(url);
  }

  async getRecommendedWorker(ticketId: string): Promise<Worker[]> {
    return this.request<Worker[]>(`/property/recommend-worker/${ticketId}`);
  }

  async dispatchTicket(id: string, workerId: string): Promise<RepairTicket> {
    return this.request<RepairTicket>(`/property/tickets/${id}/dispatch`, {
      method: 'POST',
      body: JSON.stringify({ workerId }),
    });
  }

  async startTicket(id: string): Promise<RepairTicket> {
    return this.request<RepairTicket>(`/property/tickets/${id}/start`, {
      method: 'POST',
    });
  }

  async completeTicket(id: string): Promise<RepairTicket> {
    return this.request<RepairTicket>(`/property/tickets/${id}/complete`, {
      method: 'POST',
    });
  }

  async rateTicket(id: string, rating: number, reviewComment?: string): Promise<RepairTicket> {
    return this.request<RepairTicket>(`/property/tickets/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, reviewComment }),
    });
  }

  async getExecutiveMetrics(): Promise<ExecutiveMetrics> {
    return this.request<ExecutiveMetrics>('/executive/metrics');
  }

  async getHeatmap(type?: string): Promise<any[]> {
    const url = type ? `/executive/heatmap?type=${type}` : '/executive/heatmap';
    return this.request<any[]>(url);
  }

  async getComparison(): Promise<any[]> {
    return this.request<any[]>('/executive/comparison');
  }

  async getRentAdjustments(): Promise<RentAdjustment[]> {
    return this.request<RentAdjustment[]>('/executive/rent-adjustments');
  }

  async createRentAdjustment(data: any): Promise<RentAdjustment> {
    return this.request<RentAdjustment>('/executive/rent-adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExecutiveOverview(): Promise<any> {
    return this.request<any>('/executive/overview');
  }

  async getPassengerDensity(floor?: number): Promise<PassengerDensity[]> {
    const url = floor !== undefined ? `/system/passenger/density?floor=${floor}` : '/system/passenger/density';
    return this.request<PassengerDensity[]>(url);
  }

  async getPassengerRealtime(hours?: number): Promise<any[]> {
    const url = hours !== undefined ? `/system/passenger/realtime?hours=${hours}` : '/system/passenger/realtime';
    return this.request<any[]>(url);
  }

  async checkPassengerThreshold(): Promise<any> {
    return this.request<any>('/system/passenger/check-threshold', {
      method: 'POST',
    });
  }

  async getExecutiveData(timeRange?: string): Promise<ExecutiveData> {
    const url = timeRange ? `/executive/data?timeRange=${timeRange}` : '/executive/data';
    return this.request<ExecutiveData>(url);
  }

  async getFloorComparison(metric?: string, timeRange?: string): Promise<FloorComparison[]> {
    let url = '/executive/floor-comparison';
    const params = new URLSearchParams();
    if (metric) params.append('metric', metric);
    if (timeRange) params.append('timeRange', timeRange);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<FloorComparison[]>(url);
  }

  async setRentAdjustment(adjustments: { floorId: string; adjustment: number; effectiveMonth: string }[]): Promise<any> {
    return this.request<any>('/executive/rent-adjustment', {
      method: 'POST',
      body: JSON.stringify({ adjustments }),
    });
  }

  async sendPaymentNotice(billId: string): Promise<any> {
    return this.request<any>(`/finance/bills/${billId}/send-notice`, {
      method: 'POST',
    });
  }

  async getGifts(): Promise<GiftItem[]> {
    return this.request<GiftItem[]>('/system/points/gifts');
  }

  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/system/points/customers');
  }

  async getPointsRecords(): Promise<PointsRecord[]> {
    return this.request<PointsRecord[]>('/system/points/records');
  }

  async exchangePoints(customerId: string, giftId: string): Promise<any> {
    return this.request<any>('/system/points/exchange', {
      method: 'POST',
      body: JSON.stringify({ customerId, giftId }),
    });
  }

  async deductParkingPoints(customerId: string, points: number): Promise<any> {
    return this.request<any>('/system/points/deduct-parking', {
      method: 'POST',
      body: JSON.stringify({ customerId, points }),
    });
  }

  async redeemGift(customerId: string, giftId: string): Promise<any> {
    return this.request<any>('/system/points/redeem', {
      method: 'POST',
      body: JSON.stringify({ customerId, giftId }),
    });
  }

  async redeemParking(customerId: string, hours: number): Promise<any> {
    return this.request<any>('/system/points/parking', {
      method: 'POST',
      body: JSON.stringify({ customerId, hours }),
    });
  }

  async getPassengerFlow(): Promise<PassengerFlow> {
    return this.request<PassengerFlow>('/system/passenger/flow');
  }

  async getZoneFlow(threshold?: number): Promise<ZoneFlow[]> {
    const url = threshold !== undefined ? `/system/passenger/zone-flow?threshold=${threshold}` : '/system/passenger/zone-flow';
    return this.request<ZoneFlow[]>(url);
  }

  async getMessages(isReadOrType?: boolean | string, typeOrStatus?: string): Promise<any> {
    let url = '/system/messages';
    const params = new URLSearchParams();
    
    if (typeof isReadOrType === 'boolean') {
      params.append('isRead', String(isReadOrType));
      if (typeOrStatus) params.append('type', typeOrStatus);
    } else {
      if (isReadOrType) params.append('type', isReadOrType);
      if (typeOrStatus) params.append('status', typeOrStatus);
    }
    
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<any>(url);
  }

  async markMessageRead(messageId: string): Promise<any> {
    return this.request<any>(`/system/messages/${messageId}/read`, {
      method: 'POST',
    });
  }

  async markAllMessagesRead(): Promise<any> {
    return this.request<any>('/system/messages/read-all', {
      method: 'POST',
    });
  }

  async downloadVoucher(messageId: string): Promise<any> {
    return this.request<any>(`/system/messages/${messageId}/download-voucher`, {
      method: 'POST',
    });
  }

  async deleteMessage(messageId: string): Promise<any> {
    return this.request<any>(`/system/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async getReports(month?: string): Promise<OperationReport[]> {
    const url = month ? `/system/reports?month=${month}` : '/system/reports';
    return this.request<OperationReport[]>(url);
  }

  async getReport(id: string): Promise<Report> {
    return this.request<Report>(`/system/reports/${id}`);
  }

  async generateReport(month: string): Promise<OperationReport> {
    return this.request<OperationReport>('/system/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ month }),
    });
  }

  async pushReport(reportId: string): Promise<any> {
    return this.request<any>(`/system/reports/${reportId}/push`, {
      method: 'POST',
    });
  }

  async downloadReport(reportId: string): Promise<any> {
    return this.request<any>(`/system/reports/${reportId}/download`, {
      method: 'POST',
    });
  }

  async autoDispatch(ticketId: string): Promise<any> {
    return this.request<any>(`/property/tickets/${ticketId}/auto-dispatch`, {
      method: 'POST',
    });
  }

  async getSystemStats(): Promise<any> {
    return this.request<any>('/system/stats/overview');
  }
}

export const api = new ApiService();
