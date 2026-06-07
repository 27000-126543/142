import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import {
  passengerDensity, customers, gifts, messages, reports,
  generateId, zones, workers, shops
} from '../data/mockData';

const router = Router();

router.use(authMiddleware);

router.get('/passenger/density', async (req: AuthRequest, res: Response): Promise<void> => {
  const { floor } = req.query;
  let result = [...passengerDensity];
  
  if (floor) {
    const floorNum = parseInt(floor as string);
    result = result.filter(p => p.floor === floorNum);
  }
  
  res.json(result);
});

router.get('/passenger/realtime', async (req: AuthRequest, res: Response): Promise<void> => {
  const hours = parseInt(req.query.hours as string) || 24;
  const data = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(time.getHours() - i);
    
    const floors = [-1, 1, 2, 3, 4, 5];
    const floorData = floors.map(floor => ({
      floor,
      count: Math.floor(Math.random() * 500) + 100,
    }));
    
    data.push({
      time: time.toISOString(),
      total: floorData.reduce((sum, f) => sum + f.count, 0),
      byFloor: floorData,
    });
  }
  
  res.json(data);
});

router.post('/passenger/check-threshold', async (req: AuthRequest, res: Response): Promise<void> => {
  const warnings = [];
  
  for (const zone of passengerDensity) {
    if (zone.status === 'danger') {
      warnings.push({
        ...zone,
        suggestion: `立即启动限流措施，建议引导客流至${zone.floor}层其他区域`,
      });
    } else if (zone.status === 'warning') {
      warnings.push({
        ...zone,
        suggestion: '密切关注客流变化，做好限流准备',
      });
    }
  }
  
  const dangerZones = warnings.filter(w => w.status === 'danger');
  if (dangerZones.length > 0) {
    const newMessage = {
      id: generateId(),
      recipientId: 'u5',
      recipientName: '陈总',
      type: 'warning',
      title: `客流密度预警 - ${dangerZones.length}个区域`,
      content: `${dangerZones.map(z => z.zoneName).join('、')}客流密度超过安全阈值，请关注。`,
      relatedId: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
  }
  
  res.json({
    totalZones: passengerDensity.length,
    normalZones: passengerDensity.filter(z => z.status === 'normal').length,
    warningZones: passengerDensity.filter(z => z.status === 'warning').length,
    dangerZones: passengerDensity.filter(z => z.status === 'danger').length,
    warnings,
  });
});

router.get('/points/balance/:customerId', async (req: AuthRequest, res: Response): Promise<void> => {
  const customer = customers.find(c => c.id === req.params.customerId);
  
  if (!customer) {
    res.status(404).json({ error: '客户不存在' });
    return;
  }
  
  res.json({
    customerId: customer.id,
    customerName: customer.name,
    totalPoints: customer.totalPoints,
    availablePoints: customer.availablePoints,
  });
});

router.get('/points/gifts', async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(gifts);
});

router.post('/points/redeem', async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerId, giftId } = req.body;
  
  const customer = customers.find(c => c.id === customerId);
  const gift = gifts.find(g => g.id === giftId);
  
  if (!customer || !gift) {
    res.status(400).json({ error: '客户或礼品不存在' });
    return;
  }
  
  if (customer.availablePoints < gift.pointsRequired) {
    res.status(400).json({ error: '积分不足' });
    return;
  }
  
  if (gift.stock <= 0) {
    res.status(400).json({ error: '礼品库存不足' });
    return;
  }
  
  customer.availablePoints -= gift.pointsRequired;
  gift.stock -= 1;
  
  res.json({
    success: true,
    message: `成功兑换${gift.name}`,
    remainingPoints: customer.availablePoints,
  });
});

router.post('/points/parking', async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerId, hours } = req.body;
  
  const customer = customers.find(c => c.id === customerId);
  
  if (!customer) {
    res.status(400).json({ error: '客户不存在' });
    return;
  }
  
  const pointsRequired = hours * 100;
  
  if (customer.availablePoints < pointsRequired) {
    res.status(400).json({ error: '积分不足' });
    return;
  }
  
  customer.availablePoints -= pointsRequired;
  
  res.json({
    success: true,
    message: `成功抵扣${hours}小时停车费`,
    pointsUsed: pointsRequired,
    remainingPoints: customer.availablePoints,
  });
});

router.post('/points/earn', async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerId, amount, shopId } = req.body;
  
  const customer = customers.find(c => c.id === customerId);
  
  if (!customer) {
    res.status(400).json({ error: '客户不存在' });
    return;
  }
  
  const pointsEarned = Math.floor(amount / 10);
  customer.totalPoints += pointsEarned;
  customer.availablePoints += pointsEarned;
  
  res.json({
    success: true,
    message: `消费${amount}元，获得${pointsEarned}积分`,
    pointsEarned,
    totalPoints: customer.totalPoints,
    availablePoints: customer.availablePoints,
  });
});

router.get('/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  const { isRead, type } = req.query;
  let result = messages.filter(m => m.recipientId === req.user!.id);
  
  if (isRead !== undefined) {
    const readVal = isRead === 'true';
    result = result.filter(m => m.isRead === readVal);
  }
  
  if (type && type !== 'all') {
    result = result.filter(m => m.type === type);
  }
  
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({
    total: result.length,
    unreadCount: result.filter(m => !m.isRead).length,
    messages: result,
  });
});

router.post('/messages/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  const message = messages.find(m => m.id === req.params.id && m.recipientId === req.user!.id);
  
  if (!message) {
    res.status(404).json({ error: '消息不存在' });
    return;
  }
  
  message.isRead = true;
  
  res.json(message);
});

router.post('/messages/read-all', async (req: AuthRequest, res: Response): Promise<void> => {
  const userMessages = messages.filter(m => m.recipientId === req.user!.id);
  userMessages.forEach(m => { m.isRead = true; });
  
  res.json({
    success: true,
    count: userMessages.length,
  });
});

router.get('/reports', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = [...reports].sort((a, b) => 
    b.reportMonth.localeCompare(a.reportMonth)
  );
  res.json(result);
});

router.get('/reports/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const report = reports.find(r => r.id === req.params.id);
  
  if (!report) {
    res.status(404).json({ error: '报告不存在' });
    return;
  }
  
  res.json(report);
});

router.post('/reports/generate', async (req: AuthRequest, res: Response): Promise<void> => {
  const { month } = req.body;
  
  const reportMonth = month || new Date().toISOString().slice(0, 7);
  
  const existingReport = reports.find(r => r.reportMonth === reportMonth);
  if (existingReport) {
    res.json({
      ...existingReport,
      details: {
        rentCollection: {
          target: 2500000,
          actual: existingReport.collectionRate / 100 * 2500000,
          rate: existingReport.collectionRate,
          byFloor: existingReport.floorBreakdown.map(f => ({
            floor: f.floor,
            name: f.floorName,
            collection: f.collectionRate
          })),
        },
        passengerFlow: {
          total: existingReport.totalPassengers,
          dailyAverage: Math.round(existingReport.totalPassengers / 30),
          peakDay: `${reportMonth}-15`,
          peakCount: Math.round(existingReport.totalPassengers / 30 * 1.5),
          byFloor: existingReport.floorBreakdown.map(f => ({
            floor: f.floor,
            name: f.floorName,
            count: f.passengers
          })),
        },
        activityRoi: existingReport.activityROI,
        activities: [
          { name: '月度促销活动', revenue: 8500000, cost: 2500000, roi: existingReport.activityROI },
        ],
      },
    });
    return;
  }
  
  const collectionRate = 85 + Math.random() * 15;
  const totalPassengers = Math.floor(800000 + Math.random() * 500000);
  const activityROI = 2.5 + Math.random() * 2;
  const totalSales = Math.floor(15000000 + Math.random() * 10000000);
  
  const floors = [
    { floor: 1, floorName: 'L1 精品零售' },
    { floor: 2, floorName: 'L2 时尚服饰' },
    { floor: 3, floorName: 'L3 生活家居' },
    { floor: 4, floorName: 'L4 餐饮美食' },
    { floor: 5, floorName: 'L5 休闲娱乐' },
    { floor: -1, floorName: 'B1 生活超市' },
  ];
  
  const floorBreakdown = floors.map(f => ({
    ...f,
    collectionRate: 80 + Math.random() * 20,
    passengers: Math.floor(totalPassengers / 6 + Math.random() * 50000),
    sales: Math.floor(totalSales / 6 + Math.random() * 1000000),
    efficiency: Math.floor(3000 + Math.random() * 2000),
  }));
  
  const newReport = {
    id: generateId(),
    reportMonth,
    collectionRate,
    totalPassengers,
    passengerGrowth: 0.05 + Math.random() * 0.1,
    activityROI,
    totalSales,
    status: 'generated' as const,
    pushedAt: null,
    pushCount: 0,
    generatedAt: new Date().toISOString(),
    floorBreakdown,
  };
  
  reports.push(newReport);
  
  res.json({
    ...newReport,
    details: {
      rentCollection: {
        target: 2500000,
        actual: collectionRate / 100 * 2500000,
        rate: collectionRate,
        byFloor: floorBreakdown.map(f => ({
          floor: f.floor,
          name: f.floorName,
          collection: f.collectionRate
        })),
      },
      passengerFlow: {
        total: totalPassengers,
        dailyAverage: Math.round(totalPassengers / 30),
        peakDay: `${reportMonth}-15`,
        peakCount: Math.round(totalPassengers / 30 * 1.5),
        byFloor: floorBreakdown.map(f => ({
          floor: f.floor,
          name: f.floorName,
          count: f.passengers
        })),
      },
      activityRoi: activityROI,
      activities: [
        { name: '月度促销活动', revenue: 8500000, cost: 2500000, roi: activityROI },
      ],
    },
  });
});

router.post('/reports/auto-generate-monthly', async (req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const reportMonth = lastMonth.toISOString().slice(0, 7);
  
  const existingReport = reports.find(r => r.reportMonth === reportMonth);
  if (existingReport) {
    res.json({
      success: true,
      message: `${reportMonth} 月运营报告已存在`,
      report: existingReport,
    });
    return;
  }
  
  const collectionRate = 85 + Math.random() * 15;
  const totalPassengers = Math.floor(800000 + Math.random() * 500000);
  const activityROI = 2.5 + Math.random() * 2;
  const totalSales = Math.floor(15000000 + Math.random() * 10000000);
  
  const floors = [
    { floor: 1, floorName: 'L1 精品零售' },
    { floor: 2, floorName: 'L2 时尚服饰' },
    { floor: 3, floorName: 'L3 生活家居' },
    { floor: 4, floorName: 'L4 餐饮美食' },
    { floor: 5, floorName: 'L5 休闲娱乐' },
    { floor: -1, floorName: 'B1 生活超市' },
  ];
  
  const floorBreakdown = floors.map(f => ({
    ...f,
    collectionRate: 80 + Math.random() * 20,
    passengers: Math.floor(totalPassengers / 6 + Math.random() * 50000),
    sales: Math.floor(totalSales / 6 + Math.random() * 1000000),
    efficiency: Math.floor(3000 + Math.random() * 2000),
  }));
  
  const newReport = {
    id: generateId(),
    reportMonth,
    collectionRate,
    totalPassengers,
    passengerGrowth: 0.05 + Math.random() * 0.1,
    activityROI,
    totalSales,
    status: 'generated' as const,
    pushedAt: null,
    pushCount: 0,
    generatedAt: new Date().toISOString(),
    floorBreakdown,
  };
  
  reports.push(newReport);
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u5',
    recipientName: '陈总',
    type: 'report',
    title: `${reportMonth} 月运营报告已生成`,
    content: `${reportMonth} 月运营报告已自动生成，收缴率：${collectionRate.toFixed(1)}%，客流总量：${totalPassengers.toLocaleString()}人次，活动ROI：1:${activityROI.toFixed(1)}。请查看详情。`,
    relatedId: newReport.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json({
    success: true,
    message: `${reportMonth} 月运营报告已自动生成并推送给总经理`,
    report: newReport,
    message: newMessage,
  });
});

router.post('/reports/:id/push', async (req: AuthRequest, res: Response): Promise<void> => {
  const report = reports.find(r => r.id === req.params.id);
  
  if (!report) {
    res.status(404).json({ error: '报告不存在' });
    return;
  }
  
  report.status = 'pushed';
  report.pushedAt = new Date().toISOString();
  report.pushCount = (report.pushCount || 0) + 1;
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u5',
    recipientName: '陈总',
    type: 'report',
    title: `${report.reportMonth} 月运营报告`,
    content: `${report.reportMonth} 月运营报告已推送至您的手机端。收缴率：${report.collectionRate.toFixed(1)}%，客流总量：${report.totalPassengers.toLocaleString()}人次。`,
    relatedId: report.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json({
    success: true,
    message: '报告已推送',
    report,
    pushMessage: newMessage,
  });
});

router.post('/reports/:id/download', async (req: AuthRequest, res: Response): Promise<void> => {
  const report = reports.find(r => r.id === req.params.id);
  
  if (!report) {
    res.status(404).json({ error: '报告不存在' });
    return;
  }
  
  res.json({
    success: true,
    message: '报告下载凭证已生成',
    downloadUrl: `/api/reports/${report.id}/pdf`,
    report,
  });
});

router.get('/stats/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  const todayPassenger = passengerDensity.reduce((sum, p) => sum + p.currentCount, 0);
  const totalZones = zones.length;
  const totalShops = shops.length;
  const occupiedShops = shops.filter(s => s.status === 'occupied').length;
  const availableWorkers = workers.filter(w => w.status === 'available').length;
  
  const recentAlerts = passengerDensity.filter(p => p.status !== 'normal').length;
  const pendingTickets = zones.length;
  
  res.json({
    todayPassenger,
    yesterdayPassenger: 2850,
    passengerGrowth: 12.5,
    totalZones,
    totalShops,
    occupiedShops,
    occupancyRate: Math.round((occupiedShops / totalShops) * 1000) / 10,
    availableWorkers,
    recentAlerts,
    pendingTickets,
  });
});

export default router;
