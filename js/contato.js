const formContato = document.querySelector('#form-contato')
const avisoForm = document.querySelector('#aviso-form')

const modalContato = document.querySelector('#modal-contato');
const modalContatoTexto = document.querySelector('#modal-contato-texto');
const botaoFechar = modalContato.querySelector('.modal-fechar');
const botaoOk = modalContato.querySelector('.modal-ok')

function mostrarAviso(texto, tipo) {
    avisoForm.textContent = texto;
    avisoForm.className = 'aviso-form visivel ' + tipo;
}

function esconderAviso() {
    avisoForm.textContent = '';
    avisoForm.className = 'aviso-form';
}

function abrirModalContato(texto) {
    modalContatoTexto.textContent = texto;
    modalContato.classList.add('aberto');
}

function fecharModalContato() {
    modalContato.classList.remove('aberto');
}

formContato.addEventListener('submit', function (evento) {
    evento.preventDefault();
    console.log("Formulário enviado, página NÃO recarregou");

    const nome = document.querySelector('#nome').value.trim();
    const email = document.querySelector('#email').value.trim();
    const mensagem = document.querySelector('#mensagem').value.trim();

    if (nome.length < 3) {
        mostrarAviso('Escreva seu nome completo (Mínimo 3 letras).', 'erro');
        return;
    }

    if (mensagem.length < 10) {
        mostrarAviso('Sua mensagem está curta demais. Conte um pouco mais.', 'erro')
        return;
    }

    esconderAviso();
    abrirModalContato('Recebemos sua mensagem, ' + nome + '! Em breve entraremos em contato', 'sucesso')
    formContato.reset();

    formContato.reset();
});

botaoFechar.addEventListener('click', fecharModalContato);
botaoOk.addEventListener('click', fecharModalContato)

modalContato.addEventListener('click', function (evento) {
    if (evento.target === modalContato){
        fecharModalContato();
    }
});