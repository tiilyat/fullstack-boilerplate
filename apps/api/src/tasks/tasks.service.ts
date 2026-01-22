import { HTTPException } from 'hono/http-exception'
import type { TasksStorage } from './tasks.storage.js'

export class TasksService {
  private tasksStorage: TasksStorage

  constructor(tasksStorage: TasksStorage) {
    this.tasksStorage = tasksStorage
  }

  async createTask(
    userId: string,
    task: {
      title: string
      description?: string
      completed?: boolean
    },
  ) {
    return this.tasksStorage.createTask({ userId, ...task })
  }

  async getTasks(
    userId: string,
    options: { limit?: number; offset?: number } = { limit: 50, offset: 0 },
  ) {
    return this.tasksStorage.getTasks(userId, options)
  }

  async getTask(userId: string, taskId: string) {
    return this.tasksStorage.getTask(userId, taskId)
  }

  async updateTask(
    userId: string,
    taskId: string,
    task: {
      title?: string
      description?: string
      completed?: boolean
    },
  ) {
    const updates: {
      title?: string
      description?: string
      completed?: boolean
    } = {}

    if (task.title !== undefined) {
      updates.title = task.title
    }
    if (task.description !== undefined) {
      updates.description = task.description
    }
    if (task.completed !== undefined) {
      updates.completed = task.completed
    }

    if (Object.keys(updates).length === 0) {
      throw new HTTPException(422, { message: 'No fields to update' })
    }

    return this.tasksStorage.updateTask(userId, taskId, updates)
  }

  async deleteTask(userId: string, taskId: string) {
    return this.tasksStorage.deleteTask(userId, taskId)
  }
}
