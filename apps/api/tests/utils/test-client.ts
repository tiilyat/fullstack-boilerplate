import { testClient as honoTestClient } from 'hono/testing'
import { type AppTypes, app } from '../../src/server'

export const testClient = honoTestClient<AppTypes>(app)
