// script.js

const API_PUBLIC_URL = 'http://localhost:3000/api/public-artigos';

/**
 * Converte o caminho de arquivo local (se for o caso) para a URL completa.
 * @param {string} path - O caminho da imagem ou PDF.
 * @returns {string} A URL completa.
 */
function getFullUrl(path) {
    if (path && !path.startsWith('http')) {
        return `http://localhost:3000${path}`;
    }
    return path;
}

/**
 * Cria o HTML para um único card de artigo.
 * @param {Object} artigo - Os dados do artigo.
 * @returns {HTMLElement} O elemento do card.
 */
function criarArtigoCard(artigo) {
    const card = document.createElement('div');
    // Mantém a estrutura de classes original da página de artigos
    card.className = 'publication-card article-card publicacao';

    const imagemUrl = getFullUrl(artigo.url_imagem);
    const pdfUrl = getFullUrl(artigo.link_pdf);

    card.innerHTML = `
        <div class="card-image-box">
            <img src="${imagemUrl}" alt="Capa do Artigo: ${artigo.titulo}" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem';">
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
/**
 * Busca os artigos públicos na API e os renderiza na página.
 */
async function carregarArtigosPublicos() {
    // Mapeia categorias do banco para os seletores CSS dos containers
    const containers = {
        'Artigos': document.querySelector('.publications-section:nth-of-type(1) .cards-grid'),
        'Artigos de Conferência (AC)': document.querySelector('.publications-section:nth-of-type(2) .cards-grid'),
        'Capítulos de livros (CL)': document.querySelector('.publications-section:nth-of-type(3) .cards-grid'),
        'Notas Técnicas (NT)': document.querySelector('.publications-section:nth-of-type(4) .cards-grid'),
    };

    // Limpa todos os containers antes de carregar
    Object.values(containers).forEach(container => {
        if (container) container.innerHTML = '<h2>Carregando...</h2>';
    });

    try {
        const response = await fetch(API_PUBLIC_URL);
        if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
        
        const artigos = await response.json();

        // Limpa o "Carregando..." de todos os containers
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        artigos.forEach(artigo => {
            // Procura pela chave do container de forma insensível a maiúsculas/minúsculas
            const nomeCategoria = artigo.categoria_nome;
            const chaveContainer = Object.keys(containers).find(
                key => key.toLowerCase() === nomeCategoria.toLowerCase()
            );

            if (chaveContainer) {
                const containerDestino = containers[chaveContainer];
                containerDestino.appendChild(criarArtigoCard(artigo));
            } else {
                console.warn(`Nenhum container encontrado para a categoria: "${nomeCategoria}"`);
            }
        });

    } catch (error) {
        console.error('Erro ao carregar artigos:', error);
        const mainContent = document.querySelector('.publications-main-content');
        if (mainContent) {
            mainContent.innerHTML = '<h2>❌ Erro ao carregar publicações. Verifique a conexão com o servidor.</h2>';
        }
    }
}

// Carrega os artigos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarArtigosPublicos);