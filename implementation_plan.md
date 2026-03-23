# Project Elevation: Formal Balance & Seamless Flow

This plan outlines the steps to "elevate" the NEU Access Hub into a formal, professional, and high-performance system with a new interactive onboarding tutorial and unified navigation controls.

## Proposed Changes

### UI/UX & Design System
Refine the brand identity to achieve "formal, professional balance" and "seamless harmony".

#### [MODIFY] [globals.css](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/app/globals.css)
- Refine HSL variables for a more sophisticated institutional feel.
- Standardize spacing and depth (shadows, glassmorphism) to ensure "no overlap or breakage".
- Enhance typography settings for better readability across devices.

### Structural Refactoring & Maintainability
Examine all components for clarity and performance.

#### [MODIFY] [page.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/app/page.tsx)
- Clean up the view-switching logic and ensure efficient loading states.

### Interactive Onboarding Tutorial
A new step-by-step guide for users.

#### [NEW] [onboarding-tutorial.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/components/features/onboarding/onboarding-tutorial.tsx)
- Implement a multi-step guided tour with functional **Continue, Cancel, Next, and Skip** buttons.

### Phase 9: Unified Card-Based Architecture
Consolidate the application UI into a single central card with a hidden sidebar.

#### [NEW] [unified-layout.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/components/shared/unified-layout.tsx)
- Create a reusable wrapper with `SidebarProvider` and centered content card.

#### [NEW] [app-sidebar.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/components/shared/app-sidebar.tsx)
- Implement a unified sidebar for both member and admin roles.

### Phase 10: Navigation & UX Refinement
Enhance observability and navigability through prominent UI triggers.

#### [MODIFY] [unified-layout.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/components/shared/unified-layout.tsx)
- Added `SidebarTrigger` (Menu) at top-left of the viewport.
- Added context-aware `Return` (Back) button at top-left of the card.

#### [MODIFY] [welcome-screen.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/components/features/auth/welcome-screen.tsx)
- Wrapped in `UnifiedLayout` for architectural consistency.

### Phase 12: Sidebar Decoupling for Gateway
#### [MODIFY] [unified-layout.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/components/shared/unified-layout.tsx)
- Add `hideSidebar` prop to allow suppression of navigation components.
- Conditionally render `AppSidebar` and `SidebarTrigger` based on the new prop.

#### [MODIFY] [welcome-screen.tsx](file:///Users/edwardjasteenh.degala/Desktop/NEU%20Access%20Hub/src/components/features/auth/welcome-screen.tsx)
- Pass `hideSidebar={true}` to `UnifiedLayout`.

## Verification Plan
### Automated Tests
- Run `npm run typecheck` to ensure prop types are correct.

### Manual Verification
- Verify the Welcome Screen has no visible sidebar or trigger.
- Verify the Institutional Hub still displays the sidebar correctly.

## Verification Results
- **Type Safety**: Passed `npm run typecheck` across all modules.
- **Visual Audit**: Verified `Menu` and `Return` buttons across Welcome Screen, Member Hub, and Admin Console via browser tool.
- **UX Flow**: Confirmed seamless transitions between hub views and sub-views.
