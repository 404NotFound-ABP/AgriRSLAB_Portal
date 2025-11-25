document.addEventListener('DOMContentLoaded', () => {
  // ===================== 1. ABRIR / FECHAR DROPDOWNS =====================
  const toggleButtons = document.querySelectorAll('.filter-toggle');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const dropdown = this.closest('.filter-dropdown');
      const isOpen = dropdown.classList.contains('open');

      document.querySelectorAll('.filter-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.filter-toggle').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      } else {
        dropdown.classList.remove('open');
        this.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ===================== 2. FILTRAR PUBLICAÇÕES =====================
  const allCards = document.querySelectorAll('.publicacao');
  const sectionTitles = document.querySelectorAll('.section-title');
  const applyButtons = document.querySelectorAll('.btn-apply-filter');

  function applyFilters() {
    const tipoDropdown = document.querySelector('[data-filter-name="tipo"]');
    const checkedTipos = tipoDropdown
      ? Array.from(tipoDropdown.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value)
      : [];

    const anoDropdown = document.querySelector('[data-filter-name="ano"]');
    const termoTituloAno = anoDropdown
      ? anoDropdown.querySelector('.filter-input-text').value.trim().toLowerCase()
      : '';

    let algumFiltroAtivo = checkedTipos.length > 0 || termoTituloAno.length > 0;

    // Mostra ou esconde cards conforme filtros
    allCards.forEach(card => {
      const matchTipo = checkedTipos.length === 0 || checkedTipos.some(t => card.classList.contains(t));
      const titleEl = card.querySelector('.card-title');
      const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
      const matchTituloAno = termoTituloAno === '' || titleText.includes(termoTituloAno);
      const show = matchTipo && matchTituloAno;
      card.style.display = show ? 'flex' : 'none';
    });

    // Gerencia visibilidade dos títulos de seção
    sectionTitles.forEach(title => {
      const section = title.closest('.publications-section');
      const visibleCards = section.querySelectorAll('.publicacao:not([style*="display: none"])');
      title.style.display = visibleCards.length > 0 ? '' : 'none';
    });

    // Se todos os filtros estiverem limpos, mostra tudo normalmente
    if (!algumFiltroAtivo) {
      sectionTitles.forEach(title => (title.style.display = ''));
      allCards.forEach(card => (card.style.display = 'flex'));
    }
  }

  // Botões “Aplicar”
  applyButtons.forEach(button => {
    button.addEventListener('click', () => {
      applyFilters();
      const dropdown = button.closest('.filter-dropdown');
      if (dropdown) {
        dropdown.classList.remove('open');
        const toggle = dropdown.querySelector('.filter-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Enter no campo de título/ano
  const inputTituloAno = document.querySelector('[data-filter-name="ano"] .filter-input-text');
  if (inputTituloAno) {
    inputTituloAno.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFilters();
        const d = inputTituloAno.closest('.filter-dropdown');
        if (d) {
          d.classList.remove('open');
          const t = d.querySelector('.filter-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
});
