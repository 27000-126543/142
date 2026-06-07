import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import {
  applications, rentBills, repairTickets, activities,
  messages, passengerDensity
} from '../data/mockData';
import { DashboardStats } from '../../shared/types';

const router = Router();

router.use(authMiddleware);

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  const totalPassenger = passengerDensity.reduce((sum, p) => sum + p.currentCount, 0);
  
  const totalRent = rentBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const paidRent = rentBills
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const collectionRate = totalRent > 0 ? Math.round((paidRent / totalRent) * 1000) / 10 : 0;

  const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length;
  const pendingTickets = repairTickets.filter(t => t.status === 'pending' || t.status === 'assigned').length;
  const activeActivities = activities.filter(a => a.status === 'active').length;
  const overdueBills = rentBills.filter(b => b.status === 'overdue' || b.status === 'locked').length;

  const todoList = [
    { id: 'todo1', title: '审核兰蔻入驻申请', type: 'application', priority: 'high' },
    { id: 'todo2', title: '派单喜茶制冰机报修', type: 'ticket', priority: 'urgent' },
    { id: 'todo3', title: '催收万达影城逾期租金', type: 'finance', priority: 'high' },
    { id: 'todo4', title: '确认618活动最终方案', type: 'activity', priority: 'medium' },
    { id: 'todo5', title: '生成喜茶电子合同', type: 'contract', priority: 'medium' },
  ];

  const stats: DashboardStats = {
    todayPassenger: totalPassenger,
    yesterdayPassenger: 2850,
    rentCollectionRate: collectionRate,
    monthRentTarget: 2500000,
    monthRentCollected: paidRent,
    pendingApplications: pendingApps,
    pendingTickets: pendingTickets,
    activeActivities: activeActivities,
    overdueBills: overdueBills,
    recentMessages: messages.filter(m => !m.isRead).slice(0, 5),
    todoList,
  };

  res.json(stats);
});

export default router;
