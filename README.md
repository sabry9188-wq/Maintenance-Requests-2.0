# Maintenance Requests 2.0

A maintenance request and work-order management system for an aquaculture organization
operating Station 01 through Station 07 (Hatchery, Nursery, Laboratory, Sea Cage Farm and
general facility operations).

Stations and departments report problems, Engineering tracks the work from acknowledgement
through completion, and the requesting station confirms the fix and rates the service — with a
full audit trail at every step.

**New to this project? Start with [SETUP.md](./SETUP.md)** — it walks through everything needed
to get this running, written for someone who is not an advanced programmer.

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — White + Red corporate theme
- **Supabase** — PostgreSQL database, Auth, Row Level Security, Storage
- **react-hook-form + zod** — forms and validation
- **Recharts** — dashboard charts

## Key features

- Automatic, database-generated request numbers (`MR-YY-NNNNNN`) — never editable, never duplicated
- Full request lifecycle: Submitted → Received → Acknowledged → Assigned → In Progress →
  Completed → Pending Confirmation → Closed, with Waiting for Parts / On Hold / Reopened branches,
  enforced by a database trigger (not just the UI)
- Role-based access: Admin, Station/Department User, Engineering Manager, Engineer/Technician,
  Management (view-only) — enforced with Postgres Row Level Security
- Aquaculture-specific maintenance category and problem-type taxonomy (Hatchery/Nursery,
  Laboratory, Sea Cage Farm, plus general categories), fully admin-editable
- Engineering workflow: accept, assign technician, start work, add work updates with parts used,
  put on hold / waiting for parts, and a completion report
- Station confirmation + reopen flow, and a 1-5 star feedback rating
- In-app notifications with unread count
- Engineering, Station and Management dashboards with KPIs and charts
- Equipment/asset register with breakdown history
- Preventive maintenance plans
- 15 built-in reports with CSV export
- Full audit log (admin-only, system-generated, not editable)

## Project layout

```
supabase/        schema.sql, functions.sql, rls.sql, storage.sql, seed.sql, demo_seed.sql
src/app/         Next.js routes (auth pages + the main authenticated app)
src/components/  UI primitives and feature components
src/lib/         Supabase clients, auth helpers, data access, server actions, validation, types
```

## Local development

See [SETUP.md](./SETUP.md) for the full walkthrough. Quick reference once your `.env.local` is
configured and the SQL files have been run in your Supabase project:

```
npm install
npm run dev
```

Then open http://localhost:3000.
