import { Router } from 'express'
import { TimeRecordController } from '../controllers/timeRecord.controller'
import { authenticate, requireManagerOrAdmin } from '../middlewares/auth.middleware'

const router = Router()
const controller = new TimeRecordController()

// Todas as rotas exigem autenticação
router.use(authenticate)

router.post('/punch', (req, res) => controller.punch(req, res))
router.get('/history', (req, res) => controller.getHistory(req, res))
router.get('/daily-hours', (req, res) => controller.getDailyHours(req, res))

// Rota admin/manager: ver todos os registros de hoje
router.get('/today/all', requireManagerOrAdmin, (req, res) => controller.getAllToday(req, res))

export default router
