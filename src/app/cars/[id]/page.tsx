import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'

function waLink(car: any) {
  const phone = process.env.NEXT_PUBLIC_WA_NUMBER || ''
  const text = encodeURIComponent(`Hola First Lane, quiero reservar el ${car.year} ${car.make} ${car.model} (ID ${car.id}) del ${new Date().toLocaleDateString()}.`)
  return `https://wa.me/${phone}?text=${text}`
}

export default async function CarDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const car = await prisma.car.findUnique({ where: { id } })
  if (!car) return <div>Car not found</div>
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        <Image src={car.imageUrl} alt={`${car.make} ${car.model}`} width={1200} height={900} className="w-full h-auto rounded-2xl object-cover" />
        <div className="grid grid-cols-3 gap-2">
          {car.images?.map((url, i) => (
            <Image key={i} src={url} alt="gallery" width={400} height={300} className="h-24 w-full object-cover rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{car.year} {car.make} {car.model}{car.trim ? ` ${car.trim}`: ''}</h1>
        <div className="text-primary text-2xl font-extrabold">${car.dailyPrice}/day</div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{car.city}, {car.state} • {car.transmission} • {car.fuel} • {car.seats} seats • {car.mileage.toLocaleString()} miles</p>
        <p>{car.description}</p>
        {car.features?.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-200">
            {car.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href={`/book/${car.id}`} className="btn">Request booking</Link>
          <Link href={waLink(car)} className="btn bg-green-600 hover:bg-green-700">WhatsApp</Link>
          <Link href="/" className="btn bg-neutral-200 text-neutral-900 hover:bg-neutral-300">Back</Link>
        </div>
      </div>
    </div>
  )
}
