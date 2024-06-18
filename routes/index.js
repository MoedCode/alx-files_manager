import { Router } from 'express';
import statusRoutes from './status.js';

const router = Router();

router.use(statusRoutes)

export default router