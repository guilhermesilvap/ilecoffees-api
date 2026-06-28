/**
 * Stress seed — popula o banco com volume realista para teste de UI/performance.
 * node prisma/seed-stress.js
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const p = new PrismaClient()
const HASH = bcrypt.hashSync('senha@123', 8)

/* ── helpers ── */
const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const rnd = (min, max) => +(Math.random() * (max - min) + min).toFixed(2)
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d }
const hoursAgo = n => { const d = new Date(); d.setHours(d.getHours() - n); return d }

/* ── photo banks ── */
const COFFEE_PHOTOS = [
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=600&fit=crop',
]

const COURSE_PHOTOS = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1521302200778-33500795e128?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1516231648-7e0c1e8e0f4e?w=800&h=450&fit=crop',
]

const USER_PHOTOS_M = Array.from({ length: 30 }, (_, i) => `https://randomuser.me/api/portraits/men/${i + 1}.jpg`)
const USER_PHOTOS_F = Array.from({ length: 30 }, (_, i) => `https://randomuser.me/api/portraits/women/${i + 1}.jpg`)

/* ── reference data ── */
const CITIES = [
  { city: 'São Paulo', state: 'SP', cep: '01310100' },
  { city: 'Belo Horizonte', state: 'MG', cep: '30112000' },
  { city: 'Curitiba', state: 'PR', cep: '80010010' },
  { city: 'Rio de Janeiro', state: 'RJ', cep: '20040020' },
  { city: 'Campinas', state: 'SP', cep: '13013080' },
  { city: 'Porto Alegre', state: 'RS', cep: '90010150' },
  { city: 'Florianópolis', state: 'SC', cep: '88010400' },
  { city: 'Recife', state: 'PE', cep: '50010230' },
]

const COFFEE_NAMES = [
  'Bourbon Amarelo Especial', 'Catuaí Natural Premium', 'Acaiá Cereja Descascada',
  'Mundo Novo Honey', 'Typica Lavado', 'Gesha Natural', 'SL28 Washed',
  'Pacamara Honey Process', 'Obatã Cereja Seco', 'Catucaí Amarelo',
  'Icatu Bourbon Natural', 'Topázio Honey', 'Sabiá Fermentado',
  'Arara Natural', 'Sarchimor Lavado', 'Híbrido Timor Natural',
]

const COFFEE_VARIETIES = ['Bourbon', 'Catuaí', 'Acaiá', 'Mundo Novo', 'Typica', 'Gesha', 'Pacamara', 'Catucaí']
const PROCESSES = ['Natural', 'Lavado', 'Honey', 'Cereja Descascada', 'Fermentação Anaeróbica']
const REGIONS = ['Cerrado Mineiro', 'Sul de Minas', 'Mogiana', 'Alta Mogiana', 'Chapada Diamantina', 'Serrado Goiano']
const FARMS = ['Fazenda Esperança', 'Sítio Boa Vista', 'Fazenda das Pedras', 'Sítio Primavera', 'Fazenda Recanto Verde']
const ROASTS = ['Claro', 'Médio', 'Médio Escuro', 'Escuro']
const SENSORY = [
  'Notas de chocolate amargo, frutas vermelhas e caramelo',
  'Acidez cítrica, corpo leve, final floral e de frutas tropicais',
  'Doçura de mel, notas de castanhas e toffee',
  'Corpo cremoso, notas de baunilha e frutas secas',
  'Acidez viva, bergamota, jasmim e frutos silvestres',
]

const COURSE_DATA = [
  { title: 'Barismo do Zero ao Avançado', description: 'Aprenda todas as técnicas de preparo de café, desde o básico ao especialidade. Cobertura de espresso, pour over, cold brew e muito mais.', workloadHours: 20, level: 'BEGINNER', price: 297 },
  { title: 'Controle de Qualidade Q-Grader', description: 'Entenda o protocolo SCA de avaliação sensorial. Treine seu paladar para identificar defeitos e atributos de qualidade no café.', workloadHours: 40, level: 'ADVANCED', price: 897 },
  { title: 'Gestão de Cafeteria Lucrativa', description: 'Do CMV ao ticket médio: aprenda a precificar, gerenciar equipe e criar experiências que fidelizam clientes.', workloadHours: 16, level: 'INTERMEDIATE', price: 497 },
  { title: 'Cultivo e Pós-Colheita', description: 'Todo o ciclo do café: manejo de lavoura, colheita seletiva, processamentos e armazenagem para manter qualidade na xícara.', workloadHours: 30, level: 'INTERMEDIATE', price: 697 },
  { title: 'Torrefação Artesanal', description: 'Curvas de torra, desenvolvimento de perfis e controle de qualidade. Da torra clara ao espresso escuro com consistência.', workloadHours: 24, level: 'ADVANCED', price: 797 },
  { title: 'Latte Art para Cafeterias', description: 'Micro-espuma perfeita e desenhos de coração, roseta e tulipa. Técnicas passo a passo com feedback em vídeo.', workloadHours: 10, level: 'BEGINNER', price: 197 },
]

const LESSON_TEMPLATES = [
  ['Introdução e Boas-Vindas', 'História e Contexto', 'Equipamentos Essenciais', 'Fundamentos Teóricos', 'Prática Guiada I', 'Prática Guiada II', 'Avaliação Sensorial', 'Técnicas Avançadas', 'Erros Comuns e Como Evitá-los', 'Projeto Final'],
  ['Origem e Variedades', 'Processamentos', 'Torrefação', 'Moagem', 'Extração', 'Ajuste de Receita', 'Lattê Art Básico', 'Espresso Avançado', 'Métodos Alternativos', 'Degustação Final'],
]

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED']
const PAYMENT_METHODS = ['PIX', 'CREDIT_CARD', 'BOLETO']
const PAYMENT_STATUS = ['PENDING', 'CONFIRMED', 'FAILED']
const BILLING = ['MONTHLY', 'ANNUAL']

/* ── main ── */
async function main() {
  console.log('🌱  Iniciando seed de stress...\n')

  /* ── 1. Suppliers ── */
  console.log('📦  Criando fornecedores...')
  const supplierData = [
    { name: 'Torrefação Mineira Ltda', email: 'mineira@torrefacao.com', supplierType: 'ROASTER', city: 'Belo Horizonte', state: 'MG' },
    { name: 'Café das Montanhas', email: 'montanhas@cafe.com', supplierType: 'ROASTER', city: 'Campinas', state: 'SP' },
    { name: 'Cooperativa dos Produtores do Cerrado', email: 'cerrado@coop.com', supplierType: 'PRODUCER', city: 'Patrocínio', state: 'MG' },
    { name: 'Sítio Alta Mogiana', email: 'altamogiana@sitio.com', supplierType: 'PRODUCER', city: 'Franca', state: 'SP' },
    { name: 'Fazenda Sul de Minas', email: 'sulminas@fazenda.com', supplierType: 'PRODUCER', city: 'Três Pontas', state: 'MG' },
    { name: 'Torra & Arte Especiais', email: 'torraearte@especiais.com', supplierType: 'ROASTER', city: 'Curitiba', state: 'PR' },
  ]

  const SUPPLIER_PHOTOS = [
    'https://randomuser.me/api/portraits/men/41.jpg',
    'https://randomuser.me/api/portraits/women/42.jpg',
    'https://randomuser.me/api/portraits/men/43.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/45.jpg',
    'https://randomuser.me/api/portraits/women/46.jpg',
  ]

  const suppliers = []
  for (let si = 0; si < supplierData.length; si++) {
    const s = supplierData[si]
    const exists = await p.supplier.findUnique({ where: { email: s.email } })
    if (exists) { suppliers.push(exists); continue }
    const created = await p.supplier.create({
      data: {
        name: s.name, email: s.email, supplierType: s.supplierType,
        passwordHash: HASH, isActive: true,
        photoUrl: SUPPLIER_PHOTOS[si % SUPPLIER_PHOTOS.length],
        cep: '30112000', street: 'Rua das Flores', number: String(rndInt(1, 999)),
        district: 'Centro', city: s.city, state: s.state,
      }
    })
    suppliers.push(created)
    console.log('  +', created.name)
  }

  /* ── 2. Coffees ── */
  console.log('\n☕  Criando cafés...')
  const allCoffees = []
  for (const supplier of suppliers) {
    const count = rndInt(4, 8)
    for (let i = 0; i < count; i++) {
      const name = COFFEE_NAMES[rndInt(0, COFFEE_NAMES.length - 1)] + ` ${rndInt(2020, 2025)}`
      const saleType = pick(['KG', 'PACKAGE', 'BOTH'])
      const coffee = await p.coffee.create({
        data: {
          supplierId: supplier.id,
          name, saleType,
          photoUrl: pick(COFFEE_PHOTOS),
          description: `Café especial produzido na ${pick(FARMS)}, região do ${pick(REGIONS)}. ${pick(SENSORY)}.`,
          variety: pick(COFFEE_VARIETIES),
          process: pick(PROCESSES),
          region: pick(REGIONS),
          altitude: rndInt(900, 1800),
          farm: pick(FARMS),
          producer: `Família ${pick(['Santos', 'Ferreira', 'Oliveira', 'Costa', 'Lima'])}`,
          score: rndInt(82, 95),
          sensory: pick(SENSORY),
          roast: pick(ROASTS),
          stock: rndInt(50, 500),
          pricePerKg: saleType !== 'PACKAGE' ? rnd(38, 120) : null,
          packagePrice: saleType !== 'KG' ? rnd(28, 80) : null,
          packagePriceCoffeeshop: saleType !== 'KG' ? rnd(22, 65) : null,
          packageWeight: saleType !== 'KG' ? pick([250, 500, 1000]) : null,
          weightGrams: rndInt(200, 1200),
        }
      })
      allCoffees.push(coffee)
    }
  }
  console.log('  Total cafés criados:', allCoffees.length)

  /* ── 3. Courses + Lessons ── */
  console.log('\n📚  Criando cursos e aulas...')
  const roasters = suppliers.filter(s => s.supplierType === 'ROASTER')
  const courses = []
  for (const cd of COURSE_DATA) {
    const existing = await p.course.findFirst({ where: { title: cd.title } })
    if (existing) { courses.push(existing); continue }
    const course = await p.course.create({
      data: { ...cd, supplierId: pick(roasters).id, imageUrl: pick(COURSE_PHOTOS) }
    })
    const template = pick(LESSON_TEMPLATES)
    const lessonCount = rndInt(6, template.length)
    for (let i = 0; i < lessonCount; i++) {
      await p.courseLesson.create({
        data: {
          courseId: course.id,
          title: template[i],
          description: `Nesta aula você aprenderá sobre ${template[i].toLowerCase()}.`,
          videoUrl: `https://vimeo.com/${rndInt(100000000, 999999999)}`,
          order: i + 1,
          isLocked: i > 0,
          durationMinutes: rndInt(12, 45),
        }
      })
    }
    courses.push(course)
    console.log('  +', course.title, `(${lessonCount} aulas)`)
  }

  /* ── 4. Users (CUSTOMER + COFFEESHOP) ── */
  console.log('\n👤  Criando usuários...')
  const customerData = [
    { name: 'Fernanda Alves', email: 'fernanda.alves@gmail.com', photo: USER_PHOTOS_F[0] },
    { name: 'Ricardo Mendes', email: 'ricardo.mendes@outlook.com', photo: USER_PHOTOS_M[0] },
    { name: 'Camila Souza', email: 'camila.souza@gmail.com', photo: USER_PHOTOS_F[1] },
    { name: 'Bruno Carvalho', email: 'bruno.carvalho@hotmail.com', photo: USER_PHOTOS_M[1] },
    { name: 'Juliana Martins', email: 'juliana.martins@gmail.com', photo: USER_PHOTOS_F[2] },
    { name: 'Lucas Pereira', email: 'lucas.pereira@outlook.com', photo: USER_PHOTOS_M[2] },
    { name: 'Mariana Costa', email: 'mariana.costa@gmail.com', photo: USER_PHOTOS_F[3] },
    { name: 'Felipe Rodrigues', email: 'felipe.rodrigues@gmail.com', photo: USER_PHOTOS_M[3] },
    { name: 'Patrícia Lima', email: 'patricia.lima@hotmail.com', photo: USER_PHOTOS_F[4] },
    { name: 'Eduardo Nunes', email: 'eduardo.nunes@gmail.com', photo: USER_PHOTOS_M[4] },
  ]
  const coffeeshopData = [
    { name: 'Café Noir', email: 'noir@cafes.com', photo: USER_PHOTOS_F[5] },
    { name: 'Espresso House Brasil', email: 'brasil@espressohouse.com', photo: USER_PHOTOS_M[5] },
    { name: 'Grão & Alma', email: 'graoeAlma@cafe.com', photo: USER_PHOTOS_F[6] },
    { name: 'Tostado Cafeteria', email: 'tostado@cafe.com', photo: USER_PHOTOS_M[6] },
    { name: 'Ponto de Encontro Café', email: 'pontocafe@gmail.com', photo: USER_PHOTOS_F[7] },
    { name: 'Ritual Coffee SP', email: 'ritual@coffeesp.com', photo: USER_PHOTOS_M[7] },
  ]

  const customers = []
  for (const c of customerData) {
    const exists = await p.user.findUnique({ where: { email: c.email } })
    if (exists) { customers.push(exists); continue }
    const loc = pick(CITIES)
    const user = await p.user.create({
      data: {
        name: c.name, email: c.email, passwordHash: HASH,
        accountType: 'CUSTOMER', phoneNumber: `(11) 9${rndInt(1000, 9999)}-${rndInt(1000, 9999)}`,
        photoUrl: c.photo,
        cep: loc.cep, street: 'Rua das Acácias', number: String(rndInt(1, 500)),
        district: 'Centro', city: loc.city, state: loc.state,
      }
    })
    customers.push(user)
  }
  console.log('  Clientes:', customers.length)

  const coffeeshops = []
  for (const c of coffeeshopData) {
    const exists = await p.user.findUnique({ where: { email: c.email } })
    if (exists) { coffeeshops.push(exists); continue }
    const loc = pick(CITIES)
    const user = await p.user.create({
      data: {
        name: c.name, email: c.email, passwordHash: HASH,
        accountType: 'COFFEESHOP', phoneNumber: `(11) 3${rndInt(100, 999)}-${rndInt(1000, 9999)}`,
        photoUrl: c.photo,
        cep: loc.cep, street: 'Av. Paulista', number: String(rndInt(100, 2000)),
        district: 'Bela Vista', city: loc.city, state: loc.state,
        cnpj: `${rndInt(10,99)}.${rndInt(100,999)}.${rndInt(100,999)}/0001-${rndInt(10,99)}`,
      }
    })
    coffeeshops.push(user)
  }
  console.log('  Cafeterias:', coffeeshops.length)

  /* ── 5. Orders (customers buying coffees) ── */
  console.log('\n🛍️  Criando pedidos de clientes...')
  const allUsers = [...customers]
  const existingUsers = await p.user.findMany({ where: { accountType: 'CUSTOMER' }, select: { id: true } })
  const userIds = existingUsers.map(u => u.id)

  let orderCount = 0
  for (const userId of userIds) {
    const numOrders = rndInt(2, 6)
    for (let i = 0; i < numOrders; i++) {
      const coffee = pick(allCoffees)
      const qty = rndInt(1, 5)
      const price = (coffee.pricePerKg ?? coffee.packagePrice ?? 50) * qty
      const status = pick(STATUS_OPTIONS)
      const createdAt = daysAgo(rndInt(1, 180))
      const order = await p.order.create({
        data: {
          userId, coffeeId: coffee.id,
          quantity: qty, totalPrice: price,
          status, type: 'ONE_TIME',
          trackingCode: status === 'SHIPPED' || status === 'DELIVERED' ? `ILE${rndInt(10000000, 99999999)}BR` : null,
          shippingCost: rnd(8, 35),
          deliveryCep: '01310100',
          createdAt,
        }
      })
      await p.payment.create({
        data: {
          orderId: order.id, amount: price,
          method: pick(PAYMENT_METHODS),
          status: status === 'PENDING' ? 'PENDING' : status === 'CANCELED' ? 'FAILED' : 'SUCCESS',
          paidAt: status !== 'PENDING' && status !== 'CANCELED' ? createdAt : null,
          createdAt,
        }
      })
      orderCount++
    }
  }
  console.log('  Total pedidos clientes:', orderCount)

  /* ── 6. Coffeeshop orders (B2B) ── */
  console.log('\n🏪  Criando pedidos B2B das cafeterias...')
  const allCoffeeshops = await p.user.findMany({ where: { accountType: 'COFFEESHOP' }, select: { id: true, name: true } })
  let b2bCount = 0
  for (const cs of allCoffeeshops) {
    const numOrders = rndInt(3, 8)
    const boughtCoffees = []
    for (let i = 0; i < numOrders; i++) {
      const coffee = pick(allCoffees)
      const qty = rndInt(5, 30)
      const price = (coffee.packagePriceCoffeeshop ?? coffee.pricePerKg ?? 40) * qty
      const status = pick(['PAID', 'PAID', 'SHIPPED', 'DELIVERED', 'DELIVERED', 'PENDING'])
      const createdAt = daysAgo(rndInt(1, 90))
      const order = await p.order.create({
        data: {
          userId: cs.id, coffeeId: coffee.id,
          quantity: qty, totalPrice: price,
          status, type: 'ONE_TIME',
          shippingCost: rnd(20, 80),
          deliveryCep: '01310100',
          createdAt,
        }
      })
      await p.payment.create({
        data: {
          orderId: order.id, amount: price,
          method: pick(['PIX', 'CREDIT_CARD', 'BOLETO']),
          status: 'SUCCESS', paidAt: createdAt, createdAt,
        }
      })
      boughtCoffees.push({ coffeeId: coffee.id, qty, coffee })
      b2bCount++
    }

    // Stock for each coffeeshop based on what they bought
    const stockMap = new Map()
    for (const { coffeeId, qty } of boughtCoffees) {
      stockMap.set(coffeeId, (stockMap.get(coffeeId) ?? 0) + qty)
    }
    for (const [coffeeId, quantity] of stockMap) {
      const alertAt = Math.floor(quantity * 0.2)
      await p.coffeeshopStock.upsert({
        where: { userId_coffeeId: { userId: cs.id, coffeeId } },
        create: { userId: cs.id, coffeeId, quantity: quantity * rnd(0.5, 0.9), alertAt },
        update: { quantity: quantity * rnd(0.5, 0.9), alertAt },
      })
    }
  }
  console.log('  Total pedidos B2B:', b2bCount)

  /* ── 7. Subscriptions orders ── */
  console.log('\n🔄  Criando assinaturas ativas...')
  const subs = await p.subscription.findMany({ take: 3 })
  let subCount = 0
  if (subs.length > 0) {
    const subsUsers = [...customers, ...coffeeshops.slice(0, 3)]
    for (const user of subsUsers) {
      const sub = pick(subs)
      const exists = await p.order.findFirst({ where: { userId: user.id, subscriptionId: sub.id } })
      if (exists) continue
      const createdAt = daysAgo(rndInt(5, 120))
      const order = await p.order.create({
        data: {
          userId: user.id, subscriptionId: sub.id,
          totalPrice: sub.monthlyPrice, status: 'PAID',
          type: 'SUBSCRIPTION', billingCycle: 'MONTHLY',
          subscriptionStatus: pick(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PAUSED']),
          createdAt,
        }
      })
      await p.payment.create({
        data: {
          orderId: order.id, amount: sub.monthlyPrice,
          method: pick(['PIX', 'CREDIT_CARD']),
          status: 'SUCCESS', paidAt: createdAt, createdAt,
        }
      })
      subCount++
    }
  }
  console.log('  Assinaturas criadas:', subCount)

  /* ── 8. Course enrollments + progress ── */
  console.log('\n🎓  Criando matrículas e progresso em cursos...')
  const allLessons = await p.courseLesson.findMany()
  const lessonsByCourse = {}
  for (const l of allLessons) {
    if (!lessonsByCourse[l.courseId]) lessonsByCourse[l.courseId] = []
    lessonsByCourse[l.courseId].push(l)
  }

  const allEnrollableUsers = await p.user.findMany({ where: { accountType: 'CUSTOMER' }, select: { id: true } })
  let enrollCount = 0, progressCount = 0
  for (const user of allEnrollableUsers) {
    const numCourses = rndInt(0, 3)
    const chosen = [...courses].sort(() => Math.random() - 0.5).slice(0, numCourses)
    for (const course of chosen) {
      const exists = await p.courseEnrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } }
      })
      if (exists) continue
      const enrollment = await p.courseEnrollment.create({
        data: { userId: user.id, courseId: course.id, enrolledAt: daysAgo(rndInt(1, 60)) }
      })
      enrollCount++
      const lessons = lessonsByCourse[course.id] ?? []
      const completedCount = rndInt(0, lessons.length)
      for (let i = 0; i < completedCount; i++) {
        await p.courseLessonProgress.upsert({
          where: { userId_lessonId: { userId: user.id, lessonId: lessons[i].id } },
          create: { userId: user.id, lessonId: lessons[i].id, completedAt: daysAgo(rndInt(0, 30)) },
          update: {},
        })
        progressCount++
      }

      // Also create order for paid course
      const courseOrder = await p.order.findFirst({ where: { userId: user.id, courseId: course.id } })
      if (!courseOrder) {
        const ord = await p.order.create({
          data: {
            userId: user.id, courseId: course.id,
            totalPrice: course.price, status: 'PAID', type: 'COURSE',
            createdAt: enrollment.enrolledAt,
          }
        })
        await p.payment.create({
          data: {
            orderId: ord.id, amount: course.price,
            method: pick(['PIX', 'CREDIT_CARD']),
            status: 'SUCCESS', paidAt: enrollment.enrolledAt,
            createdAt: enrollment.enrolledAt,
          }
        })
      }
    }
  }
  console.log(`  Matrículas: ${enrollCount} | Progresso de aulas: ${progressCount}`)

  /* ── 9. Employees for all coffeeshops ── */
  console.log('\n👷  Criando funcionários para cada cafeteria...')
  const firstNames = ['Ana', 'Carlos', 'Luiza', 'Pedro', 'Isabela', 'Thiago', 'Daniela', 'Rafael', 'Mariana', 'Vinicius']
  const lastNames  = ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Lima', 'Carvalho', 'Rodrigues', 'Almeida']
  const roles = ['barista', 'gerente', 'atendente', 'supervisor', 'auxiliar']
  const femaleFirstNames = ['Ana', 'Luiza', 'Isabela', 'Daniela', 'Mariana']
  let empCount = 0
  let empPhotoIdx = 10 // start after the ones used for customers/coffeeshops
  for (const cs of allCoffeeshops) {
    const numEmps = rndInt(2, 4)
    for (let i = 0; i < numEmps; i++) {
      const firstName = pick(firstNames)
      const lastName  = pick(lastNames)
      const role      = pick(roles)
      const email     = `${firstName.toLowerCase()}.${role}@${cs.name.toLowerCase().replace(/[^a-z]/g,'')}.com`
      const exists = await p.employee.findUnique({ where: { email } })
      if (exists) continue
      const lastAccess = Math.random() > 0.3 ? hoursAgo(rndInt(1, 240)) : null
      const isFemale = femaleFirstNames.includes(firstName)
      const photoArr = isFemale ? USER_PHOTOS_F : USER_PHOTOS_M
      const empPhoto = photoArr[empPhotoIdx % 30]
      empPhotoIdx++
      const emp = await p.employee.create({
        data: {
          name: `${firstName} ${lastName}`,
          email, passwordHash: HASH,
          coffeeshopId: cs.id,
          photoUrl: empPhoto,
          lastAccessAt: lastAccess,
          createdAt: daysAgo(rndInt(5, 90)),
        }
      })
      empCount++

      // Stock logs for employees who accessed
      if (lastAccess) {
        const stocks = await p.coffeeshopStock.findMany({
          where: { userId: cs.id }, include: { coffee: { select: { name: true } } }, take: 5
        })
        const numLogs = rndInt(1, Math.min(4, stocks.length || 1))
        for (let j = 0; j < numLogs && j < stocks.length; j++) {
          const s = stocks[j]
          const prev = rnd(s.quantity * 1.1, s.quantity * 1.5)
          const delta = rnd(0.5, Math.min(prev, 5))
          const next  = +(prev - delta).toFixed(2)
          await p.employeeStockLog.create({
            data: {
              employeeId: emp.id,
              coffeeId: s.coffeeId,
              coffeeName: s.coffee?.name ?? 'Café',
              previousQty: prev,
              newQty: next,
              createdAt: hoursAgo(rndInt(1, 72)),
            }
          })
        }

        // Course views for employees who accessed
        const numViews = rndInt(0, Math.min(3, courses.length))
        const viewedCourses = [...courses].sort(() => Math.random() - 0.5).slice(0, numViews)
        for (const vc of viewedCourses) {
          await p.employeeCourseView.upsert({
            where: { employeeId_courseId: { employeeId: emp.id, courseId: vc.id } },
            create: { employeeId: emp.id, courseId: vc.id, courseName: vc.title, viewedAt: hoursAgo(rndInt(1, 120)) },
            update: {},
          })
        }
      }
    }
  }
  console.log('  Funcionários criados:', empCount)

  /* ── 10. Favorites ── */
  console.log('\n❤️  Criando favoritos...')
  let favCount = 0
  for (const user of allEnrollableUsers) {
    const numFavs = rndInt(2, 6)
    const chosen = [...allCoffees].sort(() => Math.random() - 0.5).slice(0, numFavs)
    for (const coffee of chosen) {
      try {
        await p.favorite.create({ data: { userId: user.id, coffeeId: coffee.id } })
        favCount++
      } catch { /* duplicate, skip */ }
    }
  }
  console.log('  Favoritos criados:', favCount)

  /* ── Summary ── */
  console.log('\n✅  Seed completo! Resumo final:')
  const [u, s, c, o, co, en, st, em] = await Promise.all([
    p.user.count(), p.supplier.count(), p.coffee.count(),
    p.order.count(), p.course.count(), p.courseEnrollment.count(),
    p.coffeeshopStock.count(), p.employee.count(),
  ])
  console.log(`  Users: ${u} | Suppliers: ${s} | Coffees: ${c}`)
  console.log(`  Orders: ${o} | Courses: ${co} | Enrollments: ${en}`)
  console.log(`  Stock entries: ${st} | Employees: ${em}`)
}

main()
  .catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })
  .finally(() => p.$disconnect())
