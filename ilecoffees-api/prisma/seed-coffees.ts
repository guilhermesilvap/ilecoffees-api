import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SUPPLIER_ID = '95d01b23-dd79-400f-97f1-6106513672e2'

// Unsplash coffee / coffee-bag photos
const PHOTOS = [
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80', // coffee bags on shelf
  'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80', // kraft paper coffee bag
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', // espresso cup beans
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', // coffee bag label
  'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80', // coffee bag white bg
  'https://images.unsplash.com/photo-1485808191679-5f86510bd9d0?w=600&q=80', // coffee cups
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80', // coffee close-up
  'https://images.unsplash.com/photo-1421955048957-cad5be73ee94?w=600&q=80', // coffee beans
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', // coffee farm
]

const coffees = [
  { name: 'Pedra Redonda',       photo: 0, variety: 'Catuaí Vermelho',  process: 'Natural',           region: 'Mantiqueira de Minas', altitude: 1420, score: 88, saleType: 'PACKAGE', packagePrice: 68,  packagePriceCoffeeshop: 52,  packageWeight: 250, sensory: 'amêndoa · caramelo · maçã verde',         roast: 'Média Clara',   description: 'Micro-lote de colheita seletiva em altitude elevada.',                   farm: 'Sítio Pedra Redonda',     producer: 'João Ferreira',   weightGrams: 250 },
  { name: 'Crema Brûlée',        photo: 1, variety: 'Bourbon Amarelo',  process: 'Natural',           region: 'Carmo de Minas',       altitude: 1350, score: 89, saleType: 'PACKAGE', packagePrice: 79,  packagePriceCoffeeshop: 61,  packageWeight: 250, sensory: 'baunilha · caramelo · cacau',              roast: 'Média',         description: 'Café premiado internacionalmente com notas de confeitaria.',             farm: 'Fazenda Irmãs Pereira',   producer: 'Ana Pereira',     weightGrams: 250 },
  { name: 'Terra Roxa',          photo: 2, variety: 'Gesha',            process: 'Honey',             region: 'Sul de Minas',         altitude: 1180, score: 87, saleType: 'BOTH',    pricePerKg: 180,   packagePrice: 58,  packagePriceCoffeeshop: 44,  packageWeight: 250, sensory: 'jasmim · pêssego · mel',                  roast: 'Clara',         description: 'Variedade Gesha cultivada em solo fértil de terra roxa.',                farm: 'Fazenda Terra Roxa',      producer: 'Carlos Mendes',   weightGrams: 250 },
  { name: 'Sertão Profundo',     photo: 3, variety: 'Arara',            process: 'Cereja Natural',    region: 'Cerrado Mineiro',      altitude: 1060, score: 85, saleType: 'BOTH',    pricePerKg: 120,   packagePrice: 44,  packagePriceCoffeeshop: 34,  packageWeight: 250, sensory: 'chocolate · nozes · caramelo',             roast: 'Média Escura',  description: 'Café do cerrado com corpo encorpado e final longo.',                     farm: 'Fazenda Sertão',          producer: 'Pedro Lima',      weightGrams: 250 },
  { name: 'Aurora Rosa',         photo: 4, variety: 'Catuaí Amarelo',  process: 'Anaeróbico',        region: 'Chapada Diamantina',   altitude: 1250, score: 90, saleType: 'PACKAGE', packagePrice: 95,  packagePriceCoffeeshop: 74,  packageWeight: 250, sensory: 'hibisco · framboesa · açúcar mascavo',      roast: 'Clara',         description: 'Fermentação anaeróbica exclusiva com perfil floral intenso.',            farm: 'Sítio Aurora',            producer: 'Fernanda Costa',  weightGrams: 250 },
  { name: 'Granito Negro',       photo: 5, variety: 'Mundo Novo',      process: 'Natural',           region: 'Matas de Rondônia',    altitude:  980, score: 84, saleType: 'KG',      pricePerKg: 98,                                                                          sensory: 'chocolate amargo · tabaco · terra',        roast: 'Escura',        description: 'Café robusto com notas terrosas características da região.',             farm: 'Fazenda Granito',         producer: 'Roberto Santos',  weightGrams: 250 },
  { name: 'Colheita da Serra',   photo: 6, variety: 'Topázio',         process: 'Pulped Natural',    region: 'Espírito Santo do Pinhal', altitude: 1100, score: 86, saleType: 'BOTH', pricePerKg: 135,  packagePrice: 49,  packagePriceCoffeeshop: 38,  packageWeight: 250, sensory: 'amêndoa torrada · baunilha · mel',          roast: 'Média',         description: 'Café de altitude com equilíbrio perfeito entre acidez e dulçor.',        farm: 'Fazenda Serra Alta',      producer: 'Mariana Oliveira', weightGrams: 250 },
  { name: 'Horizonte Azul',      photo: 7, variety: 'Icatu Amarelo',   process: 'Lavado',            region: 'Mantiqueira de Minas', altitude: 1390, score: 88, saleType: 'PACKAGE', packagePrice: 72,  packagePriceCoffeeshop: 56,  packageWeight: 250, sensory: 'limão siciliano · chá verde · floral',      roast: 'Clara',         description: 'Processo lavado que realça a acidez vibrante e o perfil limpo.',         farm: 'Fazenda Horizonte',       producer: 'Lucas Andrade',   weightGrams: 250 },
  { name: 'Vale Encantado',      photo: 8, variety: 'Acaiá',           process: 'Natural',           region: 'Sul de Minas',         altitude: 1020, score: 85, saleType: 'BOTH',    pricePerKg: 110,   packagePrice: 42,  packagePriceCoffeeshop: 32,  packageWeight: 250, sensory: 'frutas vermelhas · canela · baunilha',      roast: 'Média',         description: 'Lote especial de fazenda familiar com 40 anos de tradição.',             farm: 'Sítio Vale Encantado',    producer: 'José Nunes',      weightGrams: 250 },
  { name: 'Ouro Verde',          photo: 0, variety: 'Catuaí Vermelho', process: 'Honey',             region: 'Cerrado Mineiro',      altitude: 1070, score: 86, saleType: 'BOTH',    pricePerKg: 128,   packagePrice: 47,  packagePriceCoffeeshop: 36,  packageWeight: 250, sensory: 'mel · fruta seca · nozes',                 roast: 'Média',         description: 'Processo honey que preserva os açúcares naturais da cereja.',            farm: 'Fazenda Ouro Verde',      producer: 'Paulo Brito',     weightGrams: 250 },
  { name: 'Névoa da Madrugada',  photo: 1, variety: 'Bourbon Vermelho',process: 'Natural',           region: 'Carmo de Minas',       altitude: 1480, score: 91, saleType: 'PACKAGE', packagePrice: 115, packagePriceCoffeeshop: 88,  packageWeight: 250, sensory: 'morango · lavanda · chocolate branco',      roast: 'Clara',         description: 'Lote de micro-altitude com terroir único de névoa constante.',           farm: 'Fazenda Névoa',           producer: 'Silvia Lopes',    weightGrams: 250 },
  { name: 'Estrada de Pedra',    photo: 2, variety: 'Tupi',            process: 'Cereja Descascada', region: 'Sul de Minas',         altitude:  940, score: 84, saleType: 'KG',      pricePerKg: 88,                                                                          sensory: 'chocolate ao leite · amendoim · caramelo', roast: 'Média Escura',  description: 'Café de blend especial com corpo e persistência marcantes.',             farm: 'Fazenda Caminho',         producer: 'Antônio Cruz',    weightGrams: 250 },
  { name: 'Diamante Bruto',      photo: 3, variety: 'Gesha',           process: 'Anaeróbico Natural',region: 'Chapada Diamantina',   altitude: 1310, score: 93, saleType: 'PACKAGE', packagePrice: 148, packagePriceCoffeeshop: 115, packageWeight: 250, sensory: 'bergamota · maracujá · creme brûlée',       roast: 'Clara',         description: 'O mais raro do portfólio. Fermentação anaeróbica de 72 horas.',         farm: 'Fazenda Diamante',        producer: 'Helena Vieira',   weightGrams: 250 },
  { name: 'Brisa do Campo',      photo: 4, variety: 'Bourbon Amarelo', process: 'Natural',           region: 'Espírito Santo do Pinhal', altitude: 1050, score: 85, saleType: 'BOTH', pricePerKg: 105,  packagePrice: 40,  packagePriceCoffeeshop: 31,  packageWeight: 250, sensory: 'caramelo · damasco · amêndoa',              roast: 'Média',         description: 'Café equilibrado ideal para espresso e filtrado.',                       farm: 'Sítio Brisa',             producer: 'Ricardo Campos',  weightGrams: 250 },
  { name: 'Mata Nativa',         photo: 5, variety: 'Catuaí Vermelho', process: 'Lavado',            region: 'Matas de Rondônia',    altitude:  870, score: 83, saleType: 'KG',      pricePerKg: 82,                                                                          sensory: 'castanha-do-pará · cacau · cedro',         roast: 'Média Escura',  description: 'Café de região de mata nativa com perfil único amazônico.',              farm: 'Fazenda Mata',            producer: 'Cleber Moreira',  weightGrams: 250 },
  { name: 'Sol Poente',          photo: 6, variety: 'Arara',           process: 'Honey',             region: 'Cerrado Mineiro',      altitude: 1090, score: 87, saleType: 'BOTH',    pricePerKg: 142,   packagePrice: 54,  packagePriceCoffeeshop: 42,  packageWeight: 250, sensory: 'pêssego · mel · biscoito',                 roast: 'Média',         description: 'Terroir de cerrado elevado com processo honey artesanal.',               farm: 'Fazenda Sol Poente',      producer: 'Wagner Teixeira', weightGrams: 250 },
  { name: 'Luz da Lua',          photo: 7, variety: 'Topázio',         process: 'Natural Slow Dry',  region: 'Mantiqueira de Minas', altitude: 1440, score: 90, saleType: 'PACKAGE', packagePrice: 98,  packagePriceCoffeeshop: 76,  packageWeight: 250, sensory: 'chocolate · frutas vermelhas · mel',        roast: 'Média Clara',   description: 'Secagem lenta em camas elevadas por 35 dias para máximo dulçor.',        farm: 'Fazenda Lua Cheia',       producer: 'Beatriz Souza',   weightGrams: 250 },
  { name: 'Rio das Pedras',      photo: 8, variety: 'Mundo Novo',      process: 'Cereja Natural',    region: 'Sul de Minas',         altitude: 1010, score: 84, saleType: 'BOTH',    pricePerKg: 92,    packagePrice: 38,  packagePriceCoffeeshop: 29,  packageWeight: 250, sensory: 'cacau · nozes · baunilha',                 roast: 'Média',         description: 'Clássico sul-mineiro com consistência e versatilidade.',                farm: 'Fazenda Rio das Pedras',  producer: 'Marcos Pinto',    weightGrams: 250 },
]

async function main() {
  console.log('Atualizando photoUrl dos cafés...')

  for (const c of coffees) {
    await prisma.coffee.updateMany({
      where: { name: c.name, supplierId: SUPPLIER_ID },
      data: { photoUrl: PHOTOS[c.photo] },
    })
    process.stdout.write('.')
  }

  console.log(`\nDone! ${coffees.length} cafés atualizados.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
