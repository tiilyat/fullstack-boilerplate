import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import type { Task } from '#/types/task'
import { cn } from '#/lib/utils'
import { Trash2 } from 'lucide-react'

interface TaskItemProps {
  task: Task
  onToggle: () => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
      <Checkbox checked={task.completed} onCheckedChange={onToggle} />
      <span className={cn('flex-1 text-sm', task.completed && 'text-muted-foreground line-through')}>
        {task.title}
      </span>
      <Button variant="destructive" size="icon-sm" onClick={() => onDelete(task.id)}>
        <Trash2 />
      </Button>
    </div>
  )
}
