import { prisma } from '@/lib/db'

export default async function seed() {
  await prisma.user.create({
    data: {
      name: 'John Doe'
    }
  })
}

seed()
