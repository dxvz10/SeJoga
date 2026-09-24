/* =============================================================
   SEJOGA — VALIDAÇÕES

   Regra de ouro deste arquivo: as funções NÃO encostam na tela.
   Elas recebem um texto e devolvem true ou false (ou um valor
   limpo). Quem decide que mensagem mostrar, e onde, é a página.

   Assim o cadastro, o login e o perfil usam EXATAMENTE a mesma
   regra — nenhuma tela aceita o que a outra recusa.

   As regras de nome, CPF, telefone, login e senha são as do
   enunciado e valem ponto na correção.
   ============================================================= */


/* -------------------------------------------------------------
   EXPRESSÕES REGULARES — um "molde" que o texto tem de encaixar

   ^  começo do texto        $  fim do texto
   [A-Za-z]  uma letra sem acento
   À-ÿ       as letras acentuadas (á, ç, õ...)
   \s        um espaço
   {6}       exatamente 6 vezes     {15,80}  de 15 a 80 vezes
   \d        um dígito (0 a 9)      \D       qualquer coisa que NÃO é dígito
   ------------------------------------------------------------- */


/* Nome completo: 15 a 80 caracteres, só letras e espaços. */
function validarNomeCompleto(nome) {
    const limpo = nome.trim();

    if (!/^[A-Za-zÀ-ÿ\s]{15,80}$/.test(limpo)) {
        return false;
    }

    // "Nome completo" pede pelo menos duas palavras.
    return limpo.split(/\s+/).length >= 2;
}


/* Login: exatamente 6 letras (exigência do enunciado).
   Num sistema real isso seria ruim — gera colisão de nomes e
   limita demais. Aqui a regra existe para exercitar validação. */
function validarLogin(login) {
    return /^[A-Za-z]{6}$/.test(login);
}


/* Senha: exatamente 8 letras (exigência do enunciado).
   Na vida real, fixar o tamanho e proibir números e símbolos
   ENFRAQUECE a senha: reduz as combinações possíveis. */
function validarSenha(senha) {
    return /^[A-Za-z]{8}$/.test(senha);
}


function validarConfirmacaoSenha(senha, confirmacao) {
    return confirmacao !== '' && senha === confirmacao;
}


/* E-mail: algo@algo.algo, sem espaços. Não é perfeito (nenhuma
   regex de e-mail é), mas barra os erros de digitação comuns. */
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}


/* Data de nascimento: precisa existir, não pode ser futura, e a
   pessoa precisa ter pelo menos 13 anos. O campo type="date"
   entrega o texto no formato "AAAA-MM-DD". */
function validarNascimento(valor) {
    if (!valor) {
        return false;
    }

    const nascimento = new Date(valor + 'T00:00:00');
    const hoje = new Date();

    if (isNaN(nascimento.getTime()) || nascimento > hoje) {
        return false;
    }

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    // Ainda não fez aniversário este ano? Então tem um ano a menos.
    const aindaNaoFez =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

    if (aindaNaoFez) {
        idade = idade - 1;
    }

    return idade >= 13 && idade <= 120;
}


/* -------------------------------------------------------------
   CPF — validação do DÍGITO VERIFICADOR

   Contar 11 números não basta. Os dois últimos dígitos do CPF
   são CALCULADOS a partir dos nove primeiros. Se o que a pessoa
   digitou não bater com a conta, o CPF não existe.
   ------------------------------------------------------------- */

function validarCPF(cpfDigitado) {
    // Tira pontos e traço: sobram só os números.
    const cpf = cpfDigitado.replace(/\D/g, '');

    // 11 dígitos, e não pode ser tudo igual (111.111.111-11
    // passaria na conta, mas não é um CPF válido).
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // 1º dígito: multiplica os 9 primeiros por 10, 9, 8 ... 2.
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma = soma + Number(cpf[i]) * (10 - i);
    }

    let digito1 = (soma * 10) % 11;
    if (digito1 === 10) {
        digito1 = 0;
    }

    if (digito1 !== Number(cpf[9])) {
        return false;
    }

    // 2º dígito: os 10 primeiros (já com o 1º dígito) por 11 ... 2.
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma = soma + Number(cpf[i]) * (11 - i);
    }

    let digito2 = (soma * 10) % 11;
    if (digito2 === 10) {
        digito2 = 0;
    }

    return digito2 === Number(cpf[10]);
}


/* Telefone no formato do enunciado: (+55)XX-XXXXXXXX
   DDD com 2 dígitos + 8 dígitos, para fixo E celular.

   Atenção: celulares no Brasil têm 9 dígitos. O enunciado pede
   8 para os dois, e é isso que a correção confere — vale saber
   explicar essa diferença se o professor perguntar. */
function validarTelefone(telefone) {
    return /^\(\+55\)\d{2}-\d{8}$/.test(telefone);
}


function validarCEP(cep) {
    return /^\d{5}-?\d{3}$/.test(cep);
}


/* -------------------------------------------------------------
   MÁSCARAS — formatam enquanto a pessoa digita

   Recebem o texto digitado e devolvem o texto formatado.
   A página chama no evento 'input' de cada campo.
   ------------------------------------------------------------- */

function mascaraCPF(valor) {
    const n = valor.replace(/\D/g, '').slice(0, 11);

    if (n.length > 9) return n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6, 9) + '-' + n.slice(9);
    if (n.length > 6) return n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6);
    if (n.length > 3) return n.slice(0, 3) + '.' + n.slice(3);
    return n;
}


function mascaraCEP(valor) {
    const n = valor.replace(/\D/g, '').slice(0, 8);
    return n.length > 5 ? n.slice(0, 5) + '-' + n.slice(5) : n;
}


/* (+55)XX-XXXXXXXX
   Se a pessoa colar "(+55)21..." o 55 do começo seria contado
   como DDD — por isso removemos o 55 inicial quando ele vem
   junto com o número inteiro. */
function mascaraTelefone(valor) {
    let n = valor.replace(/\D/g, '');

    if (n.length > 10 && n.startsWith('55')) {
        n = n.slice(2);
    }

    n = n.slice(0, 10);                     // DDD (2) + número (8)

    if (n.length === 0) return '';
    if (n.length <= 2) return '(+55)' + n;
    return '(+55)' + n.slice(0, 2) + '-' + n.slice(2);
}


/* -------------------------------------------------------------
   CEP → ENDEREÇO (API ViaCEP)

   fetch() pede os dados a outro site. A resposta demora, então
   a função é ASYNC: quem chama usa "await" para esperar.

   Devolve um objeto com o endereço, ou null se não achou.
   Quem mostra a mensagem de erro é a página.
   ------------------------------------------------------------- */

async function buscarEnderecoPorCep(cepDigitado) {
    const cep = cepDigitado.replace(/\D/g, '');

    if (cep.length !== 8) {
        return null;
    }

    try {
        const resposta = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
        const dados = await resposta.json();

        // O ViaCEP responde { erro: true } quando o CEP não existe.
        if (dados.erro) {
            return null;
        }

        return {
            rua: dados.logradouro,
            bairro: dados.bairro,
            cidade: dados.localidade,
            uf: dados.uf
        };
    } catch (erro) {
        // Sem internet, ou o ViaCEP fora do ar.
        throw new Error('sem-conexao');
    }
}
