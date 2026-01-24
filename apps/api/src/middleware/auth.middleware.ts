import type { Context, Next } from 'hono'
import { auth } from '../lib/auth'

/**
 * Middleware для проверки аутентификации пользователя
 * Используется во всех защищенных роутах
 */
export const requireAuth = async (c: Context, next: Next) => {
  const user = c.get('user')

  if (!user) {
    return c.json(
      {
        status: 'error',
        message: 'Unauthorized',
      },
      401
    )
  }

  await next()
}

export const authSession = async (c: Context, next: Next) => {
  // Skip auth session extraction for OPTIONS requests (preflight)
  if (c.req.method === 'OPTIONS') {
    return next()
  }

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  if (!session) {
    c.set('user', null)
    c.set('session', null)
    await next()
    return
  }
  c.set('user', session.user)
  c.set('session', session.session)
  await next()
}
