import { setupWorker } from 'msw/browser'
import { adminHandlers } from './handlers/admin'
import { authHandlers } from './handlers/auth'

export const worker = setupWorker(...authHandlers, ...adminHandlers)
