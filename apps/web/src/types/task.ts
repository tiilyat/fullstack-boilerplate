export interface Task {
  id: string
  title: string
  userId: string | null
  description: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}
