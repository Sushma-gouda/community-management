# Community Apartment Management System

A full-stack community apartment management platform — **Communa** — built with React, TanStack Start, Tailwind CSS v4, and Supabase.

---

## Project Structure

```
community-apartment-management/
│
├── frontend/                     # React app (Vite + TanStack Start SSR)
│   ├── src/
│   │   ├── assets/               # Static images
│   │   ├── components/
│   │   │   ├── auth/             # Auth layout (sign in / sign up)
│   │   │   ├── dashboard/        # Shared dashboard layout, nav configs
│   │   │   ├── landing/          # Landing page sections
│   │   │   └── ui/               # shadcn/ui component library (50+ components)
│   │   ├── hooks/                # Custom React hooks (use-theme, use-mobile)
│   │   ├── lib/                  # Utilities (cn, error handling)
│   │   ├── routes/               # File-based routes (TanStack Router)
│   │   │   ├── __root.tsx        # Root shell + QueryClientProvider
│   │   │   ├── index.tsx         # Landing page (/)
│   │   │   ├── signin.tsx        # Sign in (/signin)
│   │   │   ├── signup.tsx        # Sign up (/signup)
│   │   │   ├── dashboard.admin.* # Admin dashboard pages
│   │   │   ├── dashboard.resident.*
│   │   │   └── dashboard.security.*
│   │   ├── services/
│   │   │   └── supabase/
│   │   │       └── client.ts     # Supabase client + auth helpers
│   │   ├── styles.css            # Global styles + Tailwind v4 theme tokens
│   │   ├── router.tsx            # TanStack Router setup
│   │   ├── routeTree.gen.ts      # Auto-generated route tree (do not edit)
│   │   ├── server.ts             # Cloudflare Workers SSR entry point
│   │   └── start.ts              # TanStack Start middleware entry
│   ├── package.json              # Frontend dependencies + scripts
│   ├── tsconfig.json
│   ├── vite.config.ts            # Vite + TanStack Start config
│   ├── wrangler.jsonc            # Cloudflare Workers deployment config
│   ├── components.json           # shadcn/ui configuration
│   ├── eslint.config.js
│   ├── .env.example              # Frontend environment variable template
│   └── .prettierrc / .prettierignore
│
├── backend/                      # Node.js API (Express + cron jobs)
│   ├── controllers/              # Route handler functions
│   ├── cron/
│   │   └── paymentReminder.js    # Daily payment reminder job
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── routes/                   # Express route definitions
│   ├── services/                 # Business logic (email, SMS, PDF)
│   ├── utils/                    # Shared utility functions
│   ├── server.js                 # Express server entry
│   └── package.json
│
├── supabase/                     # Supabase configuration
│   ├── migrations/               # SQL migration files (run in order)
│   ├── functions/                # Supabase Edge Functions
│   └── seed.sql                  # Sample data for development
│
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TanStack Start (SSR) |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Cloudflare Workers |
| Backend | Node.js + Express |

---

## Getting Started

### 1. Install frontend dependencies

```bash
cd frontend
bun install
# or: npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the development server

```bash
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Backend API (optional)

```bash
cd ../backend
npm install
npm run dev
```

---

## User Roles & Routes

| Role | Login redirects to | Access |
|------|--------------------|--------|
| **Admin** | `/dashboard/admin` | Full community management |
| **Resident** | `/dashboard/resident` | Personal flat, bills, complaints |
| **Security** | `/dashboard/security` | Gate operations, visitor management |

---

## Dashboard Pages

### Admin (`/dashboard/admin/*`)
- Overview with stats, charts, activity timeline
- Residents directory
- Flat inventory management
- Billing & invoice tracking
- Complaint management
- Visitor logs
- Parking slot map
- Maintenance scheduling
- Notice broadcasting
- Settings

### Resident (`/dashboard/resident/*`)
- Overview with pending bills, complaints, notices
- My Profile (editable)
- My Flat details + amenities
- Complaints (raise + track with timeline)
- Billing & payment history (simulated payment modal)
- Notices & announcements feed
- Parking slot details
- Settings

### Security (`/dashboard/security/*`)
- Gate operations overview
- Add Visitor (3-step: form → OTP → success)
- Active Visitors (live tracking + check-out)
- Visitor Logs (searchable + filterable history)

---

## Available Scripts

Run these from the `frontend/` directory:

```bash
bun run dev          # Start development server
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # Run ESLint
bun run format       # Run Prettier
```

Cloudflare deploy (from `frontend/`):

```bash
npx wrangler deploy
```

---

## Supabase Integration

The Supabase client is pre-configured at `frontend/src/services/supabase/client.ts`.

```ts
import { supabase } from '@/services/supabase/client'

// Example usage
const { data, error } = await supabase
  .from('residents')
  .select('*')
  .eq('status', 'active')
```

See `supabase/migrations/` for the database schema and `supabase/seed.sql` for sample data.
