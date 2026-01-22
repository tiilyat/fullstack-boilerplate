import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { db } from './db/db.js'
import type { AuthType } from './lib/auth.js'
import { auth } from './lib/auth.js'
import env from './lib/env.js'
import { authSession } from './middleware/auth.middleware.js'
import { TasksControllers } from './tasks/tasks.controllers.js'
import { tasksRoutes } from './tasks/tasks.routes.js'
import { TasksService } from './tasks/tasks.service.js'
import { TasksStorage } from './tasks/tasks.storage.js'

declare module 'hono' {
  interface ContextVariableMap extends AuthType {}
}

const tasksStorage = new TasksStorage(db)
const tasksService = new TasksService(tasksStorage)
const tasksControllers = new TasksControllers(tasksService)

const app = new Hono({ strict: false })

if (process.env.NODE_ENV !== 'test') {
  app.use(logger())
}

app.use(
  '*',
  bodyLimit({
    maxSize: 50 * 1024, // 50KB лимит для API
    onError: (c) => {
      return c.json({ error: 'Request body too large' }, 413)
    },
  }),
)

app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: 'max-age=63072000; includeSubDomains',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
  }),
)

app.use(
  '*',
  cors({
    origin: (origin) => (env.CORS_ALLOW_ORIGINS.includes(origin) ? origin : ''),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

app.use('*', authSession)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = app
  .basePath('/api')
  .on(['POST', 'GET', 'OPTIONS'], '/auth/*', (c) => {
    return auth.handler(c.req.raw)
  })
  .basePath('/v1')
  .route('/tasks', tasksRoutes(tasksControllers))

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

app.onError((error, c) => {
  // Don't log HTTPException - it's an expected error response
  if (!(error instanceof HTTPException)) {
    console.error('Unhandled error:', error)
  }

  // Hono handles HTTPException responses automatically
  if (error instanceof HTTPException) {
    return error.getResponse()
  }

  return c.json(
    {
      status: 'error',
      message: 'Internal server error',
    },
    500,
  )
})

export type AppTypes = typeof router
export { app }
