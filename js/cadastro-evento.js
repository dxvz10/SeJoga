/* =============================================================
   SEJOGA — CADASTRO DE EVENTO

   Liga o formulário da cadastro-evento.html:
     1. valida cada campo (mensagem embaixo de cada um);
     2. monta o evento no formato que todas as páginas esperam;
     3. salva na lista de eventos do localStorage;
     4. leva para a página Eventos, já mostrando o evento novo.

   Reaproveita do campos-conta.js: valorDe, validarCampo,
   validarTodos e ligarValidacaoAoVivo.
   Reaproveita do eventos.js: obterEventos, salvarEventos e loginAtual.
   ============================================================= */


// ACHAR: o formulário e o parágrafo do aviso geral.
const formEvento = document.querySelector('#form-evento');
const avisoEvento = document.querySelector('#aviso-evento');


/* REGRAS: um "mapa" campo → regra → mensagem, no MESMO formato do
   campos-conta.js. Por isso as funções prontas de lá conseguem
   ler esta lista sem mudar nada.
   Cada "testar" recebe o valor do campo (sempre texto) e devolve
   true (passou) ou false (tem erro). */
const REGRAS_EVENTO = {
    'nome-evento': {
        testar: function (valor) {
            // trim() tira os espaços das pontas: "   " não vale como nome.
            const tamanho = valor.trim().length;
            return tamanho >= 5 && tamanho <= 60;
        },
        mensagem: 'O nome precisa ter de 5 a 60 caracteres.'
    },
    'categoria': {
        // A primeira opção ("Escolha uma categoria") tem value="".
        testar: function (valor) {
            return valor !== '';
        },
        mensagem: 'Escolha uma categoria.'
    },
    'descricao': {
        testar: function (valor) {
            const tamanho = valor.trim().length;
            return tamanho >= 20 && tamanho <= 500;
        },
        mensagem: 'Conte um pouco mais: de 20 a 500 caracteres.'
    },

    // ----- Quando e onde -----
    'data-evento': {
        testar: function (valor) {
            return valor !== '';
        },
        mensagem: 'Escolha a data.'
    },
    'hora-evento': {
        testar: function (valor) {
            if (valor === '') {
                return false;
            }
            const data = valorDe('data-evento');
            if (data === '') {
                return true;   // sem data ainda: quem reclama é a regra da data
            }
            // Junta as duas partes no formato ISO ('2026-12-30T23:55')
            // e compara com AGORA (new Date() sem nada dentro = agora).
            const quando = new Date(data + 'T' + valor);
            return quando > new Date();
        },
        mensagem: 'O evento precisa ser numa data e hora futuras.'
    },
    'local': {
        testar: function (valor) {
            const tamanho = valor.trim().length;
            return tamanho >= 3 && tamanho <= 80;
        },
        mensagem: 'Informe o local (de 3 a 80 caracteres).'
    },
    'regiao': {
        testar: function (valor) {
            return valor !== '';
        },
        mensagem: 'Escolha a região.'
    },

    // ----- Ingressos -----
    'preco': {
        testar: function (valor) {
            // Vazio NÃO pode passar: Number('') daria 0 = "Gratuito".
            if (valor === '') {
                return false;
            }
            const numero = Number(valor);
            // isNaN = "is Not a Number" (não é um número?)
            return !isNaN(numero) && numero >= 0;
        },
        mensagem: 'Informe o preço (0 para gratuito).'
    },
    'capacidade': {
        testar: function (valor) {
            if (valor === '') {
                return false;
            }
            const numero = Number(valor);
            // isInteger: 20 passa, 2.5 não (não existe meia vaga).
            return Number.isInteger(numero) && numero >= 1;
        },
        mensagem: 'Informe quantas vagas (número inteiro, 1 ou mais).'
    },
    'comida-bebida': {
        // Opcional: vazio passa; preenchido, no máximo 200 caracteres.
        testar: function (valor) {
            return valor.trim().length <= 200;
        },
        mensagem: 'No máximo 200 caracteres.'
    }
};


// Valida ao SAIR de cada campo e, depois de um erro, a cada tecla
// (para a mensagem sumir assim que a pessoa corrigir).
ligarValidacaoAoVivo(REGRAS_EVENTO);


// A regra da hora depende da DATA. Se a pessoa trocar a data,
// conferimos a hora de novo, senão o erro dela ficaria "preso".
document.getElementById('data-evento').addEventListener('change', function () {
    if (valorDe('hora-evento') !== '') {
        validarCampo('hora-evento', REGRAS_EVENTO);
    }
});


function mostrarAvisoEvento(texto) {
    avisoEvento.textContent = texto;
    avisoEvento.className = 'aviso-form visivel erro';
}

function limparAvisoEvento() {
    avisoEvento.textContent = '';
    avisoEvento.className = 'aviso-form';
}


// ESCUTAR o envio e REAGIR.
formEvento.addEventListener('submit', function (envio) {
    // Sem isto, o navegador recarregaria a página e perderia tudo.
    envio.preventDefault();

    // validarTodos confere TODOS os campos (mostra todas as mensagens
    // de uma vez) e devolve o id do primeiro com erro, ou null.
    const primeiroErro = validarTodos(REGRAS_EVENTO);

    if (primeiroErro) {
        mostrarAvisoEvento('Confira os campos marcados em vermelho.');
        document.getElementById(primeiroErro).focus();   // leva o cursor até ele
        return;   // PARA aqui: nada abaixo roda com dados errados
    }

    limparAvisoEvento();

    // MONTAR o evento no formato que TODAS as páginas esperam
    // (o mesmo dos eventos de exemplo do eventos.js).
    // O status ("Disponível", "Esgotado"...) NÃO é salvo: ele muda com
    // o tempo, então é calculado na hora de mostrar.
    const novoEvento = {
        id: 'evt_' + Date.now(),          // número único: milissegundos desde 1970
        categoria: valorDe('categoria'),
        nome: valorDe('nome-evento'),
        local: valorDe('local'),
        regiao: valorDe('regiao'),
        preco: Number(valorDe('preco')),  // texto → número
        dataHora: valorDe('data-evento') + 'T' + valorDe('hora-evento') + ':00',
        descricao: valorDe('descricao'),
        comidaBebida: valorDe('comida-bebida'),
        capacidadeVagas: Number(valorDe('capacidade')),
        vagasOcupadas: 0,                 // evento novo começa sem ninguém
        cancelado: false,
        criadoPorLogin: loginAtual()      // quem está logado
    };

    // SALVAR: pega a lista atual, põe o novo no fim, grava a lista INTEIRA.
    const lista = obterEventos();
    lista.push(novoEvento);
    salvarEventos(lista);

    // MOSTRAR: abre a página Eventos já buscando pelo nome do evento novo.
    window.location.href = 'eventos.html?busca=' + encodeURIComponent(novoEvento.nome);
});