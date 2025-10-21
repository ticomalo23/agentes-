import { prisma } from '@/lib/db'
import CarCard from '@/components/CarCard'

export default async function Home() {
  const cars = await prisma.car.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Find your ride</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Clean, reliable rentals from First Lane Enterprises.</p>
      </div>
      {cars.length === 0 && <p>No cars yet. Add some in the Admin panel.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map(c => <CarCard key={c.id} car={c} />)}
      </div>
    </div>
  )
}
