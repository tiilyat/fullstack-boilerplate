import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Home</h1>
    </div>
  )
}
