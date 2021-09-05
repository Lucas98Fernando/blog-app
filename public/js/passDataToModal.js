// Passando para o modal o id do objeto que deseja excluir do banco
var modalDelete = document.getElementById('modalDelete')
modalDelete.addEventListener('show.bs.modal', function (event) {
    var button = event.relatedTarget
    var idFromTable = button.getAttribute('data-bs-whatever')
    var inputDelete = modalDelete.querySelector('.modal-footer input')

    inputDelete.value = idFromTable
})