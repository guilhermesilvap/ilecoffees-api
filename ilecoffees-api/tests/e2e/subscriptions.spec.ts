import request from 'supertest'
import { app } from '@/app'
import { coffeePackageFactory } from '../helpers/factories'
import { authenticateAsSupplier } from '../helpers/authenticate'

async function createCoffeeAndSubscription() {
  const { token } = await authenticateAsSupplier()

  const { body: coffee } = await request(app)
    .post('/coffees')
    .set('Authorization', `Bearer ${token}`)
    .send(coffeePackageFactory)

  const subscriptionData = {
    name: 'Plano Mensal',
    description: 'Assinatura mensal de cafés especiais',
    monthlyPrice: 9900,
    annualPrice: 99000,
    coffeeIds: [coffee.id],
  }

  return { token, coffee, subscriptionData }
}

describe('POST /subscriptions', () => {
  it('cria uma assinatura como fornecedor', async () => {
    const { token, subscriptionData } = await createCoffeeAndSubscription()

    const res = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send(subscriptionData)

    expect(res.status).toBe(201)
    expect(res.body.name).toBe(subscriptionData.name)
  })
})

describe('GET /subscriptions', () => {
  it('lista as assinaturas', async () => {
    const { token, subscriptionData } = await createCoffeeAndSubscription()
    await request(app).post('/subscriptions').set('Authorization', `Bearer ${token}`).send(subscriptionData)

    const res = await request(app).get('/subscriptions').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

describe('PUT /subscriptions/:id', () => {
  it('atualiza uma assinatura', async () => {
    const { token, subscriptionData } = await createCoffeeAndSubscription()
    const { body: subscription } = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send(subscriptionData)

    const res = await request(app)
      .put(`/subscriptions/${subscription.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Plano Premium' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Plano Premium')
  })
})

describe('DELETE /subscriptions/:id', () => {
  it('deleta uma assinatura', async () => {
    const { token, subscriptionData } = await createCoffeeAndSubscription()
    const { body: subscription } = await request(app)
      .post('/subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .send(subscriptionData)

    const res = await request(app)
      .delete(`/subscriptions/${subscription.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})
