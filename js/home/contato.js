const formContato = document.querySelector('#form-contato')
const avisoForm = document.querySelector('#aviso-form')

const modalContatoTexto = document.querySelector('#modal-contato-texto');

function mostrarAviso(texto, tipo) {
    avisoForm.textContent = texto;
    avisoForm.className = 'aviso-form visivel ' + tipo;
}

function esconderAviso() {
    avisoForm.textContent = '';
    avisoForm.className = 'aviso-form';
}

/* Abrir e fechar agora é com o ui.js: ele fecha qualquer modal
   pelo X, pelo fundo escuro, pelo Esc e pelos botões marcados
   com data-fechar-modal. Não precisamos mais repetir isso aqui. */
function abrirModalContato(texto) {
    modalContatoTexto.textContent = texto;
    abrirModal('modal-contato');
}

formContato.addEventListener('submit', function (evento) {
    evento.preventDefault();

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
    abrirModalContato('Recebemos sua mensagem, ' + nome + '! Em breve entraremos em contato')
    formContato.reset();
});
