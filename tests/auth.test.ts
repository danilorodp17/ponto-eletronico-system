import request from 'supertest'
import app from '../src/server'
import prisma from '../src/prisma'

beforeAll(async () => {
  await prisma.timeRecord.deleteMany()
  await prisma.justification.deleteMany()
  await prisma.workSchedule.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Auth Routes', () => {
  it('deve registrar um novo usuário', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'João Silva', email: 'joao@test.com', password: '123456' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('email', 'joao@test.com')
    expect(res.body).not.toHaveProperty('password')
  })

  it('não deve registrar email duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'João Silva', email: 'joao@test.com', password: '123456' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('deve fazer login com credenciais corretas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joao@test.com', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
  })

  it('deve rejeitar senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joao@test.com', password: 'senhaerrada' })

    expect(res.status).toBe(401)
  })

  it('deve rejeitar acesso a rota protegida sem token', async () => {
    const res = await request(app).get('/api/time-records/history')
    expect(res.status).toBe(401)
  })
})

describe('Time Record Routes', () => {
  let token: string

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joao@test.com', password: '123456' })
    token = res.body.token
  })

  it('deve registrar uma entrada', async () => {
    const res = await request(app)
      .post('/api/time-records/punch')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'ENTRY' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('type', 'ENTRY')
  })

  it('deve buscar histórico de pontos', async () => {
    const res = await request(app)
      .get('/api/time-records/history')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('deve calcular horas do dia', async () => {
    const res = await request(app)
      .get('/api/time-records/daily-hours')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('hours')
    expect(res.body).toHaveProperty('minutes')
  })
})
