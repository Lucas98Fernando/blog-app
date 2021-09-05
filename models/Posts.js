const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Posts = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        // Fazendo o relacionando de um atributo da collection categories do model Categories
        type: Schema.Types.ObjectId,
        // Referência ao collection categories do model Categories
        ref: 'categories',
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('posts', Posts)