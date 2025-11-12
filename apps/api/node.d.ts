import type { EnvSchema } from './lib/env'

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {
      PORT: string
      BETTER_AUTH_SECRET: string
      BETTER_AUTH_URL: string
      BETTER_AUTH_TRUSTED_ORIGINS: string
      DATABASE_URL: string
      CORS_ALLOW_ORIGINS: string
    }
  }
}
