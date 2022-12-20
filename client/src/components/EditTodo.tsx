import * as React from 'react'
import { Form, Button, Image, Card, Input, Segment } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, deleteTodoImage, getTodo, patchTodo } from '../api/todos-api'
import { Todo } from '../types/Todo'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  file: any
  uploadState: UploadState
  todo: Todo | undefined
  newTodoName: string
  newTodoDescription: string
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    todo: undefined,
    newTodoName: '',
    newTodoDescription: '',
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoDescription: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if(this.state.newTodoName.length === 0) {
        alert("Name is required")
        return
      }
      if(this.state.newTodoDescription.length === 0) {
        alert("Description is required")
        return
      }

      const newTodo = await patchTodo(this.props.auth.getIdToken(), this.props.match.params.todoId, {
        name: this.state.newTodoName,
        description: this.state.newTodoDescription || '',
        dueDate: this.state.todo?.dueDate || '',
        done: this.state.todo?.done || false
      })
      
      this.setState({
        todo: undefined
      })
      
      if (this.state.file) {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)
  
        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)

        alert('File was uploaded!')
      }
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
      this.componentDidMount()
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  onDeleteTodoImage = async (todoId: string) => {
    try {
        if (!window.confirm("Are you sure to delete this image?")) return;
        await deleteTodoImage(this.props.auth.getIdToken(), todoId)
    } catch {
        alert('Image deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodo(this.props.auth.getIdToken(), this.props.match.params.todoId)
      this.setState({
        todo: todos,
        newTodoName: todos.name,
        newTodoDescription: todos.description
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    const url = this.state.todo?.attachmentUrl;
    let image
    let button;
    if (url) {
      button = 
        <Button color='red' style={{ marginTop: '5px'}} onClick={() => this.onDeleteTodoImage(this.props.match.params.todoId)}>
            Remove
        </Button>;
      image = 
        <Card>
          <Image src={this.state.todo?.attachmentUrl} wrapped />
        </Card>;
    }

    return (
      <div>
        <h1>Edit todos</h1>
        
        <Segment>

        <Form onSubmit={this.handleSubmit}>
          
        <Form.Field required>
              <label>Task Name</label>
              <Input placeholder='Task Name' onChange={this.handleNameChange} defaultValue={this.state.todo?.name}/>
            </Form.Field>
            <Form.Field required>
              <label>Description</label>
              <Input placeholder='Description' onChange={this.handleDescriptionChange} defaultValue={this.state.todo?.description}/>
            </Form.Field>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
        </Segment>
        
        {image}

        {button}
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Save
        </Button>
      </div>
    )
  }
}
