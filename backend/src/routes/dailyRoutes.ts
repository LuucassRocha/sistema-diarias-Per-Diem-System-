import { Router } from "express";
import { DailyController } from "../controllers/DailyController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const dailyController = new DailyController();

// All Per Diem routes (require authentication)
router.use(authMiddleware);

router.post('/preview', dailyController.preview)
router.post('/', dailyController.create);
router.get('/', dailyController.listByUser);
router.get('/:id', dailyController.findById);
router.patch('/:id/status', dailyController.updateStatus);
router.delete('/:id', dailyController.delete);

export default router;

