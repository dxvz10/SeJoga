/* =============================================================
   SEJOGA — TELA DE LOGIN

   Confere o formato (6 letras / 8 letras) e depois pergunta ao
   auth.js se existe alguém com aquele login e aquela senha.
   ============================================================= */

const formLogin = document.querySelector('#form-login');
const campoLogin = document.querySelector('#login');
const campoSenha = document.querySelector('#senha');
const avisoLogin = document.querySelector('#aviso-login');


function mostrarAvisoLogin(texto, tipo) {
    avisoLogin.textContent = texto;
    avisoLogin.className = 'aviso-form visivel ' + tipo;
}


/* URLSearchParams lê o que vem depois do "?" no endereço.
   login.html?novo=davich  →  parametros.get('novo') === 'davich' */
const parametros = new URLSearchParams(window.location.search);

// Veio direto do cadastro: preenche o login e avisa.
if (parametros.get('novo')) {
    campoLogin.value = parametros.get('novo');
    mostrarAvisoLogin('Conta criada! Agora é só digitar sua senha.', 'sucesso');
    campoSenha.focus();
}


formLogin.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const login = campoLogin.value.trim();
    const senha = campoSenha.value;

    // 1º) o formato. Nem adianta procurar um login de 4 letras.
    if (!validarLogin(login)) {
        mostrarAvisoLogin('O login tem exatamente 6 letras.', 'erro');
        campoLogin.focus();
        return;
    }

    if (!validarSenha(senha)) {
        mostrarAvisoLogin('A senha tem exatamente 8 letras.', 'erro');
        campoSenha.focus();
        return;
    }

    // 2º) existe alguém com esse login E essa senha?
    const resultado = entrar(login, senha);

    if (!resultado.ok) {
        mostrarAvisoLogin(resultado.erro, 'erro');
        campoSenha.value = '';
        campoSenha.focus();
        return;
    }

    /* Deu certo. Volta para a página de onde a pessoa veio
       (login.html?voltar=calendario.html), ou para a home.

       O teste com a barra "/" impede um truque: alguém montar um
       link login.html?voltar=https://site-falso.com para mandar a
       pessoa, já logada, para outro site. Só aceitamos páginas
       daqui mesmo. */
    const voltar = parametros.get('voltar');
    const destinoSeguro = voltar && !voltar.includes('/') && !voltar.includes(':');

    window.location.href = destinoSeguro ? voltar : 'index.html';
});
