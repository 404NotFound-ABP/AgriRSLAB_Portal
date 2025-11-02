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
    const { titulo, link_doi, id_categoria, url_imagem, link_pdf: linkPdfUrl } = req.body;
    
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
        INSERT INTO artigos (titulo, link_doi, link_pdf, url_imagem, id_categoria)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [titulo, link_doi, final_link_pdf, final_url_imagem, id_categoria];

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
            a.id, a.titulo, a.link_doi, a.link_pdf, a.url_imagem, a.data_cadastro,
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
    const { titulo, link_doi, id_categoria, url_imagem_existente, link_pdf: linkPdfUrl } = req.body;

    // Lógica para atualização de arquivos:
    // 1. Pega os arquivos upados agora (se houver)
    const imagemFile = req.files && req.files['imagem'] ? req.files['imagem'][0] : null;
    const pdfFile = req.files && req.files['pdf'] ? req.files['pdf'][0] : null;
    
    // 2. Define os caminhos a serem salvos
    const nova_url_imagem = imagemFile ? `/uploads/${imagemFile.filename}` : url_imagem_existente;
    const novo_link_pdf = pdfFile ? `/uploads/${pdfFile.filename}` : linkPdfUrl; // Prioriza arquivo, depois URL, depois nada

    // 3. Monta a query dinamicamente (para não sobrescrever campos vazios)
    let setClauses = [];
    let values = [];
    let paramIndex = 1;

    if (titulo) { setClauses.push(`titulo = $${paramIndex++}`); values.push(titulo); }
    if (link_doi) { setClauses.push(`link_doi = $${paramIndex++}`); values.push(link_doi); }
    if (id_categoria) { setClauses.push(`id_categoria = $${paramIndex++}`); values.push(id_categoria); }
    if (nova_url_imagem) { setClauses.push(`url_imagem = $${paramIndex++}`); values.push(nova_url_imagem); }
    
    // Se novo PDF foi upado, atualiza e marca para deletar o antigo
    let link_pdf_antigo = null; 
    if (novo_link_pdf) { // Se um novo PDF (arquivo ou link) foi fornecido
        setClauses.push(`link_pdf = $${paramIndex++}`); values.push(novo_link_pdf);
        // Primeiro, busca o caminho antigo do PDF para deletar depois
        const resAntigo = await pool.query('SELECT link_pdf FROM artigos WHERE id = $1', [id]);
        if (resAntigo.rows.length > 0) {
            link_pdf_antigo = resAntigo.rows[0].link_pdf;
        }
    }
    
    values.push(id); // O último valor é o ID

    if (setClauses.length === 0) {
        // Se não houver nada para atualizar, apenas retorna o artigo
        const resArtigo = await pool.query('SELECT * FROM artigos WHERE id = $1', [id]);
        return res.status(200).json(resArtigo.rows[0]);
    }

    const query = `
        UPDATE artigos SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
    `;
    
    try {
        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Artigo não encontrado.' });
        }
        
        // Se um novo PDF foi upado (substituindo um arquivo antigo), deleta o arquivo antigo
        if (link_pdf_antigo && link_pdf_antigo.startsWith('/uploads/')) {
            const fullPathAntigo = path.join(uploadDir, link_pdf_antigo.replace('/uploads/', ''));
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


module.exports = {
    criarArtigo,
    listarArtigos,
    atualizarArtigo,
    deletarArtigo,
    downloadPdf,
};