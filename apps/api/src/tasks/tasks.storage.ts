import { and, eq } from 'drizzle-orm'
import type { db as drizzle } from '../db/db'
import { task as taskTable } from '../db/schema'

export class TasksStorage {
  private db: typeof drizzle

  constructor(db: typeof drizzle) {
    this.db = db
  }

  async createTask(task: { title: string; userId: string; description?: string; completed?: boolean }) {
    const result = await this.db
      .insert(taskTable)
      .values({
        title: task.title,
        userId: task.userId,
        description: task.description,
        completed: task.completed ?? false,
      })
      .returning()

    return result[0]
  }

  async getTasks(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ) {
    const prepared = this.db.select().from(taskTable).where(eq(taskTable.userId, userId))

    if (options?.limit) {
      prepared.limit(options.limit)
    }

    if (options?.offset) {
      prepared.offset(options.offset)
    }

    const result = await prepared.execute()

    return result
  }

  async getTask(userId: string, taskId: string) {
    const result = await this.db
      .select()
      .from(taskTable)
      .where(and(eq(taskTable.userId, userId), eq(taskTable.id, taskId)))

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  async updateTask(
    userId: string,
    taskId: string,
    task: Partial<{
      title: string
      description: string
      completed: boolean
    }>
  ) {
    const result = await this.db
      .update(taskTable)
      .set(task)
      .where(and(eq(taskTable.userId, userId), eq(taskTable.id, taskId)))
      .returning()

    if (result.length === 0) {
      return null
    }

    return result[0]
  }

  async deleteTask(userId: string, taskId: string) {
    const result = await this.db
      .delete(taskTable)
      .where(and(eq(taskTable.userId, userId), eq(taskTable.id, taskId)))
      .returning()

    if (result.length === 0) {
      return null
    }

    return result[0]
  }
}
