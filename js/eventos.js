/* =============================================================
   SEJOGA — FONTE ÚNICA DOS EVENTOS

   A lista de eventos mora num lugar só (o localStorage). A home,
   o calendário, a página Eventos, o perfil e as notificações
   leem daqui — nenhuma página tem eventos escritos à mão.

   Este arquivo NÃO mexe na tela: só guarda, calcula e filtra.
   ============================================================= */


/* -------------------------------------------------------------
   LISTA INICIAL (semente)

   Gravada no localStorage na primeira visita. Depois disso, o
   que vale é o que está guardado — para não apagar eventos
   criados pela página de cadastro de evento.

   VERSAO_SEMENTE: quando esta lista muda (evento novo, campo
   novo), aumentamos o número. Quem já tinha a versão antiga
   guardada recebe as mudanças sem perder os eventos criados.
   ------------------------------------------------------------- */

const VERSAO_SEMENTE = 2;

const EVENTOS_INICIAIS = [
    {
        id: 'evt_001', categoria: 'futebol', nome: 'Vasco x Vitória',
        local: 'Maracanã', regiao: 'Rio de Janeiro - Zona Norte',
        preco: 50, dataHora: '2026-09-10T16:00:00',
        descricao: 'Venha assistir Vasco x Vitória pela Copa Betano do Brasil!',
        comidaBebida: 'Praça de alimentação no estádio.',
        capacidadeVagas: 200, vagasOcupadas: 200, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_002', categoria: 'futebol', nome: 'Flamengo x Palmeiras',
        local: 'Maracanã', regiao: 'Rio de Janeiro - Zona Norte',
        preco: 80, dataHora: '2026-09-27T18:30:00',
        descricao: 'Clássico pelo Brasileirão, com transmissão no telão.',
        comidaBebida: 'Praça de alimentação no estádio.',
        capacidadeVagas: 300, vagasOcupadas: 120, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_003', categoria: 'festa', nome: 'Festival SeJoga',
        local: 'Rio de Janeiro - Zona Portuária', regiao: 'Rio de Janeiro - Centro',
        preco: 120, dataHora: '2026-09-24T20:00:00',
        descricao: 'Um dia inteiro de música, food trucks e muita gente boa.',
        comidaBebida: 'Food trucks e bares no local.',
        capacidadeVagas: 500, vagasOcupadas: 310, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_004', categoria: 'e-sport', nome: 'Loud x NRG',
        local: 'Los Angeles Arena', regiao: 'Internacional',
        preco: 100, dataHora: '2026-10-20T14:00:00',
        descricao: 'Venha assistir Loud x NRG pelo VCT Americas Stage 2!',
        comidaBebida: 'Lanchonete na arena.',
        capacidadeVagas: 150, vagasOcupadas: 40, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_005', categoria: 'festa', nome: 'Resenha do Arrocha',
        local: 'Rio de Janeiro - Lapa', regiao: 'Rio de Janeiro - Centro',
        preco: 100, dataHora: '2026-08-21T22:00:00',
        descricao: 'Venha aproveitar bons drinks, comidas, e muita música boa!',
        comidaBebida: 'Bar aberto durante todo o evento.',
        capacidadeVagas: 80, vagasOcupadas: 50, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_006', categoria: 'basquete', nome: 'Flamengo x Franca — NBB',
        local: 'Maracanãzinho', regiao: 'Rio de Janeiro - Zona Norte',
        preco: 40, dataHora: '2026-10-04T19:00:00',
        descricao: 'Abertura do NBB com o clássico do basquete brasileiro.',
        comidaBebida: 'Lanchonete no ginásio.',
        capacidadeVagas: 400, vagasOcupadas: 150, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_007', categoria: 'fantasia', nome: 'Encontro Geek na Tijuca',
        local: 'Praça Saens Peña', regiao: 'Rio de Janeiro - Zona Norte',
        preco: 0, dataHora: '2026-09-26T14:00:00',
        descricao: 'Cosplay, troca de quadrinhos e concurso de fantasia. Entrada gratuita.',
        comidaBebida: 'Barracas de lanche na praça.',
        capacidadeVagas: 60, vagasOcupadas: 22, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_008', categoria: 'festa', nome: 'Samba na Pedra do Sal',
        local: 'Pedra do Sal, Saúde', regiao: 'Rio de Janeiro - Centro',
        preco: 20, dataHora: '2026-10-10T19:00:00',
        descricao: 'Roda de samba tradicional ao ar livre, no berço do samba carioca.',
        comidaBebida: 'Ambulantes e bares no entorno.',
        capacidadeVagas: 250, vagasOcupadas: 90, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_009', categoria: 'e-sport', nome: 'Final do CBLOL — Watch Party',
        local: 'Barra Shopping', regiao: 'Rio de Janeiro - Zona Oeste',
        preco: 30, dataHora: '2026-10-17T16:00:00',
        descricao: 'Telão, sorteios e torcida organizada para a grande final.',
        comidaBebida: 'Praça de alimentação do shopping.',
        capacidadeVagas: 180, vagasOcupadas: 70, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_010', categoria: 'basquete', nome: 'Racha 3x3 na Praia',
        local: 'Posto 5, Copacabana', regiao: 'Rio de Janeiro - Zona Sul',
        preco: 15, dataHora: '2026-10-11T09:00:00',
        descricao: 'Torneio 3x3 aberto, com times montados na hora.',
        comidaBebida: 'Água e isotônico no local.',
        capacidadeVagas: 48, vagasOcupadas: 20, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_011', categoria: 'futebol', nome: 'Pelada de Sábado no Aterro',
        local: 'Aterro do Flamengo', regiao: 'Rio de Janeiro - Zona Sul',
        preco: 10, dataHora: '2026-09-26T08:00:00',
        descricao: 'Racha amistoso 5x5. Leva colete quem tiver.',
        comidaBebida: 'Água disponível.',
        capacidadeVagas: 20, vagasOcupadas: 20, cancelado: false, criadoPorLogin: 'sejoga'
    },
    {
        id: 'evt_012', categoria: 'fantasia', nome: 'Noite de RPG de Mesa',
        local: 'Botafogo', regiao: 'Rio de Janeiro - Zona Sul',
        preco: 25, dataHora: '2026-11-07T18:00:00',
        descricao: 'Mesas para iniciantes e veteranos, com mestres convidados.',
        comidaBebida: 'Petiscos e bebidas à venda.',
        capacidadeVagas: 36, vagasOcupadas: 12, cancelado: false, criadoPorLogin: 'sejoga'
    }
];


/* -------------------------------------------------------------
   LER E GRAVAR
   ------------------------------------------------------------- */

function obterEventos() {
    const guardados = lerDoArmazenamento(CHAVES.eventos, null);
    const versao = lerDoArmazenamento(CHAVES.versaoSemente, 1);

    // Primeira visita: grava a lista inicial.
    if (!Array.isArray(guardados)) {
        salvarEventos(EVENTOS_INICIAIS);
        gravarNoArmazenamento(CHAVES.versaoSemente, VERSAO_SEMENTE);
        return EVENTOS_INICIAIS.slice();
    }

    // Versão antiga guardada: atualiza sem perder nada.
    if (versao < VERSAO_SEMENTE) {
        const atualizada = mesclarSemente(guardados);
        salvarEventos(atualizada);
        gravarNoArmazenamento(CHAVES.versaoSemente, VERSAO_SEMENTE);
        return atualizada;
    }

    return guardados;
}


/* Os eventos da semente substituem a cópia antiga de mesmo id;
   os criados por usuários (ids que não estão na semente) ficam
   intactos. */
function mesclarSemente(guardados) {
    const idsDaSemente = EVENTOS_INICIAIS.map(function (evento) {
        return evento.id;
    });

    const criadosPorUsuarios = guardados.filter(function (evento) {
        return idsDaSemente.indexOf(evento.id) === -1;
    });

    return EVENTOS_INICIAIS.concat(criadosPorUsuarios);
}


function salvarEventos(lista) {
    gravarNoArmazenamento(CHAVES.eventos, lista);
}


function buscarEvento(id) {
    return obterEventos().find(function (evento) {
        return evento.id === id;
    });
}


/* Do mais próximo para o mais distante. sort() recebe uma função
   que compara dois itens: negativo = "a" vem antes. */
function ordenarPorData(lista) {
    return lista.slice().sort(function (a, b) {
        return new Date(a.dataHora) - new Date(b.dataHora);
    });
}


/* Para listas de busca: primeiro o que ainda vai acontecer (do
   mais próximo ao mais distante), e só depois os que já passaram
   (do mais recente ao mais antigo). Ninguém procura evento
   encerrado primeiro. */
function ordenarParaExibir(lista) {
    const agora = new Date();

    const futuros = lista.filter(function (evento) {
        return new Date(evento.dataHora) >= agora;
    });

    const passados = lista.filter(function (evento) {
        return new Date(evento.dataHora) < agora;
    });

    return ordenarPorData(futuros).concat(ordenarPorData(passados).reverse());
}


/* -------------------------------------------------------------
   STATUS — calculado, nunca guardado

   Se a cor fosse salva junto com o evento, ela envelheceria: um
   evento marcado "Disponível" continuaria verde depois de
   acontecer. Calculando na hora de exibir, isso não acontece.
   ------------------------------------------------------------- */

function calcularStatusEvento(evento) {
    const agora = new Date();
    const data = new Date(evento.dataHora);

    if (data < agora) {
        return { chave: 'realizado', rotulo: 'Já realizado', classe: 'selo-realizado' };
    }

    if (evento.cancelado) {
        return { chave: 'cancelado', rotulo: 'Cancelado', classe: 'selo-esgotado' };
    }

    if (evento.vagasOcupadas >= evento.capacidadeVagas) {
        return { chave: 'esgotado', rotulo: 'Esgotado', classe: 'selo-esgotado' };
    }

    // Subtrair duas datas dá a diferença em MILISSEGUNDOS.
    const horasQueFaltam = (data - agora) / 1000 / 60 / 60;

    if (horasQueFaltam <= 48) {
        return { chave: 'perto', rotulo: 'Perto do início', classe: 'selo-perto' };
    }

    return { chave: 'disponivel', rotulo: 'Disponível', classe: 'selo-disponivel' };
}


/* Só dá para entrar num evento que não passou e ainda tem vaga. */
function eventoAberto(evento) {
    const status = calcularStatusEvento(evento).chave;
    return status === 'disponivel' || status === 'perto';
}


/* Os N próximos eventos em que ainda dá para entrar. */
function proximosEventosAbertos(quantidade) {
    const abertos = obterEventos().filter(eventoAberto);
    return ordenarPorData(abertos).slice(0, quantidade);
}


/* -------------------------------------------------------------
   FORMATAÇÃO
   ------------------------------------------------------------- */

const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatarData(iso) {
    const d = new Date(iso);

    // padStart(2, '0'): 5 vira "05".
    const dia = String(d.getDate()).padStart(2, '0');

    // getMonth() conta de 0 (janeiro) a 11 (dezembro). Por isso o + 1.
    const mes = String(d.getMonth() + 1).padStart(2, '0');

    return dia + '/' + mes + '/' + d.getFullYear();
}


function formatarHora(iso) {
    const d = new Date(iso);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}


/* "Qui, 24/09 · 20:00" */
function formatarDataCurta(iso) {
    const d = new Date(iso);
    return DIAS_DA_SEMANA[d.getDay()] + ', ' + formatarData(iso).slice(0, 5) + ' · ' + formatarHora(iso);
}


/* Preço zero vira "Gratuito" em vez de "R$ 0,00". */
function formatarPreco(valor) {
    if (valor === 0) {
        return 'Gratuito';
    }
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}


/* "hoje", "amanhã", "em 3 dias" — compara só as DATAS, sem a
   hora: um evento às 22h de amanhã é "amanhã", mesmo que falte
   menos de 24 horas. */
function descreverQuando(iso) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dia = new Date(iso);
    dia.setHours(0, 0, 0, 0);

    const diferenca = Math.round((dia - hoje) / (1000 * 60 * 60 * 24));

    if (diferenca === 0) return 'hoje';
    if (diferenca === 1) return 'amanhã';
    return 'em ' + diferenca + ' dias';
}


function mesmoDia(iso, ano, mes, dia) {
    const d = new Date(iso);
    return d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === dia;
}


const NOMES_CATEGORIAS = {
    'futebol': 'Futebol',
    'basquete': 'Basquete',
    'fantasia': 'Fantasia',
    'e-sport': 'E-sports',
    'festa': 'Festa'
};


/* -------------------------------------------------------------
   "MINHA AGENDA" — os eventos que cada usuário guardou

   Uma lista por login:
       { "davich": ["evt_002", "evt_007"], "maria": [...] }
   Dois usuários no mesmo navegador não misturam as agendas.
   ------------------------------------------------------------- */

function loginAtual() {
    const sessao = obterSessao();   // vem do auth.js
    return sessao ? sessao.login : null;
}


function obterMeusEventos() {
    const login = loginAtual();

    if (!login) {
        return [];
    }

    const todos = lerDoArmazenamento(CHAVES.meusEventos, {});
    return todos[login] || [];
}


/* Adiciona se não estiver, remove se estiver.
   Devolve true quando o evento FICOU na agenda. */
function alternarMeuEvento(idEvento) {
    const login = loginAtual();

    if (!login) {
        return false;
    }

    const todos = lerDoArmazenamento(CHAVES.meusEventos, {});
    const minha = todos[login] || [];
    const posicao = minha.indexOf(idEvento);

    if (posicao === -1) {
        minha.push(idEvento);
    } else {
        minha.splice(posicao, 1);    // remove 1 item naquela posição
    }

    todos[login] = minha;
    gravarNoArmazenamento(CHAVES.meusEventos, todos);

    return posicao === -1;
}


/* Os eventos da agenda como objetos completos, por data. */
function eventosDaMinhaAgenda() {
    const ids = obterMeusEventos();

    const eventos = obterEventos().filter(function (evento) {
        return ids.indexOf(evento.id) !== -1;
    });

    return ordenarPorData(eventos);
}


/* Os eventos da agenda que acontecem entre AGORA e daqui a N
   dias. É o que alimenta o sininho e o resumo pós-login. */
function agendaDosProximosDias(dias) {
    const agora = new Date();
    const limite = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000);

    return eventosDaMinhaAgenda().filter(function (evento) {
        const data = new Date(evento.dataHora);
        return data >= agora && data <= limite;
    });
}


/* -------------------------------------------------------------
   FILTRAR — função PURA

   Recebe a lista e os critérios, devolve uma lista nova. Não toca
   na tela e não guarda nada: serve para o calendário, para a
   página Eventos, para onde precisar.
   ------------------------------------------------------------- */

/* Minúsculo e sem acento, para "maracana" achar "Maracanã".
   normalize('NFD') separa a letra do acento; o replace apaga os
   acentos soltos. */
function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
}


function filtrarEventos(lista, criterios) {
    const termo = normalizar(criterios.texto || '');

    return lista.filter(function (evento) {

        if (termo !== '') {
            const alvo = normalizar(evento.nome + ' ' + evento.local + ' ' + evento.descricao);
            if (alvo.indexOf(termo) === -1) {
                return false;
            }
        }

        // Lista vazia = "não filtrar por isso".
        if (criterios.status && criterios.status.length > 0) {
            const chave = calcularStatusEvento(evento).chave;
            // Cancelado e esgotado usam o mesmo selo vermelho.
            const equivalente = (chave === 'cancelado') ? 'esgotado' : chave;

            if (criterios.status.indexOf(equivalente) === -1) {
                return false;
            }
        }

        if (criterios.categorias && criterios.categorias.length > 0) {
            if (criterios.categorias.indexOf(evento.categoria) === -1) {
                return false;
            }
        }

        if (criterios.regioes && criterios.regioes.length > 0) {
            if (criterios.regioes.indexOf(evento.regiao || 'Outros') === -1) {
                return false;
            }
        }

        /* !== null, e não só if (precoMin): o ZERO é um preço
           válido, mas o JavaScript trata 0 como "falso". Um evento
           gratuito sumiria do filtro. */
        if (criterios.precoMin !== null && criterios.precoMin !== undefined) {
            if (evento.preco < criterios.precoMin) {
                return false;
            }
        }

        if (criterios.precoMax !== null && criterios.precoMax !== undefined) {
            if (evento.preco > criterios.precoMax) {
                return false;
            }
        }

        return true;
    });
}


/* As regiões que existem de fato nos eventos, sem repetir. */
function listarRegioes() {
    const vistas = [];

    obterEventos().forEach(function (evento) {
        const regiao = evento.regiao || 'Outros';
        if (vistas.indexOf(regiao) === -1) {
            vistas.push(regiao);
        }
    });

    return vistas.sort();
}
