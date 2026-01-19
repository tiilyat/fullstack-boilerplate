import type { Session } from '@/lib/auth-client'

const defaultSession: Session = {
  session: {
    expiresAt: new Date('2026-01-25T14:48:34.465Z'),
    token: 'eYIbWIz3QNqjjQzMdCQXkxpWcQZG7JN6',
    createdAt: new Date('2026-01-18T14:48:34.465Z'),
    updatedAt: new Date('2026-01-18T14:48:34.465Z'),
    ipAddress: '',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
    userId: 'fhParIOQH2AynzZvKKLpXAiOLO0e4igP',
    id: 'ODKJwWMeDjK7lWZNQpp6rOgb4apypURX',
  },
  user: {
    name: 'ilya.teterich',
    email: 'ilya.teterich@yandex.ru',
    emailVerified: false,
    image: null,
    createdAt: new Date('2026-01-18T14:48:34.453Z'),
    updatedAt: new Date('2026-01-18T14:48:34.453Z'),
    id: 'fhParIOQH2AynzZvKKLpXAiOLO0e4igP',
  },
}

export function createSession(overrides: Partial<Session> = {}): Session {
  return {
    ...defaultSession,
    ...overrides,
  }
}
