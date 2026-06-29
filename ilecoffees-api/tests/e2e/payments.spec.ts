import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory, courseFactory } from '../helpers/factories'
import { authenticateAsUser, authenticateAsSupplier, authenticateAsAdmin } from '../helpers/authenticate'

async function setupOrderForPayment() {
  const { token: supplierToken } = await authenticateAsSupplier()
  const { body: coffee } = await request(app)
    .post('/coffees')
    .set('Authorization', `Bearer ${supplierToken}`)
    .send(coffeeFactory)

  const { token: userToken } = await authenticateAsUser()
  await request(app).post('/cart/items').set('Authorization', `Bearer ${userToken}`).send({ coffeeId: coffee.id, quantity: 1 })

  const { body: orders } = await request(app).post('/orders').set('Authorization', `Bearer ${userToken}`)
  return { userToken, order: orders[0] }
}

describe('POST /payments', () => {
  it('cria um pagamento para um pedido', async () => {
    const { userToken, order } = await setupOrderForPayment()

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderId: order.id, method: 'PIX' })

    expect(res.status).toBe(201)
    expect(res.body.method).toBe('PIX')
    expect(res.body.status).toBe('SUCCESS')
  })

  it('retorna 404 para pedido inexistente', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderId: '00000000-0000-0000-0000-000000000000', method: 'PIX' })

    expect(res.status).toBe(404)
  })

  it('retorna 403 ao tentar pagar pedido de outro usuário', async () => {
    const { order } = await setupOrderForPayment()
    const { token: otherToken } = await authenticateAsUser({ email: 'outro@test.com' })

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ orderId: order.id, method: 'PIX' })

    expect(res.status).toBe(403)
  })

  it('retorna 400 ao tentar pagar pedido já processado', async () => {
    const { userToken, order } = await setupOrderForPayment()
    await request(app).post('/payments').set('Authorization', `Bearer ${userToken}`).send({ orderId: order.id, method: 'PIX' })

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderId: order.id, method: 'PIX' })

    expect(res.status).toBe(400)
  })

  it('pagamento de curso gera matrícula automática', async () => {
    const { token: adminToken } = await authenticateAsAdmin()
    const { body: course } = await request(app)
      .post('/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(courseFactory)

    const { token: userToken } = await authenticateAsUser()
    const { body: enrollment } = await request(app)
      .post(`/courses/${course.id}/enroll`)
      .set('Authorization', `Bearer ${userToken}`)

    await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderId: enrollment.orderId, method: 'PIX' })

    const res = await request(app).get('/courses/my-enrollments').set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.some((e: { courseId: string }) => e.courseId === course.id)).toBe(true)
  })
})

describe('GET /payments', () => {
  it('lista os pagamentos do usuário', async () => {
    const { userToken, order } = await setupOrderForPayment()
    await request(app).post('/payments').set('Authorization', `Bearer ${userToken}`).send({ orderId: order.id, method: 'PIX' })

    const res = await request(app).get('/payments').set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
  })
})
