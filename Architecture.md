# Luma Softs Admin Portal

Internal Agency Management System

---

## Tech Stack

Frontend:

- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend:

- Supabase (Auth + PostgreSQL + RLS)

Hosting:

- Vercel (Frontend)
- Supabase Cloud (Database & Auth)

---

# Roles & Permissions

## 1. Admin

- View dashboard stats
- Create/Edit/Delete Projects
- Create/Edit/Delete Tasks
- Assign team members
- Add/Edit Employees
- View Clients
- View Revenue
- View All Tasks
- View All Projects

## 2. Employee

- View Dashboard (limited stats)
- View Assigned Projects
- Create Projects
- Edit Own Created Projects
- View Assigned Tasks
- Update Task Status
- Cannot see revenue
- Cannot create employee
- Cannot delete projects created by Admin

---

# Authentication System

- Email + Password login only
- No Google login
- Registration disabled publicly
- Admin creates employees manually

Tables:

- auth.users (managed by Supabase)
- profiles (custom user data)

profiles table:

- id (uuid, linked to auth.users)
- full_name (text)
- username (text)
- role (admin | employee)
- created_at (timestamp)

---

# Database Schema

## clients

- id (uuid)
- name (text)
- contact_info (text)
- created_at (timestamp)

## projects

- id (uuid)
- title (text)
- description (text)
- status (pending | ongoing | completed)
- budget (numeric)
- deadline (date)
- client_id (uuid, foreign key)
- created_by (uuid)
- created_at (timestamp)

## tasks

- id (uuid)
- title (text)
- description (text)
- priority (low | medium | high)
- status (pending | in_progress | completed)
- due_date (date)
- project_id (uuid)
- assigned_to (uuid)
- created_by (uuid)
- created_at (timestamp)

---

# Row Level Security (RLS) Rules

## Projects

Admin:

- Full access

Employee:

- Can SELECT projects where:
    created_by = auth.uid()
    OR assigned in tasks table
- Can INSERT project
- Can UPDATE project where created_by = auth.uid()

## Tasks

Admin:

- Full access

Employee:

- Can SELECT tasks where assigned_to = auth.uid()
- Can UPDATE status only

---

# Dashboard Logic

Admin Dashboard:

- Total Clients (count)
- Active Projects (status = ongoing)
- Pending Payments (future table)
- Monthly Revenue (sum of project budgets)

Employee Dashboard:

- My Projects
- My Tasks
- Upcoming Deadlines

---

# Folder Structure

lumasofts-admin/
│
├── app/
│   ├── login/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── create/page.tsx
│   │   ├── employees/page.tsx
│   │   └── clients/page.tsx
│
├── components/
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   ├── DashboardCard.tsx
│   ├── ProjectForm.tsx
│   ├── TaskForm.tsx
│
├── lib/
│   ├── supabaseClient.ts
│   ├── auth.ts
│   ├── roleGuard.ts
│
├── middleware.ts
├── types/
└── .env.local

---

# Middleware Logic

1. Check session
2. Fetch user role
3. Restrict route access
4. Redirect if unauthorized

---

# Environment Variables

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

---

# Deployment Steps

1. Push project to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

---

# Version 2 Enhancements

- File uploads per project
- Invoice system
- Activity logs
- Email notifications
- AI task summaries
- Audit logs
- Role expansion (Manager)

---

# Security Best Practices

- Strong password validation
- RLS enforced
- No public registration
- Role checks in frontend and backend
- Use HTTPS only
- Session expiry 7 days

---

# Project Goal

Build a scalable internal agency management system
for Luma Softs with role-based control, secure authentication,
and structured project-task workflow.
