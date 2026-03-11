import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
      }
      const user = await authService.register(name, email, password)
      return res.status(201).json(user)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' })
      }
      const result = await authService.login(email, password)
      return res.json(result)
    } catch (error: any) {
      return res.status(401).json({ error: error.message })
    }
  }

  async me(req: Request, res: Response) {
    try {
      return res.json({ user: req.user })
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }
}
