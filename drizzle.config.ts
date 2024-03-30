import type { Config } from 'drizzle-kit'

export default {
  schema: './src/main/db/schema.ts',
  out: 'migration',
  driver: 'better-sqlite',
  verbose: true,
  dbCredentials: {
    url: 'drizzle.db',
  },
} satisfies Config
