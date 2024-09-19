
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')

const Person = require('./models/persons')

morgan.token('type', function (req, res) { return req.headers['content-type'] })
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })


const morgan_logger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.type(req, res),
    tokens.body(req,res)
  ].join(' ')
})

phonebook = [
    {
      "id": "1",
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": "2",
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": "3",
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": "4",
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]
app.use(cors())
app.use(express.static('dist'))

app.use(express.json())
app.use(morgan_logger)

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = Person.findById(req.params.id).then(person => {
        if (person) {
            return res.json(person)
        }

        else {
            return res.status(404).end()
        }
    })
    .catch(error => next(error))

})

app.get('/info', (req, res, next) => {
    Person.find({})
        .then(persons => persons.length)
        .then(length => {
            const info = `
                <p>Phone book has info for ${length} people</p>
                <p>${Date()}</p>
            `
            return res.send(info)

        })
        .catch(error => next(error))



})

const generateId = () => {
    let number = Math.random()      //  [0,1)
    number = number * (10 ** 4)     //  [0,10000)
    number = number + 1             //  [1,10001)
    number = Math.floor(number)     //  [1,10000]

    return String(number)
}

app.post('/api/persons', (req, res) => {

    const body = req.body
    const name = body.name
    const number = body.number
    const nameExists = phonebook.find(person => person.name === body.name)

    // Name missing - 400
    if (!name) {
        return res.status(400).json({
            error: 'name missing'
        })
    }
    // Number missing - 400
    if (!number) {
        return res.status(400).json({
            error: 'number missing'
        })
    }


    // Resource exists - 409
    if (nameExists) {
        return res.status(409).json({
            error: 'name must be unique'
        })
    }


    const person = new Person({
        id: generateId(),
        name,
        number
    })
    return person.save().then(person => {
      res.json(person)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (req, res) => {
    const body = req.body
    const person = {name: body.name, number: body.number}
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
        res.json(updatedPerson)
        })
    .catch(error => next(error))
})
app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))

})



const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})


