import type { Config } from 'drizzle-kit'

export default {
  schema: './src/main/db/schema.ts',
  out: 'migration',
  driver: 'better-sqlite',
  verbose: true,
  dbCredentials: {
    // url: 'file:drizzle.db',
    url: 'drizzle.db',
  },
} satisfies Config
