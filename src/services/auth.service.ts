import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email já cadastrado')

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    return user
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) throw new Error('Credenciais inválidas')

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Credenciais inválidas')

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }
  }
}
