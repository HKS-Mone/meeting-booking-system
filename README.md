Booking System
A full-stack company meeting and service booking management system built with Next.js 14, PostgreSQL, and Prisma. Designed for organisations managing room bookings, meeting schedules, and departmental resources.
---
Tech Stack
Layer	Technology
Frontend	Next.js 14 (App Router), TypeScript, Tailwind CSS
Backend	Next.js API Routes
Database	PostgreSQL via Prisma ORM
Caching	Redis (Upstash)
Authentication	JWT + Role-Based Access Control
Email	Resend / Nodemailer
PDF Generation	PDFKit
State Management	Zustand
Validation	Zod
---
Prerequisites
Make sure these are installed on your machine before starting:
Node.js 18.17 or higher
npm 9 or higher
PostgreSQL 14 or higher
Redis (optional for local dev)
Git
---
Getting Started
1. Clone the Repository
```bash
git clone https://github.com/yourusername/booking-system.git
cd booking-system
```
2. Install Dependencies
```bash
npm install
```
3. Configure Environment Variables
```bash
cp .env.example .env
```
Open `.env` and fill in your values:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/booking_db"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
RESEND_API_KEY="your-resend-api-key"
NODE_ENV="development"
```
4. Set Up the Database
```bash
# Run all migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```
5. Start the Development Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser.
---
Project Structure
```
booking-system/
├── prisma/
│   ├── schema.prisma           ← Database schema
│   ├── seed.ts                 ← Dev seed data
│   └── migrations/             ← Auto-generated migrations
│
├── public/
│   ├── icons/
│   └── images/
│
├── src/
│   ├── app/                    ← Next.js App Router
│   │   ├── (auth)/             ← Auth pages (no dashboard layout)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        ← Protected pages (shared layout)
│   │   │   ├── layout.tsx
│   │   │   ├── overview/
│   │   │   ├── bookings/
│   │   │   ├── rooms/
│   │   │   └── admin/
│   │   ├── api/                ← REST API endpoints
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── rooms/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/             ← UI components
│   │   ├── ui/                 ← Reusable atoms (Button, Input, Modal)
│   │   ├── forms/              ← Form components with validation
│   │   ├── layout/             ← Sidebar, Header, Footer
│   │   ├── bookings/           ← Booking-specific components
│   │   ├── rooms/              ← Room-specific components
│   │   └── dashboard/          ← Dashboard widgets
│   │
│   ├── lib/                    ← Backend utilities (no React)
│   │   ├── prisma.ts           ← Prisma client singleton
│   │   ├── auth.ts             ← JWT helpers
│   │   ├── hash.ts             ← bcrypt helpers
│   │   ├── mailer.ts           ← Email setup
│   │   ├── pdf.ts              ← PDF generation
│   │   └── response.ts         ← Standard API responses
│   │
│   ├── services/               ← Business logic and DB queries
│   │   ├── auth.service.ts
│   │   ├── booking.service.ts
│   │   ├── room.service.ts
│   │   ├── user.service.ts
│   │   └── report.service.ts
│   │
│   ├── hooks/                  ← Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useBookings.ts
│   │   ├── useRooms.ts
│   │   └── useDebounce.ts
│   │
│   ├── store/                  ← Zustand global state
│   │   ├── authStore.ts
│   │   └── bookingStore.ts
│   │
│   ├── middleware/             ← API route guards
│   │   └── withAuth.ts
│   ├── middleware.ts           ← Next.js edge middleware
│   │
│   ├── types/                  ← TypeScript type definitions
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── booking.types.ts
│   │   └── api.types.ts
│   │
│   ├── validations/            ← Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── booking.schema.ts
│   │   └── room.schema.ts
│   │
│   └── constants/              ← App-wide constants
│       ├── roles.ts
│       ├── status.ts
│       └── routes.ts
│
├── .env                        ← Local environment (never commit)
├── .env.example                ← Environment variable template
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
---
Data Flow Architecture
Every request follows this strict path. Never skip a layer.
```
Browser / Client
      |
      | HTTP Request
      v
app/api/[resource]/route.ts     ← Validate input, call service
      |
      v
services/[resource].service.ts  ← All business logic and DB queries
      |
      v
lib/prisma.ts                   ← Single database connection
      |
      v
PostgreSQL Database
```
---
User Roles
Role	Access
`ADMIN`	Full access: users, rooms, bookings, reports, settings
`MANAGER`	Manage bookings and rooms within their department
`STAFF`	Create and manage their own bookings
---
API Endpoints
Authentication
Method	Endpoint	Description
POST	`/api/auth/register`	Register new user
POST	`/api/auth/login`	Login and receive JWT
POST	`/api/auth/logout`	Invalidate session
POST	`/api/auth/refresh`	Refresh access token
Bookings
Method	Endpoint	Description
GET	`/api/bookings`	List all bookings
POST	`/api/bookings`	Create new booking
GET	`/api/bookings/[id]`	Get single booking
PATCH	`/api/bookings/[id]`	Update booking
DELETE	`/api/bookings/[id]`	Cancel booking
Rooms
Method	Endpoint	Description
GET	`/api/rooms`	List all rooms
POST	`/api/rooms`	Create new room
GET	`/api/rooms/[id]`	Get single room
PATCH	`/api/rooms/[id]`	Update room
DELETE	`/api/rooms/[id]`	Remove room
Users
Method	Endpoint	Description
GET	`/api/users`	List all users (Admin only)
GET	`/api/users/[id]`	Get user profile
PATCH	`/api/users/[id]`	Update user
DELETE	`/api/users/[id]`	Remove user (Admin only)
Reports
Method	Endpoint	Description
GET	`/api/reports`	Generate usage reports
---
Available Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Run Prisma Studio (visual DB browser)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Push schema changes without migration (dev only)
npx prisma db push

# Seed the database
npx prisma db seed
```
---
Deployment
Digital Ocean VPS (Recommended)
```bash
# On your server after cloning
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 start npm --name "booking-system" -- start
pm2 save
```
Set up Nginx as a reverse proxy pointing to `http://localhost:3000`.
Vercel + Neon (Alternative)
Push code to GitHub
Import the repository at vercel.com
Add environment variables in the Vercel dashboard
Connect a Neon PostgreSQL database
Vercel deploys automatically on every push to `main`
---
Environment Variables Reference
Variable	Required	Description
`DATABASE_URL`	Yes	PostgreSQL connection string
`JWT_SECRET`	Yes	Secret key for signing JWTs
`NEXTAUTH_SECRET`	Yes	Secret for session encryption
`NEXT_PUBLIC_APP_URL`	Yes	Public URL of your application
`REDIS_URL`	No	Redis connection string for caching
`RESEND_API_KEY`	No	Resend API key for email notifications
`NODE_ENV`	Yes	`development` or `production`
---
Database Schema Overview
```
User
 ├── id, name, email, password, role, department
 └── has many Bookings

Room
 ├── id, name, capacity, location, isActive
 └── has many Bookings

Booking
 ├── id, title, description, startTime, endTime, status
 ├── belongs to User
 └── belongs to Room
```
---
Contributing
Create a feature branch from `main`
```bash
git checkout -b feature/your-feature-name
```
Make your changes and commit
```bash
git add .
git commit -m "add: your feature description"
```
Push and open a pull request
```bash
git push origin feature/your-feature-name
```
---
License
MIT License. See `LICENSE` for details.