// Validando os campos de formulário
(function () {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')

    // Prevenindo submisão do form antes de validar os campos
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()