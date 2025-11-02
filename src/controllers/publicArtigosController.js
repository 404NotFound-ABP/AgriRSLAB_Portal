// src/controllers/publicArtigosController.js

const { pool } = require('../database/dbConfig');

/**
 * [R]EAD - Listar Artigos Públicos (GET)
 * Retorna apenas os artigos onde o campo 'exibir' é TRUE.
 */
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
    listarArtigosPublicos,
};