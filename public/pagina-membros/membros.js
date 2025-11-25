// membros.js

const API_PUBLIC_MEMBROS = '/api/membros/publicos';

// Mapeia id_categoria do banco -> slug da seção + texto de cargo
function getInfoGrupo(id_categoria) {
  switch (Number(id_categoria)) {
    case 1:
      return { slug: 'coordenadores', cargo: 'Pesquisador(a)/ Coordenador(a)' };
    case 2:
      return { slug: 'pesquisadores', cargo: 'Pesquisador(a) Associado(a)' };
    case 3:
      return { slug: 'doutorandos', cargo: 'Doutorando(a)' };
    case 4:
      return { slug: 'mestrandos', cargo: 'Mestrando(a)' };
    case 5:
      return { slug: 'bolsistas', cargo: 'Bolsista' };
    default:
      return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const secoes = {};

  // Mapeia cada <section class="grupo-membros" data-grupo="...">
  document.querySelectorAll('.grupo-membros').forEach(secao => {
    const slug = secao.dataset.grupo; // coordenadores, pesquisadores, etc.
    const grade = secao.querySelector('.grade-membros');
    secoes[slug] = {
      secao,
      grade,
      count: 0
    };
  });

  carregarMembrosPublicos(secoes);
});

async function carregarMembrosPublicos(secoes) {
  try {
    const resp = await fetch(API_PUBLIC_MEMBROS);
    if (!resp.ok) {
      console.error('Erro ao buscar membros públicos:', resp.status);
      return;
    }

    const membros = await resp.json();

    // Cria os cards em cada grupo
    membros.forEach(membro => {
      const infoGrupo = getInfoGrupo(membro.id_categoria);
      if (!infoGrupo) return;

      const entry = secoes[infoGrupo.slug];
      if (!entry || !entry.grade) return;

      const card = document.createElement('div');
      card.classList.add('card-membro');

      card.innerHTML = `
        <div class="card-frente">
          <img src="${membro.foto}" alt="Foto do Membro">
          <div class="nome-membro-banner">
            <h3>${membro.nome}</h3>
            <p>${infoGrupo.cargo}</p>
          </div>
        </div>
        <div class="card-verso">
          <p>${membro.descricao || ''}</p>
          ${
            membro.link
              ? `<a href="${membro.link}" target="_blank" class="lattes-link" title="Currículo / Perfil">
                   <span class="lattes-ver">Ver</span>
                   <span class="lattes-curriculo">CURRÍCULO</span>
                   <span class="lattes-lattes">LATTES</span>
                 </a>`
              : ''
          }
        </div>
      `;

      entry.grade.appendChild(card);
      entry.count++;
    });

    // Depois de preencher, esconde grupos vazios e ativa o toggle nos que têm membros
    Object.values(secoes).forEach(({ secao, grade, count }) => {
      if (!count) {
        // não tem nenhum membro nesse grupo → esconde título + tudo
        secao.style.display = 'none';
        return;
      }

      // tem membros → deixa visível e aplica comportamento de acordeão
      const botao = secao.querySelector('.toggle-btn');

      // começa aberto
      secao.classList.add('aberto');
      if (grade) grade.style.display = 'grid';

      if (botao && grade) {
        botao.addEventListener('click', () => {
          secao.classList.toggle('aberto');
          grade.style.display = secao.classList.contains('aberto') ? 'grid' : 'none';
        });
      }
    });
  } catch (erro) {
    console.error('Erro ao carregar membros públicos:', erro);
  }
}
