
const express = require('express')
const app = express()

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

app.use(express.json())
const morgan = require('morgan')
const morgan_logger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})
app.use(morgan_logger)




app.get('/api/persons', (req, res) => {
    res.json(phonebook)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = phonebook.find(p => p.id === id)

    if (person) {
        return res.json(person)
    }

    else {
        return res.status(404).end()
    }
})

app.get('/info', (req, res) => {
    const info = `
        <p>Phone book has info for ${phonebook.length} people</p>
        <p>${Date()}</p>
    `
    return res.send(info)
})

const generateId = () => {
    let number = Math.random()      //  [0,1)
    number = number * (10 ** 4)     //  [0,10000)
    number = number + 1             //  [1,10001)
    number = Math.floor(number)     //  [1,10000]

    return number
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


    const person = {
        id: generateId(),
        name,
        number
    }
    phonebook = phonebook.concat(person)
    return res.json(person)
})


app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    phonebook = phonebook.filter(person => person.id !== id)
    console.log(phonebook)
})

const PORT = 3001

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})


