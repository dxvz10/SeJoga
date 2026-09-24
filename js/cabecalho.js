/* =============================================================
   SEJOGA — CABEÇALHO DE QUEM ESTÁ LOGADO

   Deslogado: os botões "Cadastrar" e "Entrar", escritos no HTML.
   Logado: este arquivo monta, no lugar deles,
     🔔 o sininho com os eventos da agenda dos próximos 7 dias
     👤 o avatar com o menu (perfil, agenda, aparência, sair)

   Por que montar por JavaScript em vez de escrever no HTML? Porque
   são quatro páginas com o mesmo cabeçalho. Escrito à mão, seriam
   quatro cópias de ~40 linhas — e uma hora uma delas fica
   diferente das outras. Assim existe UMA versão.

   Precisa de: storage.js, ui.js, auth.js, eventos.js, tema.js.
   ============================================================= */

const DIAS_DAS_NOTIFICACOES = 7;


/* SVGs pequenos, desenhados aqui mesmo. aria-hidden porque são
   decorativos: o texto do botão já diz o que ele faz. */
const ICONE_SINO =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z" fill="currentColor"/></svg>';

const ICONE_SETA =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';


/* =============================================================
   NOTIFICAÇÕES "JÁ VISTAS"

   O número vermelho do sino conta só o que a pessoa ainda não
   viu. Abriu o painel, zera. Guardamos por login:
       { "davich": ["evt_003", "evt_007"] }
   ============================================================= */

function notificacoesVistas() {
    const todas = lerDoArmazenamento(CHAVES.notificacoesVistas, {});
    return todas[loginAtual()] || [];
}


function marcarComoVistas(eventos) {
    const todas = lerDoArmazenamento(CHAVES.notificacoesVistas, {});
    todas[loginAtual()] = eventos.map(function (evento) {
        return evento.id;
    });
    gravarNoArmazenamento(CHAVES.notificacoesVistas, todas);
}


function contarNaoVistas(eventos) {
    const vistas = notificacoesVistas();

    return eventos.filter(function (evento) {
        return vistas.indexOf(evento.id) === -1;
    }).length;
}


/* =============================================================
   MONTAGEM
   ============================================================= */

function montarItemDeEvento(evento) {
    const item = criarElemento('li');
    const link = criarElemento('a');
    link.href = 'calendario.html';

    link.appendChild(criarElemento('strong', null, evento.nome));
    link.appendChild(criarElemento('span', 'notificacao-detalhe',
        formatarDataCurta(evento.dataHora) + ' · ' + evento.local));
    link.appendChild(criarElemento('span', 'notificacao-quando', descreverQuando(evento.dataHora)));

    item.appendChild(link);
    return item;
}


function montarPainelNotificacoes(eventos) {
    const painel = criarElemento('div', 'painel-suspenso painel-notificacoes');
    painel.id = 'painel-notificacoes';
    painel.hidden = true;

    painel.appendChild(criarElemento('h3', null, 'Sua agenda nos próximos 7 dias'));

    if (eventos.length === 0) {
        painel.appendChild(criarElemento('p', 'painel-vazio',
            'Nenhum evento da sua agenda nos próximos dias.'));

        const link = criarElemento('a', 'painel-link', 'Explorar eventos →');
        link.href = 'eventos.html';
        painel.appendChild(link);
        return painel;
    }

    const lista = criarElemento('ul', 'lista-notificacoes');
    eventos.forEach(function (evento) {
        lista.appendChild(montarItemDeEvento(evento));
    });
    painel.appendChild(lista);

    return painel;
}


function montarSino(eventos) {
    const caixa = criarElemento('div', 'notificacoes');
    const naoVistas = contarNaoVistas(eventos);

    const botao = criarElemento('button', 'botao-icone botao-sino');
    botao.type = 'button';
    botao.innerHTML = ICONE_SINO;     // SVG nosso, fixo: innerHTML é seguro aqui
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'painel-notificacoes');
    botao.setAttribute('aria-label', naoVistas > 0
        ? 'Notificações: ' + naoVistas + (naoVistas === 1 ? ' nova' : ' novas')
        : 'Notificações');

    if (naoVistas > 0) {
        botao.appendChild(criarElemento('span', 'contador-sino', naoVistas));
    }

    caixa.appendChild(botao);
    caixa.appendChild(montarPainelNotificacoes(eventos));
    return caixa;
}


function montarMenuUsuario(usuario) {
    const caixa = criarElemento('div', 'usuario');
    const primeiroNome = (usuario.nomeCompleto || usuario.login).trim().split(' ')[0];

    // --- o botão: avatar + nome + seta ---
    const botao = criarElemento('button', 'botao-usuario');
    botao.type = 'button';
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'menu-usuario');

    const avatar = criarElemento('span', 'usuario-avatar');
    if (usuario.foto) {
        avatar.style.backgroundImage = 'url("' + usuario.foto + '")';
    }

    botao.appendChild(avatar);
    botao.appendChild(criarElemento('span', 'usuario-nome', 'Olá, ' + primeiroNome));

    const seta = criarElemento('span', 'seta-menu');
    seta.innerHTML = ICONE_SETA;
    botao.appendChild(seta);

    // --- o menu ---
    const menu = criarElemento('div', 'painel-suspenso menu-usuario');
    menu.id = 'menu-usuario';
    menu.hidden = true;

    const topo = criarElemento('div', 'menu-usuario-topo');
    topo.appendChild(criarElemento('strong', null, usuario.nomeCompleto || usuario.login));
    topo.appendChild(criarElemento('span', null, '@' + usuario.login));
    menu.appendChild(topo);

    const quantosNaAgenda = obterMeusEventos().length;

    const itens = [
        { texto: 'Meu perfil', href: 'perfil.html' },
        { texto: 'Minha agenda', href: 'perfil.html#agenda', contador: quantosNaAgenda },
        { texto: 'Cadastrar evento', href: 'cadastro-evento.html' }
    ];

    itens.forEach(function (item) {
        const link = criarElemento('a', 'menu-item', item.texto);
        link.href = item.href;

        if (item.contador) {
            link.appendChild(criarElemento('span', 'menu-contador', item.contador));
        }
        menu.appendChild(link);
    });

    menu.appendChild(montarAparencia());

    const botaoSair = criarElemento('button', 'menu-item menu-sair', 'Sair');
    botaoSair.type = 'button';
    botaoSair.addEventListener('click', sair);
    menu.appendChild(botaoSair);

    caixa.appendChild(botao);
    caixa.appendChild(menu);
    return caixa;
}


/* Tema e A−/A+ dentro do menu. */
function montarAparencia() {
    const bloco = criarElemento('div', 'menu-aparencia');
    bloco.appendChild(criarElemento('span', 'menu-rotulo', 'Aparência'));

    const botaoTema = criarElemento('button', 'menu-item botao-tema');
    botaoTema.type = 'button';

    /* aria-pressed = botão de liga/desliga. O leitor de tela diz
       "Tema escuro, botão alternar, pressionado". */
    function atualizarBotaoTema() {
        const escuro = obterPreferencias().tema === 'escuro';
        botaoTema.textContent = escuro ? 'Tema escuro: ligado' : 'Tema escuro: desligado';
        botaoTema.setAttribute('aria-pressed', escuro ? 'true' : 'false');
    }

    botaoTema.addEventListener('click', function () {
        alternarTema();
        atualizarBotaoTema();
    });
    atualizarBotaoTema();

    const linhaFonte = criarElemento('div', 'controle-fonte');
    const menos = criarElemento('button', 'botao-fonte', 'A−');
    const valor = criarElemento('span', 'valor-fonte');
    const mais = criarElemento('button', 'botao-fonte', 'A+');

    menos.type = 'button';
    mais.type = 'button';
    menos.setAttribute('aria-label', 'Diminuir texto');
    mais.setAttribute('aria-label', 'Aumentar texto');
    valor.setAttribute('aria-live', 'polite');

    function atualizarFonte() {
        const escala = obterPreferencias().escala;
        valor.textContent = Math.round(escala * 100) + '%';
        menos.disabled = escala === ESCALAS_DE_FONTE[0];
        mais.disabled = escala === ESCALAS_DE_FONTE[ESCALAS_DE_FONTE.length - 1];
    }

    menos.addEventListener('click', function () { mudarEscala(-1); atualizarFonte(); });
    mais.addEventListener('click', function () { mudarEscala(1); atualizarFonte(); });
    atualizarFonte();

    linhaFonte.appendChild(criarElemento('span', null, 'Texto'));
    linhaFonte.appendChild(menos);
    linhaFonte.appendChild(valor);
    linhaFonte.appendChild(mais);

    bloco.appendChild(botaoTema);
    bloco.appendChild(linhaFonte);
    return bloco;
}


/* =============================================================
   ABRIR E FECHAR OS PAINÉIS

   Só um aberto por vez. Fecha ao clicar fora, no Esc, ou ao
   clicar de novo no mesmo botão.
   ============================================================= */

function fecharPaineis(exceto) {
    document.querySelectorAll('.area-usuario [aria-expanded="true"]').forEach(function (botao) {
        if (botao === exceto) {
            return;
        }
        botao.setAttribute('aria-expanded', 'false');
        document.getElementById(botao.getAttribute('aria-controls')).hidden = true;
    });
}


function alternarPainel(botao) {
    const painel = document.getElementById(botao.getAttribute('aria-controls'));
    const abrir = botao.getAttribute('aria-expanded') !== 'true';

    fecharPaineis(botao);
    botao.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    painel.hidden = !abrir;

    // Abriu o sino: conta como visto, some o número vermelho.
    if (abrir && botao.classList.contains('botao-sino')) {
        marcarComoVistas(agendaDosProximosDias(DIAS_DAS_NOTIFICACOES));

        const contador = botao.querySelector('.contador-sino');
        if (contador) {
            contador.remove();
            botao.setAttribute('aria-label', 'Notificações');
        }
    }
}


document.addEventListener('click', function (evento) {
    const botao = evento.target.closest('.area-usuario .botao-sino, .area-usuario .botao-usuario');

    if (botao) {
        alternarPainel(botao);
        return;
    }

    // Clique DENTRO de um painel (nos botões de tema, por exemplo)
    // não pode fechá-lo. Clique fora fecha.
    if (!evento.target.closest('.painel-suspenso')) {
        fecharPaineis(null);
    }
});


document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Escape') {
        return;
    }

    const aberto = document.querySelector('.area-usuario [aria-expanded="true"]');
    if (aberto) {
        fecharPaineis(null);
        aberto.focus();      // devolve o foco ao botão que abriu
    }
});


/* =============================================================
   RESUMO DA SEMANA — aparece uma vez, logo depois do login
   ============================================================= */

function mostrarResumoDaSemana(usuario) {
    let recado = null;

    try {
        recado = sessionStorage.getItem('portalEventos_mostrarSemana');
        sessionStorage.removeItem('portalEventos_mostrarSemana');
    } catch (erro) {
        return;
    }

    if (!recado) {
        return;
    }

    const eventos = agendaDosProximosDias(DIAS_DAS_NOTIFICACOES);
    const primeiroNome = (usuario.nomeCompleto || usuario.login).trim().split(' ')[0];

    const modal = criarElemento('div', 'modal');
    modal.id = 'modal-semana';

    const caixa = criarElemento('div', 'modal-caixa modal-semana');
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.setAttribute('aria-labelledby', 'modal-semana-titulo');

    const fechar = criarElemento('button', 'modal-fechar', '×');
    fechar.type = 'button';
    fechar.setAttribute('aria-label', 'Fechar');

    const titulo = criarElemento('h2', null, 'Olá, ' + primeiroNome + '!');
    titulo.id = 'modal-semana-titulo';

    caixa.appendChild(fechar);
    caixa.appendChild(titulo);

    if (eventos.length > 0) {
        const frase = eventos.length === 1
            ? 'Você tem 1 evento na agenda nos próximos 7 dias:'
            : 'Você tem ' + eventos.length + ' eventos na agenda nos próximos 7 dias:';
        caixa.appendChild(criarElemento('p', null, frase));

        const lista = criarElemento('ul', 'lista-notificacoes');
        eventos.forEach(function (evento) {
            lista.appendChild(montarItemDeEvento(evento));
        });
        caixa.appendChild(lista);
        marcarComoVistas(eventos);
    } else {
        caixa.appendChild(criarElemento('p', null,
            'Sua agenda está livre nos próximos 7 dias. Que tal procurar um rolê?'));
    }

    const acoes = criarElemento('div', 'modal-acoes');
    const explorar = criarElemento('a', 'botao-cadastro', 'Explorar eventos');
    explorar.href = 'eventos.html';
    const ok = criarElemento('button', 'botao-entrar', 'Fechar');
    ok.type = 'button';
    ok.setAttribute('data-fechar-modal', '');

    acoes.appendChild(ok);
    acoes.appendChild(explorar);
    caixa.appendChild(acoes);

    modal.appendChild(caixa);
    document.body.appendChild(modal);
    abrirModal('modal-semana');
}


/* =============================================================
   INICIALIZAÇÃO
   ============================================================= */

(function montarCabecalho() {
    const usuario = usuarioAtual();
    const acoes = document.querySelector('.acoes-cabecalho');

    if (!usuario || !acoes) {
        return;
    }

    // Esconde os botões de visitante e acrescenta a área logada.
    acoes.querySelectorAll('[data-sessao="deslogado"]').forEach(function (elemento) {
        elemento.hidden = true;
    });

    const area = criarElemento('div', 'area-usuario');
    area.appendChild(montarSino(agendaDosProximosDias(DIAS_DAS_NOTIFICACOES)));
    area.appendChild(montarMenuUsuario(usuario));
    acoes.appendChild(area);

    mostrarResumoDaSemana(usuario);
})();


/* Qualquer elemento da página marcado com data-sessao="logado"
   só aparece para quem está logado (e o contrário para
   "deslogado"). É assim que o calendário esconde a seção
   "Todos os eventos" dos visitantes. */
(function mostrarConformeSessao() {
    const logado = usuarioLogado();

    document.querySelectorAll('main [data-sessao="logado"]').forEach(function (elemento) {
        elemento.hidden = !logado;
    });

    document.querySelectorAll('main [data-sessao="deslogado"]').forEach(function (elemento) {
        elemento.hidden = logado;
    });
})();
