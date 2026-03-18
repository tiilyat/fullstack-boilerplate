import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CircleAlert, Loader2 } from 'lucide-react'

import { Alert, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useLoginEmail } from '#/hooks/use-auth'

export const Route = createFileRoute('/_auth/sign-in')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirectTo: (search.redirectTo as string) || '',
  }),
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const { redirectTo } = Route.useSearch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useLoginEmail({
    onSuccess: () => {
      navigate({ to: redirectTo || '/' })
    },
  })

  const errorMessage = loginMutation.error?.message

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMessage && (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>{errorMessage}</AlertTitle>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loginMutation.isPending} size="lg" className="w-full">
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            Sign In
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/sign-up" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
