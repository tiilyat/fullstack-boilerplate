<script setup lang="ts">
import TodoInput from '@/components/TodoInput.vue'
import TodoItem from '@/components/TodoItem.vue'
import TodoList from '@/components/TodoList.vue'
import useCreateTask from '@/composables/queries/use-create-task'
import useDeleteTask from '@/composables/queries/use-delete-task'
import useTasks from '@/composables/queries/use-tasks'
import useUpdateTask from '@/composables/queries/use-update-task'
import type { Task } from '@/types/task'

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
    json: { title: task.title, completed: !task.completed },
  })
}

const handleDeleteTask = (id: string) => {
  deleteTaskMutation.mutate(id)
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6 p-4">
        <TodoInput @create="handleCreateTask" />

        <TodoList :tasks="tasks?.data ?? []" :is-loading="isLoading">
          <TodoItem
            v-for="task in tasks?.data"
            :key="task.id"
            :task="task"
            @toggle="handleToggleTask(task)"
            @delete="handleDeleteTask"
          />
        </TodoList>
      </div>
    </template>
  </UDashboardPanel>
</template>
