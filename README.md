⚽ Sportify — Full-Stack E-Commerce Platform

Available at: https://next-js-sportify-10.vercel.app/

A modern, full-stack e-commerce application for sports equipment built with: <br>
  • Next.js <br>
  • App Router, <br>
  • Prisma, <br>
  • Stripe, and <br>
  • NextAuth,<br>
  • ShadCn,<br>
  • Resend,<br>
  • Axios.<br>

Database is hosted at neon.tech

✨ Features

• Secure authentication (Credentials) <br>
• Role-based access (Admin / User - logged in / guest) <br>
• Product catalog with categories <br>
• Persistent shopping cart <br>
• Stripe checkout & webhooks <br>
• Order history & inventory management <br>
• Admin dashboard <br>
• SEO-optimized pages <br>
• Fully responsive Tailwind UI <br>

🧱 Tech Stack

• Next.js 14 (App Router) <br>
• Prisma ORM <br>
• PostgresQL (possible to switch to SQLite) (dev) <br>
• Stripe <br>
• NextAuth <br>
• Tailwind CSS <br>

🗂️ Architecture

• Server Components for data-heavy views <br>
• Client Components for interactions <br>
• Server Actions & Route Handlers for mutations <br>
• Stripe webhooks as source of truth <br>
• Edge middleware for access control <br>

🔐 Security

• Secure session cookies <br>
• Server-only payment logic <br>
• Webhook verification <br>
• Role-based authorization <br>
• Input validation at every boundary <br>

🚀 Getting Started
git clone https://github.com/yourname/sportify <br>
cd sportify <br>
npm install <br>
npx prisma migrate dev <br>
npx prisma db seed <br>
npm run dev <br>
