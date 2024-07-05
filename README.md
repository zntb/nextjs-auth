# Drizzle commands

`generate` - Generates `schema.ts` and `envConfig.ts` files.
`push` - Pushes the generated files to the database.

npm run db:generate
npm run db:push

scripts:

```json
"scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "prettier": "prettier --write --ignore-unknown .",
    "db:generate": "drizzle-kit generate:pg",
    "push": "drizzle-kit push:pg",
    "seed": "npx tsx be/seed.ts",
    "start": "next start"
  },
```
