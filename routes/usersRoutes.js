import { Router } from 'express';
import UsersController from '../controllers/UsersController.js';


const usersRoutes = Router();


usersRoutes.post('/users', UsersController.postNew);


export default usersRoutes;
