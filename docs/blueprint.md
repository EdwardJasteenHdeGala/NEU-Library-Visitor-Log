# **App Name**: NEU Library Log

## Core Features:

- Google Authentication: Secure sign-in for users using their NEU Google accounts, restricting access to '@neu.edu.ph' domains.
- Manual ID Entry: Input field for visitors to 'tap' their ID, simulating an RFID scan for non-Google authenticated users.
- Blocked Status Check: Automated verification against a 'Blocked' list in Firestore for both Google-signed-in users and manually entered IDs.
- Visitor Profile Management: Firestore schema for storing visitor details including Name, ID, College, and Blocked status.
- Visit Log Recording: Firestore schema to record each visit, capturing UserID, Timestamp, and Purpose.
- Landing Page UI: Initial screen displaying options for 'Tap ID' via a text input and 'Sign in with Google' button.

## Style Guidelines:

- Primary color: A deep, academic blue (#67A5E4), reflecting a sense of learning and institutional focus, providing clear contrast for interactive elements against the dark background.
- Background color: A muted, dark blue-grey (#272E35), creating a focused and sophisticated atmosphere, appropriate for a library setting.
- Accent color: A vibrant cyan (#8CF2F2), chosen for its visual harmony with the primary blue, offering a bright highlight for important actions and information.
- Headline and body font: 'Inter' (sans-serif), chosen for its modern, clean, and highly readable characteristics, suitable for conveying information clearly and efficiently in an academic context.
- Use minimalist and functional icons, such as a user icon for visitors and a shield for administrators, to clearly communicate options without visual clutter.
- Centered, translucent modal or card elements for input fields and buttons, providing a clear visual hierarchy against a background that might subtly hint at the library environment.
- Subtle visual feedback for successful authentication, ID submission, and navigation transitions to enhance user experience.