export type UserRole = 'merchant' | 'operations' | 'finance' | 'property' | 'executive';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  avatar: string;
}

export interface Brand {
  id: string;
  name: string;
  type: string;
  contactName: string;
  contactPhone: string;
  description: string;
  logo: string;
}

export interface Floor {
  number: number;
  name: string;
  positioning: string;
  totalArea: number;
}

export interface Zone {
  id: string;
  floorNumber: number;
  name: string;
  maxCapacity: number;
}

export interface Shop {
  id: string;
  shopNumber: string;
  zoneId: string;
  area: number;
  status: 'vacant' | 'occupied' | 'under_renovation';
  brandId: string | null;
  brandName?: string;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface Application {
  id: string;
  brandId: string;
  brandName: string;
  brandType: string;
  contactName: string;
  contactPhone: string;
  requiredArea: number;
  preferredFloor: number | null;
  status: ApplicationStatus;
  reviewerId: string | null;
  reviewerName: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  submittedAt: string;
}

export type RentMode = 'fixed' | 'percentage' | 'mixed';
export type ContractStatus = 'draft' | 'signed' | 'terminated';

export interface Contract {
  id: string;
  applicationId: string;
  shopId: string;
  shopNumber: string;
  brandName: string;
  rentMode: RentMode;
  rentFreeMonths: number;
  fixedRentAmount: number;
  percentageRate: number;
  contractTermMonths: number;
  startDate: string;
  endDate: string;
  signedAt: string | null;
  status: ContractStatus;
  createdAt: string;
}

export type ActivityStatus = 'draft' | 'approved' | 'active' | 'completed';

export interface Activity {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  recommendedBudget: number;
  actualBudget: number | null;
  status: ActivityStatus;
  creatorId: string;
  creatorName: string;
  participants: ActivityParticipant[];
  recommendedBrands: string[];
  createdAt: string;
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  shopId: string;
  shopName: string;
  isRecommended: boolean;
  joinedAt: string | null;
}

export interface SalesRank {
  shopId: string;
  shopName: string;
  baselineSales: number;
  activitySales: number;
  increment: number;
  incrementRate: number;
}

export type BillStatus = 'unpaid' | 'paid' | 'overdue' | 'locked';

export interface RentBill {
  id: string;
  shopId: string;
  shopName: string;
  billMonth: string;
  rentType: 'fixed' | 'percentage';
  baseRent: number;
  salesAmount: number | null;
  percentageRent: number | null;
  totalAmount: number;
  dueDate: string;
  paidAt: string | null;
  overdueDays: number;
  lateFee: number;
  status: BillStatus;
  accessLocked: boolean;
  createdAt: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'rated';

export interface RepairTicket {
  id: string;
  shopId: string;
  shopName: string;
  faultType: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  workerId: string | null;
  workerName: string | null;
  rating: number | null;
  reviewComment: string | null;
  createdAt: string;
  assignedAt: string | null;
  completedAt: string | null;
  ratedAt: string | null;
}

export interface Worker {
  id: string;
  name: string;
  skill: string;
  phone: string;
  currentZoneId: string | null;
  currentZoneName: string | null;
  status: 'available' | 'busy' | 'offline';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  level: string;
  totalPoints: number;
  availablePoints: number;
}

export interface ExecutiveData {
  overallEfficiency: number;
  overallConversion: number;
  overallChurn: number;
  totalMonthlyRent: number;
  efficiencyTrend: number;
  conversionTrend: number;
  churnTrend: number;
}

export interface FloorComparison {
  floorId: string;
  floorNumber: number;
  floorName: string;
  shopCount: number;
  area: number;
  efficiency: number;
  conversion: number;
  churn: number;
  rentPerShop: number;
  rentAdjustment: number;
  efficiencyTrend: number;
  conversionTrend: number;
  churnTrend: number;
}

export interface OperationReport {
  id: string;
  reportMonth: string;
  status: 'draft' | 'generated' | 'pushed';
  collectionRate: number;
  totalPassengers: number;
  passengerGrowth: number;
  activityROI: number;
  totalSales: number;
  generatedAt: string;
  pushedAt: string | null;
  pushCount: number;
  floorBreakdown: {
    floor: number;
    floorName: string;
    collectionRate: number;
    passengers: number;
    sales: number;
    efficiency: number;
  }[];
}

export interface PassengerFlow {
  currentTotal: number;
  dailyTotal: number;
  avgDensity: number;
  hourlyTrend: { hour: string; count: number }[];
}

export interface ZoneFlow {
  zoneId: string;
  zoneName: string;
  floorName: string;
  currentCount: number;
  density: number;
  status: 'normal' | 'warning';
}

export interface SystemMessage {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  recipients: string[];
  hasVoucher: boolean;
  data?: Record<string, any>;
}

export type WorkTicketStatus = 'pending' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkTicket {
  id: string;
  shopId: string;
  shopName: string;
  faultType: string;
  description: string;
  priority: 'normal' | 'high';
  status: WorkTicketStatus;
  location: string;
  workerId: string | null;
  rating: number | null;
  review: string | null;
  images?: string[];
  createdAt: string;
  dispatchedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface RepairWorker {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  status: 'online' | 'offline' | 'busy';
  currentLocation: string;
  distance: number;
  rating: number;
  totalOrders: number;
}

export interface GiftItem {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  value: number;
  stock: number;
  image: string;
}

export interface PointsRecord {
  id: string;
  customerId: string;
  type: 'earn' | 'exchange' | 'parking';
  points: number;
  giftId?: string;
  description?: string;
  createdAt: string;
}

export type PointsTransactionType = 'earn' | 'redeem' | 'parking';

export interface PointsTransaction {
  id: string;
  customerId: string;
  type: PointsTransactionType;
  amount: number;
  reference: string;
  createdAt: string;
}

export interface Gift {
  id: string;
  name: string;
  pointsRequired: number;
  stock: number;
  image: string;
  description: string;
}

export interface Message {
  id: string;
  recipientId: string;
  recipientName: string;
  type: string;
  title: string;
  content: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PassengerDensity {
  zoneId: string;
  zoneName: string;
  floor: number;
  currentCount: number;
  maxCapacity: number;
  density: number;
  status: 'normal' | 'warning' | 'danger';
}

export interface ExecutiveMetrics {
  floorEfficiency: { floor: number; efficiency: number; floorName: string }[];
  conversionRate: { floor: number; rate: number; floorName: string }[];
  churnRate: { floor: number; rate: number; floorName: string }[];
}

export interface RentAdjustment {
  id: string;
  floor: number;
  zone: string;
  coefficient: number;
  effectiveDate: string;
  createdBy: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reportMonth: string;
  rentCollectionRate: number;
  totalPassenger: number;
  activityRoi: number;
  content: string;
  pushed: boolean;
  createdAt: string;
}

export interface LoginRequest {
  role: UserRole;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  todayPassenger: number;
  yesterdayPassenger: number;
  rentCollectionRate: number;
  monthRentTarget: number;
  monthRentCollected: number;
  pendingApplications: number;
  pendingTickets: number;
  activeActivities: number;
  overdueBills: number;
  recentMessages: Message[];
  todoList: { id: string; title: string; type: string; priority: string }[];
}
