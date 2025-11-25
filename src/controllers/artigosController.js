// src/controladores/artigosController.js

const { pool } = require('../database/dbConfig');
const fs = require('fs'); // Para deletar arquivos no servidor
const path = require('path');

// Caminho absoluto para a pasta de uploads
const uploadDir = path.resolve(__dirname, '..', 'upload');

// --- C.R.U.D. Artigos ---

// [C]RIAR Artigo (POST)
async function criarArtigo(req, res) {
    // Dados de texto enviados no corpo da requisição (body)
    let { titulo, link_doi, id_categoria, url_imagem, link_pdf: linkPdfUrl, exibir } = req.body;

    // Converte 'on' (de um checkbox/switch) para true, e a ausência para false.
    exibir = (exibir === 'on' || exibir === 'true' || exibir === true);
    
    // Dados dos arquivos de upload (se houver)
    const imagemFile = req.files['imagem'] ? req.files['imagem'][0] : null;
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;

    // Se a imagem for uma URL, ela virá no body, senão usaremos o caminho do arquivo upado
    const final_url_imagem = imagemFile ? `/uploads/${imagemFile.filename}` : url_imagem;
    
    // O PDF pode ser um arquivo local ou uma URL externa
    const final_link_pdf = pdfFile ? `/uploads/${pdfFile.filename}` : linkPdfUrl;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!titulo || !link_doi || !id_categoria || !final_url_imagem || !final_link_pdf) {
        return res.status(400).json({ mensagem: 'Faltam dados obrigatórios (título, DOI, categoria, imagem e PDF).' });
    }

    const query = `
        INSERT INTO artigos (titulo, link_doi, link_pdf, url_imagem, id_categoria, exibir)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [titulo, link_doi, final_link_pdf, final_url_imagem, id_categoria, exibir];

    try {
        const resultado = await pool.query(query, values);
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao cadastrar artigo:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao criar artigo.' });
    }
}


// [R]EAD - Listar Artigos (GET)
async function listarArtigos(req, res) {
    const query = `
        SELECT 
            a.id, a.titulo, a.link_doi, a.link_pdf, a.url_imagem, a.data_cadastro, a.exibir,
            c.nome AS categoria_nome
        FROM artigos a
        JOIN categoria_artigos c ON a.id_categoria = c.id
        ORDER BY a.data_cadastro DESC;
    `;

    try {
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao listar artigos:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao listar artigos.' });
    }
}


// [U]PDATE - Atualizar Artigo (PUT)
async function atualizarArtigo(req, res) {
    const { id } = req.params;
    
    try {
        // 1. Busca o artigo existente para obter os caminhos de arquivo antigos
        const resAntigo = await pool.query('SELECT link_pdf, url_imagem FROM artigos WHERE id = $1', [id]);
        if (resAntigo.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Artigo não encontrado para atualização.' });
        }
        const artigoAntigo = resAntigo.rows[0];

        // 2. Processa os dados recebidos
        let { titulo, link_doi, id_categoria, url_imagem_existente, link_pdf, exibir } = req.body;
        
        // Converte 'on' (de um checkbox/switch) para true. 
        // Se o campo não for enviado (checkbox desmarcado), o valor será false.
        const exibirFinal = (exibir === 'on' || exibir === 'true' || exibir === true);
        
        // Garante que só consideramos um arquivo se ele realmente foi enviado (tem um nome)
        const imagemFile = (req.files && req.files['imagem'] && req.files['imagem'][0].filename) ? req.files['imagem'][0] : null;
        const pdfFile = (req.files && req.files['pdf'] && req.files['pdf'][0].filename) ? req.files['pdf'][0] : null;



        // Define os novos caminhos/valores
        // Define a nova URL da imagem apenas se um novo arquivo foi upado ou uma nova URL foi fornecida.
        // Caso contrário, será `undefined` e não entrará na query de atualização, preservando o valor antigo.
        const nova_url_imagem = imagemFile ? `/uploads/${imagemFile.filename}` : (req.body['edit-url_imagem_input'] || undefined);

        // Define o novo link do PDF apenas se um novo arquivo foi upado ou uma nova URL foi fornecida.
        // Caso contrário, será `undefined` e não entrará na query de atualização.
        let novo_link_pdf;
        if (pdfFile) {
            // Prioridade 1: Um novo arquivo foi enviado.
            novo_link_pdf = `/uploads/${pdfFile.filename}`;
        } else if (link_pdf && link_pdf.trim() !== '') {
            // Prioridade 2: O campo de texto foi preenchido com uma nova URL.
            novo_link_pdf = link_pdf;
        }
        // Se nenhuma das condições acima for atendida (nenhum arquivo novo e campo de texto vazio),
        // `novo_link_pdf` permanecerá `undefined`, e o valor no banco de dados será preservado.

        // 3. Monta a query de atualização dinamicamente
        let setClauses = [];
        let values = [];
        let paramIndex = 1;

        if (titulo) { setClauses.push(`titulo = $${paramIndex++}`); values.push(titulo); }
        if (link_doi) { setClauses.push(`link_doi = $${paramIndex++}`); values.push(link_doi); }
        if (id_categoria) { setClauses.push(`id_categoria = $${paramIndex++}`); values.push(id_categoria); }
        
        // Apenas adiciona a cláusula de atualização da imagem se um novo valor foi realmente fornecido
        if (nova_url_imagem !== undefined) { setClauses.push(`url_imagem = $${paramIndex++}`); values.push(nova_url_imagem); }
        
        // Apenas adiciona a cláusula de atualização do PDF se um novo valor foi realmente fornecido
        if (novo_link_pdf !== undefined) {
            setClauses.push(`link_pdf = $${paramIndex++}`); values.push(novo_link_pdf);
        }
        
        // Sempre atualiza o campo 'exibir' com base no estado do switch (marcado ou não)
        setClauses.push(`exibir = $${paramIndex++}`);
        values.push(exibirFinal);

        // Se não houver campos para atualizar, retorna sucesso sem fazer nada no banco
        if (setClauses.length === 0) {
            return res.status(200).json(artigoAntigo);
        }

        values.push(id); // Adiciona o ID como último parâmetro para a cláusula WHERE

        const query = `
            UPDATE artigos SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;

        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Artigo não encontrado.' });
        }
        
        // 4. Deleta arquivos antigos do servidor se eles foram substituídos
        // Deleta PDF antigo se um novo foi fornecido e o antigo era um upload
        if (novo_link_pdf && artigoAntigo.link_pdf && artigoAntigo.link_pdf.startsWith('/uploads/')) {
            const fullPathAntigo = path.join(uploadDir, artigoAntigo.link_pdf.replace('/uploads/', ''));
            if (fs.existsSync(fullPathAntigo)) {
                fs.unlinkSync(fullPathAntigo);
            }
        }

        // Deleta imagem antiga se uma nova foi fornecida e a antiga era um upload
        if (nova_url_imagem !== undefined && nova_url_imagem !== artigoAntigo.url_imagem && artigoAntigo.url_imagem && artigoAntigo.url_imagem.startsWith('/uploads/')) {
            const fullPathAntigo = path.join(uploadDir, artigoAntigo.url_imagem.replace('/uploads/', ''));
            if (fs.existsSync(fullPathAntigo)) {
                fs.unlinkSync(fullPathAntigo);
            }
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar artigo:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao atualizar artigo.' });
    }
}


// [D]ELETE - Deletar Artigo (DELETE)
async function deletarArtigo(req, res) {
    const { id } = req.params;

    try {
        // 1. Busca o artigo para obter o caminho do PDF (e imagem, se for local)
        const resArtigo = await pool.query('SELECT link_pdf, url_imagem FROM artigos WHERE id = $1', [id]);
        if (resArtigo.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Artigo não encontrado.' });
        }
        const { link_pdf, url_imagem } = resArtigo.rows[0];

        // 2. Deleta o registro do banco de dados
        const query = 'DELETE FROM artigos WHERE id = $1;';
        const resultado = await pool.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Artigo não encontrado.' });
        }
        
        // 3. Deleta o arquivo PDF (e imagem, se for caminho local) do servidor
        if (link_pdf && link_pdf.startsWith('/uploads/')) {
            const fullPathPdf = path.join(uploadDir, link_pdf.replace('/uploads/', ''));
            if (fs.existsSync(fullPathPdf)) {
                fs.unlinkSync(fullPathPdf);
            }
        }
        if (url_imagem && url_imagem.startsWith('/uploads/')) {
            const fullPathImg = path.join(uploadDir, url_imagem.replace('/uploads/', ''));
            if (fs.existsSync(fullPathImg)) {
                fs.unlinkSync(fullPathImg);
            }
        }

        res.status(204).send(); // 204 No Content para deleção bem sucedida
    } catch (error) {
        console.error('Erro ao deletar artigo:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao deletar artigo.' });
    }
}


// Rota para Download do PDF
function downloadPdf(req, res) {
    const { id } = req.params;

    // Neste exemplo, simplificaremos, mas em um cenário real, você buscaria o link_pdf no DB pelo ID
    // e usaria res.download(caminho_completo_do_pdf);

    // Exemplo Simples (Ajuste para buscar no DB)
    // O correto seria buscar o link_pdf no banco de dados primeiro!
    // Para simplificar a demonstração da função:
    res.status(501).json({ mensagem: "Funcionalidade de Download: Buscar 'link_pdf' no DB e usar 'res.download(caminho_completo)'." });
    
    // Exemplo de como DEVERIA SER (inclua o código abaixo no DELETE para funcionar):
    /*
    pool.query('SELECT link_pdf FROM artigos WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) return res.status(404).json({ mensagem: 'Artigo não encontrado.' });
            
            const link_pdf = result.rows[0].link_pdf;
            if (link_pdf.startsWith('/uploads/')) {
                const fullPath = path.join(uploadDir, link_pdf.replace('/uploads/', ''));
                if (fs.existsSync(fullPath)) {
                    // res.download() envia o arquivo para download
                    return res.download(fullPath, path.basename(fullPath)); 
                }
            }
            res.status(404).json({ mensagem: 'Arquivo PDF não encontrado no servidor.' });
        })
        .catch(error => {
            console.error('Erro ao preparar download:', error.message);
            res.status(500).json({ mensagem: 'Erro interno do servidor ao buscar PDF.' });
        });
    */
}


// -------------------------------------

async function listarArtigosPublicos(req, res) {
    const query = `
        SELECT 
            a.id, a.titulo, a.link_doi, a.link_pdf, a.url_imagem, a.data_cadastro, a.exibir,
            c.nome AS categoria_nome
        FROM artigos a
        JOIN categoria_artigos c ON a.id_categoria = c.id
        WHERE a.exibir = TRUE
        ORDER BY a.data_cadastro DESC;
    `;

    try {
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao listar artigos públicos:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao listar artigos.' });
    }
}


module.exports = {
    criarArtigo,
    listarArtigos,
    atualizarArtigo,
    deletarArtigo,
    downloadPdf,
    listarArtigosPublicos,
};