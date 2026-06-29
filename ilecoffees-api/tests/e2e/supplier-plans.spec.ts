import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory } from '../helpers/factories'
import { authenticateAsAdmin, authenticateAsSupplier } from '../helpers/authenticate'

const planFactory = {
  name: 'Plano Premium',
  description: 'Acesso completo à plataforma',
  price: 199,
}

async function setupPlan() {
  const { token: adminToken } = await authenticateAsAdmin()
  const { body: plan } = await request(app)
    .post('/admin/supplier-plans')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(planFactory)
  return { adminToken, plan }
}

describe('POST /admin/supplier-plans', () => {
  it('admin cria um plano', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .post('/admin/supplier-plans')
      .set('Authorization', `Bearer ${token}`)
      .send(planFactory)

    expect(res.status).toBe(201)
    expect(res.body.name).toBe(planFactory.name)
    expect(res.body.price).toBe(planFactory.price)
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).post('/admin/supplier-plans').send(planFactory)
    expect(res.status).toBe(401)
  })
})

describe('GET /admin/supplier-plans', () => {
  it('lista os planos como admin', async () => {
    const { adminToken } = await setupPlan()

    const res = await request(app)
      .get('/admin/supplier-plans')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

describe('GET /supplier-plans', () => {
  it('fornecedor pode listar os planos disponíveis', async () => {
    await setupPlan()
    const { token } = await authenticateAsSupplier()

    const res = await request(app).get('/supplier-plans').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('PUT /admin/supplier-plans/:id', () => {
  it('admin atualiza um plano', async () => {
    const { adminToken, plan } = await setupPlan()

    const res = await request(app)
      .put(`/admin/supplier-plans/${plan.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Plano Atualizado' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Plano Atualizado')
  })

  it('retorna 404 para plano inexistente', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .put('/admin/supplier-plans/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Plano Inexistente' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /admin/supplier-plans/:id', () => {
  it('admin deleta um plano', async () => {
    const { adminToken, plan } = await setupPlan()

    const res = await request(app)
      .delete(`/admin/supplier-plans/${plan.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(204)
  })
})

describe('PATCH /admin/suppliers/:id/plan', () => {
  it('admin atribui um plano a um fornecedor', async () => {
    const { account } = await authenticateAsSupplier()
    const { adminToken, plan } = await setupPlan()

    const res = await request(app)
      .patch(`/admin/suppliers/${account.id}/plan`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ planId: plan.id })

    expect(res.status).toBe(200)
    expect(res.body.planId).toBe(plan.id)
  })

  it('admin remove plano de um fornecedor (planId: null)', async () => {
    const { account } = await authenticateAsSupplier()
    const { adminToken } = await setupPlan()

    const res = await request(app)
      .patch(`/admin/suppliers/${account.id}/plan`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ planId: null })

    expect(res.status).toBe(200)
    expect(res.body.planId).toBeNull()
  })

  it('retorna 404 para plano inexistente', async () => {
    const { account } = await authenticateAsSupplier()
    const { token: adminToken } = await authenticateAsAdmin()

    const res = await request(app)
      .patch(`/admin/suppliers/${account.id}/plan`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ planId: '00000000-0000-0000-0000-000000000000' })

    expect(res.status).toBe(404)
  })
})

describe('PATCH /admin/suppliers/:id/status', () => {
  it('admin desativa um fornecedor', async () => {
    const { account } = await authenticateAsSupplier()
    const { token: adminToken } = await authenticateAsAdmin()

    const res = await request(app)
      .patch(`/admin/suppliers/${account.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(false)
  })

  it('admin reativa um fornecedor', async () => {
    const { account } = await authenticateAsSupplier()
    const { token: adminToken } = await authenticateAsAdmin()

    await request(app)
      .patch(`/admin/suppliers/${account.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    const res = await request(app)
      .patch(`/admin/suppliers/${account.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true })

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(true)
  })

  it('retorna 404 para fornecedor inexistente', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .patch('/admin/suppliers/00000000-0000-0000-0000-000000000000/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false })

    expect(res.status).toBe(404)
  })
})

describe('Enforcement de plano na criação de cafés', () => {
  it('retorna 403 quando fornecedor sem plano tenta criar café', async () => {
    const { token: adminToken } = await authenticateAsAdmin()
    const { token: supplierToken, account } = await authenticateAsSupplier()

    await request(app)
      .patch(`/admin/suppliers/${account.id}/plan`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ planId: null })

    const res = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    expect(res.status).toBe(403)
  })

  it('retorna 403 quando fornecedor desativado tenta criar café', async () => {
    const { token: supplierToken, account } = await authenticateAsSupplier()
    const { token: adminToken } = await authenticateAsAdmin()

    await request(app)
      .patch(`/admin/suppliers/${account.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    const res = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    expect(res.status).toBe(403)
  })
})
