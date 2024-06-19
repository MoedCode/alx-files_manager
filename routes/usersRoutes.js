import { Router } from 'express';
import UsersController from '../controllers/UsersController.js';

const usersRoutes = Router();

usersRoutes.post('/users', UsersController.postNew);
usersRoutes.get('/users/me', UsersController.getMe);

usersRoutes.get('/connect', AuthController.getConnect);
usersRoutes.get('/disconnect', AuthController.getDisconnect);

export default usersRoutes;
