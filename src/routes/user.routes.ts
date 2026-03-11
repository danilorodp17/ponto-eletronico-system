import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authenticate, requireAdmin, requireManagerOrAdmin } from '../middlewares/auth.middleware'

const router = Router()
const userController = new UserController()

router.use(authenticate)

router.get('/', requireManagerOrAdmin, (req, res) => userController.getAll(req, res))
router.get('/:id', (req, res) => userController.getById(req, res))
router.put('/:id', (req, res) => userController.update(req, res))
router.delete('/:id', requireAdmin, (req, res) => userController.deactivate(req, res))

export default router
