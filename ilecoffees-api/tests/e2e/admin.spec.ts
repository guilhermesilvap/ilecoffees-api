import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory, coffeePackageFactory } from '../helpers/factories'
import { authenticateAsAdmin, authenticateAsUser, authenticateAsSupplier } from '../helpers/authenticate'

describe('POST /admin (criar admin)', () => {
  it('cria um novo admin quando autenticado como admin', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .post('/admin')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Segundo Admin', email: 'admin2@test.com', password: 'Admin@1234' })

    expect(res.status).toBe(201)
  })

  it('retorna 403 para usuário comum', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/admin')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Admin', email: 'admin2@test.com', password: 'Admin@1234' })

    expect(res.status).toBe(403)
  })
})

describe('GET /admin/users', () => {
  it('lista todos os usuários', async () => {
    await authenticateAsUser()
    const { token } = await authenticateAsAdmin()

    const res = await request(app).get('/admin/users').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

describe('DELETE /admin/users/:id', () => {
  it('deleta um usuário', async () => {
    const { account } = await authenticateAsUser()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .delete(`/admin/users/${account.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})

describe('GET /admin/suppliers', () => {
  it('lista todos os fornecedores', async () => {
    await authenticateAsSupplier()
    const { token } = await authenticateAsAdmin()

    const res = await request(app).get('/admin/suppliers').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('DELETE /admin/suppliers/:id', () => {
  it('deleta um fornecedor', async () => {
    const { account } = await authenticateAsSupplier()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .delete(`/admin/suppliers/${account.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})

describe('DELETE /admin/coffees/:id', () => {
  it('admin deleta um café', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    const { token } = await authenticateAsAdmin()
    const res = await request(app)
      .delete(`/admin/coffees/${coffee.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})

describe('DELETE /admin/subscriptions/:id', () => {
  it('admin deleta uma assinatura', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeePackageFactory)

    const { body: subscription } = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ name: 'Plano', description: 'Descrição do plano', monthlyPrice: 9900, annualPrice: 99000, coffeeIds: [coffee.id] })

    const { token } = await authenticateAsAdmin()
    const res = await request(app)
      .delete(`/admin/subscriptions/${subscription.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})

describe('GET /admin/orders', () => {
  it('lista todos os pedidos', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    const { token: userToken } = await authenticateAsUser()
    await request(app).post('/cart/items').set('Authorization', `Bearer ${userToken}`).send({ coffeeId: coffee.id, quantity: 1 })
    await request(app).post('/orders').set('Authorization', `Bearer ${userToken}`)

    const { token } = await authenticateAsAdmin()
    const res = await request(app).get('/admin/orders').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

describe('PATCH /admin/orders/:id/status', () => {
  it('atualiza o status de um pedido', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    const { token: userToken } = await authenticateAsUser()
    await request(app).post('/cart/items').set('Authorization', `Bearer ${userToken}`).send({ coffeeId: coffee.id, quantity: 1 })
    const { body: orders } = await request(app).post('/orders').set('Authorization', `Bearer ${userToken}`)

    const { token } = await authenticateAsAdmin()
    const res = await request(app)
      .patch(`/admin/orders/${orders[0].id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'SHIPPED' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('SHIPPED')
  })
})
