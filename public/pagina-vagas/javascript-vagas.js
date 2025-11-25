// Scroll existente (mantém)
function scrollToSection() {
    document.getElementById("verMestrado").scrollIntoView({ behavior: "smooth" });
}

// Novo código que carrega vagas (necessário!)
document.addEventListener("DOMContentLoaded", carregarVagas);

async function carregarVagas() {
    const container = document.getElementById("lista-vagas");

    if (!container) {
        console.error("Elemento #lista-vagas não encontrado.");
        return;
    }

    try {
        const resposta = await fetch("/api/vagas/publicos");
        const vagas = await resposta.json();

        if (!vagas.length) {
            container.innerHTML = "<p>Nenhuma vaga disponível no momento.</p>";
            return;
        }

        container.innerHTML = "";

        vagas.forEach(vaga => {
            const card = document.createElement("div");
            card.classList.add("card-vagas");

            card.innerHTML = `
        <h4>${vaga.titulo}</h4>
        <p>${vaga.descricao.substring(0, 180)}...</p>

        <h5>Requisitos:</h5>
        <ul>
          ${vaga.requisitos.map(r => `<li>${r}</li>`).join("")}
        </ul>

        <h5>Benefícios:</h5>
        <ul>
          ${vaga.beneficios.map(b => `<li>${b}</li>`).join("")}
        </ul>

        <a href="../pagina-vagas/vagas-candidatura.html?id=${vaga.vaga_id}"
           class="btn-vagas btn-primary-vagas btn-sm-vagas">
           Candidatar-se
        </a>
      `;

            container.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar vagas:", erro);
        container.innerHTML = "<p>Erro ao carregar vagas.</p>";
    }
}
