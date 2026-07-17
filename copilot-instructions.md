Services, Controllers, Mappers should be in a class. The only exception is the Router which should just be a file that creates and exposes controller methods to express.

All controllers and their dependencies should be instantiated in the relevant router file and the router exported for use at the app level. Never instantiate a class within its own file.

All CSS and JS must be in seperate JS or CSS files and imported into your html.
All validation should be done with zod.

A single BACKEND_URL should be set and the required endpoint just added on after, you won't need to set an env var for each endpoint.

Prefer simple interfaces for model definition. Avoid union types or complex types like Pick or Omit etc.
