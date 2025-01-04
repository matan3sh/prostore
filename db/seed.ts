import sampleData from '@/db/sample-data'
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  await prisma.product.deleteMany()
  await prisma.product.createMany({ data: sampleData.products })

  console.log('Data seeded successfully')
}

main()
