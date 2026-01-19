import { HttpResponse, http } from 'msw'
import { createSession } from '@/testing/factories/session-factory'

export const signUpEmailURL = `${import.meta.env.VITE_API_URL}/api/auth/sign-up/email`
export const signInEmailURL = `${import.meta.env.VITE_API_URL}/api/auth/sign-in/email`
export const getSessionURL = `${import.meta.env.VITE_API_URL}/api/auth/get-session`

export const authHandlers = [
  http.post(signUpEmailURL, () => {
    return HttpResponse.json({
      token: '1TiuQ7Q0K4TD5sO9KAAGn566ne9urIWd',
      user: {
        name: 'ilya.teterich',
        email: 'ilya.teterich@gmail.com',
        emailVerified: false,
        image: null,
        createdAt: '2026-01-18T14:50:29.139Z',
        updatedAt: '2026-01-18T14:50:29.139Z',
        id: 'ws08bXEUwMkeg1KAtdpL6H2S8xY0pYaF',
      },
    })
  }),

  http.post(signInEmailURL, () => {
    return HttpResponse.json({
      token: 'zzgXAn2feESvKCiSuHGbzJ7ganZ1HNBE',
      user: {
        name: 'ilya.teterich',
        email: 'ilya.teterich@gmail.com',
        emailVerified: false,
        image: null,
        createdAt: '2026-01-18T14:48:34.453Z',
        updatedAt: '2026-01-18T14:48:34.453Z',
        id: 'fhParIOQH2AynzZvKKLpXAiOLO0e4igP',
      },
    })
  }),

  http.get(getSessionURL, () => {
    return HttpResponse.json(createSession())
  }),
]
