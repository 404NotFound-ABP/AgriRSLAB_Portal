// ======================= CONFIG =======================

const API_PUBLIC_URL = 'http://localhost:3000/api/artigos/publicos';

function getFullUrl(path) {
    if (path && !path.startsWith('http')) {
        return `http://localhost:3000${path}`;
    }
    return path;
}

// ======================= CRIAR CARD =======================

function criarArtigoCard(artigo) {
    const card = document.createElement('div');
    card.className = 'publication-card article-card publicacao';

    const imagemUrl = getFullUrl(artigo.url_imagem);
    const pdfUrl = getFullUrl(artigo.link_pdf);

    card.innerHTML = `
        <div class="card-image-box">
            <img src="${imagemUrl}" alt="Capa do Artigo: ${artigo.titulo}" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem';">
        </div>
        <p class="card-title">${artigo.titulo}</p>
        <div class="card-links">
            <a href="${artigo.link_doi}" target="_blank" rel="noopener noreferrer" class="btn-card doi">
                DOI
            </a>
            <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" class="btn-card pdf">
                PDF
            </a>
        </div>
    `;
    return card;
}

// ======================= BUSCA INTERNA (LUPA + X) =======================

function ativarBuscaInterna() {
    const input = document.querySelector("#searchArtigos");
    const btnBuscar = document.querySelector("#btnBuscarArtigos");
    const btnLimpar = document.querySelector("#btnLimparBusca");

    if (!input || !btnBuscar || !btnLimpar) return;

    function filtrar() {
        const termo = input.value.trim().toLowerCase();
        const cards = document.querySelectorAll(".publicacao");

        cards.forEach(card => {
            const titulo = card.querySelector(".card-title")?.textContent.toLowerCase() || "";
            card.style.display = titulo.includes(termo) ? "flex" : "none";
        });

        // mostra botão X quando tem texto
        btnLimpar.style.display = termo.length > 0 ? "flex" : "none";
    }

    // filtra enquanto digita
    input.addEventListener("input", filtrar);

    // clique na lupa
    btnBuscar.addEventListener("click", filtrar);

    // enter
    input.addEventListener("keypress", e => {
        if (e.key === "Enter") filtrar();
    });

    // limpar busca
    btnLimpar.addEventListener("click", () => {
        input.value = "";
        btnLimpar.style.display = "none";

        const cards = document.querySelectorAll(".publicacao");
        cards.forEach(card => card.style.display = "flex");
    });
}

// ======================= ESCONDER TÍTULOS SEM CARD =======================

function esconderTitulosSemCard() {
    const sections = document.querySelectorAll('.publications-section');

    sections.forEach(section => {
        const titulo = section.querySelector('.titulo-secao');
        const cards = section.querySelectorAll('.publicacao');

        if (!titulo) return;

        // se não tiver nenhum card na seção, esconde o título
        if (cards.length === 0) {
            titulo.style.display = 'none';
        } else {
            titulo.style.display = '';
        }
    });
}

// ======================= CARREGAR ARTIGOS =======================

async function carregarArtigosPublicos() {

    const containers = {
        'Artigos': document.querySelector('.publications-section:nth-of-type(1) .cards-grid'),
        'Artigos de Conferência (AC)': document.querySelector('.publications-section:nth-of-type(2) .cards-grid'),
        'Capítulos de livros (CL)': document.querySelector('.publications-section:nth-of-type(3) .cards-grid'),
        'Notas Técnicas (NT)': document.querySelector('.publications-section:nth-of-type(4) .cards-grid'),
    };

    // mensagem de carregando
    Object.values(containers).forEach(container => {
        if (container) container.innerHTML = '<h2>Carregando...</h2>';
    });

    try {
        const response = await fetch(API_PUBLIC_URL);
        if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);

        const artigos = await response.json();

        // limpa containers
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        // distribui artigos nas seções
        artigos.forEach(artigo => {
            const nomeCategoria = artigo.categoria_nome;
            const chaveContainer = Object.keys(containers).find(
                key => key.toLowerCase() === nomeCategoria.toLowerCase()
            );

            if (chaveContainer && containers[chaveContainer]) {
                containers[chaveContainer].appendChild(criarArtigoCard(artigo));
            } else {
                console.warn(`Categoria sem container: "${nomeCategoria}"`);
            }
        });

        // depois de preencher, esconde títulos das seções que ficaram vazias
        esconderTitulosSemCard();

    } catch (error) {
        console.error('Erro ao carregar artigos:', error);
        const mainContent = document.querySelector('.publications-main-content');
        if (mainContent) {
            mainContent.innerHTML = '<h2>Erro ao carregar publicações.</h2>';
        }
    }

    // ativa a busca depois que os cards existem
    ativarBuscaInterna();
}

// ======================= INICIALIZAR =======================

document.addEventListener('DOMContentLoaded', carregarArtigosPublicos);
