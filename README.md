# First Lane Rentals — Setup

```bash
# 1) Install deps
pnpm i || npm i || yarn

# 2) Configure env
cp .env.example .env   # create .env and set ADMIN_PASSWORD and DATABASE_URL

# 3a) Local with SQLite (fastest):
# DATABASE_URL="file:./dev.db" in .env
npx prisma generate
npx prisma migrate dev --name init

# 3b) Supabase/Postgres (production):
# Set DATABASE_URL to your Supabase connection string
npx prisma generate
npx prisma migrate deploy

# 4) Dev server
npm run dev
# open http://localhost:3000
```

## Admin usage
- /admin (password must match `ADMIN_PASSWORD`).
- Add/edit/delete cars.

## Booking flow (email + WhatsApp)
- Page `/book/[id]` posts to `/api/bookings`.
- If `RESEND_API_KEY` is set, system sends email via Resend.
- Otherwise tries SMTP using `SMTP_*` env vars.
- WhatsApp button opens a prefilled chat to your number (`NEXT_PUBLIC_WA_NUMBER`).

## Notes
- Original codebase, inspired by common rental UX patterns.
- For production, move rate limiting to a durable store (Redis) and implement full auth (JWT/NextAuth) if you need multiple admins.
