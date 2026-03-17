# **App Name**: NEU Access Hub

## Core Features:

- Google Sign-In Integration: Enable secure user authentication using Google accounts, restricted to the 'neu.edu.ph' domain as specified.
- Student ID Linkage: Allow users to associate and authenticate their student ID with their Google account via Firestore lookup, based on stored student ID data.
- Firestore User Profile Storage: Manage user profiles in a 'users' collection within Firestore, storing email, studentId, and assigned roles (user/admin).
- Role-Based Access Control (RBAC): Implement authentication flow to check a user's role upon login from Firestore and direct them to either a 'Welcome to NEU Library!' greeting or an admin dashboard placeholder.
- Login Interface & Navigation: Provide a clean user interface for both Google sign-in and student ID entry, with dynamic content and navigation based on authenticated user roles.

## Style Guidelines:

- Primary brand color: A deep, professional blue (#0A73B3) to evoke trust and academic professionalism. (HSL: 210, 80%, 35%)
- Background color: A heavily desaturated, very light blue (#ECF4F9) providing a clean, open canvas for content. (HSL: 210, 15%, 95%)
- Accent color: A muted aqua-green (#66CCCC) for subtle highlights and interactive elements, adding a touch of modern clarity. (HSL: 180, 60%, 50%)
- Headline and body font: 'Inter', a grotesque-style sans-serif for its modern, machined, and neutral aesthetic, ensuring high readability for institutional content.
- Utilize clear and consistent sans-serif based icons, drawing from established libraries (e.g., Material Icons) to ensure an intuitive user experience across authentication and navigation.
- Adopt a responsive, mobile-first layout with a focus on central alignment for primary interactive elements, such as login forms, to guide user attention effectively.
- Incorporate subtle, quick animations on interactive elements like buttons and form submissions to provide immediate feedback without distracting from the core user journey.