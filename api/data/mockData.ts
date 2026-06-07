import { v4 as uuidv4 } from 'uuid';
import {
  User, Brand, Floor, Zone, Shop, Application, Contract,
  Activity, RepairTicket, Worker, Customer, Gift, Message,
  RentBill, RentAdjustment, Report, SalesRank, PassengerDensity,
  ExecutiveMetrics, ActivityParticipant, OperationReport
} from '/shared/types';

export const users: User[] = [
  { id: 'u1', name: '张经理', role: 'merchant', username: 'merchant', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang' },
  { id: 'u2', name: '李主管', role: 'operations', username: 'operations', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li' },
  { id: 'u3', name: '王会计', role: 'finance', username: 'finance', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang' },
  { id: 'u4', name: '赵队长', role: 'property', username: 'property', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao' },
  { id: 'u5', name: '陈总', role: 'executive', username: 'executive', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen' },
];

export const brands: Brand[] = [
  { id: 'b1', name: '星巴克', type: '餐饮/咖啡', contactName: '周经理', contactPhone: '13800138001', description: '全球知名咖啡连锁品牌', logo: '☕' },
  { id: 'b2', name: '优衣库', type: '零售/服装', contactName: '吴店长', contactPhone: '13800138002', description: '日本快时尚服装品牌', logo: '👕' },
  { id: 'b3', name: '海底捞', type: '餐饮/火锅', contactName: '郑经理', contactPhone: '13800138003', description: '知名火锅连锁品牌', logo: '🍲' },
  { id: 'b4', name: '苹果专卖店', type: '零售/数码', contactName: '孙店长', contactPhone: '13800138004', description: 'Apple官方授权店', logo: '🍎' },
  { id: 'b5', name: '海底捞', type: '餐饮/火锅', contactName: '钱经理', contactPhone: '13800138005', description: '知名火锅连锁', logo: '🍲' },
  { id: 'b6', name: '屈臣氏', type: '零售/美妆', contactName: '刘店长', contactPhone: '13800138006', description: '个人护理用品连锁', logo: '💄' },
  { id: 'b7', name: '万达影城', type: '娱乐/影院', contactName: '陈经理', contactPhone: '13800138007', description: '五星级豪华影院', logo: '🎬' },
  { id: 'b8', name: 'H&M', type: '零售/服装', contactName: '杨店长', contactPhone: '13800138008', description: '瑞典快时尚品牌', logo: '👗' },
  { id: 'b9', name: '小米之家', type: '零售/数码', contactName: '黄店长', contactPhone: '13800138009', description: '小米官方体验店', logo: '📱' },
  { id: 'b10', name: '喜茶', type: '餐饮/茶饮', contactName: '林经理', contactPhone: '13800138010', description: '网红茶饮品牌', logo: '🧋' },
  { id: 'b11', name: '耐克', type: '零售/运动', contactName: '何店长', contactPhone: '13800138011', description: '国际运动品牌', logo: '👟' },
  { id: 'b12', name: '西西弗书店', type: '零售/文化', contactName: '罗店长', contactPhone: '13800138012', description: '连锁书店品牌', logo: '📚' },
  { id: 'b13', name: '哈根达斯', type: '餐饮/甜品', contactName: '谢经理', contactPhone: '13800138013', description: '高端冰淇淋品牌', logo: '🍦' },
  { id: 'b14', name: '无印良品', type: '零售/家居', contactName: '韩店长', contactPhone: '13800138014', description: '日本家居品牌', logo: '🏠' },
  { id: 'b15', name: '必胜客', type: '餐饮/西餐', contactName: '唐经理', contactPhone: '13800138015', description: '披萨连锁品牌', logo: '🍕' },
  { id: 'b16', name: '乐高', type: '零售/玩具', contactName: '冯店长', contactPhone: '13800138016', description: '丹麦积木品牌', logo: '🧱' },
  { id: 'b17', name: '兰蔻', type: '零售/美妆', contactName: '于店长', contactPhone: '13800138017', description: '法国高端化妆品', logo: '💋' },
  { id: 'b18', name: '外婆家', type: '餐饮/中餐', contactName: '董经理', contactPhone: '13800138018', description: '杭帮菜连锁', logo: '🥢' },
  { id: 'b19', name: 'ZARA', type: '零售/服装', contactName: '萧店长', contactPhone: '13800138019', description: '西班牙快时尚品牌', logo: '👔' },
  { id: 'b20', name: '阿迪达斯', type: '零售/运动', contactName: '程店长', contactPhone: '13800138020', description: '德国运动品牌', logo: '⚽' },
];

export const floors: Floor[] = [
  { number: 1, name: 'L1 精品层', positioning: '国际精品、化妆品、珠宝首饰', totalArea: 5000 },
  { number: 2, name: 'L2 时尚层', positioning: '时尚服装、鞋履箱包', totalArea: 5000 },
  { number: 3, name: 'L3 休闲层', positioning: '运动休闲、家居生活', totalArea: 5000 },
  { number: 4, name: 'L4 餐饮层', positioning: '主题餐饮、美食广场', totalArea: 5000 },
  { number: 5, name: 'L5 娱乐层', positioning: '影院、KTV、儿童乐园', totalArea: 5000 },
  { number: -1, name: 'B1 生活层', positioning: '超市、生活服务', totalArea: 5000 },
];

export const zones: Zone[] = [
  { id: 'z1', floorNumber: 1, name: 'A区', maxCapacity: 300 },
  { id: 'z2', floorNumber: 1, name: 'B区', maxCapacity: 250 },
  { id: 'z3', floorNumber: 1, name: 'C区', maxCapacity: 200 },
  { id: 'z4', floorNumber: 2, name: 'A区', maxCapacity: 300 },
  { id: 'z5', floorNumber: 2, name: 'B区', maxCapacity: 250 },
  { id: 'z6', floorNumber: 2, name: 'C区', maxCapacity: 200 },
  { id: 'z7', floorNumber: 3, name: 'A区', maxCapacity: 300 },
  { id: 'z8', floorNumber: 3, name: 'B区', maxCapacity: 250 },
  { id: 'z9', floorNumber: 3, name: 'C区', maxCapacity: 200 },
  { id: 'z10', floorNumber: 4, name: 'A区', maxCapacity: 350 },
  { id: 'z11', floorNumber: 4, name: 'B区', maxCapacity: 300 },
  { id: 'z12', floorNumber: 4, name: 'C区', maxCapacity: 250 },
  { id: 'z13', floorNumber: 5, name: 'A区', maxCapacity: 400 },
  { id: 'z14', floorNumber: 5, name: 'B区', maxCapacity: 300 },
  { id: 'z15', floorNumber: -1, name: 'A区', maxCapacity: 400 },
  { id: 'z16', floorNumber: -1, name: 'B区', maxCapacity: 350 },
];

export const shops: Shop[] = [
  { id: 's1', shopNumber: 'L1-A01', zoneId: 'z1', area: 150, status: 'occupied', brandId: 'b4', brandName: '苹果专卖店' },
  { id: 's2', shopNumber: 'L1-A02', zoneId: 'z1', area: 80, status: 'occupied', brandId: 'b17', brandName: '兰蔻' },
  { id: 's3', shopNumber: 'L1-B01', zoneId: 'z2', area: 100, status: 'occupied', brandId: 'b6', brandName: '屈臣氏' },
  { id: 's4', shopNumber: 'L1-B02', zoneId: 'z2', area: 120, status: 'vacant', brandId: null },
  { id: 's5', shopNumber: 'L1-C01', zoneId: 'z3', area: 90, status: 'vacant', brandId: null },
  { id: 's6', shopNumber: 'L2-A01', zoneId: 'z4', area: 300, status: 'occupied', brandId: 'b2', brandName: '优衣库' },
  { id: 's7', shopNumber: 'L2-A02', zoneId: 'z4', area: 250, status: 'occupied', brandId: 'b8', brandName: 'H&M' },
  { id: 's8', shopNumber: 'L2-B01', zoneId: 'z5', area: 200, status: 'occupied', brandId: 'b19', brandName: 'ZARA' },
  { id: 's9', shopNumber: 'L2-B02', zoneId: 'z5', area: 180, status: 'vacant', brandId: null },
  { id: 's10', shopNumber: 'L3-A01', zoneId: 'z7', area: 200, status: 'occupied', brandId: 'b11', brandName: '耐克' },
  { id: 's11', shopNumber: 'L3-A02', zoneId: 'z7', area: 200, status: 'occupied', brandId: 'b20', brandName: '阿迪达斯' },
  { id: 's12', shopNumber: 'L3-B01', zoneId: 'z8', area: 150, status: 'occupied', brandId: 'b14', brandName: '无印良品' },
  { id: 's13', shopNumber: 'L3-C01', zoneId: 'z9', area: 250, status: 'occupied', brandId: 'b12', brandName: '西西弗书店' },
  { id: 's14', shopNumber: 'L4-A01', zoneId: 'z10', area: 350, status: 'occupied', brandId: 'b3', brandName: '海底捞' },
  { id: 's15', shopNumber: 'L4-A02', zoneId: 'z10', area: 300, status: 'occupied', brandId: 'b18', brandName: '外婆家' },
  { id: 's16', shopNumber: 'L4-B01', zoneId: 'z11', area: 200, status: 'occupied', brandId: 'b15', brandName: '必胜客' },
  { id: 's17', shopNumber: 'L4-B02', zoneId: 'z11', area: 80, status: 'occupied', brandId: 'b1', brandName: '星巴克' },
  { id: 's18', shopNumber: 'L4-C01', zoneId: 'z12', area: 60, status: 'occupied', brandId: 'b10', brandName: '喜茶' },
  { id: 's19', shopNumber: 'L4-C02', zoneId: 'z12', area: 60, status: 'occupied', brandId: 'b13', brandName: '哈根达斯' },
  { id: 's20', shopNumber: 'L5-A01', zoneId: 'z13', area: 800, status: 'occupied', brandId: 'b7', brandName: '万达影城' },
  { id: 's21', shopNumber: 'L5-B01', zoneId: 'z14', area: 300, status: 'occupied', brandId: 'b16', brandName: '乐高' },
  { id: 's22', shopNumber: 'B1-A01', zoneId: 'z15', area: 150, status: 'occupied', brandId: 'b9', brandName: '小米之家' },
  { id: 's23', shopNumber: 'B1-A02', zoneId: 'z15', area: 500, status: 'occupied', brandId: null, brandName: '永辉超市' },
  { id: 's24', shopNumber: 'B1-B01', zoneId: 'z16', area: 100, status: 'vacant', brandId: null },
  { id: 's25', shopNumber: 'L1-C02', zoneId: 'z3', area: 85, status: 'under_renovation', brandId: null },
  { id: 's26', shopNumber: 'L2-C01', zoneId: 'z6', area: 120, status: 'vacant', brandId: null },
  { id: 's27', shopNumber: 'L3-C02', zoneId: 'z9', area: 95, status: 'vacant', brandId: null },
  { id: 's28', shopNumber: 'L4-C03', zoneId: 'z12', area: 70, status: 'vacant', brandId: null },
];

export const applications: Application[] = [
  {
    id: 'a1', brandId: 'b1', brandName: '星巴克', brandType: '餐饮/咖啡',
    contactName: '周经理', contactPhone: '13800138001', requiredArea: 80,
    preferredFloor: 1, status: 'pending', reviewerId: null, reviewerName: null,
    reviewNote: null, reviewedAt: null, submittedAt: '2024-06-01T10:00:00Z'
  },
  {
    id: 'a2', brandId: 'b10', brandName: '喜茶', brandType: '餐饮/茶饮',
    contactName: '林经理', contactPhone: '13800138010', requiredArea: 60,
    preferredFloor: 1, status: 'reviewing', reviewerId: 'u1', reviewerName: '张经理',
    reviewNote: '位置很好，客流大', reviewedAt: '2024-06-02T14:30:00Z', submittedAt: '2024-05-28T09:00:00Z'
  },
  {
    id: 'a3', brandId: 'b11', brandName: '耐克', brandType: '零售/运动',
    contactName: '何店长', contactPhone: '13800138011', requiredArea: 250,
    preferredFloor: 2, status: 'approved', reviewerId: 'u1', reviewerName: '张经理',
    reviewNote: '符合L3运动主题定位', reviewedAt: '2024-05-20T11:00:00Z', submittedAt: '2024-05-15T16:00:00Z'
  },
  {
    id: 'a4', brandId: 'b16', brandName: '乐高', brandType: '零售/玩具',
    contactName: '冯店长', contactPhone: '13800138016', requiredArea: 200,
    preferredFloor: 5, status: 'rejected', reviewerId: 'u1', reviewerName: '张经理',
    reviewNote: 'L5已有类似品牌，业态重复', reviewedAt: '2024-05-10T10:00:00Z', submittedAt: '2024-05-05T14:00:00Z'
  },
  {
    id: 'a5', brandId: 'b17', brandName: '兰蔻', brandType: '零售/美妆',
    contactName: '于店长', contactPhone: '13800138017', requiredArea: 100,
    preferredFloor: 1, status: 'pending', reviewerId: null, reviewerName: null,
    reviewNote: null, reviewedAt: null, submittedAt: '2024-06-03T08:30:00Z'
  },
  {
    id: 'a6', brandId: 'b18', brandName: '外婆家', brandType: '餐饮/中餐',
    contactName: '董经理', contactPhone: '13800138018', requiredArea: 400,
    preferredFloor: 4, status: 'approved', reviewerId: 'u1', reviewerName: '张经理',
    reviewNote: 'L4餐饮层核心位置', reviewedAt: '2024-04-25T15:00:00Z', submittedAt: '2024-04-20T10:00:00Z'
  },
];

export const contracts: Contract[] = [
  {
    id: 'c1', applicationId: 'a3', shopId: 's10', shopNumber: 'L3-A01',
    brandName: '耐克', rentMode: 'mixed', rentFreeMonths: 3,
    fixedRentAmount: 80000, percentageRate: 8, contractTermMonths: 36,
    startDate: '2024-06-01', endDate: '2027-05-31',
    signedAt: '2024-05-25T10:00:00Z', status: 'signed', createdAt: '2024-05-20T10:00:00Z'
  },
  {
    id: 'c2', applicationId: 'a6', shopId: 's15', shopNumber: 'L4-A02',
    brandName: '外婆家', rentMode: 'percentage', rentFreeMonths: 2,
    fixedRentAmount: 0, percentageRate: 12, contractTermMonths: 24,
    startDate: '2024-05-01', endDate: '2026-04-30',
    signedAt: '2024-04-28T14:00:00Z', status: 'signed', createdAt: '2024-04-26T10:00:00Z'
  },
  {
    id: 'c3', applicationId: 'a2', shopId: 's18', shopNumber: 'L4-C01',
    brandName: '喜茶', rentMode: 'fixed', rentFreeMonths: 1,
    fixedRentAmount: 35000, percentageRate: 0, contractTermMonths: 24,
    startDate: '2024-06-15', endDate: '2026-06-14',
    signedAt: null, status: 'draft', createdAt: '2024-06-02T15:00:00Z'
  },
];

const participants1: ActivityParticipant[] = [
  { id: 'p1', activityId: 'act1', shopId: 's1', shopName: '苹果专卖店', isRecommended: true, joinedAt: '2024-05-20T10:00:00Z' },
  { id: 'p2', activityId: 'act1', shopId: 's6', shopName: '优衣库', isRecommended: true, joinedAt: '2024-05-20T11:00:00Z' },
  { id: 'p3', activityId: 'act1', shopId: 's14', shopName: '海底捞', isRecommended: true, joinedAt: '2024-05-20T12:00:00Z' },
  { id: 'p4', activityId: 'act1', shopId: 's20', shopName: '万达影城', isRecommended: true, joinedAt: '2024-05-21T09:00:00Z' },
];

const participants2: ActivityParticipant[] = [
  { id: 'p5', activityId: 'act2', shopId: 's8', shopName: 'ZARA', isRecommended: true, joinedAt: '2024-05-25T10:00:00Z' },
  { id: 'p6', activityId: 'act2', shopId: 's7', shopName: 'H&M', isRecommended: true, joinedAt: '2024-05-25T11:00:00Z' },
];

export const activities: Activity[] = [
  {
    id: 'act1', name: '618年中大促', type: '节日促销',
    startDate: '2024-06-15', endDate: '2024-06-20',
    recommendedBudget: 500000, actualBudget: 480000,
    status: 'active', creatorId: 'u2', creatorName: '李主管',
    participants: participants1,
    recommendedBrands: ['苹果专卖店', '优衣库', '海底捞', '万达影城', '星巴克', '小米之家'],
    createdAt: '2024-05-18T10:00:00Z'
  },
  {
    id: 'act2', name: '夏季新品发布会', type: '新品推广',
    startDate: '2024-07-01', endDate: '2024-07-07',
    recommendedBudget: 300000, actualBudget: null,
    status: 'approved', creatorId: 'u2', creatorName: '李主管',
    participants: participants2,
    recommendedBrands: ['ZARA', 'H&M', '优衣库', '耐克', '阿迪达斯'],
    createdAt: '2024-06-01T14:00:00Z'
  },
  {
    id: 'act3', name: '母亲节特别活动', type: '节日促销',
    startDate: '2024-05-08', endDate: '2024-05-12',
    recommendedBudget: 200000, actualBudget: 180000,
    status: 'completed', creatorId: 'u2', creatorName: '李主管',
    participants: [],
    recommendedBrands: [],
    createdAt: '2024-04-25T10:00:00Z'
  },
  {
    id: 'act4', name: '店庆十周年', type: '店庆活动',
    startDate: '2024-08-01', endDate: '2024-08-10',
    recommendedBudget: 800000, actualBudget: null,
    status: 'draft', creatorId: 'u2', creatorName: '李主管',
    participants: [],
    recommendedBrands: ['全品牌参与'],
    createdAt: '2024-06-05T09:00:00Z'
  },
];

export const salesRanks: SalesRank[] = [
  { shopId: 's14', shopName: '海底捞', baselineSales: 580000, activitySales: 980000, increment: 400000, incrementRate: 68.97 },
  { shopId: 's1', shopName: '苹果专卖店', baselineSales: 1200000, activitySales: 1850000, increment: 650000, incrementRate: 54.17 },
  { shopId: 's6', shopName: '优衣库', baselineSales: 450000, activitySales: 680000, increment: 230000, incrementRate: 51.11 },
  { shopId: 's20', shopName: '万达影城', baselineSales: 320000, activitySales: 480000, increment: 160000, incrementRate: 50.00 },
  { shopId: 's10', shopName: '耐克', baselineSales: 380000, activitySales: 550000, increment: 170000, incrementRate: 44.74 },
  { shopId: 's8', shopName: 'ZARA', baselineSales: 420000, activitySales: 590000, increment: 170000, incrementRate: 40.48 },
  { shopId: 's18', shopName: '喜茶', baselineSales: 150000, activitySales: 210000, increment: 60000, incrementRate: 40.00 },
  { shopId: 's7', shopName: 'H&M', baselineSales: 350000, activitySales: 480000, increment: 130000, incrementRate: 37.14 },
  { shopId: 's15', shopName: '外婆家', baselineSales: 280000, activitySales: 380000, increment: 100000, incrementRate: 35.71 },
  { shopId: 's17', shopName: '星巴克', baselineSales: 180000, activitySales: 240000, increment: 60000, incrementRate: 33.33 },
];

export const rentBills: RentBill[] = [
  { id: 'rb1', shopId: 's1', shopName: '苹果专卖店', billMonth: '2024-05', rentType: 'fixed', baseRent: 150000, salesAmount: null, percentageRent: null, totalAmount: 150000, dueDate: '2024-05-15', paidAt: '2024-05-12T10:00:00Z', overdueDays: 0, lateFee: 0, status: 'paid', accessLocked: false, createdAt: '2024-05-01T00:00:00Z' },
  { id: 'rb2', shopId: 's6', shopName: '优衣库', billMonth: '2024-05', rentType: 'percentage', baseRent: 80000, salesAmount: 2500000, percentageRent: 200000, totalAmount: 200000, dueDate: '2024-05-15', paidAt: '2024-05-14T14:00:00Z', overdueDays: 0, lateFee: 0, status: 'paid', accessLocked: false, createdAt: '2024-05-01T00:00:00Z' },
  { id: 'rb3', shopId: 's14', shopName: '海底捞', billMonth: '2024-05', rentType: 'fixed', baseRent: 100000, salesAmount: 3200000, percentageRent: 192000, totalAmount: 192000, dueDate: '2024-05-15', paidAt: null, overdueDays: 25, lateFee: 0, status: 'unpaid', accessLocked: false, createdAt: '2024-05-01T00:00:00Z' },
  { id: 'rb4', shopId: 's20', shopName: '万达影城', billMonth: '2024-05', rentType: 'fixed', baseRent: 250000, salesAmount: null, percentageRent: null, totalAmount: 250000, dueDate: '2024-05-15', paidAt: null, overdueDays: 35, lateFee: 8750, status: 'overdue', accessLocked: true, createdAt: '2024-05-01T00:00:00Z' },
  { id: 'rb5', shopId: 's7', shopName: 'H&M', billMonth: '2024-05', rentType: 'fixed', baseRent: 95000, salesAmount: null, percentageRent: null, totalAmount: 95000, dueDate: '2024-05-15', paidAt: '2024-05-13T09:00:00Z', overdueDays: 0, lateFee: 0, status: 'paid', accessLocked: false, createdAt: '2024-05-01T00:00:00Z' },
  { id: 'rb6', shopId: 's8', shopName: 'ZARA', billMonth: '2024-05', rentType: 'percentage', baseRent: 75000, salesAmount: 1800000, percentageRent: 144000, totalAmount: 144000, dueDate: '2024-05-15', paidAt: null, overdueDays: 15, lateFee: 0, status: 'unpaid', accessLocked: false, createdAt: '2024-05-01T00:00:00Z' },
  { id: 'rb7', shopId: 's10', shopName: '耐克', billMonth: '2024-05', rentType: 'fixed', baseRent: 80000, salesAmount: 1500000, percentageRent: 120000, totalAmount: 120000, dueDate: '2024-05-15', paidAt: '2024-05-11T16:00:00Z', overdueDays: 0, lateFee: 0, status: 'paid', accessLocked: false, createdAt: '2024-05-01T00:00:00Z' },
  { id: 'rb8', shopId: 's15', shopName: '外婆家', billMonth: '2024-05', rentType: 'percentage', baseRent: 60000, salesAmount: 1200000, percentageRent: 144000, totalAmount: 144000, dueDate: '2024-05-15', paidAt: null, overdueDays: 45, lateFee: 19440, status: 'locked', accessLocked: true, createdAt: '2024-05-01T00:00:00Z' },
];

export const workers: Worker[] = [
  { id: 'w1', name: '张师傅', skill: '水电', phone: '13900139001', currentZoneId: 'z10', currentZoneName: 'L4-A区', status: 'available' },
  { id: 'w2', name: '李师傅', skill: '空调', phone: '13900139002', currentZoneId: 'z4', currentZoneName: 'L2-A区', status: 'busy' },
  { id: 'w3', name: '王师傅', skill: '木工', phone: '13900139003', currentZoneId: 'z7', currentZoneName: 'L3-A区', status: 'available' },
  { id: 'w4', name: '赵师傅', skill: '瓦工', phone: '13900139004', currentZoneId: 'z1', currentZoneName: 'L1-A区', status: 'offline' },
  { id: 'w5', name: '陈师傅', skill: '弱电', phone: '13900139005', currentZoneId: 'z13', currentZoneName: 'L5-A区', status: 'available' },
  { id: 'w6', name: '刘师傅', skill: '电梯', phone: '13900139006', currentZoneId: null, currentZoneName: null, status: 'available' },
  { id: 'w7', name: '周师傅', skill: '消防', phone: '13900139007', currentZoneId: 'z15', currentZoneName: 'B1-A区', status: 'busy' },
  { id: 'w8', name: '吴师傅', skill: '空调', phone: '13900139008', currentZoneId: 'z11', currentZoneName: 'L4-B区', status: 'available' },
];

export const repairTickets: RepairTicket[] = [
  { id: 't1', shopId: 's1', shopName: '苹果专卖店', faultType: '空调', description: '店铺东南角空调不制冷', priority: 'high', status: 'assigned', workerId: 'w2', workerName: '李师傅', rating: null, reviewComment: null, createdAt: '2024-06-05T09:30:00Z', assignedAt: '2024-06-05T09:45:00Z', completedAt: null, ratedAt: null },
  { id: 't2', shopId: 's14', shopName: '海底捞', faultType: '水电', description: '后厨水龙头漏水', priority: 'urgent', status: 'in_progress', workerId: 'w1', workerName: '张师傅', rating: null, reviewComment: null, createdAt: '2024-06-05T08:00:00Z', assignedAt: '2024-06-05T08:15:00Z', completedAt: null, ratedAt: null },
  { id: 't3', shopId: 's6', shopName: '优衣库', faultType: '弱电', description: 'POS机网络连接不稳定', priority: 'medium', status: 'completed', workerId: 'w5', workerName: '陈师傅', rating: 5, reviewComment: '维修速度快，服务好', createdAt: '2024-06-04T14:00:00Z', assignedAt: '2024-06-04T14:30:00Z', completedAt: '2024-06-04T16:00:00Z', ratedAt: '2024-06-04T17:00:00Z' },
  { id: 't4', shopId: 's18', shopName: '喜茶', faultType: '水电', description: '制冰机电源跳闸', priority: 'urgent', status: 'pending', workerId: null, workerName: null, rating: null, reviewComment: null, createdAt: '2024-06-05T10:00:00Z', assignedAt: null, completedAt: null, ratedAt: null },
  { id: 't5', shopId: 's20', shopName: '万达影城', faultType: '电梯', description: '3号电梯异响', priority: 'high', status: 'rated', workerId: 'w6', workerName: '刘师傅', rating: 4, reviewComment: '总体满意，稍微有点慢', createdAt: '2024-06-03T10:00:00Z', assignedAt: '2024-06-03T10:30:00Z', completedAt: '2024-06-03T14:00:00Z', ratedAt: '2024-06-03T18:00:00Z' },
  { id: 't6', shopId: 's7', shopName: 'H&M', faultType: '木工', description: '试衣间门锁损坏', priority: 'low', status: 'pending', workerId: null, workerName: null, rating: null, reviewComment: null, createdAt: '2024-06-05T11:00:00Z', assignedAt: null, completedAt: null, ratedAt: null },
  { id: 't7', shopId: 's15', shopName: '外婆家', faultType: '空调', description: '大堂中央空调制冷不足', priority: 'high', status: 'in_progress', workerId: 'w8', workerName: '吴师傅', rating: null, reviewComment: null, createdAt: '2024-06-05T07:30:00Z', assignedAt: '2024-06-05T07:45:00Z', completedAt: null, ratedAt: null },
  { id: 't8', shopId: 's10', shopName: '耐克', faultType: '消防', description: '烟感器报警', priority: 'urgent', status: 'completed', workerId: 'w7', workerName: '周师傅', rating: 5, reviewComment: '响应迅速，专业到位', createdAt: '2024-06-02T20:00:00Z', assignedAt: '2024-06-02T20:05:00Z', completedAt: '2024-06-02T20:30:00Z', ratedAt: '2024-06-02T21:00:00Z' },
  { id: 't9', shopId: 's9', shopName: '小米之家', faultType: '水电', description: '店铺照明线路故障', priority: 'high', status: 'completed', workerId: 'w1', workerName: '张师傅', rating: null, reviewComment: null, createdAt: '2024-06-04T09:00:00Z', assignedAt: '2024-06-04T09:15:00Z', completedAt: '2024-06-04T11:30:00Z', ratedAt: null },
];

export const customers: Customer[] = [
  { id: 'cust1', name: '小明', phone: '13700137001', points: 8580, level: '白银', totalPoints: 12580, availablePoints: 8580 },
  { id: 'cust2', name: '小红', phone: '13700137002', points: 3560, level: '普通', totalPoints: 3560, availablePoints: 3560 },
  { id: 'cust3', name: '小刚', phone: '13700137003', points: 15600, level: '钻石', totalPoints: 28900, availablePoints: 15600 },
  { id: 'cust4', name: '小丽', phone: '13700137004', points: 4200, level: '普通', totalPoints: 5200, availablePoints: 4200 },
  { id: 'cust5', name: '小华', phone: '13700137005', points: 12300, level: '黄金', totalPoints: 18500, availablePoints: 12300 },
];

export const gifts: Gift[] = [
  { id: 'g1', name: '50元停车抵扣券', pointsRequired: 500, stock: 1000, image: '🅿️', description: '可抵扣50元停车费' },
  { id: 'g2', name: '星巴克中杯券', pointsRequired: 1500, stock: 500, image: '☕', description: '星巴克任意中杯饮品兑换券' },
  { id: 'g3', name: '万达影城电影票', pointsRequired: 2500, stock: 300, image: '🎬', description: '2D/3D通兑电影票一张' },
  { id: 'g4', name: '海底捞100元代金券', pointsRequired: 3000, stock: 200, image: '🍲', description: '无门槛100元代金券' },
  { id: 'g5', name: '定制雨伞', pointsRequired: 2000, stock: 500, image: '☂️', description: '商场定制高档雨伞' },
  { id: 'g6', name: '小米充电宝', pointsRequired: 5000, stock: 150, image: '🔋', description: '小米10000mAh移动电源' },
  { id: 'g7', name: '膳魔师保温杯', pointsRequired: 4500, stock: 200, image: '🥤', description: '膳魔师真空保温杯500ml' },
  { id: 'g8', name: '2小时免费停车', pointsRequired: 200, stock: 9999, image: '🚗', description: '可兑换2小时免费停车' },
];

export const messages: Message[] = [
  { id: 'm1', recipientId: 'u1', recipientName: '张经理', type: 'application', title: '新入驻申请待审核', content: '兰蔻提交了新的入驻申请，需要您尽快审核处理。', relatedId: 'a5', isRead: false, createdAt: '2024-06-05T10:00:00Z' },
  { id: 'm2', recipientId: 'u1', recipientName: '张经理', type: 'application', title: '入驻申请已通过', content: '耐克的入驻申请已通过，请生成电子合同。', relatedId: 'a3', isRead: true, createdAt: '2024-06-02T14:30:00Z' },
  { id: 'm3', recipientId: 'u2', recipientName: '李主管', type: 'activity', title: '活动预算已确认', content: '618年中大促活动预算48万元已确认，请按时执行。', relatedId: 'act1', isRead: false, createdAt: '2024-06-05T09:00:00Z' },
  { id: 'm4', recipientId: 'u3', recipientName: '王会计', type: 'finance', title: '租金逾期提醒', content: '万达影城租金已逾期35天，请及时催收并锁定门禁。', relatedId: 'rb4', isRead: false, createdAt: '2024-06-05T08:00:00Z' },
  { id: 'm5', recipientId: 'u3', recipientName: '王会计', type: 'finance', title: '租金已锁定', content: '外婆家租金已逾期45天，系统已自动锁定门禁。', relatedId: 'rb8', isRead: true, createdAt: '2024-06-01T00:00:00Z' },
  { id: 'm6', recipientId: 'u4', recipientName: '赵队长', type: 'property', title: '新工单待派单', content: '喜茶提交紧急报修：制冰机电源跳闸，请立即派单。', relatedId: 't4', isRead: false, createdAt: '2024-06-05T10:00:00Z' },
  { id: 'm7', recipientId: 'u4', recipientName: '赵队长', type: 'property', title: '工单已完成', content: '优衣库POS机网络问题已修复，店铺评分5星。', relatedId: 't3', isRead: true, createdAt: '2024-06-04T17:00:00Z' },
  { id: 'm8', recipientId: 'u5', recipientName: '陈总', type: 'warning', title: '客流密度预警', content: 'L1-A区当前客流密度已达85%，请注意安全。', relatedId: null, isRead: false, createdAt: '2024-06-05T14:30:00Z' },
  { id: 'm9', recipientId: 'u5', recipientName: '陈总', type: 'report', title: '5月运营报告已生成', content: '5月份租金收缴率87.5%，总客流125万人次，活动ROI 3.2。', relatedId: 'r1', isRead: true, createdAt: '2024-06-01T08:00:00Z' },
  { id: 'm10', recipientId: 'u1', recipientName: '张经理', type: 'contract', title: '合同待签署', content: '喜茶的电子合同已生成，请通知品牌方签署。', relatedId: 'c3', isRead: false, createdAt: '2024-06-03T10:00:00Z' },
];

export const rentAdjustments: RentAdjustment[] = [
  { id: 'ra1', floor: 1, zone: 'A区', coefficient: 1.1, effectiveDate: '2024-07-01', createdBy: 'u5', createdAt: '2024-05-20T10:00:00Z' },
  { id: 'ra2', floor: 4, zone: '全部', coefficient: 0.95, effectiveDate: '2024-06-01', createdBy: 'u5', createdAt: '2024-05-15T14:00:00Z' },
];

export const reports: OperationReport[] = [
  { 
    id: 'r1', 
    reportMonth: '2024-05', 
    status: 'pushed', 
    collectionRate: 87.5, 
    totalPassengers: 1250000, 
    passengerGrowth: 0.08, 
    activityROI: 3.2, 
    totalSales: 25800000, 
    generatedAt: '2024-06-01T08:00:00Z', 
    pushedAt: '2024-06-01T09:00:00Z', 
    pushCount: 1,
    floorBreakdown: [
      { floorName: 'L1 精品零售', collectionRate: 95.2, passengers: 280000, sales: 6800000, efficiency: 3800, floor: 1 },
      { floorName: 'L2 时尚服饰', collectionRate: 88.6, passengers: 250000, sales: 5200000, efficiency: 2900, floor: 2 },
      { floorName: 'L3 生活家居', collectionRate: 85.3, passengers: 210000, sales: 4200000, efficiency: 2500, floor: 3 },
      { floorName: 'L4 餐饮美食', collectionRate: 90.1, passengers: 320000, sales: 5800000, efficiency: 4200, floor: 4 },
      { floorName: 'L5 休闲娱乐', collectionRate: 78.5, passengers: 120000, sales: 2500000, efficiency: 2100, floor: 5 },
      { floorName: 'B1 生活超市', collectionRate: 82.4, passengers: 70000, sales: 1300000, efficiency: 1800, floor: -1 },
    ]
  },
  { 
    id: 'r2', 
    reportMonth: '2024-04', 
    status: 'pushed', 
    collectionRate: 92.3, 
    totalPassengers: 1180000, 
    passengerGrowth: 0.05, 
    activityROI: 2.8, 
    totalSales: 23500000, 
    generatedAt: '2024-05-01T08:00:00Z', 
    pushedAt: '2024-05-01T09:00:00Z', 
    pushCount: 1,
    floorBreakdown: [
      { floorName: 'L1 精品零售', collectionRate: 96.8, passengers: 265000, sales: 6200000, efficiency: 3600, floor: 1 },
      { floorName: 'L2 时尚服饰', collectionRate: 93.2, passengers: 235000, sales: 4800000, efficiency: 2700, floor: 2 },
      { floorName: 'L3 生活家居', collectionRate: 90.5, passengers: 195000, sales: 3800000, efficiency: 2300, floor: 3 },
      { floorName: 'L4 餐饮美食', collectionRate: 92.1, passengers: 300000, sales: 5300000, efficiency: 4000, floor: 4 },
      { floorName: 'L5 休闲娱乐', collectionRate: 85.6, passengers: 110000, sales: 2200000, efficiency: 1900, floor: 5 },
      { floorName: 'B1 生活超市', collectionRate: 88.2, passengers: 75000, sales: 1200000, efficiency: 1700, floor: -1 },
    ]
  },
];

export const passengerDensity: PassengerDensity[] = [
  { zoneId: 'z1', zoneName: 'L1-A区', floor: 1, currentCount: 255, maxCapacity: 300, density: 85, status: 'warning' },
  { zoneId: 'z2', zoneName: 'L1-B区', floor: 1, currentCount: 180, maxCapacity: 250, density: 72, status: 'normal' },
  { zoneId: 'z3', zoneName: 'L1-C区', floor: 1, currentCount: 120, maxCapacity: 200, density: 60, status: 'normal' },
  { zoneId: 'z4', zoneName: 'L2-A区', floor: 2, currentCount: 210, maxCapacity: 300, density: 70, status: 'normal' },
  { zoneId: 'z5', zoneName: 'L2-B区', floor: 2, currentCount: 165, maxCapacity: 250, density: 66, status: 'normal' },
  { zoneId: 'z6', zoneName: 'L2-C区', floor: 2, currentCount: 95, maxCapacity: 200, density: 47.5, status: 'normal' },
  { zoneId: 'z7', zoneName: 'L3-A区', floor: 3, currentCount: 180, maxCapacity: 300, density: 60, status: 'normal' },
  { zoneId: 'z8', zoneName: 'L3-B区', floor: 3, currentCount: 140, maxCapacity: 250, density: 56, status: 'normal' },
  { zoneId: 'z9', zoneName: 'L3-C区', floor: 3, currentCount: 110, maxCapacity: 200, density: 55, status: 'normal' },
  { zoneId: 'z10', zoneName: 'L4-A区', floor: 4, currentCount: 320, maxCapacity: 350, density: 91.4, status: 'danger' },
  { zoneId: 'z11', zoneName: 'L4-B区', floor: 4, currentCount: 245, maxCapacity: 300, density: 81.7, status: 'warning' },
  { zoneId: 'z12', zoneName: 'L4-C区', floor: 4, currentCount: 195, maxCapacity: 250, density: 78, status: 'normal' },
  { zoneId: 'z13', zoneName: 'L5-A区', floor: 5, currentCount: 280, maxCapacity: 400, density: 70, status: 'normal' },
  { zoneId: 'z14', zoneName: 'L5-B区', floor: 5, currentCount: 195, maxCapacity: 300, density: 65, status: 'normal' },
  { zoneId: 'z15', zoneName: 'B1-A区', floor: -1, currentCount: 310, maxCapacity: 400, density: 77.5, status: 'normal' },
  { zoneId: 'z16', zoneName: 'B1-B区', floor: -1, currentCount: 245, maxCapacity: 350, density: 70, status: 'normal' },
];

export const executiveMetrics: ExecutiveMetrics = {
  floorEfficiency: [
    { floor: 1, efficiency: 3250, floorName: 'L1 精品层' },
    { floor: 2, efficiency: 2800, floorName: 'L2 时尚层' },
    { floor: 3, efficiency: 2450, floorName: 'L3 休闲层' },
    { floor: 4, efficiency: 3680, floorName: 'L4 餐饮层' },
    { floor: 5, efficiency: 2100, floorName: 'L5 娱乐层' },
    { floor: -1, efficiency: 1850, floorName: 'B1 生活层' },
  ],
  conversionRate: [
    { floor: 1, rate: 72.5, floorName: 'L1 精品层' },
    { floor: 2, rate: 68.3, floorName: 'L2 时尚层' },
    { floor: 3, rate: 65.8, floorName: 'L3 休闲层' },
    { floor: 4, rate: 85.2, floorName: 'L4 餐饮层' },
    { floor: 5, rate: 78.6, floorName: 'L5 娱乐层' },
    { floor: -1, rate: 55.3, floorName: 'B1 生活层' },
  ],
  churnRate: [
    { floor: 1, rate: 5.2, floorName: 'L1 精品层' },
    { floor: 2, rate: 8.6, floorName: 'L2 时尚层' },
    { floor: 3, rate: 6.8, floorName: 'L3 休闲层' },
    { floor: 4, rate: 3.5, floorName: 'L4 餐饮层' },
    { floor: 5, rate: 9.2, floorName: 'L5 娱乐层' },
    { floor: -1, rate: 12.5, floorName: 'B1 生活层' },
  ],
};

export function generateId(): string {
  return uuidv4();
}

export const passwordHash: Record<string, string> = {
  merchant: '123456',
  operations: '123456',
  finance: '123456',
  property: '123456',
  executive: '123456',
};
