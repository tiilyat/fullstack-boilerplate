import { z } from 'zod'

function preporocessEnvStringToArray(value: string) {
  if (!value) {
    return []
  }

  if (!(typeof value === 'string')) {
    return []
  }

  return value.split(',').map((origin) => origin.trim())
}

const envSchema = z.object({
  PORT: z.coerce.number().min(1).default(8000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_TRUSTED_ORIGINS: z.preprocess(preporocessEnvStringToArray, z.array(z.url()).min(1)),
  CORS_ALLOW_ORIGINS: z.preprocess(preporocessEnvStringToArray, z.array(z.string()).min(1)),
})

const env = envSchema.parse(process.env)

export type Environment = z.infer<typeof envSchema>
export default env
