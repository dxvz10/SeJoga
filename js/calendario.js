/* =============================================================
   SEJOGA — PÁGINA DO CALENDÁRIO

   1. A GRADE DE DIAS, desenhada a partir de uma data.
   2. Os 6 PRÓXIMOS EVENTOS em destaque, com o botão de agenda.

   A busca "Todos os eventos" vem do busca-eventos.js, e só
   aparece para quem está logado. O calendário em si é público.
   ============================================================= */

const tituloMes = document.querySelector('#mes-ano');
const gradeDias = document.querySelector('#grade-dias');
const listaDestaques = document.querySelector('#cards-eventos');

const QUANTIDADE_DESTAQUES = 6;

const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/* O mês que está na tela. Começa no mês de hoje. */
const hoje = new Date();
let anoAtual = hoje.getFullYear();
let mesAtual = hoje.getMonth();       // 0 = janeiro ... 11 = dezembro


/* =============================================================
   A GRADE DE DIAS
   ============================================================= */

function desenharMes() {
    const eventos = obterEventos();
    const meus = obterMeusEventos();

    tituloMes.textContent = NOMES_MESES[mesAtual] + ' ' + anoAtual;
    gradeDias.textContent = '';

    /* getDay() do dia 1º = dia da semana (0 = domingo). É quantas
       casas vazias entram antes do dia 1. */
    const casasVazias = new Date(anoAtual, mesAtual, 1).getDay();

    /* O dia 0 do mês SEGUINTE é o último dia deste mês. Resolve
       fevereiro e ano bissexto sem nenhum if. */
    const totalDeDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

    for (let i = 0; i < casasVazias; i++) {
        gradeDias.appendChild(criarElemento('div', 'dia vazio'));
    }

    for (let dia = 1; dia <= totalDeDias; dia++) {
        const celula = criarElemento('div', 'dia');
        celula.appendChild(criarElemento('span', 'numero-dia', dia));

        // filter devolve só os eventos que caem neste dia.
        const doDia = eventos.filter(function (evento) {
            return mesmoDia(evento.dataHora, anoAtual, mesAtual, dia);
        });

        if (doDia.length > 0) {
            celula.classList.add('evento');
        }

        doDia.forEach(function (evento) {
            const etiqueta = criarElemento('small', 'etiqueta-evento', evento.nome);
            etiqueta.title = evento.nome + ' — ' + evento.local + ' — ' + formatarHora(evento.dataHora);

            if (meus.indexOf(evento.id) !== -1) {
                etiqueta.classList.add('meu-evento');
            }

            celula.appendChild(etiqueta);
        });

        if (mesmoDia(hoje.toISOString(), anoAtual, mesAtual, dia)) {
            celula.classList.add('hoje');
        }

        gradeDias.appendChild(celula);
    }
}


function mudarMes(passo) {
    mesAtual = mesAtual + passo;

    // Dezembro + 1 = 12, que não existe: vira janeiro do ano seguinte.
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


document.querySelector('#mes-anterior').addEventListener('click', function () {
    mudarMes(-1);
});

document.querySelector('#mes-seguinte').addEventListener('click', function () {
    mudarMes(1);
});


/* =============================================================
   DESTAQUES — os 6 próximos eventos em que ainda dá para entrar
   ============================================================= */

function desenharDestaques() {
    listaDestaques.textContent = '';

    proximosEventosAbertos(QUANTIDADE_DESTAQUES).forEach(function (evento) {
        listaDestaques.appendChild(montarCardEvento(evento));
    });
}


/* O cards-evento.js avisa quando a agenda muda. A grade precisa
   repintar as etiquetas dos "meus eventos". */
document.addEventListener('agenda-mudou', desenharMes);


desenharMes();
desenharDestaques();
