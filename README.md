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

The job roles page expects API items with `roleName`, `location`, `capability`, `band`, `closingDate`, and optional `status` fields. If `status` is missing, the frontend defaults it to `OPEN`.

## Authentication Middleware

The app uses `cookie-parser` to read the `authSession` cookie for login redirect and protected-route checks.

Authentication state checks are implemented in `src/middleware/auth-session.ts`, and middleware is registered in `src/app.ts`.

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