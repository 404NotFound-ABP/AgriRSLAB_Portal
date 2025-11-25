const { pool } = require('../database/dbConfig');

exports.buscarGeral = async (req, res) => {
    try {
        const termo = req.query.q;

        if (!termo || termo.trim() === '') {
            return res.json({ noticias: [], artigos: [], membros: [], projetos: [], vagas: [] });
        }

        const like = `%${termo}%`;

        const [noticias, artigos, membros, projetos, vagas] = await Promise.all([
            pool.query(`SELECT id_noticias AS id, titulo, subtitulo AS texto, url_imagem 
                        FROM noticias 
                        WHERE (titulo ILIKE $1 OR subtitulo ILIKE $1 OR texto ILIKE $1) 
                        AND exibir = TRUE`, [like]),

            pool.query(`SELECT id, titulo, link_pdf AS texto, url_imagem 
                        FROM artigos 
                        WHERE (titulo ILIKE $1) 
                        AND exibir = TRUE`, [like]),

            pool.query(`SELECT id, nome AS titulo, descricao AS texto, foto AS url_imagem 
                        FROM membros 
                        WHERE (nome ILIKE $1 OR descricao ILIKE $1) 
                        AND exibir = TRUE`, [like]),

            pool.query(`SELECT id, titulo, conteudo AS texto, url_imagem 
                        FROM projetos 
                        WHERE (titulo ILIKE $1 OR conteudo ILIKE $1) 
                        AND exibir = TRUE`, [like]),

            pool.query(`SELECT vaga_id AS id, titulo, descricao AS texto 
                        FROM vagas 
                        WHERE (titulo ILIKE $1 OR descricao ILIKE $1) 
                        AND exibir = TRUE`, [like])
        ]);

        return res.json({
            noticias: noticias.rows,
            artigos: artigos.rows,
            membros: membros.rows,
            projetos: projetos.rows,
            vagas: vagas.rows
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erro no servidor" });
    }
};
