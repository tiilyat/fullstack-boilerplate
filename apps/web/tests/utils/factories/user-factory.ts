import { faker } from '@faker-js/faker'
import type { UserWithRole } from '@/lib/auth-client'

export function createUser(overrides: Partial<UserWithRole> = {}): UserWithRole {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'user',
    emailVerified: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    image: null,
    banned: false,
    banReason: null,
    banExpires: null,
    ...overrides,
  }
}

export function createUsers(count: number, overrides: Partial<UserWithRole> = {}): UserWithRole[] {
  return Array.from({ length: count }, () => createUser(overrides))
}
