import { Router, Request, Response } from 'express';
import { users, passwordHash } from '../data/mockData';
import { generateToken } from '../middleware/auth';
import { LoginResponse } from '../../shared/types';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { role, username, password } = req.body;

  if (!role || !username || !password) {
    res.status(400).json({ error: '请填写完整的登录信息' });
    return;
  }

  const user = users.find(u => u.role === role && u.username === username);
  
  if (!user) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const expectedPassword = passwordHash[username];
  if (password !== expectedPassword) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const token = generateToken({ id: user.id, role: user.role, name: user.name });

  const response: LoginResponse = {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
    },
  };

  res.json(response);
});

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.json({ message: '登出成功' });
});

export default router;
