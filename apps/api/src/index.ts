import { serve } from '@hono/node-server'
import 'dotenv/config'
import { exit } from 'node:process'
import { db } from './db/db.js'
import env from './lib/env.js'
import { app } from './server.js'

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)

let isShuttingDown = false

// graceful shutdown
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    return
  }
  isShuttingDown = true
  console.log(`Received ${signal}, shutting down gracefully...`)

  const shutdownTimeout = setTimeout(() => {
    console.error('Forced shutdown after timeout')
    exit(1)
  }, 30000)

  try {
    // Закрываем HTTP сервер
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
    console.log('HTTP server closed')

    // Закрываем БД
    await db.$client.end()
    console.log('Database closed')

    clearTimeout(shutdownTimeout)
    exit(0)
  } catch (err) {
    console.error('Error during shutdown:', err)
    clearTimeout(shutdownTimeout)
    exit(1)
  }
}

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM')
})
