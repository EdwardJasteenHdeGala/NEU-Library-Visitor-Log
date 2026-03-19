# NEU Access Hub | Library Visitor Management

Institutional access control and real-time library visitor logging system for New Era University. This portal advances academic scholarship through automated registry synchronization and precision resource tracking.

## 🚀 Project Overview

The NEU Access Hub is a modern, high-fidelity web application designed to manage and audit facility access. It leverages real-time cloud synchronization to provide administrators with immediate occupancy telemetry while offering students a seamless check-in experience.

- **App Name:** NEU Library Visitor Log / Dashboard
- **Purpose:** Track institutional visits, manage academic announcements, and synchronize user profiles.
- **Tech Stack:** Next.js 15 (App Router), Firebase (Authentication & Firestore), Genkit (AI), Tailwind CSS, ShadCN UI.
- **Academic Unit:** College of Informatics & Computing Sciences (CICS)
- **Chronology:** Synchronized for the 2026 Academic Year.

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
- **Ultra-Responsive Grid (500% Zoom Compatible):** A fluid design system using relative units (rem, clamp) ensuring stability across all browser zoom levels.
- **Role-Based Access Control (RBAC):** Three-tier hierarchy:
  - **Admin:** Full oversight of the visitor registry, user management, and announcement broadcasting.
  - **User (Member):** Authenticated students/staff who can log attendance and view their own telemetry.
  - **Guest:** Limited access view for visitors requesting institutional information.
- **Real-Time Telemetry:** Powered by Firestore `onSnapshot` listeners for instant updates across all dashboards.
- **Silent Identity Handshake:** UI hooks are configured to handle permission-denied states silently during transient identity syncs to prevent "Red Screen" crashes.
- **Secure Registry Protocols:** AES-256 cloud encryption and prioritized administrative security rules.

## 📖 Definitions

- **Member:** An authenticated student or faculty member with a synchronized profile.
- **Administrator:** Authorized personnel with oversight and "Super Admin" privileges.
- **Announcement:** A real-time notice or alert displayed within the portal advisory banner.
- **Visit:** A cloud-synchronized record of a member's entry and exit within a library facility.

## 🛠 Best Practices

- **Fluid Units:** Avoid using `px` for layouts; prefer `rem`, `%`, and `clamp()` for zoom compatibility.
- **Centralized Telemetry:** All Firestore queries must use the hooks in `src/firebase` to ensure real-time consistency.
- **Atomic Design:** Maintain separation between UI logic, authentication, and data fetching.
- **Accessibility:** Adhere to WCAG standards for contrast ratios and keyboard navigation support.

---
© 2026 NEW ERA UNIVERSITY • THE HUB • COLLEGE OF INFORMATICS & COMPUTING SCIENCES