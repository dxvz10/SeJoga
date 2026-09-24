/* =============================================================
   SEJOGA — COMPONENTES DE TELA REUTILIZÁVEIS

   O enunciado proíbe alert(), confirm() e prompt(). Toda
   mensagem passa por aqui:

     mostrarToast('Texto', 'sucesso' | 'erro' | 'info')
     abrirModal('id-do-modal')   /   fecharModal('id-do-modal')

   Os modais fecham sozinhos pelo X, pelo fundo escuro e pela
   tecla Esc — nenhuma página precisa repetir esse código.
   ============================================================= */


/* -------------------------------------------------------------
   TOAST — o aviso que aparece no canto e some sozinho
   ------------------------------------------------------------- */

function obterAreaDeToasts() {
    let area = document.querySelector('.area-toasts');

    // Criada só na primeira vez que alguém pede um toast.
    if (!area) {
        area = document.createElement('div');
        area.className = 'area-toasts';

        // aria-live faz o leitor de tela LER o aviso quando ele
        // aparece, sem a pessoa precisar procurar.
        area.setAttribute('aria-live', 'polite');
        document.body.appendChild(area);
    }

    return area;
}


function mostrarToast(texto, tipo, duracao) {
    const area = obterAreaDeToasts();

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (tipo || 'info');
    toast.textContent = texto;
    area.appendChild(toast);

    /* Duas etapas: primeiro o elemento entra na página, DEPOIS
       ganha a classe que o faz aparecer. Se as duas coisas
       acontecessem juntas, o navegador não teria um "antes" para
       animar e o toast surgiria sem transição.
       requestAnimationFrame = "espere o próximo quadro". */
    requestAnimationFrame(function () {
        toast.classList.add('visivel');
    });

    setTimeout(function () {
        toast.classList.remove('visivel');

        // Espera a animação de saída terminar antes de remover.
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, duracao || 3500);
}


/* -------------------------------------------------------------
   MODAIS
   ------------------------------------------------------------- */

/* Guarda quem estava com o foco antes de abrir o modal, para
   devolver o foco a ele no fechamento. Quem navega pelo teclado
   não se perde na página. */
let focoAntesDoModal = null;


function abrirModal(id) {
    const modal = document.getElementById(id);

    if (!modal) {
        return;
    }

    focoAntesDoModal = document.activeElement;
    modal.classList.add('aberto');

    const caixa = modal.querySelector('.modal-caixa');
    if (caixa) {
        caixa.setAttribute('tabindex', '-1');   // permite receber foco
        caixa.focus();
    }
}


function fecharModal(modal) {
    // Aceita tanto o id (texto) quanto o próprio elemento.
    if (typeof modal === 'string') {
        modal = document.getElementById(modal);
    }

    if (!modal || !modal.classList.contains('aberto')) {
        return;
    }

    modal.classList.remove('aberto');

    if (focoAntesDoModal) {
        focoAntesDoModal.focus();
        focoAntesDoModal = null;
    }
}


/* UM listener no documento inteiro cobre todos os modais da
   página, inclusive os criados depois por JavaScript.
   É a delegação de eventos: o clique "sobe" até o document, e
   aqui descobrimos onde ele nasceu. */
document.addEventListener('click', function (evento) {

    // closest() sobe pelos "pais" do elemento clicado até achar
    // um que combine com o seletor (ou devolve null).
    const botaoFechar = evento.target.closest('.modal-fechar, [data-fechar-modal]');

    if (botaoFechar) {
        fecharModal(botaoFechar.closest('.modal'));
        return;
    }

    // Clique no fundo escuro: o alvo é o próprio .modal,
    // e não algo dentro da caixa branca.
    if (evento.target.classList.contains('modal')) {
        fecharModal(evento.target);
    }
});


document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
        document.querySelectorAll('.modal.aberto').forEach(fecharModal);
    }
});


/* -------------------------------------------------------------
   PEQUENO AJUDANTE PARA MONTAR ELEMENTOS

   Usamos textContent e nunca innerHTML com dados do usuário:
   se alguém cadastrar um evento chamado "<script>...", ele
   aparece como texto, e não vira código. É a proteção contra XSS.
   ------------------------------------------------------------- */

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined && texto !== null) {
        elemento.textContent = texto;
    }

    return elemento;
}
