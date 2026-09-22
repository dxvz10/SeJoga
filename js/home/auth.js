function obterSessao(){
    const bruto = localStorage.getItem('portalEventos_sessao');

    if (!bruto) {          // NOVO
        return null;
    }

    try {
        return JSON.parse(bruto);
    } catch (erro) {
        return null;
    }
}

function usuarioLogado() {
    return obterSessao() !== null;
}

const modalConta = document.querySelector('#modal-conta');
const fecharModalConta =  modalConta.querySelector('.modal-fechar');
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


/* =============================================================
   CABEÇALHO QUE REAGE À SESSÃO

   Deslogado -> "Cadastrar" e "Entrar"
   Logado    -> "Olá, <primeiro nome>" e "Sair"

   Como este arquivo é carregado por todas as páginas, basta
   marcar os elementos com data-sessao no HTML que eles passam
   a se comportar sozinhos.
   ============================================================= */

function aplicarSessaoNoCabecalho() {
    const sessao = obterSessao();
    const logado = sessao !== null;

    // hidden é uma propriedade booleana: recebe true ou false.
    // Um estado é sempre o contrário do outro.
    document.querySelectorAll('[data-sessao="deslogado"]').forEach(function (elemento) {
        elemento.hidden = logado;
    });

    document.querySelectorAll('[data-sessao="logado"]').forEach(function (elemento) {
        elemento.hidden = !logado;
    });

    if (logado) {
        // nomeCompleto é o que o cadastro vai gravar. O || funciona
        // como reserva: se não houver nome, usa o login.
        const nome = sessao.nomeCompleto || sessao.login || '';

        // split(' ') quebra o texto a cada espaço e devolve uma lista.
        // A posição [0] é o primeiro nome — cabe melhor no celular.
        const primeiroNome = nome.trim().split(' ')[0];

        document.querySelectorAll('.usuario-nome').forEach(function (elemento) {
            elemento.textContent = 'Olá, ' + primeiroNome;
        });

        // A foto virá do cadastro, guardada na sessão como "foto"
        // (uma imagem em texto, no formato data URL). Enquanto o
        // cadastro não existir, a silhueta padrão do CSS aparece.
        if (sessao.foto) {
            document.querySelectorAll('.usuario-avatar').forEach(function (elemento) {
                elemento.style.backgroundImage = 'url("' + sessao.foto + '")';
            });
        }
    }
}

const botaoSair = document.querySelector('#botao-sair');

// O if protege páginas que não tenham o botão. Sem ele,
// addEventListener em null quebraria o arquivo inteiro.
if (botaoSair) {
    botaoSair.addEventListener('click', function () {
        // Sair = apagar a sessão. Sem servidor, é literalmente isso.
        localStorage.removeItem('portalEventos_sessao');
        window.location.href = 'index.html';
    });
}

// Roda uma vez, no carregamento da página.
aplicarSessaoNoCabecalho();
