// =========================================
// CONFIGURAÇÕES GLOBAIS
// =========================================
const ITENS_POR_PAGINA = 10;
let todasAsNoticias = [];       
let noticiasFiltradas = [];     
let itensVisiveis = 0;          
let ultimoMesRenderizado = '';  

// =========================================
// FUNÇÕES AUXILIARES
// =========================================
function formatarData(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
}

function getNomeMes(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
}

// =========================================
// INICIALIZAÇÃO
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const containerCompleto = document.getElementById('container-noticias-dinamicas'); 
    const containerDestaques = document.getElementById('cards-noticias'); 

    // PÁGINA "TODAS AS NOTÍCIAS" (notícias1)
    if (containerCompleto) {
        const filtroAno = document.getElementById("YearSelection");
        const filtroCategoria = document.getElementById("CategorySelection");
        const btnVerMais = document.querySelector(".btn-ver-mais");

        // Listeners
        if (filtroAno) filtroAno.addEventListener("change", () => aplicarFiltros(true));
        if (filtroCategoria) filtroCategoria.addEventListener("change", () => aplicarFiltros(true));
        if (btnVerMais) btnVerMais.addEventListener("click", carregarMaisNoticias);

        carregarTodasNoticias();
    } 
    // PÁGINA HOME
    else if (containerDestaques) {
        carregarDestaques();
        carregarDefesas();
        carregarEventosDoMes();
    }
    
    configurarCarrosseis();
    configurarCompartilhamento();
});

// =========================================
// LÓGICA PRINCIPAL (notícias1)
// =========================================
async function carregarTodasNoticias() {
    const container = document.getElementById('container-noticias-dinamicas');
    container.innerHTML = '<p class="loading">Carregando notícias...</p>';

    try {
        const response = await fetch('/api/noticias');
        if (!response.ok) throw new Error('Erro na API');
        
        // Armazena dados brutos
        todasAsNoticias = await response.json();
        
        // Aplica filtros e ordenação inicial
        aplicarFiltros(true);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="erro">Erro ao carregar notícias.</p>';
    }
}
function aplicarFiltros(resetar = false) {
    const filtroAnoEl = document.getElementById("YearSelection");
    const filtroCatEl = document.getElementById("CategorySelection");

    // Pega valores ou define padrões
    const filtroAno = filtroAnoEl ? filtroAnoEl.value : "todos"; // Assume "todos" se não houver filtro
    const filtroCategoria = filtroCatEl ? filtroCatEl.value : "todas";

    // 1. FILTRAGEM
    noticiasFiltradas = todasAsNoticias.filter(noticia => {
        if (!noticia.data_criacao) return false;
        
        const dataObj = new Date(noticia.data_criacao);
        const anoNoticia = dataObj.getUTCFullYear().toString();
        
        const catNoticia = noticia.categoria ? noticia.categoria.toLowerCase().trim() : '';
        const filtroCatValor = filtroCategoria.toLowerCase().trim();

        // Lógica flexível para "todos/todas"
        const anoValido = ["todos", "todas", "ano"].includes(filtroAno.toLowerCase());
        const matchAno = anoValido || (anoNoticia === filtroAno);
        
        const catValida = ["todos", "todas", "categoria"].includes(filtroCatValor);
        const matchCat = catValida || (catNoticia === filtroCatValor);

        return matchAno && matchCat;
    });

    // 2. ORDENAÇÃO ESPECÍFICA (Janeiro -> Dezembro)
    // Isso resolve "Novembro antes de Janeiro"
    noticiasFiltradas.sort((a, b) => {
        const dataA = new Date(a.data_criacao);
        const dataB = new Date(b.data_criacao);
        const mesDiff = dataA.getMonth() - dataB.getMonth();
        
        if (mesDiff !== 0) {
            return mesDiff; // Retorna ordem crescente de mês (Jan antes de Fev)
        }
        
        // Se for o mesmo mês (ex: Jan 2025 e Jan 2024), mostra o ano mais recente primeiro
        return dataB.getFullYear() - dataA.getFullYear();
    });

    // 3. RESET VISUAL
    if (resetar) {
        itensVisiveis = 0;
        document.getElementById('container-noticias-dinamicas').innerHTML = ''; 
        ultimoMesRenderizado = ''; 
    }

    carregarMaisNoticias();
}
// =========================================
// LÓGICA: PÁGINA HOME
// =========================================
async function carregarDestaques() {
    const container = document.getElementById('cards-noticias');
    const btnVerTodasOriginal = container.querySelector('.ver-todas');
    container.innerHTML = '<p>Carregando destaques...</p>';

    try {
        const response = await fetch('/api/noticias/destaques'); 
        if (!response.ok) throw new Error('Erro API Destaques');
        
        const destaques = await response.json();
        container.innerHTML = ''; 

        destaques.slice(0, 3).forEach(noticia => {

            const dataFormatada = new Date(noticia.data_criacao).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'short', year: 'numeric'
            }).toUpperCase().replace('.', '').replace(/ DE /g, ' ');

            const html = `
                <a href="${noticia.url_noticia || '#'}" class="card-destaque-link">
                    <div class="card-noticia">
                        <img src="${noticia.url_imagem}" alt="${noticia.titulo}" onerror="this.style.display='none'">
                        <div class="texto">
                            <h3>${noticia.titulo}</h3>
                            <p>${noticia.subtitulo || ''}</p>
                            <span>${dataFormatada}</span>
                            <p class="continuar-lendo">Ler mais</p>
                        </div>
                    </div>
                </a>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        if (btnVerTodasOriginal) container.appendChild(btnVerTodasOriginal);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Não foi possível carregar os destaques.</p>';
    }
}
async function carregarDefesas() {
    const container = document.querySelector('.cards-defesas');
    if (!container) return; // Se não estiver na página home, não faz nada

    container.innerHTML = '<p style="padding: 20px; color: #555; width: 100%; text-align: center;">Carregando defesas...</p>';

    try {
        const response = await fetch('/api/noticias/defesas');
        if (!response.ok) throw new Error('Erro API Defesas');
        
        const defesas = await response.json();
        container.innerHTML = ''; // Limpa o "carregando"

        if (defesas.length === 0) {
            container.innerHTML = '<p style="padding: 20px; color: #555; width: 100%; text-align: center;">Nenhuma defesa agendada no momento.</p>';
            return;
        }

        defesas.forEach(defesa => {
            // Este HTML é baseado nos cards estáticos que estavam em noticias.html
            const htmlCard = `
                <div class="card-defesa">
                    <img src="${defesa.url_imagem}" alt="${defesa.titulo}" onerror="this.src='../../imagens/1.1Imagens Git/logo_404notfound.png'">
                    <h3>${defesa.titulo}</h3>
                    <p>${defesa.subtitulo || ''}</p>
                    <span>${formatarData(defesa.data_criacao)}</span>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', htmlCard);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="padding: 20px; color: red; width: 100%; text-align: center;">Erro ao carregar defesas.</p>';
    }
}
async function carregarEventosDoMes() {
    const container = document.querySelector('.conteudo-linha');
    if (!container) return; // Só roda na página noticias.html

    container.innerHTML = '<p style="padding: 20px; color: #555; width: 100%; text-align: center;">Carregando eventos...</p>';

    try {
        const response = await fetch('/api/noticias/eventos');
        if (!response.ok) throw new Error('Erro API Eventos');
        
        const eventos = await response.json();
        container.innerHTML = ''; // Limpa o "carregando"

        if (eventos.length === 0) {
            container.innerHTML = '<p style="padding: 20px; color: #555; width: 100%; text-align: center;">Nenhum evento este mês.</p>';
            return;
        }

        eventos.forEach(evento => {
            // Recria o HTML estático com dados dinâmicos
            const htmlEvento = `

                <div class="evento">
                            <div class="data">
                                <span class="dia">${formatarDataEventoDIA(evento.data_criacao)}</span>
                                <span class="mes">${formatarDataEventoMES(evento.data_criacao)}</span>
                            </div>
                            <div class="info">
                                <h3>${evento.titulo}</h3>
                                <p>${evento.subtitulo}</p>
                            </div>
                        </div>
            `;
            container.insertAdjacentHTML('beforeend', htmlEvento);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="padding: 20px; color: red; width: 100%; text-align: center;">Erro ao carregar eventos.</p>';
    }
}
// =========================================
// FUNÇÕES Página notícias 1
// =========================================
function carregarMaisNoticias() {
    const container = document.getElementById('container-noticias-dinamicas');
    const btnContainer = document.querySelector(".ver-todas");

    if (noticiasFiltradas.length === 0) {
        container.innerHTML = '<p class="aviso">Nenhuma notícia encontrada.</p>';
        if (btnContainer) btnContainer.style.display = 'none';
        return;
    }

    // Paginação: pega o próximo bloco
    const proximoLote = noticiasFiltradas.slice(itensVisiveis, itensVisiveis + ITENS_POR_PAGINA);

    proximoLote.forEach(noticia => {
        const dataNoticia = noticia.data_criacao; 
        const nomeMes = getNomeMes(dataNoticia);
        
        //AGRUPAMENTO:
        const chaveMes = nomeMes;

        if (chaveMes !== ultimoMesRenderizado) {
            const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
            container.insertAdjacentHTML('beforeend', 
                `<h2 class="titulo-mes">${nomeMesCap}</h2>`
            );
            ultimoMesRenderizado = chaveMes;
        }

        // HTML do Card
        const html = `
            <a href="${noticia.url_noticia || '#'}" class="link-card">
                <div class="card-noticia">
                    <img class="imageNotice" src="${noticia.url_imagem}" onerror="this.style.display='none'" alt="${noticia.titulo}">
                    <div class="texto">
                        <span class="tagEvent">${noticia.categoria || 'Geral'}</span>
                        <h3>${noticia.titulo}</h3>
                        <p>${noticia.texto ? noticia.texto.substring(0, 120) + '...' : ''}</p>
                        <span class="dateEvent">
                            <time datetime="${dataNoticia}">${formatarData(dataNoticia)}</time>
                        </span>
                        <p class="continuar-lendo">Ler mais</p>
                    </div>
                </div>
            </a>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    itensVisiveis += proximoLote.length;

    // Controla visibilidade do botão
    if (itensVisiveis >= noticiasFiltradas.length) {
        if (btnContainer) btnContainer.style.display = 'none';
    } else {
        if (btnContainer) btnContainer.style.display = 'block';
    }
}
// =========================================
// FUNÇÕES GERAIS
// =========================================
function configurarCarrosseis() {
    const cardsDefesas = document.querySelector('.cards-defesas');
    if (cardsDefesas) {
        document.querySelector('.seta-direita')?.addEventListener('click', () => {
            cardsDefesas.scrollBy({ left: 200, behavior: 'smooth' });
        });
        document.querySelector('.seta-esquerda')?.addEventListener('click', () => {
            cardsDefesas.scrollBy({ left: -200, behavior: 'smooth' });
        });
    }

    const conteudoLinha = document.querySelector('.conteudo-linha');
    if (conteudoLinha) {
        document.querySelector('.seta-baixo')?.addEventListener('click', () => {
            conteudoLinha.scrollBy({ top: 100, behavior: 'smooth' });
        });
        document.querySelector('.seta-cima')?.addEventListener('click', () => {
            conteudoLinha.scrollBy({ top: -100, behavior: 'smooth' });
        });
    }
}

function configurarCompartilhamento() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    const setHref = (id, link) => {
        const el = document.getElementById(id);
        if (el) el.href = link;
    };

    setHref("shareWhatsApp", `https://api.whatsapp.com/send?text=${title}%20${url}`);
    setHref("shareEmail", `mailto:?subject=${title}&body=Veja%20essa%20matéria:%20${url}`);
    setHref("shareLinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
}

function formatarDataEventoDIA(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    // Pega a abreviação do mês (ex: SET, OUT, NOV)
    const mes = data.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');
    return `${dia}`;
}

function formatarDataEventoMES(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    // Pega a abreviação do mês (ex: SET, OUT, NOV)
    const mes = data.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', '');
    return `${mes}`;
}


