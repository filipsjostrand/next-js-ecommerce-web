🏀 Sportify — Full-Stack E-Commerce Platform

A modern, full-stack e-commerce application for sports equipment built with: <br>
  • Next.js <br>
  • App Router, <br>
  • Prisma, <br>
  • Stripe, and <br>
  • NextAuth.<br>

✨ Features

Secure authentication (Credentials)
Role-based access (Admin / User)
Product catalog with categories
Persistent shopping cart
Stripe checkout & webhooks
Order history & inventory management
Admin dashboard
SEO-optimized pages
Fully responsive Tailwind UI

🧱 Tech Stack

Next.js 14 (App Router)
Prisma ORM
SQLite (dev)
Stripe
NextAuth
Tailwind CSS
Playwright (E2E tests)

🗂️ Architecture

Server Components for data-heavy views
Client Components for interactions
Server Actions & Route Handlers for mutations
Stripe webhooks as source of truth
Edge middleware for access control

🔐 Security

Secure session cookies
Server-only payment logic
Webhook verification
Role-based authorization
Input validation at every boundary

🚀 Getting Started
git clone https://github.com/yourname/sportify
cd sportify
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
