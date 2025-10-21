'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Car } from '@prisma/client'

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="card overflow-hidden">
      <Image src={car.imageUrl} alt={`${car.make} ${car.model}`} width={800} height={600} className="h-48 w-full object-cover" />
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{car.year} {car.make} {car.model}</h3>
          <span className="text-primary font-bold">${car.dailyPrice}/day</span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{car.city}, {car.state} • {car.transmission} • {car.fuel} • {car.seats} seats</p>
        <Link className="btn mt-2" href={`/cars/${car.id}`}>View details</Link>
      </div>
    </div>
  )
}
