import { Router } from 'express';
import AppController from '../controllers/AppController.js';
import FilesController from '../controllers/FilesController.js';

const statusRouter = Router();

statusRouter.get('/status', AppController.getStatus);
statusRouter.get('/stats', AppController.getStats);

statusRouter.post('/files', FilesController.postUpload);
statusRouter.get('/files/:id', FilesController.getShow);
statusRouter.get('/files', FilesController.getIndex);

export default statusRouter;
