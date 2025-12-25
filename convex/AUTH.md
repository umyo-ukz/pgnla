# Parent Auth - Usage

This directory contains Convex functions used to manage parent accounts. Parents cannot sign up themselves — accounts must be created by an administrator.

Environment:

- `ADMIN_SECRET` — a secret string stored in your environment (or deployment secrets). The `createParent` mutation requires this to prevent public signups.

API functions:

- `createParent(email, password, fullName, adminSecret)` (mutation)
  - Creates a new parent record and returns the new id. Must pass the correct `adminSecret` (compare with `process.env.ADMIN_SECRET`).

- `signInParent(email, password)` (mutation)
  - Verifies credentials and returns `{ id, email, fullName }` on success.

- `resetParentPassword(email, currentPassword, newPassword)` (mutation)
  - Verifies `currentPassword` (the default password or the parent's current password) and updates to `newPassword`.

- `getParentDashboard(email)` (query)
  - Returns parent basic info and an array of their students, each with `grades`.

Notes:

- Integrate these functions into an admin dashboard for creating parent credentials after student registration.
- For production, consider replacing the simple `adminSecret` guard with an `admins` table and proper Convex auth sessions for admins.
