import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import merchantsRoutes from './routes/merchants.js';
import operationsRoutes from './routes/operations.js';
import financeRoutes from './routes/finance.js';
import propertyRoutes from './routes/property.js';
import executiveRoutes from './routes/executive.js';
import systemRoutes from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/merchants', merchantsRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/executive', executiveRoutes);
app.use('/api/system', systemRoutes);

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    });
  },
);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
    message: error.message,
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  });
});

export default app;
