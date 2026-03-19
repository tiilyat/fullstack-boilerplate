import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="mt-4">
        <Button size="lg">Go back home</Button>
      </Link>
    </div>
  )
}
