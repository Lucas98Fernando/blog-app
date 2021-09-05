const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categories')
// Pegando uma referência do model Categories criado e atribuindo uma constante para poder ser utilizada nesse arquivo
const Categories = mongoose.model('categories')
require('../models/Posts')
// Pegando uma referência do model Posts criado e atribuindo uma constante para poder ser utilizada nesse arquivo
const Posts = mongoose.model('posts')
// Pegando o módulo que contém o middleware de admin para proteger algumas rotas
const {
    isAdmin
} = require('../helpers/isAdmin')

router.get('/', isAdmin, (req, res) => {
    res.render('admin/index')
})

/* ROTAS DE CATEGORIAS */

router.get('/categorias', isAdmin, (req, res) => {
    // Listando dados do banco
    Categories.find().sort({
            // Ordenando do mais recente para o mais antigo
            date: 'desc'
        }).lean()
        .then((listCategories) => {
            res.render('admin/categories', {
                categories: listCategories
            })
        })
        .catch((erro) => {
            req.flash('errorMessage', 'Houve um erro ao listar as categorias')
            res.redirect('/admin')
        })
})

router.get('/categorias/adicionar', isAdmin, (req, res) => {
    res.render('admin/addCategories')
})

router.post('/categorias/nova', isAdmin, (req, res) => {
    const newCategory = {
        name: req.body.name,
        slug: req.body.slug
    }

    let erros = []

    if (!req.body.name) {
        erros.push({
            message: 'Nome inválido!'
        })
    }
    if (req.body.name.length < 3) {
        erros.push({
            message: 'O nome deve conter no mínimo 3 caracteres'
        })
    }
    if (!req.body.slug) {
        erros.push({
            message: 'Slug inválido!'
        })
    }
    if (erros.length > 0) {
        res.render('admin/addCategories', {
            erros: erros
        })
    } else {
        new Categories(newCategory).save().then(() => {
            req.flash('successMessage', 'Categoria cadastrada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('errorMessage', 'Não foi possível cadastrar a categoria')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/editar/:id', isAdmin, (req, res) => {
    Categories.findOne({
        // Filtrando no banco se o id passsado como parâmetro na rota corresponde a algum id no banco
        _id: req.params.id
    }).lean().then((editCategory) => {
        res.render('admin/editCategories', {
            categories: editCategory
        })
    }).catch((erro) => {
        req.flash('errorMessage', 'Categoria inexistente!')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/editando', isAdmin, (req, res) => {
    Categories.findOne({
        _id: req.body.id
    }).then((category) => {
        let erros = []

        if (!req.body.name) {
            erros.push({
                message: 'Nome inválido'
            })
        }
        if (!req.body.slug) {
            erros.push({
                message: 'Slug inválido'
            })
        }
        if (req.body.name.length < 3) {
            erros.push({
                message: 'O nome deve conter no mínimo 3 caracteres!'
            })
        }
        if (erros.length > 0) {
            Categories.findOne({
                _id: req.body.id
            }).lean().then((category) => {
                res.render('admin/editCategories', {
                    categories: category,
                    erros: erros
                })
            }).catch((erro) => {
                req.flash('errorMessage', 'Erro ao pegar os dados')
                res.redirect('/admin/categorias')
            })
        } else {
            category.name = req.body.name
            category.slug = req.body.slug

            category.save().then(() => {
                req.flash('successMessage', 'Categoria editada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch((erro) => {
                req.flash('errorMessage', 'Ocorreu um erro ao editar a categoria, tente novamente!')
                res.redirect('/admin/categorias')
            })
        }
    }).catch((erro) => {
        req.flash('errorMessage', 'Não foi possível realizar a edição da categoria')
        req.redirect('/admin/categorias')
    })
})

router.post('/categorias/excluir', isAdmin, (req, res) => {
    Categories.deleteOne({
        _id: req.body.id
    }).then(() => {
        req.flash('successMessage', 'Categoria excluida com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((erro) => {
        req.flash('erroMessage', 'Não foi possível excluir a categoria')
        res.redirect('/admin/categorias')
    })
})

/* FIM DAS ROTAS DE CATEGORIAS */

/* ROTAS DE POSTAGENS */

router.get('/postagens', isAdmin, (req, res) => {
    // Listando dados do banco
    // Utilizando o populate() é possível trazer dados de collections que possuem relacionamentos, como é o caso da categoria em postagens
    Posts.find().sort({
            // Ordenando do mais recente para o mais antigo
            date: 'desc'
        }).lean().populate('category').lean()
        .then((listPosts) => {
            res.render('admin/posts', {
                posts: listPosts
            })
        })
        .catch((erro) => {
            req.flash('errorMessage', 'Houve um erro ao listar as postagens')
            res.redirect('/admin')
        })
})

router.get('/postagens/adicionar', isAdmin, (req, res) => {
    Categories.find().lean().then((listCategories) => {
        res.render('admin/addPosts', {
            categories: listCategories
        })
    }).catch((erro) => {
        req.flash('errorMessage', 'Não foi possível carregar o formulário de cadastro de postagens')
    })
})

router.post('/postagens/nova', isAdmin, (req, res) => {
    let erros = []

    if (req.body.category == '0') {
        erros.push({
            message: 'A categoria informada é inválida! Cadastre uma categoria.'
        })
    }

    if (erros.length > 0) {
        res.render('admin/addPosts', {
            erros: erros
        })
    } else {
        const newPost = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category
        }

        new Posts(newPost).save().then(() => {
            req.flash('successMessage', 'Postagem cadastrada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('errorMessage', 'Houve um erro ao cadastrar a postagem')
            res.redirect('/admin')
        })
    }
})

router.get('/postagens/editar/:id', isAdmin, (req, res) => {
    // Filtrando na collection posts
    Posts.findOne({
        // Filtrando no banco se o id passsado como parâmetro na rota corresponde a algum id no banco
        _id: req.params.id
    }).lean().then((editPost) => {
        // Filtrando na collection categories
        Categories.find().lean().then((categories) => {
            res.render('admin/editPosts', {
                // Passando para o front as categorias e já deixando selecionada a categoria
                posts: editPost,
                categories: categories
            })
        }).catch((erro) => {
            req.flash('errorMessage', 'Não foi possível listar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch((erro) => {
        req.flash('errorMessage', 'Postagem inexistente!')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/editando', isAdmin, (req, res) => {
    Posts.findOne({
        _id: req.body.id
    }).then((post) => {
        let erros = []

        if (!req.body.title) {
            erros.push({
                message: 'Título inválido'
            })
        }
        if (!req.body.slug) {
            erros.push({
                message: 'Slug inválido'
            })
        }
        if (!req.body.description) {
            erros.push({
                message: 'Descrição inválida'
            })
        }
        if (!req.body.content) {
            erros.push({
                message: 'Conteúdo inválido'
            })
        }
        if (req.body.category == '0') {
            erros.push({
                message: 'A categoria informada é inválida! Cadastre uma categoria.'
            })
        }
        if (req.body.title.length < 3) {
            erros.push({
                message: 'O título deve conter no mínimo 3 caracteres!'
            })
        }
        if (req.body.description.length < 10) {
            erros.push({
                message: 'Descrição muito pequena, informe no mínimo 10 caracteres'
            })
        }
        if (erros.length > 0) {
            Posts.findOne({
                _id: req.body.id
            }).lean().then((post) => {
                Categories.find().lean().then((categories) => {
                    res.render('admin/editPosts', {
                        posts: post,
                        categories: categories,
                        erros: erros
                    })
                }).catch((erro) => {
                    req.flash('errorMessage', 'Não foi possível listar as categorias')
                    res.redirect('/admin/postagens')
                })
            }).catch((erro) => {
                req.flash('errorMessage', 'Erro ao pegar os dados')
                res.redirect('/admin/postagens')
            })
        } else {
            post.title = req.body.title
            post.slug = req.body.slug
            post.description = req.body.description
            post.content = req.body.content
            post.category = req.body.category

            post.save().then(() => {
                req.flash('successMessage', 'Postagem editada com sucesso!')
                res.redirect('/admin/postagens')
            }).catch((erro) => {
                req.flash('errorMessage', 'Ocorreu um erro ao editar a postagem, tente novamente!')
                res.redirect('/admin/postagens')
            })
        }
    }).catch((erro) => {
        req.flash('errorMessage', 'Não foi possível realizar a edição da postagem')
        req.redirect('/admin/postagens')
    })
})

router.post('/postagens/excluir', isAdmin, (req, res) => {
    Posts.deleteOne({
        _id: req.body.id
    }).then(() => {
        req.flash('successMessage', 'Postagem excluida com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((erro) => {
        req.flash('erroMessage', 'Não foi possível excluir a postagem')
        res.redirect('/admin/postagens')
    })
})

/* FIM DAS ROTAS DE POSTAGENS */

module.exports = router