/* =============================================================
   SEJOGA — ARMAZENAMENTO (localStorage)

   O projeto não tem servidor: o "banco de dados" é o
   localStorage do navegador. Este arquivo concentra as chaves
   e o jeito de ler e gravar, para nenhuma página inventar o
   próprio formato.

   Carregado PRIMEIRO em todas as páginas — os outros arquivos
   usam estas funções.
   ============================================================= */

const CHAVES = {
    usuarios: 'portalEventos_usuarios',        // lista de contas cadastradas
    sessao: 'portalEventos_sessao',            // quem está logado agora
    eventos: 'portalEventos_eventos',          // lista de eventos
    meusEventos: 'portalEventos_meusEventos',  // agenda de cada usuário
    notificacoesVistas: 'portalEventos_notificacoesVistas',
    preferencias: 'portalEventos_preferencias',
    versaoSemente: 'portalEventos_versaoSemente'
};


/* localStorage só guarda TEXTO. Para guardar listas e objetos,
   JSON.stringify transforma em texto na ida e JSON.parse
   transforma de volta na volta.

   O try/catch existe porque um texto corrompido faria o
   JSON.parse quebrar o arquivo inteiro. Com ele, o pior caso é
   receber a "reserva" (um valor padrão seguro). */
function lerDoArmazenamento(chave, reserva) {
    const bruto = localStorage.getItem(chave);

    if (bruto === null) {
        return reserva;
    }

    try {
        return JSON.parse(bruto);
    } catch (erro) {
        return reserva;
    }
}


function gravarNoArmazenamento(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch (erro) {
        /* O localStorage tem limite (uns 5 MB por site). Uma foto
           grande demais estoura esse limite e o setItem lança um
           erro — sem o try, a página inteira pararia. */
        return false;
    }
}


function apagarDoArmazenamento(chave) {
    localStorage.removeItem(chave);
}
