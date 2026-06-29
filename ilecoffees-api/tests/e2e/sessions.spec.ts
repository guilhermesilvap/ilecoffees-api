import request from 'supertest'
import { app } from '@/app'
import { userFactory, supplierFactory } from '../helpers/factories'

describe('POST /sessions', () => {
  it('autentica um usuário com credenciais válidas', async () => {
    await request(app).post('/users').send(userFactory)

    const res = await request(app).post('/sessions').send({
      email: userFactory.email,
      password: userFactory.password,
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.type).toBe('USER')
  })

  it('autentica um fornecedor com credenciais válidas', async () => {
    await request(app).post('/suppliers').send(supplierFactory)

    const res = await request(app).post('/sessions').send({
      email: supplierFactory.email,
      password: supplierFactory.password,
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.type).toBe('SUPPLIER')
  })

  it('retorna 401 com senha incorreta', async () => {
    await request(app).post('/users').send(userFactory)

    const res = await request(app).post('/sessions').send({
      email: userFactory.email,
      password: 'SenhaErrada@9',
    })

    expect(res.status).toBe(401)
  })

  it('retorna 401 com e-mail inexistente', async () => {
    const res = await request(app).post('/sessions').send({
      email: 'naoexiste@test.com',
      password: 'Test@1234',
    })

    expect(res.status).toBe(401)
  })
})
