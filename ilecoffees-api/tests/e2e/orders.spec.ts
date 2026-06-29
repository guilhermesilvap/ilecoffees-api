import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory, coffeePackageFactory } from '../helpers/factories'
import { authenticateAsUser, authenticateAsSupplier } from '../helpers/authenticate'

async function setupOrder() {
  const { token: supplierToken } = await authenticateAsSupplier()
  const { body: coffee } = await request(app)
    .post('/coffees')
    .set('Authorization', `Bearer ${supplierToken}`)
    .send(coffeeFactory)

  const { token: userToken, account } = await authenticateAsUser()
  await request(app).post('/cart/items').set('Authorization', `Bearer ${userToken}`).send({ coffeeId: coffee.id, quantity: 1 })

  const { body: orders } = await request(app).post('/orders').set('Authorization', `Bearer ${userToken}`)
  return { userToken, order: orders[0], userId: account.id, coffee }
}

describe('POST /orders', () => {
  it('cria pedidos a partir do carrinho', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    const { token } = await authenticateAsUser()
    await request(app).post('/cart/items').set('Authorization', `Bearer ${token}`).send({ coffeeId: coffee.id, quantity: 1 })

    const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(201)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].type).toBe('ONE_TIME')
  })

  it('cria pedidos com informações de frete', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    const { token } = await authenticateAsUser()
    await request(app).post('/cart/items').set('Authorization', `Bearer ${token}`).send({ coffeeId: coffee.id, quantity: 1 })

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deliveryCep: '01310100',
        shippingChoices: [{ supplierId: coffee.supplierId, carrier: 'Jadlog', shippingCost: 14.2, deadlineDays: 4 }],
      })

    expect(res.status).toBe(201)
    expect(res.body[0].deliveryCep).toBe('01310100')
    expect(res.body[0].shippingCarrier).toBe('Jadlog')
    expect(res.body[0].shippingCost).toBe(14.2)
    expect(res.body[0].shippingDeadlineDays).toBe(4)
  })

  it('retorna 400 com carrinho vazio', async () => {
    const { token } = await authenticateAsUser()
    const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })

  it('retorna 403 quando fornecedor tenta criar pedido', async () => {
    const { token } = await authenticateAsSupplier()
    const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })
})

describe('GET /orders', () => {
  it('lista os pedidos do usuário autenticado', async () => {
    const { userToken } = await setupOrder()
    const res = await request(app).get('/orders').set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('GET /orders/:id', () => {
  it('retorna um pedido pelo id', async () => {
    const { userToken, order } = await setupOrder()
    const res = await request(app).get(`/orders/${order.id}`).set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(order.id)
  })

  it('retorna 403 quando outro usuário tenta acessar o pedido', async () => {
    const { order } = await setupOrder()
    const { token: otherToken } = await authenticateAsUser({ email: 'outro@test.com' })
    const res = await request(app).get(`/orders/${order.id}`).set('Authorization', `Bearer ${otherToken}`)
    expect(res.status).toBe(403)
  })
})

describe('PATCH /orders/:id/cancel', () => {
  it('cancela um pedido pendente', async () => {
    const { userToken, order } = await setupOrder()
    const res = await request(app).patch(`/orders/${order.id}/cancel`).set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELED')
  })

  it('retorna 400 ao cancelar pedido não-pendente', async () => {
    const { userToken, order } = await setupOrder()
    await request(app).patch(`/orders/${order.id}/cancel`).set('Authorization', `Bearer ${userToken}`)
    const res = await request(app).patch(`/orders/${order.id}/cancel`).set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(400)
  })

  it('retorna 403 quando outro usuário tenta cancelar', async () => {
    const { order } = await setupOrder()
    const { token: otherToken } = await authenticateAsUser({ email: 'outro@test.com' })
    const res = await request(app).patch(`/orders/${order.id}/cancel`).set('Authorization', `Bearer ${otherToken}`)
    expect(res.status).toBe(403)
  })

  it('retorna 404 para pedido inexistente', async () => {
    const { token } = await authenticateAsUser()
    const res = await request(app)
      .patch('/orders/00000000-0000-0000-0000-000000000000/cancel')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})

describe('POST /orders/subscribe', () => {
  it('cria pedido de assinatura', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeePackageFactory)

    const { body: subscription } = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ name: 'Plano', description: 'Descrição do plano', monthlyPrice: 9900, annualPrice: 99000, coffeeIds: [coffee.id] })

    const { token } = await authenticateAsUser()
    const res = await request(app)
      .post('/orders/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscriptionId: subscription.id, billingCycle: 'MONTHLY' })

    expect(res.status).toBe(201)
    expect(res.body.type).toBe('SUBSCRIPTION')
  })

  it('retorna 400 se já tiver assinatura ativa', async () => {
    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeePackageFactory)

    const { body: subscription } = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({ name: 'Plano', description: 'Descrição do plano', monthlyPrice: 9900, annualPrice: 99000, coffeeIds: [coffee.id] })

    const { token } = await authenticateAsUser()
    await request(app)
      .post('/orders/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscriptionId: subscription.id, billingCycle: 'MONTHLY' })

    const res = await request(app)
      .post('/orders/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscriptionId: subscription.id, billingCycle: 'MONTHLY' })

    expect(res.status).toBe(400)
  })

  it('retorna 404 para assinatura inexistente', async () => {
    const { token } = await authenticateAsUser()
    const res = await request(app)
      .post('/orders/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ subscriptionId: '00000000-0000-0000-0000-000000000000', billingCycle: 'MONTHLY' })
    expect(res.status).toBe(404)
  })
})
