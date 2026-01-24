import type { TasksService } from './tasks.service'
import type { CreateTaskPayload, TasksQuery, UpdateTaskPayload } from './tasks.types'

export class TasksControllers {
  constructor(private tasksService: TasksService) {}

  async createTask(userId: string, payload: CreateTaskPayload) {
    const task = await this.tasksService.createTask(userId, payload)
    return task
  }

  async getTasks(userId: string, query: TasksQuery) {
    const tasks = await this.tasksService.getTasks(userId, query)
    return tasks
  }

  async getTask(userId: string, taskId: string) {
    const task = await this.tasksService.getTask(userId, taskId)
    return task
  }

  async updateTask(userId: string, taskId: string, payload: UpdateTaskPayload) {
    return this.tasksService.updateTask(userId, taskId, payload)
  }

  async deleteTask(userId: string, taskId: string) {
    return await this.tasksService.deleteTask(userId, taskId)
  }
}
