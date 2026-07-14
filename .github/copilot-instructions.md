# Copilot Instructions

## Core Principles

- Follow the existing project structure and naming conventions.
- Follow SOLID principles, especially single responsibility and dependency inversion.
- Make the smallest useful change.
- Keep code simple and readable.
- Use classes for services, controllers, and mappers.
- Keep routers thin and only wire dependencies.
- Instantiate dependencies in route files.
- Keep controllers focused on HTTP and rendering.
- Keep services focused on data and API logic.
- Put mapping logic in mappers or helpers.
- Use Zod for all request validation in Express route handlers and middleware.
- All source code lives in `src/`.
- All tests live in `tests/`, mirroring the `src/` folder structure.
- Test files use the naming convention `<filename>.test.ts`.
- Keep CSS and JavaScript in separate files.
- Use one BACKEND_URL and append paths as needed.
- Keep config access in config modules.
- Pass complete view models when rendering forms.
- Use user-friendly, plain english and specific error messages.
- Do not introduce new patterns unless necessary.

## Testing Standards

- Add or update tests when behavior changes.
- Tests should cover both the happy path and unhappy path.
- Prefer narrow, targeted tests over broad, general tests.
- Mock external API calls in service tests.

## Post-Change Validation
- After each completed code change run:
  - `npm run lint:fix`
  - `npm run lint`
  - `npm run test`
- Do not consider the task complete until all tests pass and linting is clean.
- If any of these commands fail, fix the issue if it is caused by the current change.
- If a failure is unrelated to the current change, clearly report it to the user.

## When creating a pull request do the following:

## Add details:
### What does this PR do?

Briefly describe the change and why it was made. 
Include the ticket number or description in the PR title and description - e.g. '[ABC-123] Add new feature to handle user authentication'.

## The type of change

- [ ] New feature / functionality
- [ ] Bug fix
- [ ] Refactor (no functional change)
- [ ] Other: <!-- describe -->

### Testing done for this change (unit tests, integration tests)
Confirm what tests you added and what paths were tested, even if already ran in the CI/CD pipeline

## Completion Checklist
- At the end, summarise what changed in a concise way, and call out any remaining issues or next steps.