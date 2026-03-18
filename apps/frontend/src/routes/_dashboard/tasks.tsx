import { createFileRoute } from '@tanstack/react-router'
import { TaskInput } from '#/components/tasks/task-input'
import { TaskItem } from '#/components/tasks/task-item'
import { TaskList } from '#/components/tasks/task-list'
import useCreateTask from '#/hooks/queries/use-create-task'
import useDeleteTask from '#/hooks/queries/use-delete-task'
import useTasks from '#/hooks/queries/use-tasks'
import useUpdateTask from '#/hooks/queries/use-update-task'
import type { Task } from '#/types/task'

export const Route = createFileRoute('/_dashboard/tasks')({
  component: TasksPage,
})

function TasksPage() {
  const { data: tasks, isLoading } = useTasks()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const handleCreateTask = (title: string) => {
    createTaskMutation.mutate({ title })
  }

  const handleToggleTask = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      json: {
        title: task.title,
        completed: !task.completed,
      },
    })
  }

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id)
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Tasks</h1>
      <div className="space-y-6">
        <TaskInput onCreate={handleCreateTask} />

        <TaskList tasks={tasks ?? []} isLoading={isLoading}>
          {tasks?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleToggleTask(task)}
              onDelete={handleDeleteTask}
            />
          ))}
        </TaskList>
      </div>
    </div>
  )
}
