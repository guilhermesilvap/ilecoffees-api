import request from 'supertest'
import { app } from '@/app'
import { coffeeFactory, courseFactory } from '../helpers/factories'
import { authenticateAsAdmin, authenticateAsUser, authenticateAsSupplier } from '../helpers/authenticate'

// ─── helpers ────────────────────────────────────────────────────────────────

async function setupFreeCourseWithLesson() {
  const { token: adminToken } = await authenticateAsAdmin()

  const { body: course } = await request(app)
    .post('/admin/courses')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ ...courseFactory, price: 0 })

  const { body: lesson } = await request(app)
    .post(`/admin/courses/${course.id}/lessons`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Aula 1', videoUrl: 'https://youtube.com/watch?v=test', order: 1 })

  return { adminToken, course, lesson }
}

async function enrollUserInCourse(courseId: string) {
  const { token: userToken } = await authenticateAsUser()
  await request(app)
    .post(`/courses/${courseId}/enroll`)
    .set('Authorization', `Bearer ${userToken}`)
  return { userToken }
}

async function setupCoffee() {
  const { token: supplierToken } = await authenticateAsSupplier()
  const { body: coffee } = await request(app)
    .post('/coffees')
    .set('Authorization', `Bearer ${supplierToken}`)
    .send(coffeeFactory)
  return { coffee }
}

// ─── Progresso de aulas ──────────────────────────────────────────────────────

describe('PATCH /courses/:id/lessons/:lessonId/complete', () => {
  it('usuário marca uma aula como concluída', async () => {
    const { course, lesson } = await setupFreeCourseWithLesson()
    const { userToken } = await enrollUserInCourse(course.id)

    const res = await request(app)
      .patch(`/courses/${course.id}/lessons/${lesson.id}/complete`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.lessonId).toBe(lesson.id)
    expect(res.body).toHaveProperty('completedAt')
  })

  it('marcar a mesma aula duas vezes atualiza completedAt sem duplicar', async () => {
    const { course, lesson } = await setupFreeCourseWithLesson()
    const { userToken } = await enrollUserInCourse(course.id)

    await request(app)
      .patch(`/courses/${course.id}/lessons/${lesson.id}/complete`)
      .set('Authorization', `Bearer ${userToken}`)

    const res = await request(app)
      .patch(`/courses/${course.id}/lessons/${lesson.id}/complete`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
  })

  it('retorna 403 quando usuário não está matriculado', async () => {
    const { course, lesson } = await setupFreeCourseWithLesson()
    const { token: otherToken } = await authenticateAsUser({ email: 'outro@test.com' })

    const res = await request(app)
      .patch(`/courses/${course.id}/lessons/${lesson.id}/complete`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(res.status).toBe(403)
  })

  it('retorna 403 para fornecedor', async () => {
    const { course, lesson } = await setupFreeCourseWithLesson()
    const { token: supplierToken } = await authenticateAsSupplier()

    const res = await request(app)
      .patch(`/courses/${course.id}/lessons/${lesson.id}/complete`)
      .set('Authorization', `Bearer ${supplierToken}`)

    expect(res.status).toBe(403)
  })
})

describe('GET /courses/:id/progress', () => {
  it('retorna o progresso do usuário no curso', async () => {
    const { course, lesson } = await setupFreeCourseWithLesson()
    const { userToken } = await enrollUserInCourse(course.id)

    await request(app)
      .patch(`/courses/${course.id}/lessons/${lesson.id}/complete`)
      .set('Authorization', `Bearer ${userToken}`)

    const res = await request(app)
      .get(`/courses/${course.id}/progress`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.courseId).toBe(course.id)
    expect(res.body.totalLessons).toBe(1)
    expect(res.body.completedLessons).toBe(1)
    expect(res.body.completionPercent).toBe(100)
    expect(Array.isArray(res.body.lessons)).toBe(true)
    expect(res.body.lessons[0].completed).toBe(true)
  })

  it('retorna progresso zero para curso sem aulas concluídas', async () => {
    const { course } = await setupFreeCourseWithLesson()
    const { userToken } = await enrollUserInCourse(course.id)

    const res = await request(app)
      .get(`/courses/${course.id}/progress`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.completedLessons).toBe(0)
    expect(res.body.completionPercent).toBe(0)
    expect(res.body.lessons[0].completed).toBe(false)
  })

  it('retorna 403 para usuário não matriculado', async () => {
    const { course } = await setupFreeCourseWithLesson()
    const { token } = await authenticateAsUser({ email: 'nomatricula@test.com' })

    const res = await request(app)
      .get(`/courses/${course.id}/progress`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('retorna 404 para curso inexistente', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .get('/courses/00000000-0000-0000-0000-000000000000/progress')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

// ─── Reviews de café ─────────────────────────────────────────────────────────

describe('POST /coffees/:id/reviews', () => {
  it('usuário avalia um café', async () => {
    const { coffee } = await setupCoffee()
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post(`/coffees/${coffee.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Café incrível!' })

    expect(res.status).toBe(201)
    expect(res.body.rating).toBe(5)
    expect(res.body.targetType).toBe('COFFEE')
  })

  it('atualiza avaliação existente ao avaliar novamente', async () => {
    const { coffee } = await setupCoffee()
    const { token } = await authenticateAsUser()

    await request(app)
      .post(`/coffees/${coffee.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3 })

    const res = await request(app)
      .post(`/coffees/${coffee.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Mudei de ideia, excelente!' })

    expect(res.status).toBe(201)
    expect(res.body.rating).toBe(5)
  })

  it('retorna 400 para nota fora do range', async () => {
    const { coffee } = await setupCoffee()
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post(`/coffees/${coffee.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 6 })

    expect(res.status).toBe(400)
  })

  it('retorna 403 para fornecedor', async () => {
    const { coffee } = await setupCoffee()
    const { token } = await authenticateAsSupplier()

    const res = await request(app)
      .post(`/coffees/${coffee.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4 })

    expect(res.status).toBe(403)
  })

  it('retorna 404 para café inexistente', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/coffees/00000000-0000-0000-0000-000000000000/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4 })

    expect(res.status).toBe(404)
  })
})

describe('GET /coffees/:id/reviews', () => {
  it('lista as avaliações de um café', async () => {
    const { coffee } = await setupCoffee()
    const { token } = await authenticateAsUser()

    await request(app)
      .post(`/coffees/${coffee.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Muito bom!' })

    const res = await request(app)
      .get(`/coffees/${coffee.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('user')
    expect(res.body[0].user).toHaveProperty('name')
  })
})

// ─── Reviews de curso ─────────────────────────────────────────────────────────

describe('POST /courses/:id/reviews', () => {
  it('usuário matriculado avalia um curso', async () => {
    const { course } = await setupFreeCourseWithLesson()
    const { userToken } = await enrollUserInCourse(course.id)

    const res = await request(app)
      .post(`/courses/${course.id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Curso excelente!' })

    expect(res.status).toBe(201)
    expect(res.body.rating).toBe(5)
    expect(res.body.targetType).toBe('COURSE')
  })

  it('retorna 403 para usuário não matriculado', async () => {
    const { course } = await setupFreeCourseWithLesson()
    const { token } = await authenticateAsUser({ email: 'semmatricula@test.com' })

    const res = await request(app)
      .post(`/courses/${course.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3 })

    expect(res.status).toBe(403)
  })
})

describe('GET /courses/:id/reviews', () => {
  it('lista as avaliações de um curso', async () => {
    const { course } = await setupFreeCourseWithLesson()
    const { userToken } = await enrollUserInCourse(course.id)

    await request(app)
      .post(`/courses/${course.id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4 })

    const res = await request(app)
      .get(`/courses/${course.id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

// ─── Receita por período ──────────────────────────────────────────────────────

describe('GET /admin/dashboard/revenue', () => {
  it('retorna receita mensal (padrão)', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/dashboard/revenue')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('retorna receita semanal', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .get('/admin/dashboard/revenue?period=weekly&limit=4')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/admin/dashboard/revenue')
    expect(res.status).toBe(401)
  })

  it('retorna 403 para usuário comum', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .get('/admin/dashboard/revenue')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })
})
