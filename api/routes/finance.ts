import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  rentBills, generateId, messages, shops
} from '../data/mockData';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('finance', 'executive'));

router.get('/bills', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, month } = req.query;
  let result = [...rentBills];
  
  if (status && status !== 'all') {
    result = result.filter(b => b.status === status);
  }
  
  if (month) {
    result = result.filter(b => b.billMonth === month);
  }
  
  result.sort((a, b) => {
    const statusOrder: Record<string, number> = {
      locked: 0, overdue: 1, unpaid: 2, paid: 3
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  res.json(result);
});

router.get('/bills/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const bill = rentBills.find(b => b.id === req.params.id);
  
  if (!bill) {
    res.status(404).json({ error: '账单不存在' });
    return;
  }
  
  res.json(bill);
});

router.post('/bills/:id/pay', async (req: AuthRequest, res: Response): Promise<void> => {
  const bill = rentBills.find(b => b.id === req.params.id);
  
  if (!bill) {
    res.status(404).json({ error: '账单不存在' });
    return;
  }
  
  bill.status = 'paid';
  bill.paidAt = new Date().toISOString();
  bill.overdueDays = 0;
  bill.lateFee = 0;
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u3',
    recipientName: '王会计',
    type: 'rent',
    title: `租金已缴纳 - ${bill.shopName}`,
    content: `${bill.shopName}已缴清${bill.billMonth}月租金及滞纳金共计${bill.totalAmount + bill.lateFee}元。`,
    relatedId: bill.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  if (bill.accessLocked) {
    bill.accessLocked = false;
    
    const unlockMessage = {
      id: generateId(),
      recipientId: 'u3',
      recipientName: '王会计',
      type: 'rent',
      title: `门禁已解锁 - ${bill.shopName}`,
      content: `${bill.shopName}已缴清租金及滞纳金，门禁已自动解锁。`,
      relatedId: bill.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    messages.push(unlockMessage);
  }
  
  res.json(bill);
});

router.post('/bills/:id/lock', async (req: AuthRequest, res: Response): Promise<void> => {
  const bill = rentBills.find(b => b.id === req.params.id);
  
  if (!bill) {
    res.status(404).json({ error: '账单不存在' });
    return;
  }
  
  if (bill.overdueDays < 30) {
    res.status(400).json({ error: '逾期未满30天，无法锁定门禁' });
    return;
  }
  
  bill.status = 'locked';
  bill.accessLocked = true;
  
  const shop = shops.find(s => s.id === bill.shopId);
  if (shop) {
    shop.status = 'under_renovation';
  }
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u3',
    recipientName: '王会计',
    type: 'finance',
    title: `租金已锁定 - ${bill.shopName}`,
    content: `${bill.shopName}租金已逾期${bill.overdueDays}天，系统已自动锁定门禁。`,
    relatedId: bill.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(bill);
});

router.post('/bills/:id/unlock', async (req: AuthRequest, res: Response): Promise<void> => {
  const bill = rentBills.find(b => b.id === req.params.id);
  
  if (!bill) {
    res.status(404).json({ error: '账单不存在' });
    return;
  }
  
  bill.accessLocked = false;
  if (bill.status === 'locked') {
    bill.status = 'overdue';
  }
  
  const shop = shops.find(s => s.id === bill.shopId);
  if (shop) {
    shop.status = 'occupied';
  }
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u3',
    recipientName: '王会计',
    type: 'rent',
    title: `门禁已解锁 - ${bill.shopName}`,
    content: `${bill.shopName}的门禁已解锁。`,
    relatedId: bill.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(bill);
});

router.post('/bills/:id/send-notice', async (req: AuthRequest, res: Response): Promise<void> => {
  const bill = rentBills.find(b => b.id === req.params.id);
  
  if (!bill) {
    res.status(404).json({ error: '账单不存在' });
    return;
  }
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u3',
    recipientName: '王会计',
    type: 'rent',
    title: `租金催缴通知 - ${bill.shopName}`,
    content: `已向${bill.shopName}发送租金催缴通知，逾期${bill.overdueDays}天，应缴总额：${bill.totalAmount + bill.lateFee}元。`,
    relatedId: bill.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json({ success: true, message: '催缴通知已发送' });
});

router.post('/bills/:id/apply-late-fee', async (req: AuthRequest, res: Response): Promise<void> => {
  const bill = rentBills.find(b => b.id === req.params.id);
  
  if (!bill) {
    res.status(404).json({ error: '账单不存在' });
    return;
  }
  
  if (bill.overdueDays < 30) {
    res.status(400).json({ error: '逾期未满30天，无法加收滞纳金' });
    return;
  }
  
  const lateFeeRate = 0.0005;
  const lateFee = bill.totalAmount * lateFeeRate * (bill.overdueDays - 30);
  bill.lateFee = Math.round(lateFee * 100) / 100;
  bill.status = 'overdue';
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u3',
    recipientName: '王会计',
    type: 'finance',
    title: `租金逾期提醒 - ${bill.shopName}`,
    content: `${bill.shopName}租金已逾期${bill.overdueDays}天，请及时催收。滞纳金：${bill.lateFee}元。`,
    relatedId: bill.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(bill);
});

router.get('/statistics', async (req: AuthRequest, res: Response): Promise<void> => {
  const { month } = req.query;
  
  const monthBills = month 
    ? rentBills.filter(b => b.billMonth === month)
    : rentBills;
  
  const totalAmount = monthBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const paidAmount = monthBills
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const unpaidAmount = monthBills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + b.totalAmount + b.lateFee, 0);
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 1000) / 10 : 0;
  const overdueCount = monthBills.filter(b => b.status === 'overdue' || b.status === 'locked').length;
  const lockedCount = monthBills.filter(b => b.status === 'locked').length;
  
  res.json({
    totalAmount,
    paidAmount,
    unpaidAmount,
    collectionRate,
    totalBills: monthBills.length,
    paidBills: monthBills.filter(b => b.status === 'paid').length,
    unpaidBills: monthBills.filter(b => b.status === 'unpaid').length,
    overdueCount,
    lockedCount,
    totalLateFee: monthBills.reduce((sum, b) => sum + b.lateFee, 0),
  });
});

router.post('/generate-monthly-bills', async (req: AuthRequest, res: Response): Promise<void> => {
  const { month } = req.body;
  
  const occupiedShops = shops.filter(s => s.status === 'occupied' && s.brandName);
  const newBills = [];
  
  for (const shop of occupiedShops) {
    const dueDate = new Date(`${month}-15`);
    const isFixed = Math.random() > 0.5;
    
    const baseRent = Math.floor(Math.random() * 150000) + 50000;
    const salesAmount = isFixed ? null : Math.floor(Math.random() * 3000000) + 500000;
    const percentageRate = 0.08 + Math.random() * 0.07;
    const percentageRent = salesAmount ? Math.round(salesAmount * percentageRate) : null;
    
    const rentType: 'fixed' | 'percentage' = isFixed ? 'fixed' : 'percentage';
    const bill = {
      id: generateId(),
      shopId: shop.id,
      shopName: shop.brandName!,
      billMonth: month,
      rentType,
      baseRent,
      salesAmount,
      percentageRent,
      totalAmount: isFixed ? baseRent : Math.max(baseRent, percentageRent!),
      dueDate: dueDate.toISOString().split('T')[0],
      paidAt: null,
      overdueDays: 0,
      lateFee: 0,
      status: 'unpaid' as const,
      accessLocked: false,
      createdAt: new Date().toISOString(),
    };
    
    newBills.push(bill);
    rentBills.push(bill);
  }
  
  res.json({
    message: `成功生成${newBills.length}条账单`,
    bills: newBills,
  });
});

export default router;
