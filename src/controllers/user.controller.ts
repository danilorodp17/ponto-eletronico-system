import { Request, Response } from 'express'
import { UserService } from '../services/user.service'

const userService = new UserService()

export class UserController {
  async getAll(_req: Request, res: Response) {
    try {
      const users = await userService.getAll()
      return res.json(users)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await userService.getById(req.params.id)
      return res.json(user)
    } catch (error: any) {
      return res.status(404).json({ error: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await userService.update(req.params.id, req.body)
      return res.json(user)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      await userService.deactivate(req.params.id)
      return res.json({ message: 'Usuário desativado com sucesso' })
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }
}
