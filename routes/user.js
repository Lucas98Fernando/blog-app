const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Users')
const Users = mongoose.model('users')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/cadastro', (req, res) => {
    if (req.user) {
        req.flash('successMessage', 'Você já possui conta e está logado.')
        res.redirect('/')
    }
    res.render('users/signUp')
})

router.post('/cadastro', (req, res) => {
    let erros = []

    if (!req.body.name) {
        erros.push({
            message: 'Informe um nome válido!'
        })
    }
    if (!req.body.email) {
        erros.push({
            message: 'Informe um endereço de e-mail válido!'
        })
    }
    if (!req.body.password) {
        erros.push({
            message: 'Informe uma senha válida!'
        })
    }
    if (!req.body.password) {
        erros.push({
            message: 'Informe uma senha válida!'
        })
    }
    if (!req.body.password) {
        erros.push({
            message: 'Informe uma senha válida!'
        })
    }
    if (req.body.password.length < 6) {
        erros.push({
            message: 'A senha deve conter no mínimo 6 caracteres!'
        })
    }
    if (req.body.password !== req.body.passwordConfirm) {
        erros.push({
            message: 'As senhas não coincidem!'
        })
    }
    if (erros.length > 0) {
        res.render('users/signUp', {
            erros: erros
        })
    } else {
        Users.findOne({
            // Pegando o e-mail do formulário para verificar se já existe
            email: req.body.email
        }).then((user) => {
            if (user) {
                req.flash('errorMessage', 'Já existe uma conta cadastrada com o e-mail informado')
                res.redirect('/usuarios/cadastro')
            } else {
                const newUser = new Users({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                // Gerando a senha em formato de hash
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('errorMessage', 'Houve um erro durante o salvamento dos dados de cadastro')
                            res.redirect('/')
                        }

                        // Pegando o hash gerado e atribuindo ao campo de senha
                        newUser.password = hash

                        // Inserindo os dados do usuário no banco
                        newUser.save().then(() => {
                            req.flash('successMessage', 'Usuário cadastrado com sucesso!')
                            res.redirect('/')
                        }).catch((erro) => {
                            req.flash('errorMessage', 'Houve um erro ao cadastrar o usuário')
                            res.redirect('/')
                        })
                    })
                })
            }
        }).catch((erro) => {
            req.flash('errorMessage', 'Houve um erro inesperado')
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res) => {
    if (req.user) {
        req.flash('successMessage', 'Você já está logado!')
        res.redirect('/')
    }
    res.render('users/signIn')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Caminho para realizar o redicionamento, caso ocorra com sucesso ou com erro
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('successMessage', 'Você saiu da sua conta!')
    res.redirect('/')
})

module.exports = router