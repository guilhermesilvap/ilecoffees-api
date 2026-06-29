import request from 'supertest'
import { app } from '@/app'
import { supplierFactory } from '../helpers/factories'
import { authenticateAsSupplier } from '../helpers/authenticate'

describe('POST /suppliers', () => {
  it('cria um fornecedor com dados válidos', async () => {
    const res = await request(app).post('/suppliers').send(supplierFactory)
    expect(res.status).toBe(201)
  })

  it('retorna 400 se o e-mail já estiver cadastrado', async () => {
    await request(app).post('/suppliers').send(supplierFactory)
    const res = await request(app).post('/suppliers').send(supplierFactory)
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/e-mail/i)
  })
})

describe('PUT /suppliers/profile', () => {
  it('atualiza o perfil do fornecedor autenticado', async () => {
    const { token } = await authenticateAsSupplier()

    const res = await request(app)
      .put('/suppliers/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Fornecedor Atualizado' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Fornecedor Atualizado')
  })

  it('retorna 401 sem token', async () => {
    const res = await request(app).put('/suppliers/profile').send({ name: 'Teste' })
    expect(res.status).toBe(401)
  })
})
