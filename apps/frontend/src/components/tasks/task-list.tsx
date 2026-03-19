import type { Task } from '#/types/task'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  children: React.ReactNode
}

export function TaskList({ tasks, isLoading, children }: TaskListProps) {
  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
  }

  if (!tasks.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">No tasks yet. Add one above!</div>
    )
  }

  return <div className="space-y-2">{children}</div>
}
