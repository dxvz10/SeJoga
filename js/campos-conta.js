/* =============================================================
   SEJOGA — CAMPOS DE CONTA (cadastro e perfil)

   O cadastro e o perfil têm os mesmos campos: nome, e-mail,
   telefones, endereço... Em vez de repetir tudo nas duas telas,
   as regras, as máscaras, o ViaCEP e a foto moram aqui.

   As REGRAS em si (o que é um CPF válido) estão no validacoes.js.
   Este arquivo liga cada regra a um campo da tela.
   ============================================================= */


/* Um "mapa" campo → regra → mensagem. Em vez de dez if/else
   quase iguais, a lista descreve as regras e UM laço percorre
   todas. Para mudar uma mensagem, é só mexer aqui. */
const REGRAS_DADOS = {
    'nome': {
        testar: validarNomeCompleto,
        mensagem: 'Digite nome e sobrenome, só letras (de 15 a 80 caracteres).'
    },
    'email': {
        testar: validarEmail,
        mensagem: 'Digite um e-mail válido, como nome@exemplo.com.'
    },
    'data-nascimento': {
        testar: validarNascimento,
        mensagem: 'Informe uma data válida. É preciso ter 13 anos ou mais.'
    },
    'telefone-celular': {
        testar: validarTelefone,
        mensagem: 'Use o formato (+55)XX-XXXXXXXX.'
    },
    'telefone-fixo': {
        // Opcional: vazio passa; preenchido precisa estar certo.
        testar: function (valor) { return valor === '' || validarTelefone(valor); },
        mensagem: 'Use o formato (+55)XX-XXXXXXXX, ou deixe em branco.'
    },
    'cep': {
        testar: validarCEP,
        mensagem: 'O CEP tem 8 números.'
    },
    'rua': {
        testar: function (valor) { return valor.trim().length >= 3; },
        mensagem: 'Informe a rua.'
    },
    'numero': {
        testar: function (valor) { return valor.trim() !== ''; },
        mensagem: 'Informe o número (ou "s/n").'
    },
    'bairro': {
        testar: function (valor) { return valor.trim().length >= 2; },
        mensagem: 'Informe o bairro.'
    },
    'cidade': {
        testar: function (valor) { return valor.trim().length >= 2; },
        mensagem: 'Informe a cidade.'
    },
    'uf': {
        testar: function (valor) { return /^[A-Za-z]{2}$/.test(valor); },
        mensagem: 'Duas letras, como RJ.'
    }
};


/* -------------------------------------------------------------
   MENSAGEM EMBAIXO DE CADA CAMPO
   ------------------------------------------------------------- */

function marcarCampo(id, mensagem) {
    const campo = document.getElementById(id);
    const erro = document.getElementById('erro-' + id);

    if (erro) {
        erro.textContent = mensagem || '';
        erro.classList.remove('info');
    }

    // aria-invalid avisa o leitor de tela que o campo tem problema,
    // e o CSS usa o mesmo atributo para pintar a borda de vermelho.
    if (mensagem) {
        campo.setAttribute('aria-invalid', 'true');
    } else {
        campo.removeAttribute('aria-invalid');
    }
}


function validarCampo(id, regras) {
    const valor = document.getElementById(id).value;
    const passou = regras[id].testar(valor);

    marcarCampo(id, passou ? '' : regras[id].mensagem);
    return passou;
}


/* Valida TODOS e devolve o id do primeiro com erro (ou null).
   Não para no primeiro erro: a pessoa vê de uma vez tudo o que
   precisa corrigir. */
function validarTodos(regras) {
    let primeiroErro = null;

    Object.keys(regras).forEach(function (id) {
        if (!validarCampo(id, regras) && !primeiroErro) {
            primeiroErro = id;
        }
    });

    return primeiroErro;
}


/* Valida ao SAIR do campo (blur), e não a cada tecla: ninguém
   gosta de ler "CPF inválido" enquanto ainda está digitando.
   Depois que o campo mostrou um erro, aí sim revalida a cada
   tecla — para a mensagem sumir assim que ficar certo. */
function ligarValidacaoAoVivo(regras) {
    Object.keys(regras).forEach(function (id) {
        const campo = document.getElementById(id);

        campo.addEventListener('blur', function () {
            if (campo.value !== '') {
                validarCampo(id, regras);
            }
        });

        campo.addEventListener('input', function () {
            if (campo.hasAttribute('aria-invalid')) {
                validarCampo(id, regras);
            }
        });
    });
}


/* -------------------------------------------------------------
   MÁSCARAS — formatam enquanto a pessoa digita
   ------------------------------------------------------------- */

function aplicarMascara(id, mascara) {
    const campo = document.getElementById(id);

    if (!campo) {
        return;
    }

    campo.addEventListener('input', function () {
        campo.value = mascara(campo.value);
    });
}


function ligarMascaras() {
    aplicarMascara('cpf', mascaraCPF);
    aplicarMascara('cep', mascaraCEP);
    aplicarMascara('telefone-celular', mascaraTelefone);
    aplicarMascara('telefone-fixo', mascaraTelefone);
    aplicarMascara('uf', function (valor) {
        return valor.replace(/[^A-Za-z]/g, '').toUpperCase();
    });
}


/* -------------------------------------------------------------
   CEP → ENDEREÇO (ViaCEP)

   Quando o CEP fica com 8 números, perguntamos ao ViaCEP e
   preenchemos rua, bairro, cidade e UF. A pessoa só digita o
   número da casa.
   ------------------------------------------------------------- */

function ligarBuscaDeCep() {
    const campoCep = document.getElementById('cep');
    let ultimoCepBuscado = campoCep.value.replace(/\D/g, '');

    campoCep.addEventListener('input', async function () {
        const cep = campoCep.value.replace(/\D/g, '');

        // Só busca com 8 dígitos, e não repete a mesma busca.
        if (cep.length !== 8 || cep === ultimoCepBuscado) {
            return;
        }

        ultimoCepBuscado = cep;
        const aviso = document.getElementById('erro-cep');
        aviso.textContent = 'Buscando endereço…';
        aviso.classList.add('info');

        try {
            // await = "espere a resposta chegar antes de seguir".
            const endereco = await buscarEnderecoPorCep(cep);

            if (!endereco) {
                marcarCampo('cep', 'CEP não encontrado. Confira os números ou preencha o endereço à mão.');
                return;
            }

            marcarCampo('cep', '');

            ['rua', 'bairro', 'cidade', 'uf'].forEach(function (id) {
                document.getElementById(id).value = endereco[id];
                marcarCampo(id, '');
            });

            // O que falta é o número: leva o cursor direto para lá.
            document.getElementById('numero').focus();

        } catch (erro) {
            ultimoCepBuscado = '';          // permite tentar de novo
            marcarCampo('cep', 'Não foi possível consultar o CEP agora. Preencha o endereço à mão.');
        }
    });
}


/* -------------------------------------------------------------
   FOTO DE PERFIL

   Uma foto de celular tem 3 MB ou mais, e o localStorage INTEIRO
   tem uns 5 MB. Por isso a foto é REDUZIDA antes de ser guardada:
   desenhamos numa tela (canvas) de 160×160 e exportamos em JPEG.
   Fica com uns 10 KB.
   ------------------------------------------------------------- */

function reduzirFoto(arquivo, tamanho) {
    // Promise = "um valor que vai chegar depois". Quem chama usa
    // await, igual ao fetch do CEP.
    return new Promise(function (resolver, rejeitar) {
        const leitor = new FileReader();

        leitor.onload = function () {
            const imagem = new Image();

            imagem.onload = function () {
                const tela = document.createElement('canvas');
                tela.width = tamanho;
                tela.height = tamanho;

                // Recorta o maior quadrado do centro da foto, para ela
                // não ficar esticada dentro do círculo.
                const lado = Math.min(imagem.width, imagem.height);
                const x = (imagem.width - lado) / 2;
                const y = (imagem.height - lado) / 2;

                tela.getContext('2d').drawImage(imagem, x, y, lado, lado, 0, 0, tamanho, tamanho);
                resolver(tela.toDataURL('image/jpeg', 0.85));
            };

            imagem.onerror = rejeitar;
            imagem.src = leitor.result;
        };

        leitor.onerror = rejeitar;
        leitor.readAsDataURL(arquivo);
    });
}


/* Liga um <input type="file"> a uma prévia redonda. Chama
   aoEscolher(dataURL) quando a foto está pronta. */
function ligarEscolhaDeFoto(idCampo, idPrevia, aoEscolher) {
    document.getElementById(idCampo).addEventListener('change', async function () {
        const arquivo = this.files[0];

        if (!arquivo) {
            return;
        }

        if (!arquivo.type.startsWith('image/')) {
            mostrarToast('Escolha um arquivo de imagem (JPG ou PNG).', 'erro');
            this.value = '';
            return;
        }

        try {
            const foto = await reduzirFoto(arquivo, 160);
            document.getElementById(idPrevia).style.backgroundImage = 'url("' + foto + '")';
            aoEscolher(foto);
        } catch (erro) {
            mostrarToast('Não foi possível ler essa imagem.', 'erro');
        }

        this.value = '';     // permite escolher o mesmo arquivo de novo
    });
}


/* Lê um campo já sem espaços nas pontas. */
function valorDe(id) {
    return document.getElementById(id).value.trim();
}


/* Junta os campos de dados num objeto, no formato do combinado
   do grupo (CPF e CEP só com dígitos; formata-se na exibição). */
function lerDadosDoFormulario() {
    return {
        nomeCompleto: valorDe('nome').replace(/\s+/g, ' '),
        email: valorDe('email').toLowerCase(),
        dataNascimento: valorDe('data-nascimento'),
        telefoneCelular: valorDe('telefone-celular'),
        telefoneFixo: valorDe('telefone-fixo'),
        cep: valorDe('cep').replace(/\D/g, ''),
        rua: valorDe('rua'),
        numero: valorDe('numero'),
        bairro: valorDe('bairro'),
        cidade: valorDe('cidade'),
        uf: valorDe('uf').toUpperCase()
    };
}
