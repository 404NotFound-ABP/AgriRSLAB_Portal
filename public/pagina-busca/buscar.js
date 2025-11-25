document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const termo = params.get("q")?.trim().toLowerCase();

    const info = document.getElementById("info");
    const resultados = document.getElementById("resultados");

    if (!termo) {
        info.textContent = "Nenhum termo inserido.";
        return;
    }

    info.textContent = `Buscando por: "${termo}"...`;

    try {
        const [noticias, artigos, membros, projetos, vagas] = await Promise.all([
            fetch("/api/noticias").then(r => r.json()).catch(() => []),
            fetch("/api/artigos/publicos").then(r => r.json()).catch(() => []),
            fetch("/api/membros/publicos").then(r => r.json()).catch(() => []),
            fetch("/api/projetos/publicos").then(r => r.json()).catch(() => []),
            fetch("/api/vagas").then(r => r.json()).catch(() => [])
        ]);

        let achados = [];

        achados.push(...filtrar(noticias, termo, "Notícia", "../pagina-noticias/noticias2.html?id="));
        achados.push(...filtrar(artigos, termo, "Artigo", "../pagina-artigos/artigos.html"));
        achados.push(...filtrar(membros, termo, "Membro", "../pagina-membros/membros.html"));
        achados.push(...filtrar(projetos, termo, "Projeto", "../pagina-projetos/projeto-detalhe.html?id="));
        achados.push(...filtrar(vagas, termo, "Vaga", "../pagina-vagas/vagas-candidatura.html?id="));

        if (achados.length === 0) {
            resultados.innerHTML = "<p>Nada encontrado.</p>";
            return;
        }

        // limpa resultados
        resultados.innerHTML = "";

        // agrupar por tipo
        const grupos = {
            "Notícia": [],
            "Artigo": [],
            "Projeto": [],
            "Vaga": [],
            "Membro": []
        };

        achados.forEach(item => grupos[item.tipo].push(item));

        // renderiza por grupo
        for (const tipo in grupos) {
            if (grupos[tipo].length === 0) continue;

            const bloco = document.createElement("div");
            bloco.className = "grupo-busca";

            bloco.innerHTML = `
                <h3 class="titulo-grupo">
                    <span class="icone-grupo">${icone(tipo)}</span>
                    ${tipo}s
                </h3>

                <div class="lista-cards">
                    ${grupos[tipo].map(item => `
                        <div class="resultado-card">
                            <a href="${item.link}" class="resultado-link">
                                ${item.titulo}
                            </a>
                        </div>
                    `).join("")}
                </div>
            `;

            resultados.appendChild(bloco);
        }

    } catch (erro) {
        console.error("Erro ao buscar:", erro);
        resultados.innerHTML = "<p>Erro ao buscar.</p>";
    }
});


// FUNÇÃO DE ÍCONES 
function icone(tipo) {
    const icones = {
        "Notícia": "📰",
        "Artigo": "📄",
        "Projeto": "🛰️",
        "Vaga": "💼",
        "Membro": "👤"
    };
    return icones[tipo] || "🔎";
}


// FUNÇÃO DE FILTRAR
// FUNÇÃO DE FILTRAR (Versão Corrigida)
function filtrar(lista, termo, tipo, linkBase) {
    if (!Array.isArray(lista)) return [];

    const palavras = termo.toLowerCase().split(" ").filter(p => p);

    return lista
        .filter(item => {
            const texto = `${item.titulo || item.nome} ${item.conteudo || item.descricao || item.texto || ""}`
                .toLowerCase();
            return palavras.every(p => texto.includes(p));
        })
        .map(item => {
            
            // Tratamento especial para Artigo e Membro (não usam ID no link)
            if (tipo === "Membro" || tipo === "Artigo") {
                return {
                    titulo: item.titulo || item.nome, // Usa item.nome para Membro
                    tipo,
                    link: linkBase 
                };
            }

            // Tratamento para Notícia, Projeto e Vaga (usar ID no link)
            let idParaLink;
            
            if (tipo === "Vaga") {
                // Vagas podem ter id ou vaga_id
                idParaLink = item.id || item.vaga_id; 
            } else {
                // Notícias e Projetos usam item.id
                idParaLink = item.id;
            }
            
            // Adiciona o ID ao linkBase
            return {
                titulo: item.titulo || item.nome,
                tipo,
                link: `${linkBase}${idParaLink}`
            };
        });
}