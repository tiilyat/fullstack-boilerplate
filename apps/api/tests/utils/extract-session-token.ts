export function extractSessionToken(setCookie: string): string {
  const match = setCookie.match(/better-auth\.session_token=([^;]+)/)
  return match?.[1] || ''
}
