import { faker } from '@faker-js/faker'
import { auth } from '../../src/lib/auth.js'
import { extractSessionToken } from './extract-session-token.js'

export async function createAuthenticatedUser() {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = faker.internet.email({
    firstName,
    lastName,
  })
  const password = 'password'

  // Sign up через auth.api
  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: `${firstName} ${lastName}`,
    },
  })

  // Sign in and get session through Response object
  const signInResponse = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    asResponse: true,
  })

  // Get session token from response headers (set-cookie)
  const setCookie = signInResponse.headers.get('set-cookie') || ''
  const sessionToken = extractSessionToken(setCookie)

  // Parse response body
  const session = (await signInResponse.json()) as typeof auth.$Infer.Session

  return {
    session,
    sessionToken,
    // Headers object for use in testClient
    authHeaders: {
      Cookie: `better-auth.session_token=${sessionToken}`,
      'Content-Type': 'application/json',
    },
  }
}
