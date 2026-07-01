import {Router} from 'express';
import {UserController} from '../controllers/UserController';

// users API (CRUD)
const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', userController.create);
router.post('/login', userController.login);

// Routes with parameters
router.get('/:id', userController.findById);

export default router;