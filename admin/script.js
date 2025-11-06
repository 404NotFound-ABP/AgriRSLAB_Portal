// script.js

const API_BASE_URL = 'http://localhost:3000/api/artigos';
const artigosContainer = document.getElementById('container-artigos');

// Referências aos Modais e Botões
const modalCadastro = document.getElementById('modal-cadastro');
const modalAtualizacao = document.getElementById('modal-atualizacao');
const modalDelecao = document.getElementById('modal-delecao');

const btnAbrirCadastro = document.getElementById('btn-abrir-cadastro');
const formCadastro = document.getElementById('form-cadastro');
const formAtualizacao = document.getElementById('form-atualizacao');
const btnConfirmarDelecao = document.getElementById('btn-confirmar-delecao');

let artigoParaDeletarId = null; // Variável global para armazenar o ID a ser deletado

// ----------------------------------------------------------------------
// FUNÇÕES DE EXIBIÇÃO E RENDERIZAÇÃO
// ----------------------------------------------------------------------

/**
 * Converte o caminho de arquivo local (se for o caso) para a URL completa
 */
function getFullUrl(path) {
    // Se o caminho não começar com http (é um caminho local /uploads/), adiciona a base da API
    if (path && !path.startsWith('http')) {
        return `http://localhost:3000${path}`;
    }
    return path;
}

/**
 * Cria o HTML para um único card de artigo.
 * @param {Object} artigo - Os dados do artigo.
 */
function criarArtigoCard(artigo) {
    const card = document.createElement('div');
    // Adiciona uma classe 'oculto' se o artigo não for para exibir
    card.className = `artigo-card ${!artigo.exibir ? 'oculto' : ''}`;
    card.dataset.id = artigo.id; // Armazena o ID no elemento HTML

    const imagemUrl = getFullUrl(artigo.url_imagem);

    // Texto para o status de visibilidade
    const statusVisibilidade = artigo.exibir ? '<span class="status-visible">● Visível</span>' : '<span class="status-oculto">● Oculto</span>';

    // Formatação da data para exibição
    const dataFormatada = new Date(artigo.data_cadastro).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    card.innerHTML = `
        <img src="${imagemUrl}" alt="Capa do Artigo: ${artigo.titulo}" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem';">
        <div class="card-content">
            <h3>${artigo.titulo}</h3>
            <p><strong>Status:</strong> ${statusVisibilidade}</p>
            <p><strong>Categoria:</strong> ${artigo.categoria_nome || 'N/A'}</p>
            <p><strong>Cadastrado em:</strong> ${dataFormatada}</p>
            
            <div class="card-actions">
                <a href="${getFullUrl(artigo.link_pdf)}" target="_blank" class="btn-primary">
                    Baixar PDF
                </a>
                
                <a href="${artigo.link_doi}" target="_blank" class="btn-secondary">
                    Ver DOI
                </a>

                <button class="btn-secondary btn-abrir-atualizacao" 
                        data-id="${artigo.id}">
                    Atualizar
                </button>

                <button class="btn-danger btn-abrir-delecao" 
                        data-id="${artigo.id}" data-titulo="${artigo.titulo}">
                    Deletar
                </button>
            </div>
        </div>
    `;
    return card;
}

/**
 * Busca todos os artigos na API e os renderiza na página.
 */
async function carregarArtigos() {
    artigosContainer.innerHTML = '<h2>Carregando Artigos...</h2>';
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const artigos = await response.json();
        
        artigosContainer.innerHTML = ''; // Limpa o "Carregando..."
        
        if (artigos.length === 0) {
            artigosContainer.innerHTML = '<h2>Nenhum artigo encontrado. Cadastre o primeiro!</h2>';
            return;
        }

        artigos.forEach(artigo => {
            artigosContainer.appendChild(criarArtigoCard(artigo));
        });

        // Adiciona os event listeners aos novos botões de Atualizar e Deletar
        document.querySelectorAll('.btn-abrir-atualizacao').forEach(button => {
            button.addEventListener('click', abrirModalAtualizacao);
        });
        document.querySelectorAll('.btn-abrir-delecao').forEach(button => {
            button.addEventListener('click', abrirModalDelecao);
        });

    } catch (error) {
        console.error('Erro ao buscar artigos:', error);
        artigosContainer.innerHTML = '<h2>❌ Erro ao carregar artigos. Verifique se o Backend está rodando (npm start).</h2>';
    }
}


// ----------------------------------------------------------------------
// FUNÇÕES DE GERENCIAMENTO DE MODAIS
// ----------------------------------------------------------------------

function fecharModais() {
    modalCadastro.style.display = 'none';
    modalAtualizacao.style.display = 'none';
    modalDelecao.style.display = 'none';
}

// Abre o Modal de Cadastro
btnAbrirCadastro.onclick = () => {
    fecharModais();
    modalCadastro.style.display = 'flex'; // Alterado de 'block' para 'flex'
    formCadastro.reset(); // Limpa o formulário anterior
};

// Abre o Modal de Atualização
function abrirModalAtualizacao(event) {
    fecharModais();
    const artigoId = event.target.dataset.id;
    
    // 1. Encontra o card para obter os dados.
    const cardElement = document.querySelector(`.artigo-card[data-id='${artigoId}']`);
    const cardTitle = cardElement.querySelector('h3').textContent;
    
    // 2. Preenche os campos do formulário de atualização.
    const form = document.getElementById('form-atualizacao');
    form.querySelector('#edit-id').value = artigoId;
    form.querySelector('#edit-titulo').value = cardTitle;

    // 3. Preenche a categoria correta no select.
    const categoriaParagrafo = Array.from(cardElement.querySelectorAll('.card-content p')).find(p => p.textContent.includes('Categoria:'));
    const categoriaNome = categoriaParagrafo ? categoriaParagrafo.textContent.replace('Categoria: ', '').trim() : '';
    const selectCategoria = form.querySelector('#edit-id_categoria');
    const optionToSelect = Array.from(selectCategoria.options).find(opt => opt.text === categoriaNome);
    if (optionToSelect) {
        selectCategoria.value = optionToSelect.value;
    }

    const doiLink = cardElement.querySelector('a[href*="doi"]').href;
    const imgUrl = cardElement.querySelector('img').src;
    const pdfLink = cardElement.querySelector('.btn-primary').href; // Pega o link do botão "Baixar PDF"
    const isExibir = !cardElement.classList.contains('oculto'); // Verifica se o card está visível
    
    form.querySelector('#edit-link_doi').value = doiLink;
    form.querySelector('#edit-url_imagem_existente').value = imgUrl; // Guarda a URL existente
    form.querySelector('#edit-img-preview').src = imgUrl; // Exibe a imagem atual
    
    // Preenche os campos de input com os links/caminhos atuais
    // Se for um upload local, remove o 'http://localhost:3000' para mostrar apenas o caminho relativo
    const displayImgUrl = imgUrl.startsWith('http://localhost:3000') ? imgUrl.replace('http://localhost:3000', '') : imgUrl;

    // Limpa os campos de texto e de arquivo para uma nova atualização
    document.getElementById('edit-url_imagem_input').value = '';
    document.getElementById('edit-imagem_file_input').value = '';
    document.getElementById('edit-pdf_file_input').value = '';
    document.getElementById('edit-exibir').checked = isExibir; // Marca o switch
    
    modalAtualizacao.style.display = 'flex'; // Alterado de 'block' para 'flex'
}

// Abre o Modal de Deleção
function abrirModalDelecao(event) {
    fecharModais();
    artigoParaDeletarId = event.target.dataset.id;
    const titulo = event.target.dataset.titulo;
    
    document.getElementById('delete-titulo-confirm').textContent = titulo;
    modalDelecao.style.display = 'flex'; // Alterado de 'block' para 'flex'
}

// Fechar os modais ao clicar no 'x' ou fora da área
document.querySelectorAll('.close-button').forEach(span => {
    span.onclick = fecharModais;
});

window.onclick = (event) => {
    if (event.target === modalCadastro || event.target === modalAtualizacao || event.target === modalDelecao) {
        fecharModais();
    }
};

document.getElementById('btn-cancelar-delecao').onclick = fecharModais;


// ----------------------------------------------------------------------
// FUNÇÃO DE NOTIFICAÇÃO (TOAST)
// ----------------------------------------------------------------------

/**
 * Exibe uma notificação customizada na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de notificação ('success' ou 'error').
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('custom-toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.className = ''; // Limpa classes anteriores
    toast.classList.add(type); // Adiciona 'success' ou 'error'
    toast.classList.add('show');

    // Esconde a notificação após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ----------------------------------------------------------------------
// FUNÇÕES DE INTERAÇÃO COM A API (SUBMITs)
// ----------------------------------------------------------------------

/**
 * Função genérica para tratar o envio de formulários que incluem arquivos (multipart/form-data)
 * @param {FormData} formData - Os dados do formulário a serem enviados.
 * @param {string} method - Método HTTP ('POST' ou 'PUT').
 * @param {string} url - URL para a requisição.
 */
async function enviarFormularioComArquivos(formData, method, url) {
    try {
        const response = await fetch(url, {
            method: method,
            // Não defina o 'Content-Type': o navegador faz isso automaticamente para FormData,
            // garantindo a inclusão correta do boundary para os arquivos.
            body: formData, 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na API: ${errorData.mensagem || response.statusText}`);
        }

        // Se a operação foi bem sucedida (201 Created, 200 OK, 204 No Content)
        fecharModais();
        await carregarArtigos(); // Recarrega a lista para mostrar a atualização
        showToast(`Artigo ${method === 'POST' ? 'cadastrado' : 'atualizado'} com sucesso!`, 'success');
        
    } catch (error) {
        console.error('Erro ao processar formulário:', error);
        showToast(`Falha na operação: ${error.message}`, 'error');
    }
}


// Submissão do Formulário de Cadastro (POST)
formCadastro.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(formCadastro);
    
    // Lógica para Imagem: prioriza o upload de arquivo sobre a URL se ambos forem preenchidos
    const urlImagemInput = document.getElementById('url_imagem_input').value;
    const imagemFileInput = document.getElementById('imagem_file_input');
    
    if (imagemFileInput.files.length > 0) {
        // O arquivo já está no formData. Apenas remove o campo de URL.
        formData.delete('url_imagem_input'); 
    } else if (urlImagemInput) {
        // Se há URL, a adiciona como um campo de texto 'url_imagem'
        formData.append('url_imagem', urlImagemInput);
        formData.delete('imagem'); // Remove o campo de arquivo vazio
    } else {
        showToast('Você deve fornecer uma URL de imagem OU fazer upload de um arquivo.', 'error');
        return;
    }

    // Lógica para PDF: prioriza o upload de arquivo sobre a URL
    const linkPdfInput = document.getElementById('link_pdf_input').value;
    const pdfFileInput = document.getElementById('pdf_file_input');

    if (pdfFileInput.files.length > 0) {
        // O arquivo já está no formData. Remove o campo de URL.
        formData.delete('link_pdf_input'); // Garante que o campo de texto seja ignorado
    } else if (linkPdfInput) {
        // Se há URL, a adiciona como um campo de texto 'link_pdf'
        formData.append('link_pdf', linkPdfInput);
        formData.delete('pdf'); // Remove o campo de arquivo vazio
    } else { // Se nem arquivo nem URL foram fornecidos
        showToast('Você deve fornecer uma URL de PDF OU fazer upload de um arquivo.', 'error');
        return;
    }


    enviarFormularioComArquivos(formData, 'POST', API_BASE_URL);
});


// Submissão do Formulário de Atualização (PUT)
formAtualizacao.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const formData = new FormData(formAtualizacao);
    
    // --- Lógica de Imagem para Atualização ---
    const novaUrlImagemInput = document.getElementById('edit-url_imagem_input').value;
    const novaImagemFileInput = document.getElementById('edit-imagem_file_input');
    
    // Se um novo arquivo foi upado
    if (novaImagemFileInput.files.length > 0) {
        // O Multer no backend pegará este arquivo e salvará o novo caminho.
        formData.delete('edit-url_imagem_input'); 
    } 
    // Se uma nova URL foi digitada (e NÃO um arquivo upado)
    else if (novaUrlImagemInput) {
        formData.delete('imagem'); // Garante que o campo de arquivo vazio não seja enviado
        // O campo 'edit-url_imagem_input' já está no formData, então não precisamos fazer nada.
    }
    // Caso contrário (nenhum dos dois foi preenchido), o valor original
    // (armazenado em 'url_imagem_existente' no input hidden) será enviado.

    // O campo 'pdf' é opcional na atualização (o Multer lida com o caso de não haver arquivo).
    // --- Lógica de PDF para Atualização ---
    const novoLinkPdfInput = document.getElementById('edit-link_pdf_input').value;
    const novoPdfFileInput = document.getElementById('edit-pdf_file_input');

    if (novoPdfFileInput.files.length > 0) {
        // Se um novo arquivo de PDF foi enviado, removemos o campo de texto
        // para que o backend priorize o arquivo.
        formData.delete('link_pdf'); 
    }
    // Se nenhum arquivo novo foi enviado, o campo 'link_pdf' (que já contém o valor
    // existente) será enviado normalmente, e o backend saberá como preservá-lo.
    enviarFormularioComArquivos(formData, 'PUT', `${API_BASE_URL}/${id}`);
});


// Confirmação de Deleção (DELETE)
btnConfirmarDelecao.addEventListener('click', async () => {
    if (!artigoParaDeletarId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${artigoParaDeletarId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na API: ${errorData.mensagem || response.statusText}`);
        }

        // Sucesso na deleção
        fecharModais();
        await carregarArtigos();
        showToast('Artigo deletado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao deletar artigo:', error);
        showToast(`Falha ao deletar: ${error.message}`, 'error');
    }
});


// ----------------------------------------------------------------------
// LÓGICA DE PREVIEW DE IMAGEM
// ----------------------------------------------------------------------

function setupImagePreview(urlInputId, fileInputId, previewImgId) {
    const urlInput = document.getElementById(urlInputId);
    const fileInput = document.getElementById(fileInputId);
    const previewImg = document.getElementById(previewImgId);

    // Evento para quando o usuário cola uma URL
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        if (url) {
            previewImg.src = url;
            previewImg.style.display = 'block';
            fileInput.value = ''; // Limpa o input de arquivo se uma URL for digitada
        } else if (!fileInput.files.length) {
            previewImg.style.display = 'none';
        }
    });

    // Evento para quando o usuário seleciona um arquivo
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            };
            reader.readAsDataURL(fileInput.files[0]);
            urlInput.value = ''; // Limpa o input de URL se um arquivo for selecionado
        }
    });
}
// ----------------------------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------------------------

// Carrega os artigos assim que a página é carregada
document.addEventListener('DOMContentLoaded', carregarArtigos);

// Configura o preview de imagem para o modal de cadastro
setupImagePreview('url_imagem_input', 'imagem_file_input', 'cadastro-img-preview');

// Configura o preview de imagem para o modal de atualização
setupImagePreview('edit-url_imagem_input', 'edit-imagem_file_input', 'edit-img-preview');

// Aviso importante: 
// Para que a listagem funcione (carregarArtigos), você precisa ter ao menos
// 1. Uma categoria na tabela 'categoria_artigos' do seu PostgreSQL.
// 2. Um artigo cadastrado na tabela 'artigos' que use o ID dessa categoria.
// Ou então, cadastre um novo usando o modal!