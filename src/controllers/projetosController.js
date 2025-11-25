const { pool } = require('../database/dbConfig');
const fs = require('fs');
const path = require('path');

// Pasta uploads/projetos
const uploadDir = path.resolve(__dirname, '..', 'upload', 'projetos');

// Garante que a pasta exista
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------------------------------------------
// [C] Criar Projeto
// ------------------------------------------------------

async function createProjeto(req, res) {
    let { titulo, conteudo, autores, exibir, fase, destaque } = req.body;

    exibir = (exibir === 'on' || exibir === 'true' || exibir === true);
    destaque = (destaque === 'on' || destaque === 'true' || destaque === true);
    fase = fase || 'finalizado';

    // Se marcar destaque, desmarca todos os outros
    if (destaque) {
        await pool.query("UPDATE projetos SET destaque = false");
    }

    const imagemFile =
        req.files &&
        req.files['imagem'] &&
        req.files['imagem'][0]
            ? req.files['imagem'][0]
            : null;

    const final_imagem = imagemFile
        ? `/uploads/projetos/${imagemFile.filename}`
        : null;

    if (!titulo || !conteudo) {
        return res.status(400).json({
            mensagem: 'Titulo e conteudo sao obrigatorios.'
        });
    }

    const query = `
        INSERT INTO projetos (titulo, conteudo, autores, url_imagem, exibir, fase, destaque)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [titulo, conteudo, autores || null, final_imagem, exibir, fase, destaque];

    try {
        const resultado = await pool.query(query, values);
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao criar projeto:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao criar projeto.' });
    }
}



// ------------------------------------------------------
// [R] Listar todos
// ------------------------------------------------------

async function getAllProjetos(req, res) {
    try {
        const resultado = await pool.query(
            'SELECT * FROM projetos ORDER BY id DESC'
        );
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao listar projetos:', error.message);
        res.status(500).json({ mensagem: 'Erro ao listar projetos.' });
    }
}


// ------------------------------------------------------
// [R] Listar publicos
// ------------------------------------------------------

async function getProjetosPublicados(req, res) {
    try {
        const resultado = await pool.query(
            'SELECT * FROM projetos WHERE exibir = true ORDER BY id DESC'
        );
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao listar projetos publicos:', error.message);
        res.status(500).json({ mensagem: 'Erro ao listar projetos publicos.' });
    }
}


async function getProjetoById(req, res) {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            'SELECT * FROM projetos WHERE id = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Projeto nao encontrado.' });
        }

        res.status(200).json(resultado.rows[0]);

    } catch (error) {
        console.error('Erro ao buscar projeto por ID:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao buscar projeto.' });
    }
}

// ------------------------------------------------------
// [U] Atualizar Projeto
// ------------------------------------------------------

async function updateProjeto(req, res) {
    const { id } = req.params;

    try {
        const resAntigo = await pool.query(
            'SELECT url_imagem FROM projetos WHERE id = $1',
            [id]
        );

        if (resAntigo.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Projeto nao encontrado.' });
        }

        const projetoAntigo = resAntigo.rows[0];

        let { titulo, conteudo, autores, exibir, fase, destaque } = req.body;

        exibir = (exibir === 'on' || exibir === 'true' || exibir === true);
        destaque = (destaque === 'on' || destaque === 'true' || destaque === true);

        // Se marcar destaque, desmarca os outros
        if (destaque) {
            await pool.query("UPDATE projetos SET destaque = false");
        }

        const imagemFile =
            req.files &&
            req.files['imagem'] &&
            req.files['imagem'][0]
                ? req.files['imagem'][0]
                : null;

        const nova_imagem = imagemFile
            ? `/uploads/projetos/${imagemFile.filename}`
            : undefined;

        let sets = [];
        let values = [];
        let idx = 1;

        if (titulo) { sets.push(`titulo = $${idx++}`); values.push(titulo); }
        if (conteudo) { sets.push(`conteudo = $${idx++}`); values.push(conteudo); }
        if (autores) { sets.push(`autores = $${idx++}`); values.push(autores); }
        if (fase) { sets.push(`fase = $${idx++}`); values.push(fase); }

        if (nova_imagem !== undefined) {
            sets.push(`url_imagem = $${idx++}`);
            values.push(nova_imagem);
        }

        sets.push(`exibir = $${idx++}`);
        values.push(exibir);

        sets.push(`destaque = $${idx++}`);
        values.push(destaque);

        values.push(id);

        const query = `
            UPDATE projetos SET ${sets.join(', ')}
            WHERE id = $${idx}
            RETURNING *;
        `;

        const resultado = await pool.query(query, values);

        if (
            nova_imagem &&
            projetoAntigo.url_imagem &&
            projetoAntigo.url_imagem.startsWith('/uploads/projetos/')
        ) {
            const oldPath = path.join(
                uploadDir,
                projetoAntigo.url_imagem.replace('/uploads/projetos/', '')
            );
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        res.status(200).json(resultado.rows[0]);

    } catch (error) {
        console.error('Erro ao atualizar projeto:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar projeto.' });
    }
}



// ------------------------------------------------------
// [D] Deletar Projeto
// ------------------------------------------------------

async function deleteProjeto(req, res) {
    const { id } = req.params;

    try {
        const resProj = await pool.query(
            'SELECT url_imagem FROM projetos WHERE id = $1',
            [id]
        );

        if (resProj.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Projeto nao encontrado.' });
        }

        const { url_imagem } = resProj.rows[0];

        await pool.query('DELETE FROM projetos WHERE id = $1', [id]);

        if (
            url_imagem &&
            url_imagem.startsWith('/uploads/projetos/')
        ) {
            const fullPath = path.join(
                uploadDir,
                url_imagem.replace('/uploads/projetos/', '')
            );
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        res.status(204).send();

    } catch (error) {
        console.error('Erro ao deletar projeto:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao deletar projeto.' });
    }
}

async function getProjetosPublicosComDestaque(req, res) {
    try {
        const destaque = await pool.query(
            "SELECT * FROM projetos WHERE exibir = true AND destaque = true LIMIT 1"
        );

        const outros = await pool.query(
            "SELECT * FROM projetos WHERE exibir = true AND destaque = false ORDER BY id DESC"
        );

        res.status(200).json({
            destaque: destaque.rows[0] || null,
            outros: outros.rows
        });

    } catch (error) {
        console.error('Erro ao listar projetos com destaque:', error.message);
        res.status(500).json({ mensagem: 'Erro ao listar projetos.' });
    }
}

// ------------------------------------------------------

module.exports = {
    createProjeto,
    getAllProjetos,
    getProjetosPublicados,
    getProjetoById,
    updateProjeto,
    deleteProjeto,
    getProjetosPublicosComDestaque
};

