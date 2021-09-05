const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Definindo a estrutura da Collection
const Categories = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

// Criando o model
mongoose.model('categories', Categories)
