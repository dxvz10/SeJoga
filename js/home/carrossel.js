const trilho = document.querySelector('.trilho-eventos');
const setaDireita = document.querySelector('.seta-direita');
const setaEsquerda = document.querySelector('.seta-esquerda');
const cards = document.querySelectorAll('.card-evento');
const carrossel = document.querySelector('.carrossel-eventos');

let indiceAtual = 0;
let temporizador;
let esperandoParar;

function atualizarCarrosel() {
    cards.forEach(function(card, i) {
        card.classList.toggle('ativo', i === indiceAtual);
    });

    const card = cards[indiceAtual];
    const alvo = card.offsetLeft - (trilho.offsetWidth - card.offsetWidth) / 2;

    trilho.scrollTo({
        left: alvo,
        behavior: 'smooth'
    });
}

// ===== ROLAGEM AUTOMATICA =====

function avancarAutomatico() {
    indiceAtual = (indiceAtual + 1) % cards.length;
    atualizarCarrosel()
}

function iniciarAutomatico() {
    clearInterval(temporizador);
    temporizador = setInterval(avancarAutomatico, 5000);
}

function pararAutomatico() {
    clearInterval(temporizador);
}

function reiniciarAutomatico(){
    pararAutomatico();
    iniciarAutomatico();
}

// ===== EVENTOS =====

setaDireita.addEventListener('click', function() {
    indiceAtual = Math.min(indiceAtual + 1, cards.length -1);
    atualizarCarrosel();
    reiniciarAutomatico();
});

setaEsquerda.addEventListener('click', function() {
    indiceAtual = Math.max(indiceAtual -1, 0);
    atualizarCarrosel();
    reiniciarAutomatico();
});

atualizarCarrosel();

// ===== PAUSA ENQUANTO MOUSE/TECLADO ESTÁ NOS CARDS =====

carrossel.addEventListener('mouseenter', pararAutomatico);
carrossel.addEventListener('mouseleave', iniciarAutomatico);
carrossel.addEventListener('focusin', pararAutomatico);
carrossel.addEventListener('focusout', iniciarAutomatico);

// ===== CORRIGE SINCRONIZAÇÃO ENTRE CARDS =====

function sincronizarIndice() {
    const centroDoTrilho = trilho.scrollLeft + trilho.offsetWidth / 2;

    let maisPerto = 0;
    let menorDistancia = Infinity;

    cards.forEach(function (card, i) {
        const centroDoCard = card.offsetLeft + card.offsetWidth / 2;

        const distancia = Math.abs(centroDoCard - centroDoTrilho);

        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            maisPerto = i;
        }
    });

    if (maisPerto !== indiceAtual) {
        indiceAtual = maisPerto;
        
        cards.forEach(function (card, i) {
            card.classList.toggle('ativo', i === indiceAtual);
        });
    }
}

trilho.addEventListener('scroll', function () {
    clearTimeout(esperandoParar);
    esperandoParar = setTimeout(sincronizarIndice, 120);
});

atualizarCarrosel();
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    iniciarAutomatico();
}