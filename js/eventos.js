const CHAVE_EVENTOS = 'portalEventos_eventos';
const CHAVE_MEUS_EVENTOS = 'portalEventos_meusEventos';
const EVENTOS_INICIAIS = [
    {
        id: 'evt_001',
        categoria: 'futebol',
        nome: 'Vasco x Vitória',
        local: 'Maracanã',
        preco: 50.00,
        dataHora: '2026-09-10T16:00:00',
        descricao: 'Venha assistir Vasco x Vitória pela Copa Betano do Brasil!',
        comidaBebida: 'Praça de alimentação no estádio.',
        capacidadeVagas: 200,
        vagasOcupadas: 200,
        cancelado: false,
        criadoPorLogin: 'davich'
    },
    {
        id: 'evt_002',
        categoria: 'futebol',
        nome: 'Flamengo x Palmeiras',
        local: 'Maracanã',
        preco: 80.00,
        dataHora: '2026-09-27T18:30:00',
        descricao: 'Clássico pelo Brasileirão, com transmissão no telão.',
        comidaBebida: 'Praça de alimentação no estádio.',
        capacidadeVagas: 300,
        vagasOcupadas: 120,
        cancelado: false,
        criadoPorLogin: 'davich'
    },
    {
        id: 'evt_003',
        categoria: 'festa',
        nome: 'Festival SeJoga',
        local: 'Rio de Janeiro - Zona Portuária',
        preco: 120.00,
        dataHora: '2026-09-24T20:00:00',
        descricao: 'Um dia inteiro de música, food trucks e muita gente boa.',
        comidaBebida: 'Food trucks e bares no local.',
        capacidadeVagas: 500,
        vagasOcupadas: 310,
        cancelado: false,
        criadoPorLogin: 'davich'
    },
    {
        id: 'evt_004',
        categoria: 'e-sport',
        nome: 'Loud x NRG',
        local: 'Los Angeles Arena',
        preco: 100.00,
        dataHora: '2026-10-20T14:00:00',
        descricao: 'Venha assistir Loud x NRG pelo VCT Americas Stage 2!',
        comidaBebida: 'Lanchonete na arena.',
        capacidadeVagas: 150,
        vagasOcupadas: 40,
        cancelado: false,
        criadoPorLogin: 'davich'
    },
    {
        id: 'evt_005',
        categoria: 'festa',
        nome: 'Resenha do Arrocha',
        local: 'Rio de Janeiro - Lapa',
        preco: 100.00,
        dataHora: '2026-08-21T22:00:00',
        descricao: 'Venha aproveitar bons drinks, comidas, e muita música boa!',
        comidaBebida: 'Bar aberto durante todo o evento.',
        capacidadeVagas: 80,
        vagasOcupadas: 50,
        cancelado: false,
        criadoPorLogin: 'davich'
    }
];


function lerDoArmazenamento(chave, reserva) {
    const bruto = localStorage.getItem(chave);

    if (!bruto) {
        return reserva;
    }

    try {
        return JSON.parse(bruto);
    } catch (erro) {
        return reserva;
    }
}


function obterEventos() {
    const guardados = lerDoArmazenamento(CHAVE_EVENTOS, null);

    // Primeira visita: grava a lista inicial e devolve ela.
    if (guardados === null) {
        localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(EVENTOS_INICIAIS));
        return EVENTOS_INICIAIS;
    }

    return guardados;
}


function salvarEventos(lista) {
    localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(lista));
}


function calcularStatusEvento(evento) {
    const agora = new Date();
    const data = new Date(evento.dataHora);

    // 1º) já passou? Nada mais importa.
    if (data < agora) {
        return { chave: 'realizado', rotulo: 'Já realizado', classe: 'selo-realizado' };
    }

    if (evento.cancelado) {
        return { chave: 'cancelado', rotulo: 'Cancelado', classe: 'selo-esgotado' };
    }

    if (evento.vagasOcupadas >= evento.capacidadeVagas) {
        return { chave: 'esgotado', rotulo: 'Esgotado', classe: 'selo-esgotado' };
    }

    // Subtrair duas datas devolve a diferença em MILISSEGUNDOS.
    // Dividindo por 1000, 60 e 60 chegamos às horas.
    const horasQueFaltam = (data - agora) / 1000 / 60 / 60;

    if (horasQueFaltam <= 48) {
        return { chave: 'perto', rotulo: 'Perto do início', classe: 'selo-perto' };
    }

    return { chave: 'disponivel', rotulo: 'Disponível', classe: 'selo-disponivel' };
}


function eventoAberto(evento) {
    const status = calcularStatusEvento(evento).chave;
    return status === 'disponivel' || status === 'perto';
}



function formatarData(iso) {
    const d = new Date(iso);


    const dia = String(d.getDate()).padStart(2, '0');

    
    const mes = String(d.getMonth() + 1).padStart(2, '0');

    return dia + '/' + mes + '/' + d.getFullYear();
}


function formatarPreco(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}


function mesmoDia(iso, ano, mes, dia) {
    const d = new Date(iso);
    return d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === dia;
}



function loginAtual() {
    const sessao = obterSessao();   // vem do auth.js, carregado antes
    return sessao ? sessao.login : null;
}


function obterMeusEventos() {
    const login = loginAtual();

    if (!login) {
        return [];
    }

    const todos = lerDoArmazenamento(CHAVE_MEUS_EVENTOS, {});
    return todos[login] || [];
}


function alternarMeuEvento(idEvento) {
    const login = loginAtual();

    if (!login) {
        return false;
    }

    const todos = lerDoArmazenamento(CHAVE_MEUS_EVENTOS, {});
    const minha = todos[login] || [];

  
    const posicao = minha.indexOf(idEvento);

    if (posicao === -1) {
        minha.push(idEvento);
    } else {
        
        minha.splice(posicao, 1);
    }

    todos[login] = minha;
    localStorage.setItem(CHAVE_MEUS_EVENTOS, JSON.stringify(todos));

    return posicao === -1;
}
