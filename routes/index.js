import { Router } from 'express';
import statusRoutes from './status.js';
import usersRoutes from './usersRoutes.js';
i;
const router = Router();

router.use(statusRoutes);
router.use(usersRoutes);

export default router;
