/* =============================================================
   SEJOGA — CARD DE EVENTO E BOTÃO "ADICIONAR AO CALENDÁRIO"

   Usado pelo calendário, pela página Eventos e pelo perfil.
   Um card só, escrito uma vez: se o visual mudar, muda nos três.

   Quando alguém adiciona ou remove um evento da agenda, este
   arquivo DISPARA um evento próprio, "agenda-mudou". Cada página
   escuta e se atualiza do seu jeito (o calendário redesenha a
   grade, o perfil tira o card da lista...). Assim este arquivo
   não precisa conhecer as páginas — só avisar que algo mudou.
   ============================================================= */


function montarCardEvento(evento, opcoes) {
    opcoes = opcoes || {};

    const status = calcularStatusEvento(evento);
    const naAgenda = obterMeusEventos().indexOf(evento.id) !== -1;

    const card = criarElemento('article', 'card');

    card.appendChild(criarElemento('span', 'categoria', NOMES_CATEGORIAS[evento.categoria] || evento.categoria));
    card.appendChild(criarElemento('h3', null, evento.nome));
    card.appendChild(criarElemento('p', 'local', '📍 ' + evento.local));
    card.appendChild(criarElemento('p', 'data', '📅 ' + formatarDataCurta(evento.dataHora)));

    const rodape = criarElemento('div', 'rodape-card');
    rodape.appendChild(criarElemento('span', 'preco', formatarPreco(evento.preco)));
    rodape.appendChild(criarElemento('span', status.classe, status.rotulo));
    card.appendChild(rodape);

    /* O botão só aparece se ainda dá para ir ao evento — ou se ele
       já está na agenda (no perfil, a pessoa precisa conseguir
       tirar da agenda um evento que já passou). */
    if (eventoAberto(evento) || (naAgenda && opcoes.permitirRemoverEncerrado)) {
        const botao = criarElemento('button', 'botao-agenda');
        botao.type = 'button';
        botao.dataset.id = evento.id;        // o id fica guardado no próprio botão
        pintarBotaoAgenda(botao, naAgenda);
        card.appendChild(botao);
    }

    return card;
}


function pintarBotaoAgenda(botao, naAgenda) {
    botao.textContent = naAgenda ? '✓ No meu calendário' : '+ Adicionar ao calendário';
    botao.classList.toggle('na-agenda', naAgenda);
    botao.setAttribute('aria-pressed', naAgenda ? 'true' : 'false');
}


/* UM listener no documento para todos os botões de agenda da
   página, inclusive os de cards criados depois. */
document.addEventListener('click', function (evento) {
    const botao = evento.target.closest('.botao-agenda');

    if (!botao) {
        return;
    }

    // Sem conta não há agenda: mostra o convite de login.
    if (!usuarioLogado()) {
        pedirLogin();
        return;
    }

    const ficou = alternarMeuEvento(botao.dataset.id);
    const dados = buscarEvento(botao.dataset.id);

    // Pode haver o MESMO evento em dois lugares da página (nos
    // destaques e na busca). Atualiza todos os botões dele.
    document.querySelectorAll('.botao-agenda[data-id="' + botao.dataset.id + '"]').forEach(function (outro) {
        pintarBotaoAgenda(outro, ficou);
    });

    if (dados) {
        mostrarToast(ficou
            ? dados.nome + ' foi para a sua agenda.'
            : dados.nome + ' saiu da sua agenda.',
            ficou ? 'sucesso' : 'info');
    }

    // Avisa a página inteira. Quem se interessar, escuta.
    document.dispatchEvent(new CustomEvent('agenda-mudou', {
        detail: { id: botao.dataset.id, naAgenda: ficou }
    }));
});
