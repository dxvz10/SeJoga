/* =============================================================
   SEJOGA — HOME: CARDS DO CARROSSEL E CONTAGEM DAS CATEGORIAS

   Os cards são montados a partir da lista única do eventos.js —
   a mesma do calendário e da página Eventos.

   Este arquivo roda ANTES do carrossel.js de propósito: o
   carrossel precisa que os cards já existam para encontrá-los.

   (O criarElemento, que morava aqui, foi para o ui.js: agora
   todas as páginas usam o mesmo.)
   ============================================================= */

const trilhoEventos = document.querySelector('.trilho-eventos');

/* Quantos eventos entram no carrossel. Só os próximos em que
   ainda dá para entrar — evento que já passou não é vitrine. */
const QUANTIDADE_CARROSSEL = 6;


function montarCardCarrossel(evento) {
    const status = calcularStatusEvento(evento);

    const card = criarElemento('article', 'card-evento');

    card.appendChild(criarElemento('span', 'categoria', NOMES_CATEGORIAS[evento.categoria] || evento.categoria));
    card.appendChild(criarElemento('h2', 'titulo', evento.nome));
    card.appendChild(criarElemento('p', 'local', evento.local));
    card.appendChild(criarElemento('p', 'data', formatarDataCurta(evento.dataHora)));
    card.appendChild(criarElemento('p', 'descricao', evento.descricao));

    const rodape = criarElemento('div', 'rodape-card');
    rodape.appendChild(criarElemento('span', 'preco', formatarPreco(evento.preco)));
    rodape.appendChild(criarElemento('span', status.classe, status.rotulo));
    card.appendChild(rodape);

    return card;
}


function renderizarCarrossel() {
    // Limpa antes de montar, senão uma segunda chamada duplicaria tudo.
    trilhoEventos.textContent = '';

    proximosEventosAbertos(QUANTIDADE_CARROSSEL).forEach(function (evento) {
        trilhoEventos.appendChild(montarCardCarrossel(evento));
    });
}


/* Em cada cartão de categoria: "3 próximos eventos".
   O HTML marca onde escrever com data-contar-categoria. */
function contarCategorias() {
    const abertos = obterEventos().filter(eventoAberto);

    document.querySelectorAll('[data-contar-categoria]').forEach(function (alvo) {
        const categoria = alvo.dataset.contarCategoria;

        const quantos = abertos.filter(function (evento) {
            return evento.categoria === categoria;
        }).length;

        if (quantos === 0) {
            alvo.textContent = 'Em breve';
        } else {
            alvo.textContent = quantos + (quantos === 1 ? ' próximo evento' : ' próximos eventos');
        }
    });
}


renderizarCarrossel();
contarCategorias();
