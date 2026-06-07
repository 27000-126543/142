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
  
  const monthBills = reports[0];
  
  const details = {
    rentCollection: {
      target: 2500000,
      actual: monthBills.rentCollectionRate / 100 * 2500000,
      rate: monthBills.rentCollectionRate,
      byFloor: [
        { floor: 1, name: 'L1', collection: 95.2 },
        { floor: 2, name: 'L2', collection: 88.6 },
        { floor: 3, name: 'L3', collection: 85.3 },
        { floor: 4, name: 'L4', collection: 90.1 },
        { floor: 5, name: 'L5', collection: 78.5 },
        { floor: -1, name: 'B1', collection: 82.4 },
      ],
    },
    passengerFlow: {
      total: monthBills.totalPassenger,
      dailyAverage: Math.round(monthBills.totalPassenger / 30),
      peakDay: '2024-05-01',
      peakCount: 68000,
      byFloor: [
        { floor: 1, name: 'L1', count: 280000 },
        { floor: 2, name: 'L2', count: 250000 },
        { floor: 3, name: 'L3', count: 210000 },
        { floor: 4, name: 'L4', count: 320000 },
        { floor: 5, name: 'L5', count: 120000 },
        { floor: -1, name: 'B1', count: 70000 },
      ],
    },
    activityRoi: monthBills.activityRoi,
    activities: [
      { name: '五一黄金周促销', revenue: 12500000, cost: 3500000, roi: 3.57 },
      { name: '母亲节特别活动', revenue: 5600000, cost: 1800000, roi: 3.11 },
    ],
  };
  
  res.json({
    ...monthBills,
    details,
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
