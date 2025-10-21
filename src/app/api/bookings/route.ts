import { prisma } from '@/lib/db'

function isEmail(v:string){ return /.+@.+\..+/.test(v) }

async function sendEmail(subject:string, html:string){
  if (process.env.RESEND_API_KEY){
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'First Lane Rentals <noreply@firstlane.example>',
      to: [process.env.BOOKINGS_EMAIL || 'owner@example.com'],
      subject,
      html
    })
    return
  }
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  })
  await transporter.sendMail({
    from: 'First Lane Rentals <noreply@firstlane.example>',
    to: process.env.BOOKINGS_EMAIL || 'owner@example.com',
    subject, html
  })
}

export async function POST(req: Request){
  const json = await req.json()
  const { carId, name, email, phone, startDate, endDate, message } = json || {}

  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null

  if (
    !carId ||
    !name ||
    !isEmail(email) ||
    !start ||
    !end ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ){
    return new Response('Invalid payload', { status: 422 })
  }

  const car = await prisma.car.findUnique({ where: { id: Number(carId) } })
  if (!car) return new Response('Car not found', { status: 404 })

  const booking = await prisma.booking.create({ data: {
    carId: Number(carId),
    name: String(name),
    email: String(email),
    phone: phone ? String(phone) : null,
    startDate: start,
    endDate: end,
    message: message ? String(message) : null,
  } })

  const html = `
    <h2>New booking request</h2>
    <p><b>Car:</b> ${car.year} ${car.make} ${car.model} (ID ${car.id})</p>
    <p><b>Name:</b> ${booking.name}</p>
    <p><b>Email:</b> ${booking.email}</p>
    <p><b>Phone:</b> ${booking.phone || '-'} </p>
    <p><b>Dates:</b> ${booking.startDate.toDateString()} → ${booking.endDate.toDateString()}</p>
    <p><b>Message:</b> ${booking.message || '-'} </p>
  `
  try { await sendEmail(`Booking — Car ${car.id}`, html) } catch {}

  return Response.json({ ok: true, bookingId: booking.id }, { status: 201 })
}
