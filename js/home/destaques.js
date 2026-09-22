/* =============================================================
   SEJOGA — CARDS DO CARROSSEL DA HOME

   Antes os três cards estavam escritos à mão no index.html.
   Agora eles são montados a partir da lista do eventos.js, que
   é a mesma que o calendário usa — as duas páginas nunca mais
   podem discordar.

   Este arquivo roda ANTES do carrossel.js de propósito: o
   carrossel precisa que os cards já existam para encontrá-los.
   ============================================================= */

const trilhoEventos = document.querySelector('.trilho-eventos');


/* Cria um elemento, coloca o texto e a classe. Uma função curta
   como esta evita repetir cinco linhas iguais para cada pedaço
   do card.

   Usamos textContent, e não innerHTML: se um evento cadastrado
   tiver < ou > no nome, o texto aparece como texto, em vez de
   virar HTML de verdade. É a proteção contra XSS. */
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}


function montarCardCarrossel(evento) {
    const status = calcularStatusEvento(evento);

    const card = criarElemento('article', 'card-evento');

    card.appendChild(criarElemento('span', 'categoria', evento.categoria));
    card.appendChild(criarElemento('h2', 'titulo', evento.nome));
    card.appendChild(criarElemento('p', 'local', evento.local));
    card.appendChild(criarElemento('p', 'data', formatarData(evento.dataHora)));
    card.appendChild(criarElemento('p', 'descricao', evento.descricao));

    const rodape = criarElemento('div', 'rodape-card');
    rodape.appendChild(criarElemento('span', 'preco', formatarPreco(evento.preco)));
    rodape.appendChild(criarElemento('span', status.classe, status.rotulo));
    card.appendChild(rodape);

    return card;
}


function renderizarCarrossel() {
    const eventos = obterEventos();

    // Limpa antes de montar, senão uma segunda chamada duplicaria tudo.
    trilhoEventos.textContent = '';

    eventos.forEach(function (evento) {
        trilhoEventos.appendChild(montarCardCarrossel(evento));
    });
}


renderizarCarrossel();
