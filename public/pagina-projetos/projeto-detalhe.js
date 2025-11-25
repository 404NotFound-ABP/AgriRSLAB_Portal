document.addEventListener('DOMContentLoaded', carregarProjeto);

async function carregarProjeto() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.querySelector('.detalhes_projetos').innerHTML =
            '<p>Projeto não encontrado.</p>';
        return;
    }

    try {
        const resposta = await fetch(`/api/projetos/${id}`);
        const projeto = await resposta.json();

        console.log("DETALHE CARREGADO:", projeto);

        if (!projeto || projeto.erro) {
            document.querySelector('.detalhes_projetos').innerHTML =
                '<p>Projeto não encontrado.</p>';
            return;
        }

        // Título do navegador
        document.getElementById('titulo-pagina').textContent = projeto.titulo;

        // Título
        document.getElementById('titulo').textContent = projeto.titulo;

        // Autores (pulando linha por quebra de vírgula)
        document.getElementById('autores').innerHTML =
            projeto.autores ? projeto.autores.replace(/,/g, '<br>') : 'Autores não informados';

        // Conteúdo
        document.getElementById('conteudo').innerHTML = projeto.conteudo;

        // Imagem
        if (projeto.url_imagem) {
            document.getElementById('imagem').src = projeto.url_imagem;
            document.getElementById('imagem').alt = projeto.titulo;
        } else {
            document.getElementById('imagem').style.display = 'none';
        }

    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
    }
}
