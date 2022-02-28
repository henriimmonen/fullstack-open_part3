require('dotenv').config()
const express = require('express')
const req = require('express/lib/request')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { response } = require('express')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.use(morgan(':body', {
  skip: function (req, res) { return req.method ==='GET' || req.method === 'DELETE' }}))


morgan.token('body', function (req, res) { 
  return JSON.stringify(req.body)})

const generateId = () => {
  return Math.floor(Math.random() * (100000-5) + 5)
}

app.get('/', (req, res) => {
  res.send('<h1>Personlist at /persons</h1>')
})

app.get('/info', (req, res) => {
  res.send('<p>Phonebook has info for ' + (Person.length +1) + ' people<p> ' + new Date())
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (req,res, next) => {
  const body = req.body

  const person = new Person ({
    id: generateId(),
    name: body.name,
    number: body.number
  })
  person.save()
    .then(savedNote => {
      console.log(savedNote)
      res.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req,res, next) => {
  const body = req.body
  
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { 
      new: true, 
      runValidators: true, 
      context: 'query' 
    })
  .then(updatedPerson => {
    res.json(updatedPerson)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})