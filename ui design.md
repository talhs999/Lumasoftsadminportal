# Luma Softs Admin Portal
Frontend Detailed Specification

---

# Overview

This document defines the complete frontend architecture
for the Luma Softs Admin Portal.

Stack:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase Client SDK

Deployment:
- Vercel

Design Goal:
Modern, clean, minimal, fast agency dashboard.

---

# Branding

App Name:
Luma Softs Admin Portal

Logo:
Use /public/logo.png

Theme Colors:
Primary: #0F172A
Accent: #F97316
Background: #F1F5F9
Card Background: #FFFFFF
Border: #E2E8F0

Typography:
- Headings: Semi-bold
- Body: Normal weight
- Clean spacing, professional layout

---

# Layout System

## Global Layout

Structure:

Sidebar (left, fixed width 250px)
Navbar (top, full width)
Main Content Area (responsive)

Layout hierarchy:

app/layout.tsx
    -> dashboard/layout.tsx
        -> page content

---

# Sidebar

Dynamic role-based rendering.

## Admin Menu:
- Dashboard
- Projects
- Tasks
- Clients
- Employees

## Employee Menu:
- Dashboard
- My Projects
- My Tasks

Active link highlighting required.

Collapsible on mobile.

---

# Navbar

Contains:
- Page Title
- Logged-in User Name
- Role badge
- Logout button

---

# Authentication Pages

## Login Page

Fields:
- Email
- Password

Features:
- Client-side validation
- Loading spinner on submit
- Error alert
- Redirect to /dashboard after login

No public registration page.

---

# Dashboard Page

## Admin Dashboard Cards:

- Total Clients
- Active Projects
- Pending Payments
- Monthly Revenue

Each card:
- Icon
- Big number
- Small label
- Clean shadow card design

## Employee Dashboard:

- My Projects count
- My Tasks count
- Upcoming deadlines list

---

# Projects Module

Route:
dashboard/projects

## Project List Page

Table layout:

Columns:
- Title
- Client
- Status
- Budget
- Deadline
- Created By
- Actions (Edit/View)

Filters:
- Status dropdown
- Search by title

---

## Create Project Page

Fields:
- Title (required)
- Description (required)
- Client (dropdown)
- Budget
- Deadline
- Status
- Assign Team Members (multi-select)

Validation:
- Required fields check
- Budget must be numeric
- Deadline must be future date

After success:
- Redirect to project list

---

## Edit Project Page

Pre-fill form.
Employee can edit only if:
created_by === current user.

Admin can edit any.

---

# Tasks Module

Route:
dashboard/tasks

## Task List Page

Columns:
- Title
- Project
- Priority
- Status
- Due Date
- Assigned To

Admin:
Full CRUD

Employee:
- View assigned tasks only
- Update status only

---

## Create Task Page

Fields:
- Title
- Description
- Project
- Priority
- Due Date
- Assign To

Validation required.

---

# Employees Module (Admin Only)

Route:
dashboard/employees

Table:
- Full Name
- Username
- Role
- Created Date

Admin can:
- Create Employee
- Set temporary password
- Assign role

---

# Clients Module

Route:
dashboard/clients

CRUD table:
- Client Name
- Contact Info

---

# State Management

Use:
- React Server Components for data fetching
- Client Components for forms
- Supabase client hooks

No Redux required.

---

# Loading States

- Skeleton loaders for tables
- Spinner for form submission
- Disabled button during submit

---

# Error Handling

- Global error boundary
- Toast notifications
- Supabase error messages display

---

# Role Guard System

Use middleware.ts

Check:
- Session
- Role
- Route access

Frontend must also conditionally render:
- Revenue card (Admin only)
- Employees menu (Admin only)

---

# Security UI Rules

- Hide restricted routes
- Disable restricted buttons
- Double-check role before action

---

# Responsive Rules

Desktop:
Sidebar visible

Tablet:
Collapsible sidebar

Mobile:
Sidebar drawer
Navbar compact

---

# Folder Structure (Frontend Only)

app/
    layout.tsx
    page.tsx (login)
    dashboard/
        layout.tsx
        page.tsx
        projects/
        tasks/
        employees/
        clients/

components/
    Sidebar.tsx
    Navbar.tsx
    DashboardCard.tsx
    Table.tsx
    FormInput.tsx
    Modal.tsx

lib/
    supabaseClient.ts
    authHelpers.ts

---

# UI Style Guidelines

- Use rounded-xl cards
- Subtle shadow
- Hover effects on table rows
- Accent buttons in orange
- Destructive actions in red
- Clean spacing (p-6 sections)

---

# Animations

Optional:
- Fade in dashboard cards
- Smooth sidebar toggle
- Page transition minimal animation

---

# Performance Rules

- Use server-side data fetching
- Avoid unnecessary client components
- Lazy load heavy components

---

### Final Frontend Goal

A clean, scalable, professional agency admin panel
that feels premium and production-ready.

No clutter.
Role-based dynamic interface.
Fast and secure.