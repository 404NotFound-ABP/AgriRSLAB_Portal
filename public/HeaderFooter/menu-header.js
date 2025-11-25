document.addEventListener("DOMContentLoaded", () => {
  // === CARREGAR HEADER ===
  fetch("../HeaderFooter/header.html")
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar o header");
      return response.text();
    })
    .then(data => {
      document.querySelector("header").innerHTML = data;

      // Só executa o controle do menu depois do header existir
      inicializarMenuHamburguer();
      inicializarBuscaGlobal();

    })
    .catch(error => console.error("Erro ao carregar header:", error));

  // === CARREGAR FOOTER ===
 fetch("../HeaderFooter/footer.html")
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar o footer");
      return response.text();
    })
    .then(data => {
      document.querySelector("footer").innerHTML = data;

      // === INSERIR ANO AUTOMÁTICO ===
      const anoElemento = document.getElementById("ano");
      if (anoElemento) {
        anoElemento.textContent = new Date().getFullYear();
      }
    })
    .catch(error => console.error("Erro ao carregar footer:", error));
});

// === FUNÇÃO PARA CONTROLAR O MENU ===
function inicializarMenuHamburguer() {
  const hamburguer = document.getElementById("hamburguer");
  const menu = document.querySelector(".ulNav");

  if (!hamburguer || !menu) {
    console.warn("Elementos do menu não encontrados no header.");
    return;
  }

  hamburguer.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("active");
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener("click", (event) => {
    const cliqueDentroMenu = menu.contains(event.target);
    const cliqueNoHamburguer = hamburguer.contains(event.target);
    if (!cliqueDentroMenu && !cliqueNoHamburguer) {
      menu.classList.remove("active");
    }
  });
}

// === ATIVAR BUSCA GLOBAL ===
function inicializarBuscaGlobal() {
  const input = document.getElementById("search");
  const botao = document.getElementById("searchBtn");

  if (!input || !botao) {
    console.warn("Campo de busca não encontrado no header.");
    return;
  }

  // Quando tecla Enter
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executarBusca();
  });

  // Quando clica no botão
  botao.addEventListener("click", executarBusca);

  function executarBusca() {
    const termo = input.value.trim();
    if (termo) {
      window.location.href = `/pagina-busca/buscar.html?q=${encodeURIComponent(termo)}`;
    }
  }
}
