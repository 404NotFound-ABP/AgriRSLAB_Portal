
function showMessage(msgContainer, message, type) {
    msgContainer.textContent = message;
    // As classes 'form-message', 'success' e 'error' estão definidas no CSS
    msgContainer.className = `form-message ${type}`;
    msgContainer.style.display = 'block';
    // Oculta a mensagem após 5 segundos
    setTimeout(() => { msgContainer.style.display = 'none'; }, 5000); 
}

const customAlert = (msgContainer, message, isError = false) => {
    showMessage(msgContainer, message, isError ? 'error' : 'success');
};


// =====================================================================
// 1. CARREGAR DADOS DA VAGA (Do URL e do Backend)
// =====================================================================
async function carregarVaga() {
    const params = new URLSearchParams(window.location.search);
    // Pega o ID da vaga a ser carregada
    const id = params.get("id"); 

    if (!id) {
        console.error("ID da vaga não encontrado na URL.");
        // Exibe uma mensagem de erro na área principal
        document.querySelector(".vacancy-canditadura").innerHTML =
            "<p>Erro: ID da vaga não fornecido na URL.</p>";
        return;
    }

    try {
        const resposta = await fetch(`/api/vagas/${id}`);
        // Verifica se a resposta foi HTTP 404/500, etc.
        if (!resposta.ok) {
             throw new Error(`Erro HTTP ${resposta.status}`);
        }
        
        const vaga = await resposta.json();

        if (!vaga || vaga.mensagem === "Vaga não encontrada.") {
            document.querySelector(".vacancy-canditadura").innerHTML =
                "<p>Vaga não encontrada.</p>";
            return;
        }

        // 🛑 PREENCHIMENTO DOS DADOS (Requisitos e Benefícios devem ser arrays de strings)
        document.getElementById("vaga-titulo").textContent = vaga.titulo;
        document.getElementById("vaga-descricao").textContent = vaga.descricao;

        // Mapeia array de requisitos (que vem como array de strings do backend)
        if (Array.isArray(vaga.requisitos)) {
             document.getElementById("vaga-requisitos").innerHTML =
                vaga.requisitos.map(req => `<li>${req}</li>`).join("");
        } else {
             document.getElementById("vaga-requisitos").innerHTML = "<li>Requisitos não listados.</li>";
        }
        
        // Mapeia array de benefícios
        if (Array.isArray(vaga.beneficios)) {
            document.getElementById("vaga-beneficios").innerHTML =
                vaga.beneficios.map(b => `<li>${b}</li>`).join("");
        } else {
             document.getElementById("vaga-beneficios").innerHTML = "<li>Benefícios não listados.</li>";
        }

    } catch (erro) {
        console.error("Erro ao carregar vaga:", erro);
        document.querySelector(".vacancy-canditadura").innerHTML =
            "<p>Erro ao carregar detalhes da vaga. Verifique a conexão com o servidor.</p>";
    }
}


// =====================================================================
// 2. INICIALIZAR LÓGICA DO FORMULÁRIO (Configura o Spinner)
// =====================================================================
function inicializarFormulario() {
    const form = document.getElementById("form-candidatura"); // ID do formulário em vagas-candidatura.html
    const btnSubmit = document.getElementById("btn-candidatura-submit");
    const msgContainer = document.getElementById("candidatura-message");
    
    if (!form || !btnSubmit || !msgContainer) {
        console.warn("Elementos do formulário (botão/msgContainer) não encontrados. O envio não será configurado.");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        
        // Validação básica do lado do cliente
        const nome = formData.get('nome')?.trim();
        const email = formData.get('email')?.trim();
        
        msgContainer.style.display = 'none'; 

        if (!nome || !email) {
            customAlert(msgContainer, "Por favor, preencha nome e e-mail.", true);
            return;
        }

        // 1. 🛑 INÍCIO DO LOADING: Adiciona a classe 'loading' no botão
        btnSubmit.classList.add('loading');

        try {
            // Requisição de envio do formulário (adaptada para lidar com FormData)
            const resposta = await fetch("/api/email/candidatura", {
                method: "POST",
                body: formData // Envia FormData diretamente, incluindo o arquivo CV
            });

            const dados = await resposta.json().catch(() => ({}));

            if (resposta.ok) {
                customAlert(msgContainer, dados.mensagem || "Candidatura enviada com sucesso!", false);
                form.reset();
            } else {
                customAlert(
                    msgContainer,
                    dados.mensagem ||
                    "Ocorreu um erro ao enviar sua candidatura. Tente novamente mais tarde.", 
                    true
                );
            }
        } catch (erro) {
            console.error("Erro ao enviar candidatura:", erro);
            customAlert(
                msgContainer,
                "Não foi possível enviar sua candidatura no momento. Verifique sua conexão e tente novamente.", 
                true
            );
        } finally {
            btnSubmit.classList.remove('loading');
        }
    });
  }
function inicializarPagina() {
    // Carrega os dados da vaga (async)
    carregarVaga(); 
    
    // Configura os listeners do formulário (sync)
    inicializarFormulario(); 
}
document.addEventListener("DOMContentLoaded", inicializarPagina);
