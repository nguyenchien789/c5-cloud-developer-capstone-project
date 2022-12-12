import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const logger = createLogger("todos");

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info("Create todo for user " + userId);

    const todoId = uuid.v4();
    const createdAt = new Date().toISOString();
    const newItem : TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: createdAt,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    };

    return await todoAccess.createTodo(newItem);
}

export async function deleteTodo(todoId: string, userId: string) {
    logger.info("Delete todo for user " + userId + " by id " + todoId);

    await todoAccess.deleteTodo(todoId, userId);
}

export async function getTodosForUser(userId: string): Promise<any> {
    logger.info("Get todos for user " + userId);

    return await todoAccess.getTodosForUser(userId);
}

export async function updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest) {
    logger.info("Update todo for user " + userId + " by id " + todoId);

    await todoAccess.updateTodo(todoId, userId, updateTodoRequest);
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info("Create attachment presigned url");
    const attachmentId = uuid.v4();
    await todoAccess.createAttachmentPresignedUrl(todoId, userId, attachmentId);
    return await attachmentUtils.createAttachmentPresignedUrl(attachmentId);
}