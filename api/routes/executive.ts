import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  executiveMetrics, rentAdjustments, generateId, messages, rentBills,
  floors, zones, shops
} from '../data/mockData';
import { RentAdjustment } from '../../shared/types';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('executive'));

router.get('/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(executiveMetrics);
});

router.get('/heatmap', async (req: AuthRequest, res: Response): Promise<void> => {
  const { type = 'efficiency' } = req.query;
  
  const heatmapData = floors.map(floor => {
    const floorZones = zones.filter(z => z.floorNumber === floor.number);
    
    const zoneData = floorZones.map(zone => {
      const zoneShops = shops.filter(s => s.zoneId === zone.id);
      const occupiedShops = zoneShops.filter(s => s.status === 'occupied');
      const vacancyRate = zoneShops.length > 0 
        ? Math.round(((zoneShops.length - occupiedShops.length) / zoneShops.length) * 1000) / 10 
        : 0;
      
      let value = 0;
      if (type === 'efficiency') {
        value = occupiedShops.length * 100 + Math.floor(Math.random() * 50);
      } else if (type === 'conversion') {
        value = 50 + Math.floor(Math.random() * 40);
      } else if (type === 'churn') {
        value = vacancyRate;
      }
      
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        value,
        shopCount: zoneShops.length,
        occupiedCount: occupiedShops.length,
      };
    });
    
    return {
      floor: floor.number,
      floorName: floor.name,
      positioning: floor.positioning,
      zones: zoneData,
    };
  });
  
  res.json(heatmapData);
});

router.get('/comparison', async (req: AuthRequest, res: Response): Promise<void> => {
  const comparisonData = executiveMetrics.floorEfficiency.map(item => {
    const conversion = executiveMetrics.conversionRate.find(c => c.floor === item.floor);
    const churn = executiveMetrics.churnRate.find(c => c.floor === item.floor);
    
    return {
      floor: item.floor,
      floorName: item.floorName,
      efficiency: item.efficiency,
      conversionRate: conversion?.rate || 0,
      churnRate: churn?.rate || 0,
    };
  });
  
  res.json(comparisonData);
});

router.get('/rent-adjustments', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = [...rentAdjustments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(result);
});

router.post('/rent-adjustments', async (req: AuthRequest, res: Response): Promise<void> => {
  const { floor, zone, coefficient, effectiveDate } = req.body;
  
  if (!floor || !zone || !coefficient || !effectiveDate) {
    res.status(400).json({ error: '请填写完整信息' });
    return;
  }
  
  if (coefficient < 0.5 || coefficient > 2) {
    res.status(400).json({ error: '调整系数应在0.5到2之间' });
    return;
  }
  
  const newAdjustment: RentAdjustment = {
    id: generateId(),
    floor,
    zone,
    coefficient,
    effectiveDate,
    createdBy: req.user!.id,
    createdAt: new Date().toISOString(),
  };
  
  rentAdjustments.push(newAdjustment);
  
  const affectedBills = rentBills.filter(b => {
    const shop = shops.find(s => s.id === b.shopId);
    if (!shop) return false;
    const shopZone = zones.find(z => z.id === shop.zoneId);
    return shopZone?.floorNumber === floor && (zone === '全部' || shopZone?.name === zone);
  });
  
  affectedBills.forEach(bill => {
    bill.baseRent = Math.round(bill.baseRent * coefficient);
    bill.totalAmount = Math.round(bill.totalAmount * coefficient);
  });
  
  const floorInfo = floors.find(f => f.number === floor);
  const newMessage = {
    id: generateId(),
    recipientId: 'u3',
    recipientName: '王会计',
    type: 'finance',
    title: `租金调整通知`,
    content: `${floorInfo?.name} ${zone}租金调整系数已设置为${coefficient}，生效日期：${effectiveDate}。`,
    relatedId: newAdjustment.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.status(201).json(newAdjustment);
});

router.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  const totalShops = shops.length;
  const occupiedShops = shops.filter(s => s.status === 'occupied').length;
  const vacantShops = shops.filter(s => s.status === 'vacant').length;
  const occupancyRate = totalShops > 0 ? Math.round((occupiedShops / totalShops) * 1000) / 10 : 0;
  
  const totalRent = rentBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const paidRent = rentBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
  const collectionRate = totalRent > 0 ? Math.round((paidRent / totalRent) * 1000) / 10 : 0;
  
  const pendingApps = shops.filter(s => s.status === 'under_renovation').length;
  const overdueBills = rentBills.filter(b => b.status === 'overdue' || b.status === 'locked').length;
  
  const revenueByFloor = floors.map(floor => {
    const floorZones = zones.filter(z => z.floorNumber === floor.number);
    const floorShops = floorZones.flatMap(z => shops.filter(s => s.zoneId === z.id));
    const floorBills = rentBills.filter(b => floorShops.some(s => s.id === b.shopId));
    const revenue = floorBills.reduce((sum, b) => sum + b.totalAmount, 0);
    const efficiency = floor.totalArea > 0 ? Math.round(revenue / floor.totalArea * 100) / 100 : 0;
    
    return {
      floor: floor.number,
      floorName: floor.name,
      revenue,
      efficiency,
      shopCount: floorShops.length,
      occupiedCount: floorShops.filter(s => s.status === 'occupied').length,
    };
  });
  
  res.json({
    totalShops,
    occupiedShops,
    vacantShops,
    occupancyRate,
    totalRent,
    paidRent,
    collectionRate,
    pendingApps,
    overdueBills,
    revenueByFloor,
    monthOverMonth: {
      revenue: 8.5,
      passenger: 12.3,
      conversion: -2.1,
    },
  });
});

export default router;
