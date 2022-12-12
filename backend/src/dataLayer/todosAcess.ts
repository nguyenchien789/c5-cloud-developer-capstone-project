import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly table = process.env.TODOS_TABLE,
      private readonly bucket = process.env.ATTACHMENT_S3_BUCKET) {
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info("createTodo");

        await this.docClient.put({
            TableName: this.table,
            Item: todoItem
        }).promise();

        return todoItem;
    }

    async deleteTodo(todoId: string, userId: string) {
        logger.info("deleteTodo");

        await this.docClient.delete({
            TableName: this.table,
            Key: {
                todoId: todoId,
                userId: userId
            },
        }).promise();
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info("getTodosForUser");

        const result = await this.docClient.query({
            TableName: process.env.TODOS_TABLE,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items;
        return items as TodoItem[];
    }


    async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info("updateTodo");

        await this.docClient.update({
            TableName: this.table,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: "set #n = :n, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":n": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done,
            },
            ExpressionAttributeNames: { '#n': "name" }
        }).promise();

        return todoUpdate;
    }

    async createAttachmentPresignedUrl(todoId: string, userId: string, attachmentId: any) {
        logger.info("createAttachmentPresignedUrl");
        const attachmentUrl = `https://${this.bucket}.s3.amazonaws.com/${attachmentId}`

        await this.docClient.update({
            TableName: this.table,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl,
            },
        }).promise();
    }
}