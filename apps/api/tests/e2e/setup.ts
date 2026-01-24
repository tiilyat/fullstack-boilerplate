import { beforeAll } from 'vitest'
import { db } from '../../src/db/db'
import { account, session, task, user, verification } from '../../src/db/schema'

// Clear database before each test
export async function cleanDatabase() {
  await db.delete(task)
  await db.delete(session)
  await db.delete(account)
  await db.delete(verification)
  await db.delete(user)
}

beforeAll(async () => {
  await cleanDatabase()
})
