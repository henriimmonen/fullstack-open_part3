require('dotenv').config()
const express = require('express')
const req = require('express/lib/request')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':body', {
  skip: function (req, res) { return req.method ==='GET' }}))

morgan.token('body', function (req, res) { 
  return JSON.stringify(req.body)})

const generateId = () => {
  return Math.floor(Math.random() * (100000-5) + 5)
}

app.get('/', (req, res) => {
  res.send('<h1>Personlist at /persons</h1>')
})

app.get('/info', (req, res) => {
  res.send('<p>Phonebook has info for ' + Person.length + ' people<p> ' + new Date())
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = Person.findById(id).then(person => {
    res.json(person)
  })
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  
  res.status(204).end()
})

app.post('/api/persons', (req,res) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({
      error:'Name or number missing'
    })
  }
  
  /*if(persons.find(person => person.name === body.name)){
    return res.status(400).json({
      error:'Name must be unique'
    })
  }*/
  const person = new Person ({
    id: generateId(),
    name: body.name,
    number: body.number
  })
  person.save().then(savedNote => {
    res.json(savedNote)
  })
  app.use(morgan(':body'))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})