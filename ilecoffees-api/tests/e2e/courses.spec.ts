import request from 'supertest'
import { app } from '@/app'
import { courseFactory } from '../helpers/factories'
import { authenticateAsAdmin, authenticateAsUser, authenticateAsSupplier } from '../helpers/authenticate'

async function setupCourse() {
  const { token: adminToken } = await authenticateAsAdmin()
  const { body: course } = await request(app)
    .post('/admin/courses')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(courseFactory)
  return { adminToken, course }
}

async function setupCourseWithLesson() {
  const { adminToken, course } = await setupCourse()
  const { body: lesson } = await request(app)
    .post(`/admin/courses/${course.id}/lessons`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Aula 1', videoUrl: 'https://youtube.com/watch?v=test', order: 1 })
  return { adminToken, course, lesson }
}

describe('POST /admin/courses', () => {
  it('cria um curso como admin', async () => {
    const { token } = await authenticateAsAdmin()

    const res = await request(app)
      .post('/admin/courses')
      .set('Authorization', `Bearer ${token}`)
      .send(courseFactory)

    expect(res.status).toBe(201)
    expect(res.body.title).toBe(courseFactory.title)
  })

  it('retorna 403 para usuário comum', async () => {
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post('/admin/courses')
      .set('Authorization', `Bearer ${token}`)
      .send(courseFactory)

    expect(res.status).toBe(403)
  })
})

describe('GET /courses', () => {
  it('lista os cursos disponíveis', async () => {
    await setupCourse()
    const { token } = await authenticateAsUser()

    const res = await request(app).get('/courses').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

describe('GET /courses/:id', () => {
  it('retorna o curso com aulas', async () => {
    const { course } = await setupCourse()
    const { token } = await authenticateAsUser()

    const res = await request(app).get(`/courses/${course.id}`).set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.course.id).toBe(course.id)
  })
})

describe('PUT /admin/courses/:id', () => {
  it('atualiza um curso', async () => {
    const { adminToken, course } = await setupCourse()

    const res = await request(app)
      .put(`/admin/courses/${course.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Curso Atualizado' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Curso Atualizado')
  })
})

describe('POST /admin/courses/:id/lessons', () => {
  it('cria uma aula no curso', async () => {
    const { adminToken, course } = await setupCourse()

    const res = await request(app)
      .post(`/admin/courses/${course.id}/lessons`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Aula 1', videoUrl: 'https://youtube.com/watch?v=test', order: 1 })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Aula 1')
  })
})

describe('PUT /admin/courses/:id/lessons/:lessonId', () => {
  it('atualiza uma aula', async () => {
    const { adminToken, course, lesson } = await setupCourseWithLesson()

    const res = await request(app)
      .put(`/admin/courses/${course.id}/lessons/${lesson.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Aula Atualizada' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Aula Atualizada')
  })

  it('retorna 404 para aula inexistente', async () => {
    const { adminToken, course } = await setupCourse()

    const res = await request(app)
      .put(`/admin/courses/${course.id}/lessons/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Aula X' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /admin/courses/:id/lessons/:lessonId', () => {
  it('deleta uma aula', async () => {
    const { adminToken, course, lesson } = await setupCourseWithLesson()

    const res = await request(app)
      .delete(`/admin/courses/${course.id}/lessons/${lesson.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(204)
  })

  it('retorna 404 para aula inexistente', async () => {
    const { adminToken, course } = await setupCourse()

    const res = await request(app)
      .delete(`/admin/courses/${course.id}/lessons/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(404)
  })
})

describe('POST /courses/:id/enroll', () => {
  it('matricula em curso pago — retorna orderId para pagamento', async () => {
    const { course } = await setupCourse()
    const { token } = await authenticateAsUser()

    const res = await request(app)
      .post(`/courses/${course.id}/enroll`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(201)
    expect(res.body.enrolled).toBe(false)
    expect(res.body).toHaveProperty('orderId')
  })

  it('matricula em curso gratuito — confirma matrícula imediatamente', async () => {
    const { token: adminToken } = await authenticateAsAdmin()
    const { body: freeCourse } = await request(app)
      .post('/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...courseFactory, price: 0 })

    const { token } = await authenticateAsUser()
    const res = await request(app)
      .post(`/courses/${freeCourse.id}/enroll`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.enrolled).toBe(true)
    expect(res.body.orderId).toBeUndefined()
  })

  it('retorna 404 para curso inexistente', async () => {
    const { token } = await authenticateAsUser()
    const res = await request(app)
      .post('/courses/00000000-0000-0000-0000-000000000000/enroll')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('retorna 400 ao tentar se matricular duas vezes', async () => {
    const { token: adminToken } = await authenticateAsAdmin()
    const { body: freeCourse } = await request(app)
      .post('/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...courseFactory, price: 0 })

    const { token } = await authenticateAsUser()
    await request(app).post(`/courses/${freeCourse.id}/enroll`).set('Authorization', `Bearer ${token}`)
    const res = await request(app).post(`/courses/${freeCourse.id}/enroll`).set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })

  it('retorna 403 quando fornecedor tenta se matricular', async () => {
    const { course } = await setupCourse()
    const { token } = await authenticateAsSupplier()
    const res = await request(app)
      .post(`/courses/${course.id}/enroll`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })
})

describe('GET /courses/my-enrollments', () => {
  it('retorna lista vazia quando não há matrículas', async () => {
    await setupCourse()
    const { token } = await authenticateAsUser()

    const res = await request(app).get('/courses/my-enrollments').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('DELETE /admin/courses/:id', () => {
  it('deleta um curso', async () => {
    const { adminToken, course } = await setupCourse()

    const res = await request(app)
      .delete(`/admin/courses/${course.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(204)
  })
})
