import { z } from 'zod'

export const carSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().gte(1980).lte(new Date().getFullYear() + 1),
  trim: z.string().optional().nullable(),
  dailyPrice: z.number().int().gte(10).lte(2000),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  mileage: z.number().int().gte(0).lte(500000),
  transmission: z.enum(['Automatic', 'Manual']),
  fuel: z.enum(['Gas', 'Hybrid', 'Electric', 'Diesel']),
  seats: z.number().int().gte(2).lte(9),
  doors: z.number().int().gte(2).lte(5),
  imageUrl: z.string().url(),
  images: z.array(z.string().url()).default([]),
  description: z.string().min(1).max(2000),
  features: z.array(z.string()).default([]),
  available: z.boolean().default(true)
})

export type CarInput = z.infer<typeof carSchema>
