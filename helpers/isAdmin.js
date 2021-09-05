module.exports = {
    isAdmin: function (req, res, next) {
        // Verificando através do passport se existe um usuário autenticado
        if (req.isAuthenticated() && req.user.isAdmin == 1) {
            return next()
        }

        req.flash('errorMessage', 'Você não tem permissão de acesso administrador!')
        res.redirect('/')
    }
}