import prisma from '../prisma'

export class UserService {
  async getAll() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, department: true, position: true, isActive: true, createdAt: true }
    })
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, department: true, position: true, isActive: true, createdAt: true }
    })
    if (!user) throw new Error('Usuário não encontrado')
    return user
  }

  async update(id: string, data: { name?: string; department?: string; position?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, department: true, position: true }
    })
  }

  async deactivate(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
  }
}
