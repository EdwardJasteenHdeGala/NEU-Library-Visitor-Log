# NEU Access Hub | Library Visitor Management

Institutional access control and real-time library visitor logging system for New Era University. This portal advances academic scholarship through automated registry synchronization and precision resource tracking.

## 🚀 Project Overview

The NEU Access Hub is a modern, high-fidelity web application designed to manage and audit facility access. It leverages real-time cloud synchronization to provide administrators with immediate occupancy telemetry while offering students a seamless check-in experience.

- **App Name:** NEU Library Visitor Log / Dashboard
- **Purpose:** Track institutional visits, manage academic announcements, and synchronize user profiles.
- **Tech Stack:** Next.js 15 (App Router), Firebase (Authentication & Firestore), Genkit (AI), Tailwind CSS, ShadCN UI.

## 📂 Folder Structure

The codebase is organized into modular directories to ensure scalability and maintainability:

- `src/app` → Next.js App Router (Routes, Layouts, and Global CSS)
- `src/components` → Reusable UI elements and high-level views (Dashboard, Auth, Guest)
- `src/components/ui` → Shared Design System (ShadCN UI components)
- `src/firebase` → Configuration, Client Providers, and real-time Firestore hooks (`useCollection`, `useDoc`)
- `src/hooks` → Custom React hooks for Auth, Library Status, and Mobile responsiveness
- `src/lib` → Helper functions, constants, and utility logic (Academic Year calculation, etc.)
- `src/ai` → Genkit AI integration for intelligent portal features
- `public` → Static assets (logos, icons)
- `docs` → Backend schemas and project documentation

## ✨ Key Features

- **Google Sign-In Synchronization:** Mandatory institutional identity handshake via @neu.edu.ph accounts.
- **Role-Based Access Control (RBAC):** Three-tier hierarchy:
  - **Admin:** Full oversight of the visitor registry, user management, and announcement broadcasting.
  - **User (Member):** Authenticated students/staff who can log attendance and view their own telemetry.
  - **Guest:** Limited access view for visitors requesting institutional information.
- **Real-Time Telemetry:** Powered by Firestore `onSnapshot` listeners for instant updates across all dashboards.
- **Institutional Advisory Banner:** A dynamic, togglable announcement bar for campus-wide notices.
- **Visitor Log Filtering:** Advanced filtering by date range, purpose, academic unit (College), and visitor frequency.
- **Secure Registry Protocols:** AES-256 cloud encryption and prioritized administrative security rules.
- **Responsive High-Fidelity Design:** A modern grid-based UI that scales perfectly across desktop and mobile devices.

## 📖 Definitions

- **Member:** An authenticated student or faculty member with a synchronized profile.
- **Administrator:** Authorized personnel with oversight and "Super Admin" privileges.
- **Announcement:** A real-time notice or alert displayed within the portal advisory banner.
- **Visit:** A cloud-synchronized record of a member's entry and exit within a library facility.

## 🛠 Best Practices

- **Centralized Telemetry:** All Firestore queries must use the hooks in `src/firebase` to ensure real-time consistency.
- **Silent Handshaking:** UI hooks are configured to handle permission-denied states silently during transient identity syncs.
- **Modular Components:** Maintain atomic design by keeping UI logic separate from authentication and data fetching.
- **Accessibility:** All designs must adhere to institutional contrast ratios and support keyboard navigation.

---
© 2026 NEW ERA UNIVERSITY • THE HUB • COLLEGE OF ENGINEERING & ARCHITECTURE
