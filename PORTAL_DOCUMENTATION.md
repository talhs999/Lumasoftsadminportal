# 📋 Luma Softs Admin Portal — Complete Documentation
>
> Last Updated: March 2026 | Version: 1.0.0

---

## 🏢 Overview

**Luma Softs Admin Portal** is a full-stack internal management system built for the Luma Softs team.
It allows admins to manage projects, clients, employees, and tasks — while employees can view and update their assigned work.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Custom CSS Variables |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma v5 |
| **Authentication** | NextAuth.js v4 (Credentials Provider / JWT) |
| **Password Hashing** | bcryptjs (12 salt rounds) |
| **Deployment** | Vercel |
| **Image Handling** | Next.js Image Optimization |
| **Icons** | Lucide React |

---

## 🎨 Design & Theme

- **Theme:** Dark mode / LIGHT MODE  — professional dark admin UI
- **Primary Background:** `#0d0d0d` (near-black)
- **Secondary Surfaces:** `#161616` (cards, sidebar)
- **Accent Color:** `#b7e53a` (lime/green — brand color)
- **Text:** White primary, gray muted
- **Font:** System sans-serif (Inter-compatible)
- **Border Radius:** Rounded cards (`rounded-xl`, `rounded-2xl`)
- **Shadows:** Subtle card shadows, green glow effects on logo/buttons
- **Logo:** Circular avatar (140×140px) with soft green glow on login page
- **Responsive:** Mobile-first — collapsible sidebar on small screens

### Layout

- **Sidebar** (left): Navigation + collapse toggle + mobile hamburger
- **Navbar** (top): Page title, notifications bell, theme toggle, user info + logout
- **Main Area** (right): Page-specific content

---

## 🔐 Authentication System

- Login via **Email + Password** (no social login)
- Credentials stored in PostgreSQL, passwords hashed with **bcryptjs (12 rounds)**
- Sessions managed via **JWT** (signed with `NEXTAUTH_SECRET`)
- Session lives for **8 hours**, then auto-expires
- Login page: `/login`
- Unauthorized access auto-redirects to `/login`

---

## 🛡️ Security Features

### 1. Brute Force Lockout

- After **5 consecutive failed login attempts** → account locked for **15 minutes**
- Remaining attempts shown in error message: *"3 attempts remaining"*
- Lock message: *"Account locked. Try again in 14 minutes."*
- Successful login **resets** the attempt counter
- Stored in DB (`loginAttempts`, `lockedUntil` fields on User model)

### 2. Email Enumeration Protection

- Login error always says **"Invalid email or password"** — never reveals if email exists

### 3. Session Expiry (8 Hours)

- JWT sessions expire after 8 hours
- Previously was 7 days — reduced to 8 hours for security

### 4. Role-Based Access Control (RBAC)

- `requireAdmin()` — server-side guard on all admin-only pages/routes
- `requireAuth()` — guards all authenticated pages
- Employees cannot access admin routes (auto-redirect to `/dashboard`)

### 5. SQL Injection Protection

- Prisma ORM used for all queries — parameterized queries by default, no raw SQL

### 6. XSS Protection

- React/Next.js JSX auto-escapes all rendered values

### 7. HTTPS

- Enforced automatically on Vercel deployment

### 8. Test Mode Isolation

- Test users can never access or modify real database data (see Test Mode section)

---

## 👑 Admin Features

Admin users have full access to the portal.

### Dashboard

- Total Clients count
- Active Projects count
- Pending Projects count
- Monthly Revenue (sum of completed project budgets)
- Recent Projects table (last 5)

### Projects (`/dashboard/projects`)

- View all projects in a sortable table
- Create new project (`/dashboard/projects/create`)
  - Title, Description, Client, Budget, Status, Deadline
- Edit existing project (inline edit page)
- View project detail page (`/dashboard/projects/[id]`)
- Delete project (soft delete — hidden from admin but preserved in DB)
- Project status: `ongoing` | `pending` | `completed`

### Tasks (`/dashboard/tasks`)

- View ALL tasks across all employees
- Create new task (`/dashboard/tasks/create`)
  - Title, Description, Project, Priority, Assigned Employee, Due Date
- Assign tasks to specific employees
- Change task status: `pending` → `in_progress` → `completed`
- Delete task (soft delete — hidden from admin, stays in employee history)
- Priority levels: `high` | `medium` | `low`
- Tabs: **All Tasks** | **Completed History**
- Auto-notification sent to employee when task is assigned

### Clients (`/dashboard/clients`)

- View all clients
- Add new client (name + contact info)
- Edit client details
- Delete client

### Employees (`/dashboard/employees`)

- View all team members (name, username, email, role, join date)
- Add new employee (full name, email, username, password, role)
- Delete employee account
- Role assignment: `admin` | `employee`

### Notifications

- Bell icon in navbar with unread count badge
- View all notifications (newest first, max 30)
- Mark individual notification as read
- Mark all as read

---

## 👤 Employee Features

Employees have a restricted view — only their own work.

### Dashboard

- My Projects count
- Assigned Tasks count
- Pending Tasks count
- Upcoming Deadlines list (sorted by due date)

### Tasks (`/dashboard/tasks`)

- View **only their own assigned tasks**
- Update task status: `pending` → `in_progress` → `completed`
- View task details in modal
- Soft-delete task from their own history (admin still sees it)
- Tabs: **My Tasks** | **Completed History**

### Projects (`/dashboard/projects`)

- View all projects (read-only access)
- Cannot create or delete projects

### Clients (`/dashboard/clients`)

- View all clients (read-only access)

### Notifications

- Receive notification when a new task is assigned
- Mark as read

---

## 🧪 Test Mode (Sandbox / Demo)

A sandbox system for demoing the portal without affecting real data.

### How It Works

- Users with `isTestUser = true` in the database enter Test Mode automatically on login
- A **yellow banner** appears at the top: *"⚠️ Test / Demo Mode — You are viewing simulated data."*
- All pages show **mock/dummy data** — no real DB data is ever shown
- Any create/update/delete action is **simulated** — database is never touched
- Real users are completely unaffected

### Test Accounts

| Role | Email | Password |
|---|---|---|
| Test Admin | `testadmin@lumasofts.com` | `test1234` |
| Test Employee | `testemployee@lumasofts.com` | `test1234` |

### Mock Data Shown

- **4 mock clients** (Acme Corporation, TechBridge Inc., Pixel Studio, CloudVault Ltd.)
- **3 mock employees** (Ali Hassan, Sara Khan, Usman Tariq)
- **3 mock projects** (E-Commerce Redesign, Mobile App Development, Brand Identity Package)
- **3 mock tasks** (Design Homepage Wireframes, Set Up CI/CD Pipeline, Client Presentation Deck)
- **2 mock notifications**

---

## 🗄️ Database Schema (Prisma)

### User

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| email | String | Unique |
| password | String | bcryptjs hashed |
| fullName | String | |
| username | String | Unique |
| role | Role (enum) | `admin` \| `employee` |
| isTestUser | Boolean | Default `false` |
| loginAttempts | Int | Default `0` |
| lockedUntil | DateTime? | Null = not locked |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Project

| Field | Type | Notes |
|---|---|---|
| id | String | |
| title | String | |
| description | String? | |
| status | String | `pending`/`ongoing`/`completed` |
| budget | Float? | PKR |
| deadline | DateTime? | |
| clientId | String | FK → Client |
| createdById | String | FK → User |

### Task

| Field | Type | Notes |
|---|---|---|
| id | String | |
| title | String | |
| description | String? | |
| priority | String | `high`/`medium`/`low` |
| status | String | `pending`/`in_progress`/`completed` |
| dueDate | DateTime? | |
| assignedToId | String? | FK → User |
| createdById | String | FK → User |
| projectId | String | FK → Project |
| isDeletedByAdmin | Boolean | Soft delete |
| isDeletedByEmployee | Boolean | Soft delete |

### Client

| Field | Type |
|---|---|
| id | String |
| name | String |
| contactInfo | String? |
| createdAt | DateTime |

### Notification

| Field | Type |
|---|---|
| id | String |
| userId | String (FK → User) |
| title | String |
| message | String |
| read | Boolean |
| createdAt | DateTime |

---

## 🌐 API Routes

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Auth | List projects |
| POST | `/api/projects` | Admin | Create project |
| PATCH | `/api/projects/[id]` | Admin | Update project |
| DELETE | `/api/projects/[id]` | Admin | Soft delete project |
| GET | `/api/tasks` | Auth | List tasks (role-filtered) |
| POST | `/api/tasks` | Admin | Create task |
| PATCH | `/api/tasks/[id]` | Auth | Update task status |
| DELETE | `/api/tasks/[id]` | Admin | Soft delete task |
| GET | `/api/clients` | Auth | List clients |
| POST | `/api/clients` | Auth | Create client |
| PATCH | `/api/clients/[id]` | Auth | Update client |
| DELETE | `/api/clients/[id]` | Auth | Delete client |
| GET | `/api/employees` | Admin | List employees |
| POST | `/api/employees` | Admin | Create employee |
| DELETE | `/api/employees/[id]` | Admin | Delete employee |
| GET | `/api/notifications` | Auth | Get notifications |
| PATCH | `/api/notifications` | Auth | Mark as read |

> All routes return mock data when `session.user.isTestUser === true` — no DB access.

---

## 📁 Project Structure

```
Luma Softs Admin Portal/
├── app/
│   ├── login/                  # Login page
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── layout.tsx          # Auth guard + layout wrapper
│   │   ├── projects/           # Project pages
│   │   ├── tasks/              # Task pages
│   │   ├── clients/            # Client pages
│   │   └── employees/          # Employee pages (admin only)
│   └── api/                    # API routes
│       ├── auth/               # NextAuth handler
│       ├── projects/
│       ├── tasks/
│       ├── clients/
│       ├── employees/
│       └── notifications/
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Navbar.tsx              # Top navigation bar
│   ├── DashboardLayoutClient.tsx # Layout + test mode banner
│   ├── DashboardCard.tsx       # Stat cards
│   ├── Modal.tsx               # Reusable modal
│   └── LoadingSkeleton.tsx     # Loading UI
├── lib/
│   ├── auth.ts                 # NextAuth config + lockout logic
│   ├── prisma.ts               # Prisma client singleton
│   └── mock-data.ts            # Test mode dummy data
├── prisma/
│   └── schema.prisma           # Database schema
├── types/
│   └── next-auth.d.ts          # Auth type extensions
└── public/
    └── logo.png                # Luma Softs logo
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon) |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret |
| `NEXTAUTH_URL` | ✅ | App URL (e.g. `https://yourapp.vercel.app`) |

---

## 🚀 Deployment

- Platform: **Vercel**
- Branch: `main` → auto-deploys on push
- Database: **Neon PostgreSQL** (serverless, auto-scales)
- Schema changes: `npx prisma db push` (run locally)
- No Docker or server management required

---

## 📌 Known Limitations / Future Improvements

| Feature | Status |
|---|---|
| Two-Factor Authentication (2FA) | ❌ Not implemented |
| Audit Logs (who did what, when) | ❌ Not implemented |
| Password Reset via Email | ❌ Not implemented |
| File Attachments on Projects | ❌ Not implemented |
| Export to PDF/Excel | ❌ Not implemented |
| Real-time notifications (WebSocket) | ❌ Polling-based currently |
| Dark/Light mode toggle | ⚠️ Dark only |

---

*Document generated for internal reference — Luma Softs Development Team.*
