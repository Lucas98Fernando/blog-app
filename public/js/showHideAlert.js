 // Esconder alert após um tempo
 var alertMessage = document.querySelector('.alert')
 if (alertMessage) {
     setTimeout(function () {
         alertMessage.classList.remove('d-flex')
         alertMessage.classList.add('d-none')
     }, 3000)
 }