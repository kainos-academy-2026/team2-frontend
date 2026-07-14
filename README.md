# Team 2 Frontend

UI application built with TypeScript, Express, and Nunjucks templates.

## Prerequisites

- Node.js 20+ (CI uses Node 20)
- npm
- Job roles backend API running (default expected endpoint: http://localhost:3001/job-roles)

## Environment

You can override the job roles API endpoint with an environment variable:

```bash
JOB_ROLES_API_URL=http://localhost:3001/job-roles npm run dev
```

If `JOB_ROLES_API_URL` is not set, the app uses `http://localhost:3001/job-roles`.

The job roles page expects API items with `roleName`, `description`, `responsibilities`, `sharepointUrl`, `numberOfOpenPositions`, and `status` fields.

`status` is stored and handled as a string value. In TypeScript, this app uses a string enum for status values.
You can also override the registration API endpoint:

```bash
REGISTRATION_API_URL=http://localhost:3000/register npm run dev
```

If `REGISTRATION_API_URL` is not set, the app uses `http://localhost:3000/register`.

The job roles page expects API items with `roleName`, `location`, `capability`, `band`, `closingDate`, and optional `status` fields. If `status` is missing, the frontend defaults it to `OPEN`.

## Authentication Middleware

The app uses `cookie-parser` to read the `authSession` cookie for login redirect and protected-route checks.

Authentication state checks are implemented in `src/middleware/auth-session.ts`, and middleware is registered in `src/app.ts`.

## Dev Login (Temporary)

Until backend authentication is integrated, temporary dev login can be enabled with environment variables.

Dev login is disabled by default and is automatically disabled in production.

Enable it with:

```bash
ENABLE_DEV_LOGIN=true DEV_LOGIN_EMAIL=dev@example.com DEV_LOGIN_PASSWORD=devpassword123 npm run dev
```

To test backend password verification (including backend Argon2 checks), run the app with backend auth enabled:

```bash
ENABLE_DEV_LOGIN=false AUTH_LOGIN_API_URL=http://localhost:3001/login npm run dev
```

This sends the plaintext password entered in the login form to the backend login endpoint for verification.

## Install

```bash
npm ci
```

Use `npm install` if you are adding or updating dependencies.

## Run

### Development (watch mode)

```bash
npm run dev
```

This runs `tsx watch src/index.ts` and reloads on TypeScript changes.

### Production mode

```bash
npm run build
npm run start
```

`build` compiles TypeScript and copies `src/views` into `dist/views`.

## Build

```bash
npm run build
```

Output is written to `dist/`.

## Test

```bash
npm test
```

Additional test commands:

```bash
npm run test:watch
npm run test:coverage
```

## Lint

```bash
npm run lint
```

Auto-fix lint issues:

```bash
npm run lint:fix
```