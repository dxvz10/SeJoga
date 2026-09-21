function obterSessao(){
    const bruto = localStorage.getItem('portalEventos_sessao');


    try {
        return JSON.parse(bruto);
    } catch (erro) {
        return null
    }
}

function usuarioLogado() {
    return obterSessao() !== null;
}

const modalConta = document.querySelector('#modal-conta');
const fecharModalConta =  modalConta.querySelector('.modal fechar');
const linksProtegidos = document.querySelectorAll('[data-precisa-login]')

linksProtegidos.forEach(function (link) {
    link.addEventListener('click', function (evento) {
        if (usuarioLogado()) {
            return;
        }

        evento.preventDefault();
        modalConta.classList.add('aberto');
    });
});


fecharModalConta.addEventListener('click', function() {
    modalConta.classList.remove('aberto');
});


modalConta.addEventListener('click', function(evento) {
    if (evento.target === modalConta){
        modalConta.classList.remove('aberto');
    }
});


document.addEventListener('keydown', function (evento) {
    if(evento.key === 'Escape'){
        modalConta.classList.remove('aberto');
    }
});
