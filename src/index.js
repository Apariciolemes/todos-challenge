const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const userAlreadyExists = users.find(user => user.username === username);

  if (!userAlreadyExists) {
    return response.status(400).json({ error: 'Username dont exists' })
  }

  next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body
  const nameAlreadyExists = users?.some(user => user.username === username)

  if (nameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' })
  }

  if (!username && !name) {
    return response.status(400).json({ error: 'Need username and name to create new User' })
  }

  const user = {
    id: uuidv4(),
    username,
    name,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const getTodosUsername = users.find(user => user.username === username)?.todos

  return response.status(200).json(getTodosUsername)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body

  if (!title, !deadline) {
    return response.status(400).json({ error: 'Need title and deadline to create new User' })
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const user = users.find(user => user.username === username)
  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const { title, deadline } = request.body

  const user = users.find(user => user.username === username)
  const indexTodo = user.todos.findIndex(todo => todo.id === id)

  if (indexTodo < 0) {
    return response.status(404).json({ error: 'This is id not exists' })
  }

  if (!title, !deadline) {
    return response.status(400).json({ error: 'Need title and deadline to update Todo' })
  }

  const todo = user.todos[indexTodo]

  todo.title = title
  todo.deadline = deadline

  user.todos.splice(indexTodo, 1, todo)

  return response.status(200).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers

  const user = users.find(user => user.username === username)
  const indexTodo = user.todos.findIndex(todo => todo.id === id)

  if (indexTodo < 0) {
    return response.status(404).json({ error: 'This is id not exists' })
  }

  const todo = user.todos[indexTodo]

  todo.done = true

  user.todos.splice(indexTodo, 1, todo)

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers

  const user = users.find(user => user.username === username)
  const indexTodo = user.todos.findIndex(todo => todo.id === id)

  if (indexTodo < 0) {
    return response.status(404).json({ error: 'This is id not exists' })
  }

  user.todos.splice(indexTodo, 1)

  return response.status(204).json(user.todos)
});

module.exports = app;