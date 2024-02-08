import type { Config } from 'drizzle-kit'

export default {
  schema: './src/main/db/schema.ts',
  out: 'migration',
  driver: 'libsql',
  verbose: true,
  dbCredentials: {
    url: 'file:drizzle.db',
  },
} satisfies Config
