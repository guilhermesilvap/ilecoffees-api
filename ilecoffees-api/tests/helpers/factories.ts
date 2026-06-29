export const userFactory = {
  accountType: 'INDIVIDUAL' as const,
  name: 'Test User',
  email: 'user@test.com',
  password: 'Test@1234',
  phoneNumber: '(11) 99999-9999',
  cep: '01310100',
  street: 'Rua Teste',
  number: '100',
  district: 'Centro',
  city: 'São Paulo',
  state: 'SP',
}

export const supplierFactory = {
  name: 'Test Supplier',
  email: 'supplier@test.com',
  password: 'Test@1234',
  cep: '01310100',
  street: 'Rua Teste',
  number: '100',
  district: 'Centro',
  city: 'São Paulo',
  state: 'SP',
}

export const coffeeFactory = {
  name: 'Café Teste',
  description: 'Descrição do café de teste',
  variety: 'Bourbon',
  process: 'Natural',
  region: 'Sul de Minas',
  altitude: 1200,
  farm: 'Fazenda Teste',
  producer: 'Produtor Teste',
  score: 85,
  sensory: 'Chocolate e frutas vermelhas',
  roast: 'Médio',
  saleType: 'KG' as const,
  pricePerKg: 50,
  stock: 100,
}

export const coffeePackageFactory = {
  name: 'Café Pacote Teste',
  description: 'Descrição do café pacote de teste',
  variety: 'Bourbon',
  process: 'Natural',
  region: 'Sul de Minas',
  altitude: 1200,
  farm: 'Fazenda Teste',
  producer: 'Produtor Teste',
  score: 85,
  sensory: 'Chocolate e frutas vermelhas',
  roast: 'Médio',
  saleType: 'PACKAGE' as const,
  packagePrice: 35,
  packageWeight: 250,
  stock: 50,
}

export const courseFactory = {
  title: 'Curso de Barismo',
  description: 'Aprenda a fazer café como um profissional',
  price: 299.9,
  workloadHours: 10,
  level: 'BEGINNER' as const,
}
