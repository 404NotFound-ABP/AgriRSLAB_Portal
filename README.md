# AgriRSLAB-Portal - ABP1

<a id="topo"></a>



<p align="center">
  <img src="imagens/1.1Imagens%20Git/logo_404notfound.png"
       alt="Logo 404NotFound"
       style="max-width: 260px; width: 60%; height: auto;">
</p>


<p align="center">
  <a href="#sobre">Sobre o Projeto</a> |
  <a href="#backlogs">Product Backlog</a> |
  <a href="#sprint">Entrega de Sprints</a> |
  <a href="#tecnologias">Tecnologias</a> |
  <a href="#equipe">Nossa Equipe</a>
</p>

<a id="sobre"></a>
## Sobre o Projeto 📋

A criação de um website para o Laboratório de Sensoriamento Remoto Agrícola do INPE (AgriRS Lab).

O site do AgriRS está sendo desenvolvido pela **404NotFound** com o objetivo de centralizar informações essenciais do laboratório, ampliar sua visibilidade e facilitar o acesso do público às pesquisas, projetos e iniciativas. O portal reunirá perfis da equipe e áreas de atuação, publicações científicas, oportunidades (vagas, editais, estágios) e canais de contato.  
Nossa meta é manter a comunidade atualizada sobre as atividades e descobertas do laboratório e aproximar estudantes, parceiros e a sociedade do conhecimento produzido.



[↑ Voltar ao topo](#topo)

<a id="sprint"></a>
## Entregas de Sprints

Todas as entregas serão realizadas conforme os prazos acordados com o cliente. Para cada ciclo de desenvolvimento, será gerado um relatório completo por sprint e uma planilha de tarefas, na aba **Tasks**, que detalha cada atividade executada, o responsável, a data de conclusão e uma descrição do trabalho realizado. A relação detalhada das sprints e tarefas é apresentada abaixo.

<div align="center">

| Sprint | Entrega       | Status |                 Relatório                  | Tasks |
|------: |---------------|:------:|:------------------------------------------:|:-----:|
| 1      | 📅 08/10/2025 | ✅     | [Ver Backlog](docs/sprint1.md#backlog)     | —     |
| 2      | 📅 04/11/2025 | 🚧  | [Ver Backlog](docs/sprint2.md#backlog)                                         | —     |
| 3      | 📅 25/11/2025 | —      | —                                          | —     |


</div>

**Legenda:**
- ✅ **Finalizada**
- 🚧 **Em Progresso**
- `—` **Não iniciado**

A apresentação da Sprint 1 em vídeo pode ser acessada [aqui](https://youtu.be/8NwBtAC9zXE).

[↑ Voltar ao topo](#topo)

<a id="dor"></a>
## Dor do Cliente

1. Necessidade de um site para divulgação do Laboratório de Sensoriamento Remoto Agrícola do INPE.  
2. Cliente com pouca experiência em desenvolvimento de websites — portanto, é essencial que o gerenciamento de conteúdo seja simples e objetivo.  
3. Necessidade de compliance com estrutura e regras do INPE (instituição pública).

[↑ Voltar ao topo](#topo)

<a id="backlogs"></a>
## Backlog do Produto

### Prioridade Alta
1. Página inicial com navegação.  
2. Cards em destaque na home (notícias, projetos, publicações).  
3. Links para redes sociais e contato no rodapé.  
4. Página "Sobre" — objetivo e foco do laboratório.  
5. Página de membros com nome, foto, função e descrição.  
6. Página de oportunidades (estágio, IC, pós-graduação).  
7. Listagem de projetos (título, resumo, ano, status, equipe).  
8. Publicação de notícias (título, data, imagem, texto).  
9. Lista de publicações científicas.  
10. Formulário de contato funcional.

> RNF01. Responsividade.  
> RNF03. Site deve carregar rapidamente.  
> RNF02. Facilidade de atualização de conteúdo.

### Prioridade Média
1. Exibir colaboradores e financiadores.  
2. Explicação das áreas de atuação.  
3. Categorizar membros por tipo (pesquisadores, bolsistas, etc.).  
4. Informações de como se candidatar a vagas.  
5. Inclusão de imagens/links adicionais nos projetos.  
6. Organização cronológica das notícias.  
7. Campo de pesquisa por palavra-chave em publicações.  
8. Exibir informações institucionais (telefone, e-mail, endereço).

> RNF04. Versão em português e inglês.  
> RNF06. Identidade visual definida.

### Prioridade Baixa
1. Ordenar membros alfabeticamente dentro de cada categoria.  
2. Links para redes sociais na página de contato (além do rodapé).  
3. Mapa com localização do laboratório.

> RNF05. Hospedagem e domínio próprio (pode ser feito após protótipo).

# Tabela descritiva das sprints com as colunas
| ID     | Nome da Tarefa                                    | Pontos | Diciplina | Requisitos Atendidos|
|--------|---------------------------------------------------|------- |-----------|---------------------|
| **DD-001** | Definir identidade visual do site             | 5      | DD        | RNF06               |
| **DD-002** | Criar protótipo da página inicial             | 8      | DD        | PA-01              |
| **DD-003** | Cards em destaque na home (notícias, projetos, publicações). | 9      | DD        | PA-02               |
| **DD-004** | Criar  página "Sobre" – objetivo e foco do laboratório.| 4      | DD        | PA-04               |
| **DD-005** | Criar página de membros com nome, foto, função e descrição.| 6      | DD        | PA-05               |
| **DD-006** | Criar  página de oportunidades (estágio, IC, pós-graduação).| 3      | DD        | PA-06               |
| **DD-007** | Criar página de listagem de projetos (título, resumo, ano, status, equipe).| 1   |  DD| PA-07              |
| **DD-008** | Criar página de publicação de notícias (título, data, imagem, texto).| 7     | DD | PA-08             |
| **DD-009** | Criar protótipo de lista de publicações científicas.| 4      | DD | PA-09                      |
| **DD-0010** | Criar protótipo de formulário de contato funcional. | 2     | DD | RF-010                      |
| **DW-001** | Criar o arquivo HTML para página inicial        | 10      | Dw        | PA-01               |
| **Dw-002** | Aplicar a estilização da página inicial em CSS  | 10      | Dw        | PA-01               |
| **Dw-003** | Criar arquivo HTML para a página de notícias                | 9      | Dw        | PA-08               |
| **Dw-004** | Aplicar a estilização da página de notícias em CSS                 | 9      | Dw        | PA-08               |
| **Dw-005** | Criar o arquivo HTML para página de projetos | 3      | Dw        | PA-07               |
| **Dw-006** | Criar a estilização para página de projetos | 3      | Dw        | PA-07               |
| **Dw-007** | Criar o arquivo HTML para página de públicações | 3      | Dw        | PA-09               |
| **Dw-008** | Criar a estilização para a página de publicações | 3      | Dw        | PA-09               |
| **Dw-009** | Criar o arquivo HTML para página de sobre | 3      | Dw        | PA-04               |
| **Dw-0010** | Criar a estilização da página sobre  | 3      | Dw        | PA-04               |
| **Dw-0011** | Criar o arquivo HTML para a página membros  | 6      | Dw        | PA-05              |
| **Dw-0012** | Criar a estilização  para a página membros  | 6      | Dw        | PA-05              |
| **Dw-0013** | Criar o arquivo em HTML para a página de oportunidades  | 8     | Dw        | PA-06              |
| **Dw-0013** | Criar a estilização para a página de oportunidades  | 8     | Dw        | PA-06              |
| **ES-001** | Criar um estudo de caso do projeto  | 10      | ES        |                |
| **Dw-002** | Criar diagrama de caso do projeto  | 10      | ES        |                |
- Periodo da sprints
- Link para a documentação da sprint
- Link para o video no youtube do Incremento entregue
=======
## Tabela descritiva das sprints com as colunas

| ID       | Nome da Tarefa                                              | Pontos | Disciplina | Requisitos Atendidos |
|----------|-------------------------------------------------------------|:------:|:----------:|----------------------|
| **DD-001** | Definir identidade visual do site                          | 5      | DD         | RNF06                |
| **DD-002** | Criar protótipo da página inicial                          | 8      | DD         | PA-01                |
| **DD-003** | Cards em destaque na home (notícias, projetos, publicações) | 9      | DD         | PA-02                |
| **DD-004** | Criar página "Sobre" – objetivo e foco do laboratório      | 4      | DD         | PA-04                |
| **DD-005** | Criar página de membros (nome, foto, função, descrição)    | 6      | DD         | PA-05                |
| **DD-006** | Criar página de oportunidades                              | 3      | DD         | PA-06                |
| **DD-007** | Criar listagem de projetos                                 | 1      | DD         | PA-07                |
| **DD-008** | Criar página de notícias                                   | 7      | DD         | PA-08                |
| **DD-009** | Criar lista de publicações científicas                     | 4      | DD         | PA-09                |
| **DD-010** | Protótipo de formulário de contato funcional               | 2      | DD         | RF-010               |
| **DW-001** | HTML da página inicial                                     | 10     | DW         | PA-01                |
| **DW-002** | CSS da página inicial                                      | 10     | DW         | PA-01                |
| **DW-003** | HTML da página de notícias                                 | 9      | DW         | PA-08                |
| **DW-004** | CSS da página de notícias                                  | 9      | DW         | PA-08                |
| **DW-005** | HTML da página de projetos                                 | 3      | DW         | PA-07                |
| **DW-006** | CSS da página de projetos                                  | 3      | DW         | PA-07                |
| **DW-007** | HTML da página de publicações                              | 3      | DW         | PA-09                |
| **DW-008** | CSS da página de publicações                               | 3      | DW         | PA-09                |
| **DW-009** | HTML da página "Sobre"                                     | 3      | DW         | PA-04                |
| **DW-010** | CSS da página "Sobre"                                      | 3      | DW         | PA-04                |
| **DW-011** | HTML da página de membros                                  | 6      | DW         | PA-05                |
| **DW-012** | CSS da página de membros                                   | 6      | DW         | PA-05                |
| **DW-013** | HTML da página de oportunidades                            | 8      | DW         | PA-06                |
| **DW-014** | CSS da página de oportunidades                             | 8      | DW         | PA-06                |
| **ES-001** | Estudo de caso do projeto                                  | 10     | ES         | —                    |
| **ES-002** | Diagrama de caso do projeto                                | 10     | ES         | —                    |

[↑ Voltar ao topo](#topo)

<a id="tecnologias"></a>
## Tecnologias

<p align="center">

 <a href="https://www.figma.com/" style="">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" alt="Figma" width="30" height="30">
</a>



<a href="https://trello.com/" >
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg" alt="Trello" width="30" height="30">
</a>


<a href="https://code.visualstudio.com/" >
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="VS Code" width="30" height="30">
</a>

[↑ Voltar ao topo](#topo)

<a id="equipe"></a>
## Nossa Equipe

A equipe **404 Not Found** é constituída de alunos do primeiro semestre do curso de Desenvolvimento de Software Multiplataforma.

| Função        | Nome                          | Links |
|---------------|-------------------------------|-------|
| Project Owner | Eloah Sousa da Silva          | [GitHub](https://github.com/eloahsousaa) / [LinkedIn](https://www.linkedin.com/in/eloah-sousa-650038349/) |
| Scrum Master  | Pedro Gonçalves Sampaio       | [GitHub](https://github.com/PedroSmp) / [LinkedIn](https://www.linkedin.com/in/pedro-sampaio-463a77375) |
| Dev Team      | Ariana Ferreira dos Santos    | [GitHub](https://github.com/arianaferresan) / [LinkedIn](https://br.linkedin.com/in/arianaferreira) |
| Dev Team      | Felipe Faria Machado          | [GitHub](https://github.com/Felipe1781) / [LinkedIn](https://www.linkedin.com/in/felipefariamachado) |
| Dev Team      | João Augusto Leal Neto        | [GitHub](https://github.com/lealdev7) / [LinkedIn](https://www.linkedin.com/in/jo%C3%A3o-leal-558071385/) |
| Dev Team      | João Otávio Nunes de Mesquita | [GitHub](https://github.com/jotavionm) / [LinkedIn](https://www.linkedin.com/in/jo%C3%A3o-ot%C3%A1vio-nunes-mesquita/) |
| Dev Team      | Luiza Gonçalves Manchini      | [GitHub](https://github.com/luiza-manchini) / [LinkedIn](https://www.linkedin.com/in/luiza-manchini-b51a7b336/) |
| Dev Team      | William Max dos Santos Silva  | [GitHub](https://github.com/WilliamM4x) / [LinkedIn](https://www.linkedin.com/in/william-max-7b8036140/) |

[↑ Voltar ao topo](#topo)
