// Importando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const mongoose = require('mongoose')
// Recebendo a função do Express
const app = express()
const admin = require('./routes/admin')
const user = require('./routes/user')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Posts')
const Posts = mongoose.model('posts')
require('./models/Categories')
const Categories = mongoose.model('categories')
const passport = require('passport')
require('./config/auth')(passport)
require('dotenv').config({
    path: path.resolve(__dirname, './.env')
});

// Controle de sessão
app.use(session({
    secret: 'chaveParaGerarSessao',
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Middleware
app.use((req, res, next) => {
    // Criando variáveis globais para toda a aplicação
    // Menssagem de sucesso
    res.locals.successMessage = req.flash('successMessage')
    // Menssagem de erro
    res.locals.errorMessage = req.flash('errorMessage')
    res.locals.error = req.flash('error')
    // Recuperando dados do usuário autenticado
    res.locals.user = req.user || null
    next()
})

// Configurações
// Configuração com o express para o dados do body da requisição HTTP
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())

// Configuração do template engine do handlebars
app.engine('handlebars', handlebars({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

// mongoose
mongoose.Promise = global.Promise
mongoose.connect((process.env.MONGO_URL), {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.info('Conexão realizada com sucesso!')
}).catch((erro) => {
    console.error(`Não foi possível realizar a conexão: ${erro}`)
})

// Public
// Definindo a pasta public com o express
app.use(express.static(path.join(__dirname, 'public')))

// Rotas
app.get('/', (req, res) => {
    // Listando dados do banco
    // Utilizando o populate() é possível trazer dados de collections que possuem relacionamentos, como é o caso da categoria em postagens
    Posts.find().sort({
            // Ordenando do mais recente para o mais antigo
            date: 'desc'
        }).lean().populate('category').lean()
        .then((listPosts) => {
            res.render('home', {
                posts: listPosts
            })
        })
        .catch((erro) => {
            req.flash('errorMessage', 'Houve um erro inexperado')
            res.redirect('/404')
        })
})

app.get('/404', (req, res) => {
    res.send('Erro 404!')
})

app.get('/postagens', (req, res) => {
    Posts.find().sort({
        date: 'desc'
    }).lean().populate('category').lean().then((listPosts) => {
        res.render('posts/listPosts', {
            posts: listPosts
        })
    }).catch((erro) => {
        req.flash('errorMessage', 'Não foi possível listar as postagens')
        res.redirect('/')
    })
})

app.get('/postagens/:slug', (req, res) => {
    Posts.findOne({
        slug: req.params.slug
    }).lean().then((postData) => {
        if (postData) {
            res.render('posts/index', {
                post: postData
            })
        } else {
            req.flash('errorMessage', 'Não foi possível localizar a postagem')
            res.redirect('/')
        }
    }).catch((erro) => {
        req.flash('errorMessage', 'Ocorreu um erro inesperado!')
    })
})

// Rota de listagem de categorias
app.get('/categorias', (req, res) => {
    Categories.find().lean().then((listCategories) => {
        res.render('categories/index', {
            categories: listCategories
        })
    }).catch((erro) => {
        req.flash('errorMessage', 'Houve um erro inesperado ao listar categorias')
        res.redirect('/')
    })
})

// Rota de visualização da categoria selecionada, baseada no slug passado
app.get('/categorias/:slug', (req, res) => {
    Categories.findOne({
        slug: req.params.slug
    }).lean().then((category) => {
        if (category) {
            // Procurando na collection de categorias, a categoria selecionada pelo id
            Posts.find({
                category: category._id
            }).lean().then((post) => {
                res.render('categories/postsCategories', {
                    posts: post,
                    categories: category
                })
            }).catch((erro) => {
                req.flash('errorMessage', 'Não foi possível listar os posts dessa categoria')
                res.redirect('/')
            })
        } else {
            req.flash('errorMessage', 'Essa categoria não existe!')
            res.redirect('/')
        }
    }).catch((erro) => {
        req.flash('errorMessage', 'Houve um erro interno ao carregar a página dessa categoria')
        res.redirect('/')
    })
})

// Grupo de rotas com o prefixo/admin
app.use('/admin', admin)

app.use('/usuarios', user)

// Servidor
const port = process.env.PORT || 8081
app.listen(port, () => {
    console.log('Servidor funcionando!')
    console.log('Acesse: http://localhost:8081')
})