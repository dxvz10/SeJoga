/* =============================================================
   SEJOGA — PÁGINA DO CALENDÁRIO

   Duas coisas acontecem aqui:

   1. A GRADE DE DIAS é desenhada por JavaScript a partir de uma
      data. Antes ela estava escrita à mão no HTML, então só
      existia setembro de 2026 e as setas não faziam nada.

   2. Os CARDS de "Eventos em destaque" saem da mesma lista do
      js/eventos.js que a home usa, com um botão para o usuário
      guardar o evento na própria agenda.
   ============================================================= */

const tituloMes = document.querySelector('#mes-ano');
const gradeDias = document.querySelector('#grade-dias');
const listaCards = document.querySelector('#cards-eventos');
const setaMesAnterior = document.querySelector('#mes-anterior');
const setaMesSeguinte = document.querySelector('#mes-seguinte');

const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/* O mês que está na tela. Começa no mês de hoje. */
const hoje = new Date();
let anoAtual = hoje.getFullYear();
let mesAtual = hoje.getMonth();       // 0 = janeiro, 11 = dezembro


function novoElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}


/* =============================================================
   A GRADE DE DIAS
   ============================================================= */

function desenharMes() {
    const eventos = obterEventos();
    const meus = obterMeusEventos();

    tituloMes.textContent = NOMES_MESES[mesAtual] + ' ' + anoAtual;
    gradeDias.textContent = '';

    /* new Date(ano, mes, 1) é o dia 1º do mês.
       getDay() devolve o dia da SEMANA: 0 = domingo ... 6 = sábado.
       Esse número diz quantas casas vazias entram antes do dia 1. */
    const diaDaSemanaDoPrimeiro = new Date(anoAtual, mesAtual, 1).getDay();

    /* Truque clássico: o dia 0 do mês SEGUINTE é o último dia
       deste mês. Resolve fevereiro e ano bissexto de graça. */
    const totalDeDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

    for (let i = 0; i < diaDaSemanaDoPrimeiro; i++) {
        gradeDias.appendChild(novoElemento('div', 'dia vazio'));
    }

    for (let dia = 1; dia <= totalDeDias; dia++) {
        const celula = novoElemento('div', 'dia');
        celula.appendChild(novoElemento('span', 'numero-dia', dia));

        /* filter percorre a lista e devolve só os itens que passam
           no teste — aqui, os eventos que caem neste dia. */
        const doDia = eventos.filter(function (evento) {
            return mesmoDia(evento.dataHora, anoAtual, mesAtual, dia);
        });

        if (doDia.length > 0) {
            celula.classList.add('evento');
        }

        doDia.forEach(function (evento) {
            const etiqueta = novoElemento('small', 'etiqueta-evento', evento.nome);
            etiqueta.title = evento.nome + ' — ' + evento.local;

            // indexOf !== -1 significa "está na lista".
            if (meus.indexOf(evento.id) !== -1) {
                etiqueta.classList.add('meu-evento');
            }

            celula.appendChild(etiqueta);
        });

        // Marca o dia de hoje.
        if (mesmoDia(hoje.toISOString(), anoAtual, mesAtual, dia)) {
            celula.classList.add('hoje');
        }

        gradeDias.appendChild(celula);
    }
}


function mudarMes(passo) {
    mesAtual = mesAtual + passo;

    /* Dezembro + 1 vira 12, que não existe: volta para 0 e soma
       um ano. O mesmo ao contrário em janeiro - 1. */
    if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual = anoAtual + 1;
    }

    if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual = anoAtual - 1;
    }

    desenharMes();
}


setaMesAnterior.addEventListener('click', function () {
    mudarMes(-1);
});

setaMesSeguinte.addEventListener('click', function () {
    mudarMes(1);
});


/* =============================================================
   OS CARDS E O BOTÃO "ADICIONAR AO CALENDÁRIO"
   ============================================================= */

function montarCard(evento) {
    const status = calcularStatusEvento(evento);
    const meus = obterMeusEventos();
    const jaEstaNaAgenda = meus.indexOf(evento.id) !== -1;

    const card = novoElemento('article', 'card');

    card.appendChild(novoElemento('span', 'categoria', evento.categoria));
    card.appendChild(novoElemento('h3', null, evento.nome));
    card.appendChild(novoElemento('p', 'local', '📍 ' + evento.local));
    card.appendChild(novoElemento('p', 'data', '📅 ' + formatarData(evento.dataHora)));

    const rodape = novoElemento('div', 'rodape-card');
    rodape.appendChild(novoElemento('span', 'preco', formatarPreco(evento.preco)));
    rodape.appendChild(novoElemento('span', status.classe, status.rotulo));
    card.appendChild(rodape);

    /* O botão só existe em evento que ainda dá para entrar.
       Num evento esgotado ou já realizado ele não faz sentido. */
    if (eventoAberto(evento)) {
        const botao = novoElemento('button', 'botao-agenda');
        botao.type = 'button';
        botao.dataset.id = evento.id;          // guarda o id no próprio elemento
        aplicarTextoDoBotao(botao, jaEstaNaAgenda);
        card.appendChild(botao);
    }

    return card;
}


function aplicarTextoDoBotao(botao, naAgenda) {
    botao.textContent = naAgenda ? '✓ No meu calendário' : '+ Adicionar ao calendário';
    botao.classList.toggle('na-agenda', naAgenda);
}


function renderizarCards() {
    const eventos = obterEventos();
    listaCards.textContent = '';

    eventos.forEach(function (evento) {
        listaCards.appendChild(montarCard(evento));
    });
}


/* Um listener só, na lista inteira, em vez de um por botão.
   Isso se chama DELEGAÇÃO: o clique num botão "sobe" até a lista,
   e aqui a gente descobre de qual botão veio. A vantagem é que
   funciona também para cards criados depois. */
listaCards.addEventListener('click', function (evento) {
    const botao = evento.target.closest('.botao-agenda');

    if (!botao) {
        return;
    }

    // Sem sessão não há agenda de quem. Mostra o mesmo convite do menu.
    if (!usuarioLogado()) {
        modalConta.classList.add('aberto');
        return;
    }

    const ficouNaAgenda = alternarMeuEvento(botao.dataset.id);
    aplicarTextoDoBotao(botao, ficouNaAgenda);

    // A grade e a lista de busca precisam refletir a mudança.
    desenharMes();
    aplicarFiltros();
});


/* =============================================================
   INICIALIZAÇÃO
   ============================================================= */

desenharMes();
renderizarCards();


/* =============================================================
   TODOS OS EVENTOS — busca e filtros

   A regra de filtragem em si mora no eventos.js (filtrarEventos).
   Aqui só lemos o que está na tela, chamamos a função e
   desenhamos o resultado.
   ============================================================= */

const campoBusca = document.querySelector('#busca');
const resultados = document.querySelector('#resultados-busca');
const contador = document.querySelector('#contador');
const precoMin = document.querySelector('#preco-min');
const precoMax = document.querySelector('#preco-max');
const botaoLimpar = document.querySelector('#limpar-filtros');
const caixaRegioes = document.querySelector('#filtro-regioes');

let esperandoDigitar;


/* As regiões não estão escritas no HTML: saem dos próprios
   eventos. Quando o cadastro criar um evento numa região nova,
   o filtro aparece sozinho. */
function montarFiltroDeRegioes() {
    listarRegioes().forEach(function (regiao) {
        const rotulo = document.createElement('label');

        const caixa = document.createElement('input');
        caixa.type = 'checkbox';
        caixa.name = 'regiao';
        caixa.value = regiao;

        rotulo.appendChild(caixa);
        rotulo.appendChild(document.createTextNode(' ' + regiao));
        caixaRegioes.appendChild(rotulo);
    });
}


/* Lê as caixas marcadas de um grupo e devolve os valores.
   O seletor :checked pega só as marcadas. */
function marcados(nome) {
    const caixas = document.querySelectorAll('input[name="' + nome + '"]:checked');
    const valores = [];

    caixas.forEach(function (caixa) {
        valores.push(caixa.value);
    });

    return valores;
}


/* Campo de número vazio devolve "". Number('') daria 0, o que
   filtraria errado — por isso devolvemos null quando vazio. */
function numeroOuNulo(campo) {
    const texto = campo.value.trim();

    if (texto === '') {
        return null;
    }

    return Number(texto);
}


function aplicarFiltros() {
    const criterios = {
        texto: campoBusca.value,
        status: marcados('status'),
        categorias: marcados('categoria'),
        regioes: marcados('regiao'),
        precoMin: numeroOuNulo(precoMin),
        precoMax: numeroOuNulo(precoMax)
    };

    const encontrados = filtrarEventos(obterEventos(), criterios);

    resultados.textContent = '';

    if (encontrados.length === 0) {
        const aviso = novoElemento('p', 'sem-resultado',
            'Nenhum evento encontrado. Tente mudar a busca ou limpar os filtros.');
        resultados.appendChild(aviso);
    } else {
        encontrados.forEach(function (evento) {
            resultados.appendChild(montarCard(evento));
        });
    }

    // Concordância: "1 evento" e não "1 eventos".
    const plural = encontrados.length === 1 ? ' evento encontrado' : ' eventos encontrados';
    contador.textContent = encontrados.length + plural;
}


/* O evento 'input' dispara a cada tecla. Recalcular em todas
   seria desperdício, então esperamos 250ms de teclado parado —
   a mesma técnica de debounce usada no carrossel. */
campoBusca.addEventListener('input', function () {
    clearTimeout(esperandoDigitar);
    esperandoDigitar = setTimeout(aplicarFiltros, 250);
});

/* Nas caixas e nos números, um listener só no painel inteiro
   (delegação) cobre todos os controles de uma vez. */
document.querySelector('.painel-filtros').addEventListener('change', aplicarFiltros);
precoMin.addEventListener('input', aplicarFiltros);
precoMax.addEventListener('input', aplicarFiltros);

botaoLimpar.addEventListener('click', function () {
    campoBusca.value = '';
    precoMin.value = '';
    precoMax.value = '';

    document.querySelectorAll('.painel-filtros input[type="checkbox"]').forEach(function (caixa) {
        caixa.checked = false;
    });

    aplicarFiltros();
});


/* O botão "adicionar ao calendário" também existe nos cards da
   busca, então a lista de resultados precisa do mesmo tratamento
   que a de destaques. */
resultados.addEventListener('click', function (evento) {
    const botao = evento.target.closest('.botao-agenda');

    if (!botao) {
        return;
    }

    if (!usuarioLogado()) {
        modalConta.classList.add('aberto');
        return;
    }

    const ficouNaAgenda = alternarMeuEvento(botao.dataset.id);
    aplicarTextoDoBotao(botao, ficouNaAgenda);

    desenharMes();
    renderizarCards();
});


montarFiltroDeRegioes();
aplicarFiltros();
