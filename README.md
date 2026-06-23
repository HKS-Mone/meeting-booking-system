# Booking System

A meeting booking system built with Next.js App Router. The application lets employees book meeting time slots, view their booking history, and manage a shared calendar. Admin users get additional dashboards for bookings, users, reports, and settings.

## Features

- JWT cookie-based authentication with protected dashboard layouts
- Role-based redirects for employees, admins, and super admins
- Calendar view for booking availability
- Booking creation, update, soft delete, and overlap validation
- Employee booking history
- Admin dashboard with booking and department statistics
- Admin booking management and user management screens
- MySQL persistence through Prisma ORM
- Docker and Docker Compose support for production-style local hosting
- GitHub Actions deployment workflow over SSH

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form, Zod |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Database | MySQL 8 |
| ORM | Prisma 6 |
| Runtime | Node.js 20 |
| Deployment | Docker, Docker Compose, GitHub Actions |

## Requirements

- Node.js 20 or newer
- npm
- MySQL 8, or Docker with Docker Compose

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/booking-system.git
cd booking-system
```

2. Install dependencies:

```bash
npm install
```

3. Create the environment file:

```bash
cp .env.example .env
```

4. Update `.env` for your local setup. For a local MySQL server outside Docker, use a localhost database URL:

```env
DATABASE_URL="mysql://root:1234@localhost:3306/booking_system"
MYSQL_ROOT_PASSWORD=1234
MYSQL_DATABASE=booking_system
MYSQL_USER=booking_user
MYSQL_PASSWORD=booking_password
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=change-me-to-a-long-random-secret
```

5. Generate Prisma Client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

6. Seed the database:

```bash
npm run db:seed
```

Seeded admin account:

```text
Email: admin@mone.com
Password: admin123
```

7. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Docker Setup

For Docker Compose, keep the default `.env.example` style database URL because the app container connects to the MySQL service by service name:

```env
DATABASE_URL="mysql://root:1234@db:3306/booking_system"
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=change-me-to-a-long-random-secret
```

Start the app and database:

```bash
docker compose up -d --build
```

The app runs on `http://localhost:3000` and MySQL is exposed on port `3306`.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run Prisma migrations in development |
| `npm run db:seed` | Seed departments, admin user, and sample booking |

Useful Prisma commands:

```bash
npx prisma studio
npx prisma migrate deploy
npx prisma db push
```

## Project Structure

```text
booking-system/
+-- .github/
|   +-- workflows/
|       +-- deploy.yml              # SSH deployment workflow
+-- hook/                           # Client-side React hooks
|   +-- useAdmin.ts
|   +-- useAuth.ts
|   +-- useBooking.ts
|   +-- useUser.ts
+-- prisma/
|   +-- migrations/                 # Database migrations
|   +-- schema.prisma               # MySQL schema
|   +-- seed.ts                     # Initial departments, admin, sample data
+-- public/                         # Static assets
+-- src/
|   +-- app/                        # Next.js App Router
|   |   +-- (admin)/                # Protected admin area
|   |   +-- (auth)/                 # Login layout and actions
|   |   +-- (dashboard)/            # Employee dashboard area
|   |   +-- globals.css
|   |   +-- layout.tsx
|   |   +-- page.tsx                # Role-aware root redirect
|   +-- components/
|   |   +-- admin/                  # Admin tables and management UI
|   |   +-- booking/                # Booking history UI
|   |   +-- calendar/               # Calendar grid and event chips
|   |   +-- dashboard/              # Dashboard cards and charts
|   |   +-- layout/                 # Sidebars and top bar
|   |   +-- ui/                     # Shared UI components
|   +-- lib/                        # Shared types, stores, utilities, Prisma client
|   +-- repository/                 # Prisma data access layer
|   +-- services/                   # Server Actions and business logic
+-- docker-compose.yml
+-- Dockerfile
+-- next.config.ts
+-- package.json
+-- tsconfig.json
```

## Application Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Redirects by session and role |
| `/login` | Public | Sign in |
| `/calendar` | Employee | Booking calendar |
| `/booking-history` | Employee | Current user's booking history |
| `/settings` | Employee | User settings |
| `/admin/dashboard` | Admin | Admin summary dashboard |
| `/admin/calendar` | Admin | Admin calendar view |
| `/admin/manage-bookings` | Admin | Manage all bookings |
| `/admin/manage-bookings/add-booking` | Admin | Create a booking from admin area |
| `/admin/manage-employee` | Admin | Manage employees |
| `/admin/add-admin` | Admin | Add admin users |
| `/admin/reports` | Admin | Reports |
| `/admin/settings` | Admin | Admin settings |

## Roles

| Role | Description |
| --- | --- |
| `EMPLOYEE` | Uses the calendar and manages their own bookings |
| `ADMIN` | Accesses admin pages and booking management |
| `SUPER_ADMIN` | Highest admin role, seeded by default |

## Data Model

The current Prisma schema uses three main models:

```text
Department
+-- id, name
+-- users
+-- bookings

User
+-- id, name, email, password
+-- role: EMPLOYEE | ADMIN | SUPER_ADMIN
+-- departmentId
+-- isActive
+-- bookings

Booking
+-- id, userId, departmentId
+-- description
+-- date
+-- startTime, endTime
+-- isActive
+-- user
+-- department
```

Notes:

- Bookings are soft-deleted with `isActive = false`.
- Booking overlap checks are done before create and update.
- There is no `Room` table in the current database schema. Some UI types still contain room-related fields for future expansion.

## Architecture

This project uses the Next.js App Router with Server Actions for mutations and reads. There are no REST route handlers for the core booking flow at the moment.

```text
Browser / React component
        |
        v
hook/use*.ts
        |
        v
src/services/*.service.ts
        |
        v
src/repository/*.repository.ts
        |
        v
src/lib/prisma.ts
        |
        v
MySQL database
```

Key conventions:

- `src/app` owns routing, layouts, pages, and auth actions.
- `src/services` contains business rules and Server Actions.
- `src/repository` contains Prisma queries.
- `src/lib/prisma.ts` provides the shared Prisma Client.
- `hook` contains client-side hooks used by pages and components.

## Authentication

Authentication is implemented with a signed JWT stored in an HTTP-only cookie named `auth_token_mone`.

- JWT signing uses `JWT_SECRET`.
- Session lifetime is 7 days.
- `NEXTAUTH_URL` controls whether the auth cookie is marked secure in production-like environments.
- The root page redirects authenticated admins to `/admin/dashboard` and employees to `/calendar`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection string used by Prisma |
| `MYSQL_ROOT_PASSWORD` | Docker | Root password for the Compose MySQL service |
| `MYSQL_DATABASE` | Docker | Database created by the Compose MySQL service |
| `MYSQL_USER` | Docker | Optional MySQL application user |
| `MYSQL_PASSWORD` | Docker | Password for `MYSQL_USER` |
| `NEXTAUTH_URL` | Yes | Public app URL used for auth cookie behavior |
| `JWT_SECRET` | Yes | Secret used to sign auth tokens |

## Deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. On pushes to `main`, it connects to a server over SSH, pulls the latest code, rebuilds Docker containers, and prunes dangling images.

Required GitHub secrets:

| Secret | Description |
| --- | --- |
| `HOST` | Server hostname or IP |
| `USERNAME` | SSH username |
| `SSH_KEY` | Private key for SSH access |

Server deployment command used by the workflow:

```bash
docker compose up -d --build --remove-orphans
```

## Development Notes

- Read `node_modules/next/dist/docs/` before changing Next.js-specific behavior. This project uses Next.js 16, which may differ from older examples.
- Keep database access inside repository classes.
- Keep booking validation and authorization checks inside service actions.
- Run `npm run lint` before opening a pull request.
- Run migrations whenever `prisma/schema.prisma` changes.
