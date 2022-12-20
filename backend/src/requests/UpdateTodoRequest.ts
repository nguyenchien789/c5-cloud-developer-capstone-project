/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest {
  name: string
  description: string
  dueDate: string
  done: boolean
}