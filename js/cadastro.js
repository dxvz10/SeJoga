/* =============================================================
   SEJOGA — TELA DE CADASTRO

   Os campos comuns com o perfil (nome, contato, endereço, foto)
   são tratados pelo campos-conta.js. Aqui entra só o que é do
   cadastro: CPF, login, senha e a criação da conta.
   ============================================================= */

const formCadastro = document.querySelector('#form-cadastro');
const avisoCadastro = document.querySelector('#aviso-cadastro');


/* As regras do cadastro = as regras de dados + as de acesso.
   Object.assign junta os dois "mapas" num só. */
const REGRAS_CADASTRO = Object.assign({}, REGRAS_DADOS, {
    'cpf': {
        testar: validarCPF,
        mensagem: 'CPF inválido. Confira os números.'
    },
    'login': {
        testar: validarLogin,
        mensagem: 'Exatamente 6 letras, sem números nem espaços.'
    },
    'senha': {
        testar: validarSenha,
        mensagem: 'Exatamente 8 letras, sem números nem símbolos.'
    },
    'confirmacao': {
        testar: function (valor) {
            return validarConfirmacaoSenha(document.getElementById('senha').value, valor);
        },
        mensagem: 'As senhas não são iguais.'
    }
});


let fotoEscolhida = '';

ligarValidacaoAoVivo(REGRAS_CADASTRO);
ligarMascaras();
ligarBuscaDeCep();
ligarEscolhaDeFoto('foto', 'previa-foto', function (foto) {
    fotoEscolhida = foto;
});


function mostrarAvisoCadastro(texto) {
    avisoCadastro.textContent = texto;
    avisoCadastro.className = 'aviso-form visivel erro';
}


formCadastro.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const primeiroErro = validarTodos(REGRAS_CADASTRO);

    if (primeiroErro) {
        mostrarAvisoCadastro('Confira os campos marcados em vermelho.');
        document.getElementById(primeiroErro).focus();
        return;
    }

    const dados = Object.assign(lerDadosDoFormulario(), {
        cpf: valorDe('cpf').replace(/\D/g, ''),      // só dígitos; formata na exibição
        login: valorDe('login'),
        senha: document.getElementById('senha').value,
        foto: fotoEscolhida
    });

    const resultado = cadastrarUsuario(dados);

    if (!resultado.ok) {
        // Login, CPF ou e-mail repetido: marca o campo culpado.
        if (document.getElementById('erro-' + resultado.campo)) {
            marcarCampo(resultado.campo, resultado.erro);
            document.getElementById(resultado.campo).focus();
        }
        mostrarAvisoCadastro(resultado.erro);
        return;
    }

    /* Conta criada. Vai para o login com o campo já preenchido:
       ali a pessoa confirma que lembra a senha, e o professor vê
       os dois fluxos funcionando. */
    window.location.href = 'login.html?novo=' + encodeURIComponent(resultado.usuario.login);
});
