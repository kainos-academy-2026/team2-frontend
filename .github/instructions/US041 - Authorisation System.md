# User Story

- As a platform user, I want the frontend to enforce authentication and role-based access so I only see and access pages/actions I am allowed to use.

# Scope

- Frontend login session handling using JWT from backend.
- Route protection for public and protected pages.
- Role-based page and action access for user and admin.
- Automatic redirect to login when unauthenticated session is detected.
- API client integration with Authorization header.

# Roles

- admin: Full frontend access to protected pages and privileged actions.
- user: Read-only access to list and detail experiences only.

# Authentication Rules

- Public frontend routes:
- /login
- /register
- Protected frontend routes:
- all application routes that require backend data from protected endpoints
- Unauthenticated users trying to access protected routes must be redirected to /login.
- After login success, redirect back to intended route if one exists, otherwise to default app landing page.

# Authorisation Rules

- admin can view all protected pages and use create/update/delete UI actions.
- user can only access list and detail pages.
- user must not be able to access create/edit/delete pages.
- user must not see create/edit/delete buttons in UI.

# Route Access Matrix

- /login: public
- /register: public
- /job-roles: user, admin
- /job-roles/:id: user, admin

# API Integration Contract

- Include Authorization header on all protected API calls:
- Authorization: Bearer <token>
- Do not include token for:
- POST /login
- POST /register
- Handle backend unauthenticated response by clearing session and redirecting to /login:
- expected backend behavior is redirect to /login for missing/invalid token
- Handle forbidden response by showing access denied UX:
- expected backend behavior is 403 with message Forbidden

# JWT Handling

- Store token after successful login.
- Extract role from token payload role claim.
- Supported role values:
- user
- admin
- Required claims used by frontend:
- sub
- name
- email
- role

# Session Lifecycle

- On app start:
- read token from storage
- validate token shape and expiry
- set auth state with role
- if invalid/expired, clear token and treat as logged out
- On logout:
- clear token
- clear auth state
- navigate to /login

# UI Requirements

- Hide privileged admin actions for non-admin users.
- If user reaches admin-only route by URL, block route and redirect to safe page:
- recommended fallback: /job-roles
- Show clear access denied message for forbidden actions.

# State Management Requirements

- Maintain a single auth source of truth:
- isAuthenticated
- token
- user info
- role
- preferred implementation:
- Auth context/store plus route guard wrappers

# Seed/Test Accounts for Frontend QA

- user:
- email: applicant.seed@example.com
- password: Applicant!123
- role: user
- admin:
- email: admin.seed@example.com
- password: Admin!12345
- role: admin

# Acceptance Criteria

- Given no token, when user navigates to protected route, then app redirects to /login.
- Given invalid or expired token, when protected API call is made, then app clears session and redirects to /login.
- Given valid user token, when navigating to list and detail pages, then access is allowed.
- Given valid user token, when navigating to create/edit/delete pages, then access is denied and user is redirected.
- Given valid admin token, when navigating to create/edit/delete pages, then access is allowed.
- Given user role, privileged action buttons are hidden.
- Given admin role, privileged action buttons are visible.
- Login and register pages are accessible without token.

# Test Coverage Expectations

- Unit tests:
- auth state initialization from token
- token expiry handling
- role extraction
- route guards for public/protected/admin routes
- Component tests:
- action visibility by role
- redirect behavior for blocked routes
- Integration/E2E tests:
- login as user and confirm read-only journey
- login as admin and confirm privileged journey
- unauthenticated access redirect to login