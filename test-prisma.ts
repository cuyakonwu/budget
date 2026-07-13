import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const pc = await prisma.paycheck.create({
      data: {
        name: 'Test',
        date: new Date(),
        expectedAmt: 1000
      }
    })
    console.log('Success:', pc)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
