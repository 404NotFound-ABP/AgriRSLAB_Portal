// src/controllers/vagasController.js

const { pool } = require('../database/dbConfig');


// ------------------------------------------------------------
// --- C.R.U.D. VAGAS ---
// ------------------------------------------------------------



// [C]RIAR Vaga (POST)
async function criarVaga(req, res) {
    const { titulo, descricao, link_candidatura, requisitos, beneficios, exibir } = req.body;

    // Validação básica
    if (!titulo || !descricao) {
        return res.status(400).json({ mensagem: 'Preencha título e descrição.' });
    }

    // Converte o valor recebido do checkbox/switch para booleano real
    const exibirFinal = (exibir === 'on' || exibir === 'true' || exibir === true);

    const query = `
        INSERT INTO vagas (titulo, descricao, link_candidatura, exibir)
        VALUES ($1, $2, $3, $4)
        RETURNING vaga_id;
    `;

    const values = [
        titulo,
        descricao,
        link_candidatura || null,
        exibirFinal
    ];

    try {
        // Insere vaga
        const vagaResult = await pool.query(query, values);
        const vagaId = vagaResult.rows[0].vaga_id;

        // Insere requisitos
        if (Array.isArray(requisitos)) {
            for (const r of requisitos) {
                await pool.query(
                    `INSERT INTO requisitos_vaga (vaga_id, descricao) VALUES ($1, $2)`,
                    [vagaId, r]
                );
            }
        }

        // Insere benefícios
        if (Array.isArray(beneficios)) {
            for (const b of beneficios) {
                await pool.query(
                    `INSERT INTO beneficios_vaga (vaga_id, descricao) VALUES ($1, $2)`,
                    [vagaId, b]
                );
            }
        }

        res.status(201).json({ mensagem: 'Vaga criada com sucesso.', vagaId });

    } catch (error) {
        console.error('Erro ao criar vaga:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao criar vaga.' });
    }
}



// [R]EAD – Listar vagas para ADMIN (GET)
async function listarVagas(req, res) {
    const query = `
        SELECT *
        FROM vagas
        ORDER BY data_criacao DESC;
    `;

    try {
        const resultado = await pool.query(query);
        const lista = [];

        // Carrega requisitos e benefícios de cada vaga
        for (const v of resultado.rows) {
            const reqs = await pool.query(
                `SELECT descricao FROM requisitos_vaga WHERE vaga_id = $1`,
                [v.vaga_id]
            );

            const bens = await pool.query(
                `SELECT descricao FROM beneficios_vaga WHERE vaga_id = $1`,
                [v.vaga_id]
            );

            lista.push({
                ...v,
                requisitos: reqs.rows.map(r => r.descricao),
                beneficios: bens.rows.map(b => b.descricao)
            });
        }

        res.status(200).json(lista);

    } catch (error) {
        console.error('Erro ao listar vagas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao listar vagas.' });
    }
}



// [R]EAD – Listar vagas públicas (Somente exibir = true)
async function listarVagasPublicas(req, res) {
    const query = `
        SELECT *
        FROM vagas
        WHERE exibir = TRUE
        ORDER BY data_criacao DESC;
    `;

    try {
        const resultado = await pool.query(query);
        const lista = [];

        for (const v of resultado.rows) {
            const reqs = await pool.query(
                `SELECT descricao FROM requisitos_vaga WHERE vaga_id = $1`,
                [v.vaga_id]
            );

            const bens = await pool.query(
                `SELECT descricao FROM beneficios_vaga WHERE vaga_id = $1`,
                [v.vaga_id]
            );

            lista.push({
                ...v,
                requisitos: reqs.rows.map(r => r.descricao),
                beneficios: bens.rows.map(b => b.descricao)
            });
        }

        res.status(200).json(lista);

    } catch (error) {
        console.error('Erro ao listar vagas públicas:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao listar vagas públicas.' });
    }
}



// [R]EAD – Buscar vaga por ID (GET)
async function buscarVagaPorId(req, res) {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            `SELECT * FROM vagas WHERE vaga_id = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Vaga não encontrada.' });
        }

        const vaga = resultado.rows[0];

        const reqs = await pool.query(
            `SELECT descricao FROM requisitos_vaga WHERE vaga_id = $1`,
            [id]
        );

        const bens = await pool.query(
            `SELECT descricao FROM beneficios_vaga WHERE vaga_id = $1`,
            [id]
        );

        vaga.requisitos = reqs.rows.map(r => r.descricao);
        vaga.beneficios = bens.rows.map(b => b.descricao);

        res.status(200).json(vaga);

    } catch (error) {
        console.error('Erro ao buscar vaga:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao buscar vaga.' });
    }
}



// [U]PDATE – Atualizar vaga (PUT)
async function atualizarVaga(req, res) {
    const { id } = req.params;
    const { titulo, descricao, link_candidatura, requisitos, beneficios, exibir } = req.body;

    const exibirFinal = (exibir === 'on' || exibir === 'true' || exibir === true);

    try {
        // Atualiza vaga principal
        const query = `
            UPDATE vagas
            SET titulo = $1, descricao = $2, link_candidatura = $3, exibir = $4
            WHERE vaga_id = $5
        `;

        await pool.query(query, [
            titulo,
            descricao,
            link_candidatura || null,
            exibirFinal,
            id
        ]);

        // Limpa e reinsere requisitos
        await pool.query(`DELETE FROM requisitos_vaga WHERE vaga_id = $1`, [id]);

        if (Array.isArray(requisitos)) {
            for (const r of requisitos) {
                await pool.query(
                    `INSERT INTO requisitos_vaga (vaga_id, descricao) VALUES ($1, $2)`,
                    [id, r]
                );
            }
        }

        // Limpa e reinsere benefícios
        await pool.query(`DELETE FROM beneficios_vaga WHERE vaga_id = $1`, [id]);

        if (Array.isArray(beneficios)) {
            for (const b of beneficios) {
                await pool.query(
                    `INSERT INTO beneficios_vaga (vaga_id, descricao) VALUES ($1, $2)`,
                    [id, b]
                );
            }
        }

        res.status(200).json({ mensagem: 'Vaga atualizada com sucesso.' });

    } catch (error) {
        console.error('Erro ao atualizar vaga:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar vaga.' });
    }
}



// [D]ELETE – Deletar vaga (DELETE)
async function deletarVaga(req, res) {
    const { id } = req.params;

    try {
        // Remove itens dependentes
        await pool.query(`DELETE FROM requisitos_vaga WHERE vaga_id = $1`, [id]);
        await pool.query(`DELETE FROM beneficios_vaga WHERE vaga_id = $1`, [id]);

        // Remove vaga
        await pool.query(`DELETE FROM vagas WHERE vaga_id = $1`, [id]);

        res.status(204).send();

    } catch (error) {
        console.error('Erro ao deletar vaga:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao deletar vaga.' });
    }
}



// [PATCH] Atualizar exibição (mostrar/ocultar vaga)
async function atualizarExibir(req, res) {
    const { id } = req.params;
    const { exibir } = req.body;

    const exibirFinal = (exibir === 'on' || exibir === 'true' || exibir === true);

    try {
        await pool.query(
            `UPDATE vagas SET exibir = $1 WHERE vaga_id = $2`,
            [exibirFinal, id]
        );

        res.status(200).json({ mensagem: 'Exibição atualizada.' });

    } catch (error) {
        console.error('Erro ao atualizar exibição:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao atualizar exibição.' });
    }
}



// ------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------
module.exports = {
    criarVaga,
    listarVagas,
    listarVagasPublicas,
    buscarVagaPorId,
    atualizarVaga,
    deletarVaga,
    atualizarExibir
};
