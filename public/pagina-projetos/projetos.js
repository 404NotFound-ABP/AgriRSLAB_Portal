document.addEventListener('DOMContentLoaded', () => {
    carregarProjetos();
    configurarFiltros();
});

async function carregarProjetos() {
    try {
        const resposta = await fetch('/api/projetos/publicos');
        const projetos = await resposta.json();

        // salva para filtros
        window.todosProjetos = projetos;

        renderizarProjetos(projetos);

    } catch (erro) {
        console.error("Erro ao carregar projetos:", erro);
    }
}

// ===============================================
// RENDERIZA LISTA 
// ===============================================



function renderizarProjetos(lista) {

    lista.sort((a, b) => {
        if (a.destaque === b.destaque) return 0;
        return a.destaque ? -1 : 1;
    });

    const container = document.getElementById('lista-projetos');
    const mensagem = document.getElementById('mensagem');

    if (!container) return;

    container.innerHTML = '';

    if (!lista || lista.length === 0) {
        mensagem.style.display = 'block';
        return;
    }

    mensagem.style.display = 'none';

    lista.forEach((proj, index) => {

        // destaque = primeiro item
        const destaqueClasse = proj.destaque ? 'item-destaque' : '';

        const a = document.createElement('a');
        a.href = `projeto-detalhe.html?id=${proj.id}`;
        a.className = `item-galeria ${destaqueClasse} ${proj.fase || ''}`;

        a.innerHTML = `
            <img src="${proj.url_imagem}" alt="${proj.titulo}">
            <div class="overlay-texto">${proj.titulo}</div>
        `;

        container.appendChild(a);
    });
}

// ===============================================
// FILTROS 
// ===============================================
function configurarFiltros() {
    const botoes = document.querySelectorAll('.botao-filtro');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            const filtro = botao.getAttribute('data-filtro');

            if (filtro === 'todos') {
                renderizarProjetos(window.todosProjetos);
                return;
            }

            const filtrados = window.todosProjetos.filter(
                proj => proj.fase === filtro
            );

            renderizarProjetos(filtrados);
        });
    });
}
