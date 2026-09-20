// ===== CARROSSEL DE EVENTOS =====
// Achar → Escutar → Mudar

// 1. ACHAR os elementos na página
const trilho = document.querySelector('.trilho-eventos');
const setaDireita = document.querySelector('.seta-direita');
const setaEsquerda = document.querySelector('.seta-esquerda');

// Quanto rolar por clique: largura de um card + o gap de 20px do CSS.
// É função, e não número fixo, porque o card tem 70% da largura do trilho —
// esse valor muda se a janela mudar de tamanho.
function passoDoCarrossel() {
    const card = trilho.querySelector('.card-evento');
    return card.offsetWidth + 20;
}

// 2. ESCUTAR o clique  /  3. MUDAR a posição
setaDireita.addEventListener('click', function () {
    trilho.scrollBy({ left: passoDoCarrossel() });
});

setaEsquerda.addEventListener('click', function () {
    trilho.scrollBy({ left: -passoDoCarrossel() });   // negativo = para trás
});