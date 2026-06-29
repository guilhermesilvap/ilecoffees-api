import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory } from '../helpers/factories'
import { authenticateAsUser, authenticateAsSupplier } from '../helpers/authenticate'

const melhorEnvioResponse = [
  { id: 1, name: 'PAC', company: { name: 'Correios' }, price: '18.50', delivery_time: 7 },
  { id: 2, name: '.Package', company: { name: 'Jadlog' }, price: '14.20', delivery_time: 4 },
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /shipping/estimate', () => {
  it('retorna opções de frete agrupadas por fornecedor', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => melhorEnvioResponse,
    } as Response)

    const { token: supplierToken } = await authenticateAsSupplier()
    const { body: coffee } = await request(app)
      .post('/coffees')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send(coffeeFactory)

    const { token } = await authenticateAsUser()
    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ coffeeId: coffee.id, quantity: 1 })

    const res = await request(app)
      .get('/shipping/estimate?cep=01310100')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('supplierName')
    expect(res.body[0]).toHaveProperty('options')
    expect(res.body[0].options).toHaveLength(2)
    expect(res.body[0].options[0].carrier).toBe('Jadlog')
    expect(res.body[0].options[0].price).toBe(14.2)
  })

  it('retorna 400 com carrinho vazio', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .get('/shipping/estimate?cep=01310100')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })

  it('retorna 400 sem CEP informado', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .get('/shipping/estimate')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/shipping/estimate?cep=01310100')
    expect(res.status).toBe(401)
  })
})
