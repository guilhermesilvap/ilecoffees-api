import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory } from '../helpers/factories'
import { authenticateAsSupplier, authenticateAsUser } from '../helpers/authenticate'

describe('POST /coffees', () => {
  it('cria um café como fornecedor', async () => {
    const { token } = await authenticateAsSupplier()

    const res = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${token}`)
      .send(coffeeFactory)

    expect(res.status).toBe(201)
    expect(res.body.name).toBe(coffeeFactory.name)
  })

  it('retorna 403 quando usuário tenta criar café', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${token}`)
      .send(coffeeFactory)

    expect(res.status).toBe(403)
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).post('/coffees').send(coffeeFactory)
    expect(res.status).toBe(401)
  })
})

describe('GET /coffees', () => {
  it('lista os cafés', async () => {
    const { token } = await authenticateAsSupplier()
    await request(app).post('/coffees').set('Authorization', `Bearer ${token}`).send(coffeeFactory)

    const res = await request(app).get('/coffees').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

describe('PUT /coffees/:id', () => {
  it('atualiza um café como fornecedor', async () => {
    const { token } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${token}`)
      .send(coffeeFactory)

    const res = await request(app)
      .put(`/coffees/${coffee.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Café Atualizado' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Café Atualizado')
  })
})

describe('DELETE /coffees/:id', () => {
  it('deleta um café como fornecedor', async () => {
    const { token } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${token}`)
      .send(coffeeFactory)

    const res = await request(app)
      .delete(`/coffees/${coffee.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})
