/* =============================================================
   SEJOGA — MEU PERFIL

   Três partes:
   1. Meus dados — os mesmos campos do cadastro, já preenchidos.
   2. Alterar senha.
   3. Minha agenda — os eventos que a pessoa guardou.

   A página é restrita (data-pagina="restrita"): o auth.js já
   mandou para o login quem não estiver logado.
   ============================================================= */

const usuario = usuarioAtual();

/* Um visitante que abriu esta página está sendo mandado para o
   login pelo auth.js — mas o navegador ainda termina de ler os
   scripts. Sem usuário, não há o que montar: por isso tudo que
   RODA fica dentro de iniciarPerfil(), chamada só se houver
   alguém logado (lá no fim do arquivo). */


/* =============================================================
   1. MEUS DADOS
   ============================================================= */

let fotoAtual = '';


function formatarCPF(cpf) {
    return mascaraCPF(cpf || '');
}


/* Mostra na tela o que está guardado. */
function preencherPerfil() {
    document.getElementById('perfil-nome').textContent = usuario.nomeCompleto || usuario.login;
    document.getElementById('perfil-login').textContent = '@' + usuario.login;

    if (fotoAtual) {
        document.getElementById('previa-foto').style.backgroundImage = 'url("' + fotoAtual + '")';
    }

    const campos = {
        'nome': usuario.nomeCompleto,
        'email': usuario.email,
        'data-nascimento': usuario.dataNascimento,
        'cpf-exibicao': formatarCPF(usuario.cpf),
        'telefone-celular': usuario.telefoneCelular,
        'telefone-fixo': usuario.telefoneFixo,
        'cep': mascaraCEP(usuario.cep || ''),
        'rua': usuario.rua,
        'numero': usuario.numero,
        'bairro': usuario.bairro,
        'cidade': usuario.cidade,
        'uf': usuario.uf
    };

    /* Object.keys devolve a lista de "nomes" do objeto. Para cada
       um, coloca o valor no campo de mesmo id. O || '' evita
       escrever "undefined" num campo que ficou vazio. */
    Object.keys(campos).forEach(function (id) {
        document.getElementById(id).value = campos[id] || '';
    });
}


/* O avatar do cabeçalho foi montado quando a página abriu. Sem
   isto, ele só mostraria a foto nova depois de recarregar. */
function atualizarAvataresDoCabecalho(foto) {
    document.querySelectorAll('.cabecalho .usuario-avatar').forEach(function (avatar) {
        avatar.style.backgroundImage = foto ? 'url("' + foto + '")' : '';
    });
}


function mostrarAviso(id, texto, tipo) {
    const aviso = document.getElementById(id);
    aviso.textContent = texto;
    aviso.className = 'aviso-form visivel ' + tipo;
}


/* =============================================================
   2. ALTERAR SENHA
   ============================================================= */

const REGRAS_SENHA = {
    'senha-atual': {
        // Confere com a senha guardada.
        testar: function (valor) { return valor === buscarUsuario(usuario.login).senha; },
        mensagem: 'Senha atual incorreta.'
    },
    'nova-senha': {
        testar: validarSenha,
        mensagem: 'Exatamente 8 letras, sem números nem símbolos.'
    },
    'confirmacao-nova': {
        testar: function (valor) {
            return validarConfirmacaoSenha(document.getElementById('nova-senha').value, valor);
        },
        mensagem: 'As senhas não são iguais.'
    }
};


/* =============================================================
   3. MINHA AGENDA
   ============================================================= */

function desenharAgenda() {
    const proximos = document.getElementById('agenda-proximos');
    const passados = document.getElementById('agenda-passados');
    const agora = new Date();

    const todos = eventosDaMinhaAgenda();

    const futuros = todos.filter(function (evento) {
        return new Date(evento.dataHora) >= agora;
    });

    // reverse(): os já realizados do mais recente para o mais antigo.
    const antigos = todos.filter(function (evento) {
        return new Date(evento.dataHora) < agora;
    }).reverse();

    proximos.textContent = '';
    passados.textContent = '';

    if (todos.length === 0) {
        const vazio = criarElemento('div', 'agenda-vazia');
        vazio.appendChild(criarElemento('p', null, 'Sua agenda está vazia.'));
        const link = criarElemento('a', 'botao-cadastro', 'Explorar eventos');
        link.href = 'eventos.html';
        vazio.appendChild(link);
        proximos.appendChild(vazio);
        return;
    }

    if (futuros.length > 0) {
        proximos.appendChild(criarElemento('h3', 'agenda-subtitulo', 'Próximos'));
        const grade = criarElemento('div', 'cards-eventos');
        futuros.forEach(function (evento) {
            grade.appendChild(montarCardEvento(evento, { permitirRemoverEncerrado: true }));
        });
        proximos.appendChild(grade);
    }

    if (antigos.length > 0) {
        passados.appendChild(criarElemento('h3', 'agenda-subtitulo', 'Já aconteceram'));
        const grade = criarElemento('div', 'cards-eventos cards-passados');
        antigos.forEach(function (evento) {
            grade.appendChild(montarCardEvento(evento, { permitirRemoverEncerrado: true }));
        });
        passados.appendChild(grade);
    }
}


/* =============================================================
   INICIALIZAÇÃO
   ============================================================= */

function iniciarPerfil() {
    fotoAtual = usuario.foto || '';

    ligarValidacaoAoVivo(REGRAS_DADOS);
    ligarMascaras();
    ligarBuscaDeCep();

    ligarEscolhaDeFoto('foto', 'previa-foto', function (foto) {
        fotoAtual = foto;

        // A foto é salva na hora — não precisa clicar em "Salvar".
        if (atualizarUsuario(usuario.login, { foto: foto })) {
            atualizarAvataresDoCabecalho(foto);
            mostrarToast('Foto atualizada.', 'sucesso');
        } else {
            mostrarToast('A foto não coube no armazenamento do navegador.', 'erro');
        }
    });


    document.getElementById('remover-foto').addEventListener('click', function () {
        fotoAtual = '';
        atualizarUsuario(usuario.login, { foto: '' });

        // Tirar o background inline faz a silhueta do CSS voltar.
        document.getElementById('previa-foto').style.backgroundImage = '';
        atualizarAvataresDoCabecalho('');
        mostrarToast('Foto removida.', 'info');
    });

    document.getElementById('form-perfil').addEventListener('submit', function (evento) {
        evento.preventDefault();

        const primeiroErro = validarTodos(REGRAS_DADOS);

        if (primeiroErro) {
            mostrarAviso('aviso-perfil', 'Confira os campos marcados em vermelho.', 'erro');
            document.getElementById(primeiroErro).focus();
            return;
        }

        const dados = lerDadosDoFormulario();

        // O e-mail não pode ser o de OUTRA conta (o próprio pode).
        if (valorJaCadastrado('email', dados.email, usuario.login)) {
            marcarCampo('email', 'Este e-mail já é usado por outra conta.');
            document.getElementById('email').focus();
            return;
        }

        if (!atualizarUsuario(usuario.login, dados)) {
            mostrarAviso('aviso-perfil', 'Não foi possível salvar agora. Tente de novo.', 'erro');
            return;
        }

        // Atualiza o objeto na memória e o que aparece na tela.
        Object.assign(usuario, dados);
        document.getElementById('perfil-nome').textContent = usuario.nomeCompleto;

        document.querySelectorAll('.cabecalho .usuario-nome').forEach(function (nome) {
            nome.textContent = 'Olá, ' + usuario.nomeCompleto.split(' ')[0];
        });

        mostrarAviso('aviso-perfil', 'Dados salvos.', 'sucesso');
        mostrarToast('Perfil atualizado.', 'sucesso');
    });

    document.getElementById('form-senha').addEventListener('submit', function (evento) {
        evento.preventDefault();

        const primeiroErro = validarTodos(REGRAS_SENHA);

        if (primeiroErro) {
            mostrarAviso('aviso-senha', 'Confira os campos marcados em vermelho.', 'erro');
            document.getElementById(primeiroErro).focus();
            return;
        }

        atualizarUsuario(usuario.login, { senha: document.getElementById('nova-senha').value });

        // form.reset() limpa todos os campos do formulário de uma vez.
        this.reset();
        mostrarAviso('aviso-senha', 'Senha alterada.', 'sucesso');
        mostrarToast('Senha alterada.', 'sucesso');
    });

    /* Quando a pessoa tira um evento da agenda (botão do card), o
       cards-evento.js avisa. Aqui, redesenhar = o card some da lista. */
    document.addEventListener('agenda-mudou', desenharAgenda);


    preencherPerfil();
    desenharAgenda();
}


if (usuario) {
    iniciarPerfil();
}
