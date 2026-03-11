import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import timeRecordRoutes from './routes/timeRecord.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json())

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/time-records', timeRecordRoutes)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})

export default app
