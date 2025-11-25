// membros-admin.js

const API_BASE_URL = '/api/membros';

let membroSelecionadoParaDelecao = null;

// Helpers de UI
function showToast(message, tipo = 'info') {
    const toast = document.getElementById('custom-toast');
    const toastMsg = document.getElementById('toast-message');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.className = ''; // limpa classes
    toast.classList.add('show', tipo); // 'show', 'info', 'error', etc se você usar no CSS

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function abrirModal(modal) {
    if (modal) {
        modal.style.display = 'block';
    }
}

function fecharModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

// Mapeia id_categoria -> texto da categoria (para exibir na listagem admin)
function getCategoriaNome(id_categoria) {
    switch (Number(id_categoria)) {
        case 1: return 'Coordenação';
        case 2: return 'Pesquisadores';
        case 3: return 'Doutorandos';
        case 4: return 'Mestrandos';
        case 5: return 'Bolsistas';
        default: return 'Não informado';
    }
}

// Carrega todos os membros e desenha no container
async function carregarMembros() {
  const container = document.getElementById('container-membros');
  if (!container) return;

  container.innerHTML = '<h2>Carregando Membros...</h2>';

  try {
    const resp = await fetch(API_BASE_URL);
    if (!resp.ok) {
      console.error('Erro ao buscar membros:', resp.status);
      container.innerHTML = '<p>Erro ao carregar membros.</p>';
      return;
    }

    let membros = await resp.json();

    // 1) Ordena por id_categoria (1 coordenação, 5 bolsistas)
    // 2) Dentro de cada categoria, ordena por nome em ordem alfabética
    membros.sort((a, b) => {
      const ga = Number(a.id_categoria);
      const gb = Number(b.id_categoria);

      if (ga !== gb) {
        return ga - gb;
      }

      return String(a.nome).localeCompare(String(b.nome), 'pt-BR', {
        sensitivity: 'base'
      });
    });

    if (!membros || membros.length === 0) {
      container.innerHTML = '<p>Nenhum membro cadastrado ainda.</p>';
      return;
    }

    const tabela = document.createElement('table');
    tabela.classList.add('tabela-admin-membros');

    tabela.innerHTML = `
      <thead>
        <tr>
          <th class="col-membro">Membro</th>
          <th class="col-categoria">Categoria</th>
          <th class="col-exibir">Status</th>
          <th class="col-acoes">Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabela.querySelector('tbody');

membros.forEach((membro) => {
  const cargo = getCategoriaNome(membro.id_categoria);

  const tr = document.createElement('tr');

  // se o membro não está marcado para exibir, aplica a classe de "apagado"
  if (!membro.exibir) {
    tr.classList.add('membro-oculto');
  }

  tr.innerHTML = `
    <td>
      <div class="celula-membro">
        <img src="${membro.foto}" alt="Foto de ${membro.nome}" class="thumb-tabela">
        <span class="nome-membro-tabela">${membro.nome}</span>
      </div>
    </td>
    <td>
      <span class="badge-categoria">${cargo}</span>
    </td>
    <td>
      <span class="badge-exibir ${membro.exibir ? 'badge-exibir--on' : 'badge-exibir--off'}">
        ${membro.exibir ? 'Visível' : 'Oculto'}
      </span>
    </td>
    <td>
      <div class="acoes-tabela">
        <button class="btn-secondary btn-editar" data-id="${membro.id}">Editar</button>
        <button class="btn-danger btn-deletar" data-id="${membro.id}">Excluir</button>
      </div>
    </td>
  `;

  const btnEditar = tr.querySelector('.btn-editar');
  const btnDeletar = tr.querySelector('.btn-deletar');

  btnEditar.addEventListener('click', () => abrirModalEdicao(membro));
  btnDeletar.addEventListener('click', () => abrirModalDelecao(membro));

  tbody.appendChild(tr);
});


    container.innerHTML = '';
    container.appendChild(tabela);
  } catch (erro) {
    console.error('Erro ao carregar membros:', erro);
    container.innerHTML = '<p>Erro ao carregar membros.</p>';
  }
}



// Abre modal de cadastro
function configurarModalCadastro() {
    const btnAbrirCadastro = document.getElementById('btn-abrir-cadastro');
    const modalCadastro = document.getElementById('modal-cadastro');
    const closeButtons = modalCadastro?.querySelectorAll('.close-button');

    if (btnAbrirCadastro && modalCadastro) {
        btnAbrirCadastro.addEventListener('click', () => {
            const form = document.getElementById('form-cadastro');
            if (form) form.reset();

            const preview = document.getElementById('cadastro-foto-preview');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }

            abrirModal(modalCadastro);
        });
    }

    closeButtons?.forEach(btn => {
        btn.addEventListener('click', () => fecharModal(modalCadastro));
    });
}

// Abre modal de edição e preenche os campos
function abrirModalEdicao(membro) {
    const modal = document.getElementById('modal-atualizacao');
    const form = document.getElementById('form-atualizacao');

    if (!modal || !form) return;

    form.reset();

    form.querySelector('#edit-id').value = membro.id;
    form.querySelector('#edit-nome').value = membro.nome || '';
    form.querySelector('#edit-descricao').value = membro.descricao || '';
    form.querySelector('#edit-id_categoria').value = membro.id_categoria || '';
    form.querySelector('#edit-link').value = membro.link || '';

    const checkboxExibir = form.querySelector('#edit-exibir');
    if (checkboxExibir) {
        checkboxExibir.checked = !!membro.exibir;
    }

    const fotoExistenteInput = form.querySelector('#edit-foto_existente');
    const fotoPreview = document.getElementById('edit-foto-preview');

    if (fotoExistenteInput) {
        fotoExistenteInput.value = membro.foto || '';
    }
    if (fotoPreview) {
        if (membro.foto) {
            fotoPreview.src = membro.foto;
            fotoPreview.style.display = 'block';
        } else {
            fotoPreview.src = '';
            fotoPreview.style.display = 'none';
        }
    }

    abrirModal(modal);
}

// Configura fechamento do modal de atualização
function configurarModalAtualizacaoFechamento() {
    const modalAtualizacao = document.getElementById('modal-atualizacao');
    const closeButtons = modalAtualizacao?.querySelectorAll('.close-button');

    closeButtons?.forEach(btn => {
        btn.addEventListener('click', () => fecharModal(modalAtualizacao));
    });
}

// Abre modal de deleção
function abrirModalDelecao(membro) {
    membroSelecionadoParaDelecao = membro;

    const modal = document.getElementById('modal-delecao');
    const nomeConfirm = document.getElementById('delete-nome-confirm');

    if (nomeConfirm) {
        nomeConfirm.textContent = membro.nome || '';
    }

    abrirModal(modal);
}

// Configurar modal de deleção (botões)
function configurarModalDelecao() {
    const modalDelecao = document.getElementById('modal-delecao');
    const btnConfirmar = document.getElementById('btn-confirmar-delecao');
    const btnCancelar = document.getElementById('btn-cancelar-delecao');
    const closeButtons = modalDelecao?.querySelectorAll('.close-button');

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async () => {
            if (!membroSelecionadoParaDelecao) return;

            try {
                const resp = await fetch(`${API_BASE_URL}/${membroSelecionadoParaDelecao.id}`, {
                    method: 'DELETE'
                });

                if (!resp.ok && resp.status !== 204) {
                    console.error('Erro ao deletar membro:', resp.status);
                    showToast('Erro ao deletar membro', 'error');
                    return;
                }

                showToast('Membro deletado com sucesso.', 'info');
                fecharModal(modalDelecao);
                membroSelecionadoParaDelecao = null;
                carregarMembros();
            } catch (erro) {
                console.error('Erro ao deletar membro:', erro);
                showToast('Erro ao deletar membro', 'error');
            }
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            fecharModal(modalDelecao);
            membroSelecionadoParaDelecao = null;
        });
    }

    closeButtons?.forEach(btn => {
        btn.addEventListener('click', () => fecharModal(modalDelecao));
    });
}

// Submit do cadastro
function configurarSubmitCadastro() {
    const formCadastro = document.getElementById('form-cadastro');
    if (!formCadastro) return;

    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(formCadastro);

        try {
            const resp = await fetch(API_BASE_URL, {
                method: 'POST',
                body: formData
            });

            if (!resp.ok) {
                console.error('Erro ao cadastrar membro:', resp.status);
                showToast('Erro ao cadastrar membro', 'error');
                return;
            }

            await resp.json();
            showToast('Membro cadastrado com sucesso!', 'info');

            const modalCadastro = document.getElementById('modal-cadastro');
            fecharModal(modalCadastro);
            formCadastro.reset();

            const preview = document.getElementById('cadastro-foto-preview');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }

            carregarMembros();
        } catch (erro) {
            console.error('Erro ao cadastrar membro:', erro);
            showToast('Erro ao cadastrar membro', 'error');
        }
    });
}


// Submit da atualização
function configurarSubmitAtualizacao() {
    const formAtualizacao = document.getElementById('form-atualizacao');
    if (!formAtualizacao) return;

    formAtualizacao.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = formAtualizacao.querySelector('#edit-id').value;
        if (!id) return;

        const formData = new FormData(formAtualizacao);

        try {
            const resp = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (!resp.ok) {
                console.error('Erro ao atualizar membro:', resp.status);
                showToast('Erro ao atualizar membro', 'error');
                return;
            }

            await resp.json();
            showToast('Membro atualizado com sucesso!', 'info');

            const modalAtualizacao = document.getElementById('modal-atualizacao');
            fecharModal(modalAtualizacao);
            carregarMembros();
        } catch (erro) {
            console.error('Erro ao atualizar membro:', erro);
            showToast('Erro ao atualizar membro', 'error');
        }
    });
}

// Preview simples da foto no cadastro
function configurarPreviewCadastro() {
    const fotoFileInput = document.getElementById('foto_file_input');
    const preview = document.getElementById('cadastro-foto-preview');

    if (!preview || !fotoFileInput) return;

    fotoFileInput.addEventListener('change', () => {
        const file = fotoFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.src = '';
            preview.style.display = 'none';
        }
    });
}


// Preview da foto na edição (se quiser atualizar visualmente ao trocar)
function configurarPreviewEdicao() {
    const fotoFileInput = document.getElementById('edit-foto_file_input');
    const preview = document.getElementById('edit-foto-preview');

    if (!preview || !fotoFileInput) return;

    fotoFileInput.addEventListener('change', () => {
        const file = fotoFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}


// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarMembros();
    configurarModalCadastro();
    configurarModalAtualizacaoFechamento();
    configurarModalDelecao();
    configurarSubmitCadastro();
    configurarSubmitAtualizacao();
    configurarPreviewCadastro();
    configurarPreviewEdicao();
});
