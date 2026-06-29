import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory } from '../helpers/factories'
import { authenticateAsAdmin, authenticateAsUser, authenticateAsSupplier } from '../helpers/authenticate'

// ─── helpers ────────────────────────────────────────────────────────────────

async function setupOrder() {
  const { token: supplierToken } = await authenticateAsSupplier()
  const { body: coffee } = await request(app)
    .post('/coffees')
    .set('Authorization', `Bearer ${supplierToken}`)
    .send(coffeeFactory)

  const { token: userToken } = await authenticateAsUser()
  await request(app)
    .post('/cart/items')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ coffeeId: coffee.id, quantity: 1 })

  const { body: orders } = await request(app)
    .post('/orders')
    .set('Authorization', `Bearer ${userToken}`)

  return { userToken, order: orders[0] }
}

async function setupFreeCourse() {
  const { token: adminToken } = await authenticateAsAdmin()
  const { body: course } = await request(app)
    .post('/admin/courses')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Curso Gratuito',
      description: 'Curso para teste de matrícula',
      price: 0,
      workloadHours: 2,
      level: 'BEGINNER',
    })
  return { adminToken, course }
}

// ─── GET /admin/dashboard ────────────────────────────────────────────────────

describe('GET /admin/dashboard', () => {
  it('retorna as estatísticas do sistema', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    // Shape dos usuários
    expect(res.body.users).toHaveProperty('total')
    expect(typeof res.body.users.total).toBe('number')

    // Shape dos fornecedores
    expect(res.body.suppliers).toHaveProperty('total')
    expect(res.body.suppliers).toHaveProperty('active')
    expect(res.body.suppliers).toHaveProperty('inactive')
    expect(res.body.suppliers).toHaveProperty('withoutPlan')

    // Shape dos cafés
    expect(res.body.coffees).toHaveProperty('total')
    expect(res.body.coffees).toHaveProperty('lowStock')

    // Shape dos pedidos
    expect(res.body.orders).toHaveProperty('total')
    expect(res.body.orders).toHaveProperty('byStatus')
    expect(res.body.orders).toHaveProperty('byType')
    expect(typeof res.body.orders.byStatus).toBe('object')

    // Shape da receita
    expect(res.body.revenue).toHaveProperty('confirmed')
    expect(res.body.revenue).toHaveProperty('pending')
    expect(res.body.revenue).toHaveProperty('failedPayments')
    expect(res.body.revenue).toHaveProperty('byMethod')

    // Shape dos cursos
    expect(res.body.courses).toHaveProperty('total')
    expect(res.body.courses).toHaveProperty('totalEnrollments')
    expect(res.body.courses).toHaveProperty('byLevel')

    // Shape das assinaturas
    expect(res.body.subscriptions).toHaveProperty('total')

    // Shape do carrinho
    expect(res.body.cart).toHaveProperty('usersWithAbandonedCart')
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/admin/dashboard')
    expect(res.status).toBe(401)
  })

  it('retorna 403 para usuário comum', async () => {
    const { token } = await authenticateAsUser()
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('contabiliza fornecedores ativos e inativos corretamente', async () => {
    const { account } = await authenticateAsSupplier()
    const { token: adminToken } = await authenticateAsAdmin()

    await request(app)
      .patch(`/admin/suppliers/${account.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.suppliers.inactive).toBeGreaterThan(0)
    expect(
      res.body.suppliers.active + res.body.suppliers.inactive,
    ).toBe(res.body.suppliers.total)
  })

  it('contabiliza pedidos no byStatus', async () => {
    await setupOrder()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.orders.byStatus.PENDING).toBeGreaterThan(0)
    expect(res.body.orders.total).toBeGreaterThan(0)
  })
})

// ─── GET /admin/orders (filtros) ─────────────────────────────────────────────

describe('GET /admin/orders com filtros', () => {
  it('lista todos os pedidos sem filtro', async () => {
    await setupOrder()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/orders')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('filtra pedidos por status PENDING', async () => {
    await setupOrder()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/orders?status=PENDING')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    res.body.forEach((order: { status: string }) => {
      expect(order.status).toBe('PENDING')
    })
  })

  it('filtra pedidos por status CANCELED', async () => {
    const { userToken, order } = await setupOrder()
    await request(app)
      .patch(`/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)

    const { token: adminToken } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/orders?status=CANCELED')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    res.body.forEach((o: { status: string }) => {
      expect(o.status).toBe('CANCELED')
    })
  })

  it('filtra pedidos por tipo ONE_TIME', async () => {
    await setupOrder()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/orders?type=ONE_TIME')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    res.body.forEach((o: { type: string }) => {
      expect(o.type).toBe('ONE_TIME')
    })
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/admin/orders?status=PENDING')
    expect(res.status).toBe(401)
  })
})

// ─── GET /admin/suppliers (filtros) ──────────────────────────────────────────

describe('GET /admin/suppliers com filtros', () => {
  it('lista todos os fornecedores sem filtro', async () => {
    await authenticateAsSupplier()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/suppliers')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('lista apenas fornecedores ativos', async () => {
    await authenticateAsSupplier()
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/suppliers?isActive=true')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    res.body.forEach((s: { isActive: boolean }) => {
      expect(s.isActive).toBe(true)
    })
  })

  it('lista apenas fornecedores inativos', async () => {
    const { account } = await authenticateAsSupplier()
    const { token: adminToken } = await authenticateAsAdmin()

    await request(app)
      .patch(`/admin/suppliers/${account.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    const res = await request(app)
      .get('/admin/suppliers?isActive=false')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
    res.body.forEach((s: { isActive: boolean }) => {
      expect(s.isActive).toBe(false)
    })
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/admin/suppliers?isActive=true')
    expect(res.status).toBe(401)
  })
})

// ─── GET /admin/courses/:id/enrollments ──────────────────────────────────────

describe('GET /admin/courses/:id/enrollments', () => {
  it('lista os usuários matriculados em um curso', async () => {
    const { adminToken, course } = await setupFreeCourse()
    const { token: userToken } = await authenticateAsUser()

    await request(app)
      .post(`/courses/${course.id}/enroll`)
      .set('Authorization', `Bearer ${userToken}`)

    const res = await request(app)
      .get(`/admin/courses/${course.id}/enrollments`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('user')
    expect(res.body[0].user).toHaveProperty('name')
    expect(res.body[0].user).toHaveProperty('email')
    expect(res.body[0]).toHaveProperty('enrolledAt')
  })

  it('retorna lista vazia para curso sem matrículas', async () => {
    const { adminToken, course } = await setupFreeCourse()

    const res = await request(app)
      .get(`/admin/courses/${course.id}/enrollments`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('retorna 404 para curso inexistente', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/courses/00000000-0000-0000-0000-000000000000/enrollments')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('retorna 403 para usuário comum', async () => {
    const { course } = await setupFreeCourse()
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .get(`/admin/courses/${course.id}/enrollments`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })
})
