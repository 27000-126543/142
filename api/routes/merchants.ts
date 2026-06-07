import { Router, Response } from 'express';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  applications, shops, zones, floors, contracts, generateId, messages, users
} from '../data/mockData';
import { Application, Contract } from '../../shared/types';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('merchant', 'executive'));

router.get('/applications', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  let result = [...applications];
  
  if (status && status !== 'all') {
    result = result.filter(a => a.status === status);
  }
  
  result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  
  res.json(result);
});

router.get('/applications/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const application = applications.find(a => a.id === req.params.id);
  
  if (!application) {
    res.status(404).json({ error: '申请不存在' });
    return;
  }
  
  res.json(application);
});

router.post('/applications/:id/approve', async (req: AuthRequest, res: Response): Promise<void> => {
  const { reviewNote } = req.body;
  const application = applications.find(a => a.id === req.params.id);
  
  if (!application) {
    res.status(404).json({ error: '申请不存在' });
    return;
  }
  
  application.status = 'approved';
  application.reviewerId = req.user!.id;
  application.reviewerName = req.user!.name;
  application.reviewNote = reviewNote || '审核通过';
  application.reviewedAt = new Date().toISOString();
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u1',
    recipientName: '张经理',
    type: 'application',
    title: `入驻申请已通过 - ${application.brandName}`,
    content: `${application.brandName}的入驻申请已通过，请生成电子合同。`,
    relatedId: application.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(application);
});

router.post('/applications/:id/reject', async (req: AuthRequest, res: Response): Promise<void> => {
  const { reviewNote } = req.body;
  const application = applications.find(a => a.id === req.params.id);
  
  if (!application) {
    res.status(404).json({ error: '申请不存在' });
    return;
  }
  
  application.status = 'rejected';
  application.reviewerId = req.user!.id;
  application.reviewerName = req.user!.name;
  application.reviewNote = reviewNote || '审核未通过';
  application.reviewedAt = new Date().toISOString();
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u1',
    recipientName: '张经理',
    type: 'application',
    title: `入驻申请已拒绝 - ${application.brandName}`,
    content: `${application.brandName}的入驻申请已被拒绝。审核意见：${reviewNote || '审核未通过'}。`,
    relatedId: application.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(application);
});

router.get('/recommendations/:applicationId', async (req: AuthRequest, res: Response): Promise<void> => {
  const application = applications.find(a => a.id === req.params.applicationId);
  
  if (!application) {
    res.status(404).json({ error: '申请不存在' });
    return;
  }

  const vacantShops = shops.filter(s => s.status === 'vacant');
  
  const recommendations = vacantShops.map(shop => {
    const zone = zones.find(z => z.id === shop.zoneId);
    const floor = floors.find(f => f.number === zone?.floorNumber);
    
    let score = 0;
    const reasons: string[] = [];
    
    const areaDiff = Math.abs(shop.area - application.requiredArea);
    if (areaDiff <= 10) {
      score += 40;
      reasons.push('面积高度匹配');
    } else if (areaDiff <= 30) {
      score += 25;
      reasons.push('面积基本匹配');
    }
    
    if (application.preferredFloor && floor?.number === application.preferredFloor) {
      score += 30;
      reasons.push('符合品牌方首选楼层');
    }
    
    if (application.brandType.includes('餐饮') && floor?.number === 4) {
      score += 35;
      reasons.push('符合餐饮层业态定位');
    } else if (application.brandType.includes('零售') && floor && floor.number >= 1 && floor.number <= 3) {
      score += 30;
      reasons.push('符合零售层业态定位');
    } else if (application.brandType.includes('数码') && (floor?.number === 1 || floor?.number === -1)) {
      score += 35;
      reasons.push('符合数码/精品区定位');
    } else if (application.brandType.includes('娱乐') && floor?.number === 5) {
      score += 35;
      reasons.push('符合娱乐层业态定位');
    }
    
    if (zone?.name === 'A区') {
      score += 15;
      reasons.push('位于A区核心位置');
    } else if (zone?.name === 'B区') {
      score += 10;
      reasons.push('位于B区次核心位置');
    }
    
    return {
      floor: floor?.number,
      floorName: floor?.name,
      zone: zone?.name,
      zoneId: zone?.id,
      shopNumber: shop.shopNumber,
      shopId: shop.id,
      area: shop.area,
      requiredArea: application.requiredArea,
      score,
      reason: reasons.join('；'),
    };
  });
  
  recommendations.sort((a, b) => b.score - a.score);
  
  res.json(recommendations.slice(0, 5));
});

router.get('/contracts', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  let result = [...contracts];
  
  if (status && status !== 'all') {
    result = result.filter(c => c.status === status);
  }
  
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(result);
});

router.get('/contracts/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const contract = contracts.find(c => c.id === req.params.id);
  
  if (!contract) {
    res.status(404).json({ error: '合同不存在' });
    return;
  }
  
  res.json(contract);
});

router.post('/contracts', async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    applicationId, shopId, rentMode, rentFreeMonths,
    fixedRentAmount, percentageRate, contractTermMonths, startDate
  } = req.body;
  
  const application = applications.find(a => a.id === applicationId);
  const shop = shops.find(s => s.id === shopId);
  
  if (!application || !shop) {
    res.status(400).json({ error: '申请或铺位不存在' });
    return;
  }
  
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + contractTermMonths);
  
  const newContract: Contract = {
    id: generateId(),
    applicationId,
    shopId,
    shopNumber: shop.shopNumber,
    brandName: application.brandName,
    rentMode,
    rentFreeMonths,
    fixedRentAmount,
    percentageRate,
    contractTermMonths,
    startDate: startDate,
    endDate: end.toISOString().split('T')[0],
    signedAt: null,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  
  contracts.push(newContract);
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u1',
    recipientName: '张经理',
    type: 'contract',
    title: `合同待签署 - ${application.brandName}`,
    content: `${application.brandName}的电子合同已生成，请通知品牌方签署。`,
    relatedId: newContract.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.status(201).json(newContract);
});

router.post('/contracts/:id/sign', async (req: AuthRequest, res: Response): Promise<void> => {
  const contract = contracts.find(c => c.id === req.params.id);
  
  if (!contract) {
    res.status(404).json({ error: '合同不存在' });
    return;
  }
  
  contract.status = 'signed';
  contract.signedAt = new Date().toISOString();
  
  const shop = shops.find(s => s.id === contract.shopId);
  const application = applications.find(a => a.id === contract.applicationId);
  
  if (shop && application) {
    shop.status = 'occupied';
    shop.brandId = application.brandId;
    shop.brandName = application.brandName;
  }
  
  const newMessage = {
    id: generateId(),
    recipientId: 'u1',
    recipientName: '张经理',
    type: 'contract',
    title: `合同已签署 - ${contract.brandName}`,
    content: `${contract.brandName}的电子合同已签署，租期${contract.contractTermMonths}个月，免租期${contract.rentFreeMonths}个月。`,
    relatedId: contract.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  
  res.json(contract);
});

export default router;
