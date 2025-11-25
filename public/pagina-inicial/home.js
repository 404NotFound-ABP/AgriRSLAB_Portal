document.addEventListener('DOMContentLoaded', () => {
    carregarProjetoDestaque();
    carregarNoticiasHome();
});

async function carregarProjetoDestaque() {
    const card = document.getElementById('projeto-destaque');
    const imagem = document.getElementById('projeto-destaque-imagem');
    const titulo = document.getElementById('projeto-destaque-titulo');
    const descricao = document.getElementById('projeto-destaque-descricao');
    const mensagem = document.getElementById('projeto-mensagem');

    if (!card || !imagem || !titulo || !descricao) return;

    setEstado(mensagem, 'Carregando projeto em destaque...');

    try {
        const resposta = await fetch('/api/projetos/publicos-com-destaque');
        if (!resposta.ok) throw new Error('Erro ao buscar projetos');

        const dados = await resposta.json();
        const projeto = (dados && dados.destaque) || (dados && dados.outros && dados.outros[0]);

        if (!projeto) {
            ocultarElemento(card);
            setEstado(mensagem, 'Nenhum projeto publicado no momento.');
            return;
        }

        titulo.textContent = projeto.titulo || 'Projeto sem título';
        descricao.textContent = resumirTexto(projeto.conteudo || '', 220);
        aplicarImagem(imagem, projeto.url_imagem);
        imagem.alt = projeto.titulo || 'Projeto em destaque';

        card.href = `../pagina-projetos/projeto-detalhe.html?id=${projeto.id}`;
        card.style.display = 'block';
        setEstado(mensagem, '');
    } catch (erro) {
        console.error('Erro ao carregar projeto em destaque:', erro);
        ocultarElemento(card);
        setEstado(mensagem, 'Não foi possível carregar o projeto em destaque agora.');
    }
}

async function carregarNoticiasHome() {
    const principalCard = document.getElementById('noticia-principal');
    const principalImagem = document.getElementById('noticia-principal-imagem');
    const principalTitulo = document.getElementById('noticia-principal-titulo');
    const principalSubtitulo = document.getElementById('noticia-principal-subtitulo');
    const principalData = document.getElementById('noticia-principal-data');
    const principalLink = document.getElementById('noticia-principal-link');
    const secundarias = document.getElementById('noticias-secundarias');
    const mensagem = document.getElementById('noticias-mensagem');

    if (!principalCard || !secundarias) return;

    setEstado(mensagem, 'Carregando notícias...');
    secundarias.innerHTML = '<p class="estado-informativo">Carregando notícias...</p>';

    try {
        const noticias = await buscarNoticiasParaHome();

        if (!Array.isArray(noticias) || noticias.length === 0) {
            ocultarElemento(principalCard);
            secundarias.innerHTML = '<p class="estado-informativo">Nenhuma notícia publicada no momento.</p>';
            setEstado(mensagem, '');
            return;
        }

        const [principal, ...resto] = noticias;

        preencherNoticiaPrincipal(principal, {
            card: principalCard,
            imagem: principalImagem,
            titulo: principalTitulo,
            subtitulo: principalSubtitulo,
            data: principalData,
            link: principalLink
        });

        preencherNoticiasSecundarias(resto.slice(0, 2), secundarias);
        setEstado(mensagem, '');
    } catch (erro) {
        console.error('Erro ao carregar notícias da home:', erro);
        ocultarElemento(principalCard);
        secundarias.innerHTML = '';
        setEstado(mensagem, 'Não foi possível carregar as notícias agora.');
    }
}

function preencherNoticiaPrincipal(noticia, refs) {
    const { card, imagem, titulo, subtitulo, data, link } = refs;

    titulo.textContent = (noticia && noticia.titulo) || 'Notícia sem título';
    subtitulo.textContent = resumirTexto(
        (noticia && (noticia.subtitulo || noticia.texto)) || '',
        240
    );

    aplicarImagem(imagem, noticia && noticia.url_imagem);
    if (imagem) imagem.alt = (noticia && noticia.titulo) || 'Notícia principal';

    if (data) {
        data.textContent = formatarData(noticia && noticia.data_criacao);
        data.dateTime = (noticia && noticia.data_criacao) || '';
    }

    if (link) {
        link.href = (noticia && noticia.url_noticia) || '../pagina-noticias/noticias.html';
    }

    if (card) card.style.display = 'flex';
}

function preencherNoticiasSecundarias(lista, container) {
    container.innerHTML = '';

    if (!lista || lista.length === 0) {
        container.innerHTML = '<p class="estado-informativo">Nenhuma outra notícia por aqui ainda.</p>';
        return;
    }

    lista.forEach((noticia) => {
        const link = document.createElement('a');
        link.className = 'card-noticia-link';
        link.href = (noticia && noticia.url_noticia) || '../pagina-noticias/noticias.html';

        link.innerHTML = `
            <div class="card-noticia">
                <img src="${(noticia && noticia.url_imagem) || ''}" alt="${(noticia && noticia.titulo) || 'Notícia'}">
                <div class="texto">
                    <h3>${(noticia && noticia.titulo) || 'Notícia sem título'}</h3>
                    <p>${resumirTexto((noticia && (noticia.subtitulo || noticia.texto)) || '', 140)}</p>
                    <div class="noticia-principal-footer">
                        <span class="dateEvent"><time>${formatarData(noticia && noticia.data_criacao)}</time></span>
                        <span class="continuar-lendo">Leia mais</span>
                    </div>
                </div>
            </div>
        `;

        const img = link.querySelector('img');
        aplicarImagem(img, noticia && noticia.url_imagem);

        container.appendChild(link);
    });
}

async function buscarNoticiasParaHome() {
    try {
        const respostaDestaques = await fetch('/api/noticias/destaques');
        if (respostaDestaques.ok) {
            const destaques = await respostaDestaques.json();
            if (Array.isArray(destaques) && destaques.length > 0) {
                return destaques;
            }
        }
    } catch (erro) {
        console.warn('Falha ao carregar destaques, buscando todas as notícias.', erro);
    }

    const respostaTodas = await fetch('/api/noticias');
    if (!respostaTodas.ok) throw new Error('Erro ao buscar notícias');
    return respostaTodas.json();
}

function resumirTexto(texto, limite) {
    const limpo = limparTexto(texto);
    if (limpo.length <= limite) return limpo;
    return `${limpo.slice(0, limite).trim()}...`;
}

function limparTexto(texto) {
    if (!texto) return '';
    return texto.replace(/<[^>]*>?/gm, '').trim();
}

function formatarData(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    if (Number.isNaN(data.getTime())) return '';
    return data.toLocaleDateString('pt-BR');
}

function aplicarImagem(imgEl, url) {
    if (!imgEl) return;
    if (!url) {
        imgEl.style.display = 'none';
        imgEl.removeAttribute('src');
        return;
    }
    imgEl.style.display = 'block';
    imgEl.src = url;
    imgEl.onerror = () => {
        imgEl.style.display = 'none';
    };
}

function setEstado(elemento, texto) {
    if (!elemento) return;
    elemento.textContent = texto || '';
    elemento.style.display = texto ? 'block' : 'none';
}

function ocultarElemento(el) {
    if (el) el.style.display = 'none';
}
