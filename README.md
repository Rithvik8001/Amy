# Amy - Subscription Tracker

All your subscriptions in one place—because you're tired of surprises.

## Tech Stack

- Next.js 16 (App Router)
- Clerk Authentication (Email, Google, GitHub)
- PostgreSQL (Supabase) + Drizzle ORM
- Zod Validation
- Tailwind CSS + shadcn/ui
- TypeScript

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables in `.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
DATABASE_URL=your_database_url
```

3. Run database migrations:

```bash
bun run db:push
```

4. Start development server:

```bash
bun dev
```

## Database Commands

- `bun run db:generate` - Generate migrations
- `bun run db:push` - Push schema to database
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio

## Features

- ✅ User authentication (Email, Google, GitHub)
- ✅ Add, edit, delete subscriptions
- ✅ View all subscriptions in dashboard
- ✅ Track billing cycles and next billing dates
- ✅ Categorize subscriptions
- ✅ Status management (active, cancelled, paused)

See `CURSOR.md` for detailed progress documentation.
