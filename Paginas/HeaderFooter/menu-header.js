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


