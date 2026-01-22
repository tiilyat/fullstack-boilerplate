import { testClient as honoTestClient } from 'hono/testing'
import { type AppTypes, app } from '../../src/server.js'

export const testClient = honoTestClient<AppTypes>(app)
