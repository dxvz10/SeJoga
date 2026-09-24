/* =============================================================
   SEJOGA — CONTAS E SESSÃO

   Cadastro, login, logout e a proteção das páginas.

   ⚠ Proteção só de INTERFACE. Sem servidor, qualquer pessoa pode
   abrir o DevTools e mexer no localStorage. E a senha fica em
   texto puro — num sistema real ela ficaria num servidor,
   guardada com hash (bcrypt, por exemplo). O enunciado pede
   simulação 100% no navegador; vale saber explicar a diferença.
   ============================================================= */


/* -------------------------------------------------------------
   USUÁRIOS CADASTRADOS
   ------------------------------------------------------------- */

function obterUsuarios() {
    return lerDoArmazenamento(CHAVES.usuarios, []);
}


function salvarUsuarios(lista) {
    return gravarNoArmazenamento(CHAVES.usuarios, lista);
}


/* find() percorre a lista e devolve o PRIMEIRO item que passa no
   teste — ou undefined se nenhum passar. */
function buscarUsuario(login) {
    const alvo = login.toLowerCase();

    return obterUsuarios().find(function (usuario) {
        return usuario.login.toLowerCase() === alvo;
    });
}


/* Verifica se já existe alguém com aquele valor num campo.
   O "ignorarLogin" serve para o perfil: quando a pessoa edita o
   próprio e-mail, ela não pode colidir consigo mesma. */
function valorJaCadastrado(campo, valor, ignorarLogin) {
    const alvo = String(valor).toLowerCase();

    return obterUsuarios().some(function (usuario) {
        if (ignorarLogin && usuario.login === ignorarLogin) {
            return false;
        }
        return String(usuario[campo]).toLowerCase() === alvo;
    });
}


function cadastrarUsuario(dados) {
    if (valorJaCadastrado('login', dados.login)) {
        return { ok: false, campo: 'login', erro: 'Este login já está em uso. Escolha outro.' };
    }

    if (valorJaCadastrado('cpf', dados.cpf)) {
        return { ok: false, campo: 'cpf', erro: 'Já existe uma conta com este CPF.' };
    }

    if (valorJaCadastrado('email', dados.email)) {
        return { ok: false, campo: 'email', erro: 'Já existe uma conta com este e-mail.' };
    }

    const usuario = Object.assign({ id: 'usr_' + Date.now() }, dados);

    const lista = obterUsuarios();
    lista.push(usuario);

    if (!salvarUsuarios(lista)) {
        return { ok: false, campo: 'foto', erro: 'Não coube no armazenamento do navegador. Tente uma foto menor.' };
    }

    return { ok: true, usuario: usuario };
}


/* Atualiza os dados de quem está logado (tela de perfil). */
function atualizarUsuario(login, novosDados) {
    const lista = obterUsuarios();

    // findIndex é o find() que devolve a POSIÇÃO, ou -1.
    const posicao = lista.findIndex(function (usuario) {
        return usuario.login === login;
    });

    if (posicao === -1) {
        return false;
    }

    // Object.assign copia os campos novos por cima dos antigos.
    lista[posicao] = Object.assign({}, lista[posicao], novosDados);

    if (!salvarUsuarios(lista)) {
        return false;
    }

    gravarSessao(lista[posicao]);
    return true;
}


/* -------------------------------------------------------------
   SESSÃO — quem está logado agora
   ------------------------------------------------------------- */

function obterSessao() {
    const sessao = lerDoArmazenamento(CHAVES.sessao, null);

    // Uma sessão sem login é lixo (ou foi mexida à mão).
    if (!sessao || typeof sessao.login !== 'string') {
        return null;
    }

    return sessao;
}


function usuarioLogado() {
    return obterSessao() !== null;
}


/* O cadastro completo de quem está logado (com foto, endereço...).
   A sessão guarda só o essencial; o resto vem daqui. */
function usuarioAtual() {
    const sessao = obterSessao();
    return sessao ? (buscarUsuario(sessao.login) || sessao) : null;
}


/* Só o necessário: login e nome. NUNCA a senha. */
function gravarSessao(usuario) {
    gravarNoArmazenamento(CHAVES.sessao, {
        login: usuario.login,
        nomeCompleto: usuario.nomeCompleto
    });
}


function entrar(login, senha) {
    const usuario = buscarUsuario(login);

    /* A mesma mensagem para "login não existe" e "senha errada".
       Se fossem diferentes, alguém mal-intencionado descobriria
       quais logins existem só testando. */
    if (!usuario || usuario.senha !== senha) {
        return { ok: false, erro: 'Login ou senha incorretos.' };
    }

    gravarSessao(usuario);

    /* sessionStorage é o primo do localStorage que se apaga ao
       fechar a aba. Serve de "recado para a próxima página":
       mostre o resumo da semana UMA vez, logo depois do login. */
    try {
        sessionStorage.setItem('portalEventos_mostrarSemana', '1');
    } catch (erro) {
        // Navegação privada pode bloquear; o login continua valendo.
    }

    return { ok: true, usuario: usuario };
}


function sair() {
    apagarDoArmazenamento(CHAVES.sessao);
    window.location.href = 'index.html';
}


/* -------------------------------------------------------------
   O CONVITE "FAÇA LOGIN OU CADASTRE-SE"

   Antes cada página precisava ter esse modal escrito no HTML — e
   a que esquecia quebrava o auth.js inteiro. Agora ele é criado
   aqui, uma vez, em qualquer página que precisar.
   ------------------------------------------------------------- */

function garantirModalConta() {
    if (document.getElementById('modal-conta')) {
        return;
    }

    const modal = criarElemento('div', 'modal');
    modal.id = 'modal-conta';

    const caixa = criarElemento('div', 'modal-caixa');
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.setAttribute('aria-labelledby', 'modal-conta-titulo');

    const fechar = criarElemento('button', 'modal-fechar', '×');
    fechar.type = 'button';
    fechar.setAttribute('aria-label', 'Fechar');

    const titulo = criarElemento('h2', null, 'Entre para continuar');
    titulo.id = 'modal-conta-titulo';

    const texto = criarElemento('p', null,
        'Faça login ou crie sua conta para ver todos os eventos e montar sua agenda.');

    const acoes = criarElemento('div', 'modal-acoes');
    const linkEntrar = criarElemento('a', 'botao-entrar', 'Entrar');
    const linkCadastro = criarElemento('a', 'botao-cadastro', 'Cadastrar');

    // Depois do login, a pessoa volta para onde estava.
    linkEntrar.href = 'login.html?voltar=' + encodeURIComponent(paginaAtual());
    linkCadastro.href = 'cadastro.html';

    acoes.appendChild(linkEntrar);
    acoes.appendChild(linkCadastro);

    caixa.appendChild(fechar);
    caixa.appendChild(titulo);
    caixa.appendChild(texto);
    caixa.appendChild(acoes);
    modal.appendChild(caixa);
    document.body.appendChild(modal);
}


/* destino: para onde ir depois do login. Se a pessoa clicou em
   "Futebol" na home, depois de entrar ela deve cair na página de
   eventos já filtrada — e não voltar para a home. */
function pedirLogin(destino) {
    garantirModalConta();

    document.querySelector('#modal-conta .botao-entrar').href =
        'login.html?voltar=' + encodeURIComponent(destino || paginaAtual());

    abrirModal('modal-conta');
}


/* "calendario.html", "eventos.html?categoria=festa"... */
function paginaAtual() {
    const caminho = window.location.pathname.split('/').pop() || 'index.html';
    return caminho + window.location.search;
}


/* -------------------------------------------------------------
   LINKS PROTEGIDOS — data-precisa-login

   Um listener só, no documento inteiro. Cobre também os links
   criados depois por JavaScript (os cartões de categoria, por
   exemplo), coisa que um forEach no carregamento não faria.
   ------------------------------------------------------------- */

document.addEventListener('click', function (evento) {
    const link = evento.target.closest('[data-precisa-login]');

    if (!link || usuarioLogado()) {
        return;
    }

    evento.preventDefault();

    // getAttribute('href') devolve o endereço como está escrito
    // ("eventos.html?categoria=festa"); link.href devolveria o
    // endereço completo, com "http://..." na frente.
    pedirLogin(link.getAttribute('href'));
});


/* -------------------------------------------------------------
   PÁGINAS INTEIRAS PROTEGIDAS

   <html data-pagina="restrita">  → só entra logado
   <html data-pagina="visitante"> → login e cadastro: quem já está
                                    logado não tem o que fazer ali

   O CSS esconde o <main> das páginas restritas até este código
   confirmar a sessão — assim o conteúdo não "pisca" antes do
   redirecionamento.
   ------------------------------------------------------------- */

(function verificarAcessoDaPagina() {
    const tipo = document.documentElement.dataset.pagina;

    if (tipo === 'restrita') {
        if (!usuarioLogado()) {
            // replace() não deixa esta página no histórico: o botão
            // "voltar" do navegador não traz a pessoa de volta aqui.
            window.location.replace('login.html?voltar=' + encodeURIComponent(paginaAtual()));
            return;
        }
        document.documentElement.dataset.sessaoOk = '';
    }

    if (tipo === 'visitante' && usuarioLogado()) {
        window.location.replace('index.html');
    }
})();
/* Esse "(function () { ... })();" é uma função que roda na hora
   em que é lida. Serve para não deixar variáveis soltas no
   arquivo — tudo que ela cria some quando ela termina. */
