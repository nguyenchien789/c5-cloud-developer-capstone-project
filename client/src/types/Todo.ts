export interface Todo {
  todoId: string
  createdAt: string
  name: string
  description: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
