document.addEventListener("DOMContentLoaded", () => {
  // === COMPARTILHAMENTO DE NOTÍCIAS ===
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);

  const shareWhatsApp = document.getElementById("shareWhatsApp");
  const shareEmail = document.getElementById("shareEmail");
  const shareLinkedIn = document.getElementById("shareLinkedIn");

  if (shareWhatsApp) shareWhatsApp.href = `https://api.whatsapp.com/send?text=${title}%20${url}`;
  if (shareEmail) shareEmail.href = `mailto:?subject=${title}&body=Veja%20essa%20matéria:%20${url}`;
  if (shareLinkedIn) shareLinkedIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;

  // === ELEMENTOS ===
  const btnVerMais = document.querySelector(".btn-ver-mais");
  const cards = document.querySelectorAll(".cards-noticias a");
  const containerNoticias = document.querySelector(".cards-noticias");
  const filtroAno = document.getElementById("YearSelection");
  const filtroCategoria = document.getElementById("CategorySelection");
  const meses = document.querySelectorAll(".titulo-mes");

  // === ORGANIZAÇÃO DOS FILTROS ===
  const filtrosLinha = document.createElement("div");
  filtrosLinha.classList.add("filtros-linha");

  const filtrosContainer = filtroAno.closest(".filtros-superiores");
  filtrosContainer.prepend(filtrosLinha);

  // Move os filtros (Categoria e Ano) para a nova linha
  document.querySelectorAll(".filterCategorySelection, .filterYearSelection")
    .forEach(f => filtrosLinha.appendChild(f));

// === BOTÃO LIMPAR FILTRO ===
const btnLimpar = document.createElement("button");
btnLimpar.textContent = "Limpar filtro";
btnLimpar.classList.add("btn-limpar-filtro");
btnLimpar.style.display = "none";

const containerBtnLimpar = document.createElement("div");
containerBtnLimpar.classList.add("container-btn-limpar");

// Aqui muda: adiciona o botão DEPOIS da linha dos filtros
filtrosLinha.after(containerBtnLimpar);
containerBtnLimpar.appendChild(btnLimpar);


  // === CONFIGURAÇÕES ===
  const qtdInicio = 4;
  const passo = 4;
  let index = qtdInicio;

  // === MENSAGEM DE NENHUM REGISTRO ===
  const msgNenhum = document.createElement("p");
  msgNenhum.textContent = "Nenhum registro encontrado.";
  msgNenhum.classList.add("mensagem-nenhum");
  msgNenhum.style.display = "none";
  containerNoticias.parentElement.insertBefore(msgNenhum, containerNoticias.nextSibling);

  // === ESTADO INICIAL ===
  function aplicarEstadoInicial() {
    cards.forEach((card, i) => {
      if (i < qtdInicio) {
        card.style.display = "block";
        card.classList.remove("hidden");
      } else {
        card.style.display = "none";
        card.classList.add("hidden");
      }
    });

    // Esconde os títulos dos meses no início
    meses.forEach(m => (m.style.display = "none"));

    btnVerMais.style.display = cards.length > qtdInicio ? "block" : "none";
    msgNenhum.style.display = "none";
    btnLimpar.style.display = "none";

    filtroAno.value = "todos";
    if (filtroCategoria) filtroCategoria.value = "todas";

    index = qtdInicio;
  }

  aplicarEstadoInicial();

  // === BOTÃO VER MAIS ===
  if (btnVerMais) {
    btnVerMais.addEventListener("click", () => {
      let mostradas = 0;
      for (let i = 0; i < cards.length && mostradas < passo; i++) {
        if (cards[i].style.display === "none") {
          cards[i].style.display = "block";
          cards[i].classList.remove("hidden");
          mostradas++;
          index++;
        }
      }

      // Mostra os meses quando clica em “Ver mais”
      meses.forEach(m => (m.style.display = "block"));

      if (index >= cards.length) btnVerMais.style.display = "none";
    });
  }

  // === FUNÇÃO DE FILTRO (ANO + CATEGORIA) ===
  function aplicarFiltros() {
    const anoSelecionado = filtroAno.value;
    const categoriaSelecionada = filtroCategoria ? filtroCategoria.value : "todas";
    let encontrou = false;
    let contadorVisiveis = 0;

    cards.forEach(card => {
      const timeElement = card.querySelector("time");
      const tag = card.querySelector(".tagEvent");
      if (!timeElement || !tag) return;

      const anoNoticia = timeElement.getAttribute("datetime").slice(0, 4);
      const categoriaNoticia = tag.dataset.category;

      const anoOK = (anoSelecionado === "todos" || anoSelecionado === anoNoticia);
      const categoriaOK = (categoriaSelecionada === "todas" || categoriaSelecionada === categoriaNoticia);

      if (anoOK && categoriaOK) {
        card.style.display = "block";
        card.classList.remove("hidden");
        encontrou = true;
      } else {
        card.style.display = "none";
      }
    });

    // Mostra apenas os meses que têm notícias visíveis
    meses.forEach(mes => {
      let temVisivel = false;
      let next = mes.nextElementSibling;
      while (next && !next.classList.contains("titulo-mes")) {
        if (next.tagName === "A" && next.style.display !== "none") {
          temVisivel = true;
          break;
        }
        next = next.nextElementSibling;
      }
      mes.style.display = temVisivel ? "block" : "none";
    });

    // Exibe só 4 após filtrar
    cards.forEach(card => {
      if (card.style.display !== "none") {
        contadorVisiveis++;
        if (contadorVisiveis > qtdInicio) card.classList.add("hidden");
      }
    });

    const temMais = contadorVisiveis > qtdInicio;
    btnVerMais.style.display = temMais ? "block" : "none";
    msgNenhum.style.display = encontrou ? "none" : "block";

    // Aparece o botão limpar se QUALQUER filtro for usado
const filtroAtivo = (anoSelecionado !== "todos" || categoriaSelecionada !== "todas");
    btnLimpar.style.display = filtroAtivo ? "inline-block" : "none";
  }

  // === APLICA OS FILTROS ===
  if (filtroAno) filtroAno.addEventListener("change", aplicarFiltros);
  if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltros);

  // === LIMPAR FILTRO ===
  btnLimpar.addEventListener("click", () => {
    filtroAno.value = "todos";
    if (filtroCategoria) filtroCategoria.value = "todas";
    aplicarEstadoInicial();
  });
});

// === CONTROLE DE SETAS ===
document.addEventListener("DOMContentLoaded", () => {
  const setaEsquerda = document.querySelector(".seta-esquerda");
  const setaDireita = document.querySelector(".seta-direita");
  const setaCima = document.querySelector(".seta-cima");
  const setaBaixo = document.querySelector(".seta-baixo");

  const cardsDefesas = document.querySelector(".cards-defesas");
  const conteudoLinha = document.querySelector(".conteudo-linha");

  // Carrossel horizontal (Defesas)
  if (setaEsquerda && setaDireita && cardsDefesas) {
    setaEsquerda.addEventListener("click", () => {
      cardsDefesas.scrollBy({
        left: -300,
        behavior: "smooth"
      });
    });

    setaDireita.addEventListener("click", () => {
      cardsDefesas.scrollBy({
        left: 300,
        behavior: "smooth"
      });
    });
  }

  // Carrossel vertical (Eventos)
  if (setaCima && setaBaixo && conteudoLinha) {
    setaCima.addEventListener("click", () => {
      conteudoLinha.scrollBy({
        top: -150,
        behavior: "smooth"
      });
    });

    setaBaixo.addEventListener("click", () => {
      conteudoLinha.scrollBy({
        top: 150,
        behavior: "smooth"
      });
    });
  }
});
