import request from 'supertest'
import { hash } from 'bcrypt'
import { app } from '@/app'
import { prisma } from './prisma'
import { userFactory, supplierFactory } from './factories'

export async function authenticateAsUser(overrides: Partial<typeof userFactory> = {}) {
  const data = { ...userFactory, ...overrides }
  await request(app).post('/users').send(data)
  const res = await request(app).post('/sessions').send({ email: data.email, password: data.password })
  return { token: res.body.token as string, account: res.body.account }
}

export async function authenticateAsSupplier(overrides: Partial<typeof supplierFactory> = {}) {
  const data = { ...supplierFactory, ...overrides }
  await request(app).post('/suppliers').send(data)
  const res = await request(app).post('/sessions').send({ email: data.email, password: data.password })
  const token = res.body.token as string
  const account = res.body.account

  const { token: adminToken } = await authenticateAsAdmin()
  const { body: plan } = await request(app)
    .post('/admin/supplier-plans')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Plano Básico', description: 'Plano de acesso à plataforma', price: 99 })
  await request(app)
    .patch(`/admin/suppliers/${account.id}/plan`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ planId: plan.id })

  return { token, account }
}

export async function authenticateAsAdmin() {
  const passwordHash = await hash('Admin@1234', 8)
  await prisma.admin.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: { name: 'Test Admin', email: 'admin@test.com', passwordHash },
  })
  const res = await request(app).post('/sessions').send({ email: 'admin@test.com', password: 'Admin@1234' })
  return { token: res.body.token as string, account: res.body.account }
}
