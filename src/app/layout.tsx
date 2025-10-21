import './globals.css'
import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'First Lane Rentals — Car Rentals in Arkansas',
  description: 'Rent clean, reliable cars from First Lane Enterprises. Easy booking and transparent pricing.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200/70 dark:border-neutral-800/70">
          <nav className="container flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">First Lane Rentals</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">Cars</Link>
              <Link href="/admin" className="hover:underline">Admin</Link>
            </div>
          </nav>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t border-neutral-200/70 dark:border-neutral-800/70">
          <div className="container py-8 text-sm text-neutral-500">© {new Date().getFullYear()} First Lane Enterprises</div>
        </footer>
      </body>
    </html>
  )
}
