import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SUPPLIER_ID = '56a729a5-1edb-4a06-9062-2ec73c48a77e'

// Unsplash — fotos de grãos, fazenda, colheita, café verde
const PHOTOS = [
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', // coffee farm aerial
  'https://images.unsplash.com/photo-1499744937866-d7e566a20a61?w=600&q=80', // coffee beans close-up
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', // raw coffee beans
  'https://images.unsplash.com/photo-1532004491497-ba35c367d634?w=600&q=80', // harvest / cherries
  'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600&q=80', // coffee plant
  'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&q=80', // coffee sack / burlap
  'https://images.unsplash.com/photo-1516743619420-154b70a65fea?w=600&q=80', // sorting beans
]

// Produtor vende por KG — preços de atacado, lotes mínimos de 5–60 kg
// saleType KG: visível para COFFEESHOP e torrefadores, oculto para clientes individuais
const coffees = [
  {
    photo: 0, name: 'Lote Especial Mantiqueira', variety: 'Catuaí Vermelho',
    process: 'Natural', region: 'Mantiqueira de Minas', altitude: 1420, score: 88,
    saleType: 'KG', pricePerKg: 52,
    sensory: 'amêndoa · caramelo · maçã verde', roast: 'A definir pelo comprador',
    description: 'Lote especial colhido manualmente. Cereja selecionada, secagem em camas elevadas por 30 dias. Ideal para torra clara.',
    farm: 'Sítio Pedra Redonda', producer: 'João Ferreira', stock: 300,
  },
  {
    photo: 1, name: 'Bourbon Amarelo Natural', variety: 'Bourbon Amarelo',
    process: 'Natural', region: 'Carmo de Minas', altitude: 1350, score: 89,
    saleType: 'KG', pricePerKg: 62,
    sensory: 'baunilha · caramelo · frutas amarelas', roast: 'A definir pelo comprador',
    description: 'Variedade Bourbon Amarelo de alta expressão. Colheita manual 100%, secagem controlada. Cereja com alto brix.',
    farm: 'Fazenda Irmãs Pereira', producer: 'Ana Pereira', stock: 180,
  },
  {
    photo: 2, name: 'Gesha Honey Lote 01', variety: 'Gesha',
    process: 'Honey', region: 'Sul de Minas', altitude: 1180, score: 91,
    saleType: 'KG', pricePerKg: 140,
    sensory: 'jasmim · pêssego · mel · bergamota', roast: 'A definir pelo comprador',
    description: 'Variedade Gesha processada em Honey. Mucilagem 50% mantida. Secagem 25 dias em camas suspensas. Lote limitado.',
    farm: 'Fazenda Terra Roxa', producer: 'Carlos Mendes', stock: 60,
  },
  {
    photo: 3, name: 'Arara Cerrado', variety: 'Arara',
    process: 'Cereja Natural', region: 'Cerrado Mineiro', altitude: 1060, score: 85,
    saleType: 'KG', pricePerKg: 38,
    sensory: 'chocolate · nozes · caramelo tostado', roast: 'A definir pelo comprador',
    description: 'Variedade Arara em terreiro suspenso. Boa expressão de corpo e doçura. Excelente para blend de espresso.',
    farm: 'Fazenda Sertão', producer: 'Pedro Lima', stock: 500,
  },
  {
    photo: 4, name: 'Anaeróbico Seleção', variety: 'Catuaí Amarelo',
    process: 'Anaeróbico Natural 72h', region: 'Chapada Diamantina', altitude: 1250, score: 90,
    saleType: 'KG', pricePerKg: 88,
    sensory: 'hibisco · framboesa · chocolate branco', roast: 'A definir pelo comprador',
    description: 'Fermentação anaeróbica de 72 horas em tanques selados. Perfil exótico e intenso. Para torrefadores especializados.',
    farm: 'Sítio Aurora', producer: 'Fernanda Costa', stock: 90,
  },
  {
    photo: 5, name: 'Mundo Novo Rondônia', variety: 'Mundo Novo',
    process: 'Natural', region: 'Matas de Rondônia', altitude: 980, score: 84,
    saleType: 'KG', pricePerKg: 28,
    sensory: 'chocolate amargo · cedro · terroso', roast: 'A definir pelo comprador',
    description: 'Café de altitude média com corpo expressivo. Ótimo custo-benefício para blend. Lote de grande volume disponível.',
    farm: 'Fazenda Granito', producer: 'Roberto Santos', stock: 1200,
  },
  {
    photo: 6, name: 'Topázio Pulped Natural', variety: 'Topázio',
    process: 'Pulped Natural (CD)', region: 'Espírito Santo do Pinhal', altitude: 1100, score: 86,
    saleType: 'KG', pricePerKg: 44,
    sensory: 'amêndoa · baunilha · mel · pão torrado', roast: 'A definir pelo comprador',
    description: 'Cereja descascada com secagem em terreiro de concreto. Equilíbrio entre acidez e dulçor. Versátil para filtrado ou espresso.',
    farm: 'Fazenda Serra Alta', producer: 'Mariana Oliveira', stock: 420,
  },
  {
    photo: 0, name: 'Icatu Lavado Altitude', variety: 'Icatu Amarelo',
    process: 'Lavado', region: 'Mantiqueira de Minas', altitude: 1390, score: 87,
    saleType: 'KG', pricePerKg: 56,
    sensory: 'limão siciliano · chá verde · floral', roast: 'A definir pelo comprador',
    description: 'Processo lavado em estação mecanizada própria. Perfil limpo e de alta acidez. Ideal para método filtrado.',
    farm: 'Fazenda Horizonte', producer: 'Lucas Andrade', stock: 240,
  },
  {
    photo: 1, name: 'Acaiá Sul de Minas', variety: 'Acaiá',
    process: 'Natural', region: 'Sul de Minas', altitude: 1020, score: 85,
    saleType: 'KG', pricePerKg: 36,
    sensory: 'frutas vermelhas · canela · doce', roast: 'A definir pelo comprador',
    description: 'Variedade Acaiá de fazenda familiar com 4 décadas. Consistência garantida lote a lote. Ótimo para assinaturas de torrefadores.',
    farm: 'Sítio Vale Encantado', producer: 'José Nunes', stock: 380,
  },
  {
    photo: 2, name: 'Bourbon Vermelho Névoa', variety: 'Bourbon Vermelho',
    process: 'Natural Slow Dry 35d', region: 'Carmo de Minas', altitude: 1480, score: 92,
    saleType: 'KG', pricePerKg: 165,
    sensory: 'morango · lavanda · chocolate branco · mel', roast: 'A definir pelo comprador',
    description: 'Secagem ultra-lenta de 35 dias em névoa de altitude. Complexidade excepcional. Lote micro, 45 kg disponíveis.',
    farm: 'Fazenda Névoa', producer: 'Silvia Lopes', stock: 45,
  },
  {
    photo: 3, name: 'Gesha Anaeróbico Diamante', variety: 'Gesha',
    process: 'Anaeróbico Natural', region: 'Chapada Diamantina', altitude: 1310, score: 93,
    saleType: 'KG', pricePerKg: 210,
    sensory: 'bergamota · maracujá · creme brûlée · floral', roast: 'A definir pelo comprador',
    description: 'Micro-lote de Gesha em fermentação anaeróbica. Pontuação de referência nacional. Alocação exclusiva mediante contrato.',
    farm: 'Fazenda Diamante', producer: 'Helena Vieira', stock: 30,
  },
  {
    photo: 4, name: 'Arara Honey Cerrado', variety: 'Arara',
    process: 'Honey', region: 'Cerrado Mineiro', altitude: 1090, score: 87,
    saleType: 'KG', pricePerKg: 48,
    sensory: 'pêssego · mel · biscoito amanteigado', roast: 'A definir pelo comprador',
    description: 'Arara em processo honey com mucilagem total preservada. Dulçor pronunciado e baixa acidez. Muito procurado por torrefadores.',
    farm: 'Fazenda Sol Poente', producer: 'Wagner Teixeira', stock: 350,
  },
]

async function main() {
  console.log(`Inserindo ${coffees.length} cafés para o produtor ${SUPPLIER_ID}...`)

  for (const c of coffees) {
    await prisma.coffee.create({
      data: {
        supplierId: SUPPLIER_ID,
        photoUrl: PHOTOS[c.photo],
        name: c.name,
        description: c.description,
        variety: c.variety,
        process: c.process,
        region: c.region,
        altitude: c.altitude,
        score: c.score,
        saleType: c.saleType as any,
        pricePerKg: c.pricePerKg,
        packagePrice: null,
        packagePriceCoffeeshop: null,
        packageWeight: null,
        farm: c.farm,
        producer: c.producer,
        sensory: c.sensory,
        roast: c.roast,
        stock: c.stock,
        weightGrams: null,
      },
    })
    process.stdout.write('.')
  }

  console.log(`\nDone! ${coffees.length} cafés inseridos.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
