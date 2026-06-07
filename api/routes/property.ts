import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  repairTickets, workers, generateId, messages, shops, zones
} from '../data/mockData';
import { RepairTicket } from '../../shared/types';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('property', 'executive'));

router.get('/tickets', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, priority } = req.query;
  let result = [...repairTickets];
  
  if (status && status !== 'all') {
    result = result.filter(t => t.status === status);
  }
  
  if (priority && priority !== 'all') {
    result = result.filter(t => t.priority === priority);
  }
  
  const priorityOrder: Record<string, number> = {
    urgent: 0, high: 1, medium: 2, low: 3
  };
  result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  res.json(result);
});

router.get('/tickets/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const ticket = repairTickets.find(t => t.id === req.params.id);
  
  if (!ticket) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  
  res.json(ticket);
});

router.get('/workers', async (req: AuthRequest, res: Response): Promise<void> => {
  const { skill, status } = req.query;
  let result = [...workers];
  
  if (skill) {
    result = result.filter(w => w.skill === skill);
  }
  
  if (status) {
    result = result.filter(w => w.status === status);
  }
  
  res.json(result);
});

router.get('/recommend-worker/:ticketId', async (req: AuthRequest, res: Response): Promise<void> => {
  const ticket = repairTickets.find(t => t.id === req.params.ticketId);
  
  if (!ticket) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  
  const shop = shops.find(s => s.id === ticket.shopId);
  const zone = zones.find(z => z.id === shop?.zoneId);
  
  const availableWorkers = workers.filter(w => 
    w.status === 'available' && w.skill === ticket.faultType
  );
  
  const scoredWorkers = availableWorkers.map(worker => {
    let score = 0;
    
    if (worker.currentZoneId === zone?.id) {
      score += 50;
    } else if (worker.currentZoneId && zone) {
      const workerZone = zones.find(z => z.id === worker.currentZoneId);
      if (workerZone?.floorNumber === zone.floorNumber) {
        score += 30;
      }
    }
    
    score += Math.floor(Math.random() * 30) + 10;
    
    return {
      ...worker,
      score,
      distance: worker.currentZoneId === zone?.id ? '同区域' : 
                worker.currentZoneId && zones.find(z => z.id === worker.currentZoneId)?.floorNumber === zone?.floorNumber ? '同楼层' : '其他楼层',
    };
  });
  
  scoredWorkers.sort((a, b) => b.score - a.score);
  
  res.json(scoredWorkers);
});

router.post('/tickets/:id/dispatch', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workerId } = req.body;
  const ticket = repairTickets.find(t => t.id === req.params.id);
  const worker = workers.find(w => w.id === workerId);
  
  if (!ticket) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  
  if (!worker) {
    res.status(400).json({ error: '维修工不存在' });
    return;
  }
  
  ticket.workerId = workerId;
  ticket.workerName = worker.name;
  ticket.status = 'assigned';
  ticket.assignedAt = new Date().toISOString();
  
  worker.status = 'busy';
  
  res.json(ticket);
});

router.post('/tickets/:id/start', async (req: AuthRequest, res: Response): Promise<void> => {
  const ticket = repairTickets.find(t => t.id === req.params.id);
  
  if (!ticket) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  
  ticket.status = 'in_progress';
  
  res.json(ticket);
});

router.post('/tickets/:id/complete', async (req: AuthRequest, res: Response): Promise<void> => {
  const ticket = repairTickets.find(t => t.id === req.params.id);
  
  if (!ticket) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  
  ticket.status = 'completed';
  ticket.completedAt = new Date().toISOString();
  
  const worker = workers.find(w => w.id === ticket.workerId);
  if (worker) {
    worker.status = 'available';
  }
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u4',
    recipientName: '赵队长',
    type: 'property',
    title: `工单已完成 - ${ticket.shopName}`,
    content: `${ticket.shopName}的${ticket.faultType}维修已完成，等待店铺评分确认。`,
    relatedId: ticket.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(ticket);
});

router.post('/tickets/:id/rate', async (req: AuthRequest, res: Response): Promise<void> => {
  const { rating, reviewComment } = req.body;
  const ticket = repairTickets.find(t => t.id === req.params.id);
  
  if (!ticket) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  
  if (ticket.status !== 'completed') {
    res.status(400).json({ error: '工单未完成，无法评分' });
    return;
  }
  
  ticket.rating = rating;
  ticket.reviewComment = reviewComment || null;
  ticket.status = 'rated';
  ticket.ratedAt = new Date().toISOString();
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u4',
    recipientName: '赵队长',
    type: 'property',
    title: `工单已评价 - ${ticket.shopName}`,
    content: `${ticket.shopName}的维修工单已评价：${rating}星。${reviewComment ? `评价内容：${reviewComment}` : ''}`,
    relatedId: ticket.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(ticket);
});

router.post('/tickets', async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId, faultType, description, priority } = req.body;
  
  const shop = shops.find(s => s.id === shopId);
  if (!shop) {
    res.status(400).json({ error: '店铺不存在' });
    return;
  }
  
  const newTicket: RepairTicket = {
    id: generateId(),
    shopId,
    shopName: shop.brandName || shop.shopNumber,
    faultType,
    description,
    priority: priority || 'medium',
    status: 'pending',
    workerId: null,
    workerName: null,
    rating: null,
    reviewComment: null,
    createdAt: new Date().toISOString(),
    assignedAt: null,
    completedAt: null,
    ratedAt: null,
  };
  
  repairTickets.push(newTicket);
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u4',
    recipientName: '赵队长',
    type: 'property',
    title: `新工单待派单 - ${newTicket.shopName}`,
    content: `${newTicket.shopName}提交${priority === 'urgent' ? '紧急' : ''}报修：${description}，请立即派单。`,
    relatedId: newTicket.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.status(201).json(newTicket);
});

export default router;
