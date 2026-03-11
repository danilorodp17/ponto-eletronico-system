import { Request, Response } from 'express'
import { TimeRecordService } from '../services/timeRecord.service'
import { RecordType } from '@prisma/client'

const service = new TimeRecordService()

export class TimeRecordController {
  async punch(req: Request, res: Response) {
    try {
      const userId = req.user!.userId
      const { type, latitude, longitude } = req.body

      if (!type || !['ENTRY', 'EXIT'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser ENTRY ou EXIT' })
      }

      const record = await service.punch(userId, type as RecordType, latitude, longitude)
      return res.status(201).json(record)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.userId
      const { startDate, endDate } = req.query

      const records = await service.getUserHistory(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      )
      return res.json(records)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }

  async getDailyHours(req: Request, res: Response) {
    try {
      const userId = req.user!.userId
      const date = req.query.date ? new Date(req.query.date as string) : new Date()
      const hours = await service.calculateDailyHours(userId, date)
      return res.json(hours)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }

  async getAllToday(req: Request, res: Response) {
    try {
      const records = await service.getAllUsersToday()
      return res.json(records)
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  }
}
