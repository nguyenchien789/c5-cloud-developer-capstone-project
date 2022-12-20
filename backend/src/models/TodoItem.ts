export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  description: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
