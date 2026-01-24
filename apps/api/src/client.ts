import { hc } from 'hono/client'
import type { AppTypes } from './server.js'

const client = (...args: Parameters<typeof hc>) => hc<AppTypes>(...args)
export default client

export type {
  InferRequestType,
  InferResponseType,
} from 'hono/client'
