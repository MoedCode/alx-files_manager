import { Router } from 'express';
import AppController from '../controllers/AppController';


const statusRouter = Router();


statusRouter.get('/status', AppController.getStatus);
statusRouter.get('/stats', AppController.getStats);

export default statusRouter;