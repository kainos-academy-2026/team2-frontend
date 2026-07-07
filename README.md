# Team 2 Frontend

UI application built with TypeScript, Express, and Nunjucks templates.

## Prerequisites

- Node.js 20+ (CI uses Node 20)
- npm

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