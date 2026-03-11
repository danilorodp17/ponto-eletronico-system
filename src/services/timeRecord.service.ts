import prisma from '../prisma'
import { RecordType } from '@prisma/client'

export class TimeRecordService {
  async punch(userId: string, type: RecordType, latitude?: number, longitude?: number) {
    const record = await prisma.timeRecord.create({
      data: { userId, type, latitude, longitude }
    })
    return record
  }

  async getUserHistory(userId: string, startDate?: Date, endDate?: Date) {
    const where: { userId: string; timestamp?: { gte: Date; lte: Date } } = { userId }

    if (startDate && endDate) {
      where.timestamp = { gte: startDate, lte: endDate }
    }

    return prisma.timeRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    })
  }

  async calculateDailyHours(userId: string, date: Date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const records = await prisma.timeRecord.findMany({
      where: { userId, timestamp: { gte: start, lte: end } },
      orderBy: { timestamp: 'asc' }
    })

    let totalMinutes = 0
    for (let i = 0; i < records.length - 1; i += 2) {
      if (records[i].type === 'ENTRY' && records[i + 1]?.type === 'EXIT') {
        const diff = records[i + 1].timestamp.getTime() - records[i].timestamp.getTime()
        totalMinutes += diff / 60000
      }
    }

    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: Math.floor(totalMinutes % 60),
      totalMinutes: Math.floor(totalMinutes)
    }
  }

  async getAllUsersToday() {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return prisma.timeRecord.findMany({
      where: { timestamp: { gte: start, lte: end } },
      include: { user: { select: { id: true, name: true, email: true, department: true } } },
      orderBy: { timestamp: 'desc' }
    })
  }
}
