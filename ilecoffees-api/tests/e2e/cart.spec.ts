import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory } from '../helpers/factories'
import { authenticateAsUser, authenticateAsSupplier } from '../helpers/authenticate'

async function setupCoffee(overrides?: Partial<typeof coffeeFactory>) {
  const { token: supplierToken } = await authenticateAsSupplier()
  const { body: coffee } = await request(app)
    .post('/coffees')
    .set('Authorization', `Bearer ${supplierToken}`)
    .send({ ...coffeeFactory, ...overrides })
  return coffee
}

describe('POST /cart/items', () => {
  it('adiciona um café ao carrinho', async () => {
    const coffee = await setupCoffee()
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ coffeeId: coffee.id, quantity: 2 })

    expect(res.status).toBe(201)
  })

  it('retorna 404 para café inexistente', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ coffeeId: '00000000-0000-0000-0000-000000000000', quantity: 1 })

    expect(res.status).toBe(404)
  })

  it('retorna 400 para quantidade zero', async () => {
    const coffee = await setupCoffee()
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ coffeeId: coffee.id, quantity: 0 })

    expect(res.status).toBe(400)
  })

  it('retorna 400 quando quantidade supera o estoque disponível', async () => {
    const coffee = await setupCoffee({ stock: 1 })
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ coffeeId: coffee.id, quantity: 5 })

    expect(res.status).toBe(400)
  })
})

describe('GET /cart', () => {
  it('lista os itens do carrinho do usuário', async () => {
    const coffee = await setupCoffee()
    const { token } = await authenticateAsUser()
    await request(app).post('/cart/items').set('Authorization', `Bearer ${token}`).send({ coffeeId: coffee.id, quantity: 1 })

    const res = await request(app).get('/cart').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
  })
})

describe('DELETE /cart/items/:coffeeId', () => {
  it('remove um item do carrinho', async () => {
    const coffee = await setupCoffee()
    const { token } = await authenticateAsUser()
    await request(app).post('/cart/items').set('Authorization', `Bearer ${token}`).send({ coffeeId: coffee.id, quantity: 1 })

    const res = await request(app)
      .delete(`/cart/items/${coffee.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})
