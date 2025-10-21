import { prisma } from '@/lib/db'
import { carSchema } from '@/lib/validators'

function isAuthed(req: Request){
  const header = req.headers.get('x-admin-password')
  return Boolean(header && process.env.ADMIN_PASSWORD && header === process.env.ADMIN_PASSWORD)
}

export async function GET(){
  const cars = await prisma.car.findMany({ orderBy: { createdAt: 'desc' } })
  return Response.json({ cars })
}

export async function POST(req: Request){
  if (!isAuthed(req)) return new Response('Unauthorized', { status: 401 })
  const json = await req.json()
  const parsed = carSchema.safeParse(json)
  if (!parsed.success) return new Response(JSON.stringify(parsed.error.format()), { status: 422 })
  const created = await prisma.car.create({ data: parsed.data })
  return Response.json({ car: created }, { status: 201 })
}
