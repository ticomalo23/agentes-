import { prisma } from '@/lib/db'
import { carSchema } from '@/lib/validators'

function isAuthed(req: Request){
  const header = req.headers.get('x-admin-password')
  return Boolean(header && process.env.ADMIN_PASSWORD && header === process.env.ADMIN_PASSWORD)
}

export async function GET(_req: Request, { params }: { params: { id: string } }){
  const id = Number(params.id)
  const car = await prisma.car.findUnique({ where: { id } })
  if (!car) return new Response('Not found', { status: 404 })
  return Response.json({ car })
}

export async function PUT(req: Request, { params }: { params: { id: string } }){
  if (!isAuthed(req)) return new Response('Unauthorized', { status: 401 })
  const id = Number(params.id)
  const json = await req.json()
  const parsed = carSchema.partial().safeParse(json)
  if (!parsed.success) return new Response(JSON.stringify(parsed.error.format()), { status: 422 })
  try {
    const updated = await prisma.car.update({ where: { id }, data: parsed.data })
    return Response.json({ car: updated })
  } catch (error) {
    return new Response('Not found', { status: 404 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }){
  if (!isAuthed(req)) return new Response('Unauthorized', { status: 401 })
  const id = Number(params.id)
  try {
    await prisma.car.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    return new Response('Not found', { status: 404 })
  }
}
