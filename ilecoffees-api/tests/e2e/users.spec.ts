import request from 'supertest'
import { app } from '@/app'
import { userFactory } from '../helpers/factories'
import { authenticateAsUser } from '../helpers/authenticate'

describe('POST /users', () => {
  it('cria um usuário com dados válidos', async () => {
    const res = await request(app).post('/users').send(userFactory)
expect(res.status).toBe(201)
  })

  it('retorna 400 se o e-mail já estiver cadastrado', async () => {
    await request(app).post('/users').send(userFactory)
    const res = await request(app).post('/users').send(userFactory)
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/e-mail/i)
  })

  it('retorna 400 se a senha não atender os requisitos', async () => {
    const res = await request(app).post('/users').send({ ...userFactory, password: '123456' })
    expect(res.status).toBe(400)
  })
})

describe('PUT /users/profile', () => {
  it('atualiza o perfil do usuário autenticado', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .put('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nome Atualizado' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Nome Atualizado')
  })

  it('retorna 401 sem token', async () => {
    const res = await request(app).put('/users/profile').send({ name: 'Teste' })
    expect(res.status).toBe(401)
  })
})
