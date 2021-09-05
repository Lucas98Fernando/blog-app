const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model de usuários
require('../models/Users')
const User = mongoose.model('users')

module.exports = function (passport) {
    passport.use(new localStrategy({
        // Informando qual campo devo analisar
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        User.findOne({
            // Procurando um usuário com um e-mail igual ao que foi passado na autenticação
            email: email
        }).then((user) => {
            if (!user) {
                // O done() recebe 3 parâmetros, os dados da conta que foi autenticada, o resultado da autenticação e a messagem  
                return done(null, false, {
                    message: 'Esse conta não existe!'
                })
            }
            // Verificando a senha que foi passada na autenticação e a senha que foi encontrada no banco
            bcrypt.compare(password, user.password, (error, passwordMatch) => {
                if (passwordMatch) {
                    return done(null, user)
                } else {
                    return (null, false, {
                        message: 'Usuário ou senha incorretos!'
                    })
                }
            })
        })
    }))

    // Salvando os dados do usuário para um sessão
    passport.serializeUser((user, done) => {
        // Passando os dados do usuário para uma sessão
        done(null, user)
    })

    passport.deserializeUser((id, done) => {
        // Procurando o usuário pelo id dele
        User.findById(id, (erro, user) => {
            done(erro, user)
        })
    })
}