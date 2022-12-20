import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Card,
  Form,
  Segment
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  newTodoDescription: string
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    newTodoDescription: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoDescription: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async () => {
    try {
      if(this.state.newTodoName.length === 0) {
        alert("Name is required")
        return
      }
      if(this.state.newTodoDescription.length === 0) {
        alert("Description is required")
        return
      }
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        description: this.state.newTodoDescription || '',
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: '',
        newTodoDescription: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      if (!window.confirm("Are you sure to delete this item?")) return;
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        description: todo.description,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Chien's TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Segment>
          <Form>
            <Form.Field required>
              <label>Task Name</label>
              <Input placeholder='Task Name' onChange={this.handleNameChange} defaultValue='' />
            </Form.Field>
            <Form.Field required>
              <label>Description</label>
              <Input placeholder='Description' onChange={this.handleDescriptionChange} defaultValue='' />
            </Form.Field>
            <Button primary onClick={() => this.onTodoCreate()}><Icon name="save" />Save</Button>
          </Form>
        </Segment>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        <Card.Group>
          {this.state.todos.map((todo, pos) => {
            return (
              <Card key={todo.todoId}>
                <Image src={todo.attachmentUrl} wrapped ui={false} />
                <Card.Content>
                  <Card.Description>
                    Name: {todo.name}
                  </Card.Description>
                  <Card.Description>
                    Due date: {todo.dueDate}
                  </Card.Description>
                  <Card.Description>
                    Description: {todo.description}
                  </Card.Description>
                  <Card.Description>
                    Done: <Checkbox
                            onChange={() => this.onTodoCheck(pos)}
                            checked={todo.done}
                          />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <div className='ui two buttons'>
                    <Button basic color='blue' onClick={() => this.onEditButtonClick(todo.todoId)}>
                      <Icon name="pencil" />Edit
                    </Button>
                    <Button basic color='red' onClick={() => this.onTodoDelete(todo.todoId)}>
                      <Icon name="delete" />Delete
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            )
          })}
        </Card.Group>
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
