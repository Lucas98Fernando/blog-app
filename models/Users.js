const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Users = new Schema({
    isAdmin: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('users', Users)