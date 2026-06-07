import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  activities, salesRanks, shops, generateId, messages
} from '../data/mockData';
import { Activity } from '../../shared/types';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('operations', 'executive'));

router.get('/activities', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  let result = [...activities];
  
  if (status && status !== 'all') {
    result = result.filter(a => a.status === status);
  }
  
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(result);
});

router.get('/activities/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const activity = activities.find(a => a.id === req.params.id);
  
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }
  
  res.json(activity);
});

router.post('/activities', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, type, startDate, endDate, actualBudget, participants } = req.body;
  
  const occupiedShops = shops.filter(s => s.status === 'occupied' && s.brandName);
  
  const shopSales = occupiedShops.map(shop => ({
    shopId: shop.id,
    shopName: shop.brandName!,
    avgSales: Math.floor(Math.random() * 500000) + 100000,
  }));
  
  shopSales.sort((a, b) => b.avgSales - a.avgSales);
  const recommendedBrands = shopSales.slice(0, 8).map(s => s.shopName);
  
  const totalSales = shopSales.reduce((sum, s) => sum + s.avgSales, 0);
  const recommendedBudget = Math.floor(totalSales * 0.15);
  
  const newActivity: Activity = {
    id: generateId(),
    name,
    type,
    startDate,
    endDate,
    recommendedBudget,
    actualBudget: actualBudget || null,
    status: 'draft',
    creatorId: req.user!.id,
    creatorName: req.user!.name,
    participants: participants || [],
    recommendedBrands,
    createdAt: new Date().toISOString(),
  };
  
  activities.push(newActivity);
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u2',
    recipientName: '李主管',
    type: 'activity',
    title: `新活动待审核 - ${name}`,
    content: `${req.user!.name}创建了新活动"${name}"，预算${recommendedBudget}元，请审核。`,
    relatedId: newActivity.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.status(201).json(newActivity);
});

router.post('/activities/:id/approve', async (req: AuthRequest, res: Response): Promise<void> => {
  const activity = activities.find(a => a.id === req.params.id);
  
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }
  
  activity.status = 'approved';
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u2',
    recipientName: '李主管',
    type: 'activity',
    title: `活动预算已确认 - ${activity.name}`,
    content: `${activity.name}活动预算${activity.actualBudget || activity.recommendedBudget}元已确认，请按时执行。`,
    relatedId: activity.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(activity);
});

router.post('/activities/:id/start', async (req: AuthRequest, res: Response): Promise<void> => {
  const activity = activities.find(a => a.id === req.params.id);
  
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }
  
  activity.status = 'active';
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u2',
    recipientName: '李主管',
    type: 'activity',
    title: `活动已启动 - ${activity.name}`,
    content: `${activity.name}活动已正式启动，请各参与品牌做好准备。`,
    relatedId: activity.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(activity);
});

router.post('/activities/:id/complete', async (req: AuthRequest, res: Response): Promise<void> => {
  const activity = activities.find(a => a.id === req.params.id);
  
  if (!activity) {
    res.status(404).json({ error: '活动不存在' });
    return;
  }
  
  activity.status = 'completed';
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u2',
    recipientName: '李主管',
    type: 'activity',
    title: `活动已结束 - ${activity.name}`,
    content: `${activity.name}活动已结束，系统将自动统计销售额增量排行。`,
    relatedId: activity.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(activity);
});

router.get('/sales/ranking', async (req: AuthRequest, res: Response): Promise<void> => {
  const { activityId, sortBy = 'incrementRate' } = req.query;
  
  let result = [...salesRanks];
  
  if (sortBy === 'increment') {
    result.sort((a, b) => b.increment - a.increment);
  } else if (sortBy === 'incrementRate') {
    result.sort((a, b) => b.incrementRate - a.incrementRate);
  }
  
  res.json(result);
});

router.get('/sales/trend', async (req: AuthRequest, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 7;
  const trendData = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trendData.push({
      date: date.toISOString().split('T')[0],
      totalSales: Math.floor(Math.random() * 2000000) + 3000000,
      passengerFlow: Math.floor(Math.random() * 5000) + 8000,
    });
  }
  
  res.json(trendData);
});

export default router;
