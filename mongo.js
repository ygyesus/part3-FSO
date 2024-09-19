const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const username = 'phonebook'
const password = process.argv[2]
const name = process.argv.length > 3 ? process.argv[3]
    : null
const number = process.argv.length > 3 ? process.argv[4]
    : null


const url = process.env.MONGODB_URI


// const url = 'mongodb://localhost:27017/phonebook';
mongoose.set('strictQuery',false)
mongoose.connect(url)


// Schema + Model
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

const addPerson = (person) => {
    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}

const getPersons = () => Person.find({})

if (name && number) {

    const person = new Person({
        name, number
    })
    addPerson(person)
    console.log(`added ${name} number ${number} to phonebook`)
} else {
    console.log("phonebook:")
    getPersons()
        .then(persons => {
                persons.forEach(person => {
                    console.log(`${person.name} ${person.number}`)
                })
                mongoose.connection.close()
            }
        )
}
