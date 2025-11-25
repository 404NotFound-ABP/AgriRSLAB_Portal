// src/controladores/membrosController.js

const { pool } = require('../database/dbConfig');
const fs = require('fs'); // Para deletar arquivos no servidor
const path = require('path');

// Caminho absoluto para a pasta de uploads
const uploadDir = path.resolve(__dirname, '..', 'upload', 'membros');

// Garante que a pasta exista
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- C.R.U.D. Membros ---

// [C]RIAR Membro (POST)
async function criarMembro(req, res) {
    // Dados de texto enviados no corpo da requisição (body)
    let { nome, descricao, foto: fotoUrl, link, id_categoria, exibir } = req.body;

    // Converte 'on' (de um checkbox/switch) para true, e a ausência para false.
    exibir = (exibir === 'on' || exibir === 'true' || exibir === true);

    // Dados dos arquivos de upload (se houver)
    const fotoFile = req.files && req.files['foto'] ? req.files['foto'][0] : null;

    // Se a imagem for uma URL, ela virá no body, senão usaremos o caminho do arquivo upado
    const final_foto = fotoFile ? `/uploads/membros/${fotoFile.filename}` : fotoUrl;

    // Verifica se os campos obrigatórios foram preenchidos
    if (!nome || !descricao || !final_foto || !id_categoria) {
        return res.status(400).json({
            mensagem: 'Faltam dados obrigatórios (nome, descrição, foto e grupo).'
        });
    }

    const query = `
        INSERT INTO membros (nome, descricao, foto, link, id_categoria, exibir)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [nome, descricao, final_foto, link || null, id_categoria, exibir];

    try {
        const resultado = await pool.query(query, values);
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao cadastrar membro:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao criar membro.' });
    }
}


// [R]EAD - Listar Membros (GET)
async function listarMembros(req, res) {
    const query = `
        SELECT 
            m.id, m.nome, m.descricao, m.foto, m.link, m.id_categoria, m.exibir,
            g.nome AS grupo_nome
        FROM membros m
        LEFT JOIN categoria_membros g ON m.id_categoria = g.id
        ORDER BY g.nome, m.nome;
    `;

    try {
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao listar membros:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao listar membros.' });
    }
}


// [U]PDATE - Atualizar membro (PUT)
async function atualizarMembro(req, res) {
    const { id } = req.params;
    
    try {
        // 1. Busca o membro existente para obter o caminho da foto antiga
        const resAntigo = await pool.query(
            'SELECT foto FROM membros WHERE id = $1',
            [id]
        );
        if (resAntigo.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Membro não encontrado para atualização.' });
        }
        const membroAntigo = resAntigo.rows[0];

        // 2. Processa os dados recebidos
        let { nome, descricao, link, id_categoria, exibir } = req.body;
        
        // Converte 'on' (de um checkbox/switch) para true. 
        // Se o campo não for enviado (checkbox desmarcado), o valor será false.
        const exibirFinal = (exibir === 'on' || exibir === 'true' || exibir === true);

        // Garante que só consideramos um arquivo se ele realmente foi enviado (tem um nome)
        const fotoFile =
            req.files &&
            req.files['foto'] &&
            req.files['foto'][0] &&
            req.files['foto'][0].filename
                ? req.files['foto'][0]
                : null;

        // Define os novos caminhos/valores
        // Define a nova foto apenas se um novo arquivo foi upado ou uma nova URL foi fornecida.
        // Caso contrário, será `undefined` e não entrará na query de atualização, preservando o valor antigo.
        const nova_foto = fotoFile
            ? `/uploads/membros/${fotoFile.filename}`
            : (req.body['edit-foto_input'] || undefined);

        // 3. Monta a query de atualização dinamicamente
        let setClauses = [];
        let values = [];
        let paramIndex = 1;

        if (nome) {
            setClauses.push(`nome = $${paramIndex++}`);
            values.push(nome);
        }
        if (descricao) {
            setClauses.push(`descricao = $${paramIndex++}`);
            values.push(descricao);
        }
        if (link) {
            setClauses.push(`link = $${paramIndex++}`);
            values.push(link);
        }
        if (id_categoria) {
            setClauses.push(`id_categoria = $${paramIndex++}`);
            values.push(id_categoria);
        }

        // Apenas adiciona a cláusula de atualização da foto se um novo valor foi realmente fornecido
        if (nova_foto !== undefined) {
            setClauses.push(`foto = $${paramIndex++}`);
            values.push(nova_foto);
        }

        // Sempre atualiza o campo 'exibir' com base no estado do switch (marcado ou não)
        setClauses.push(`exibir = $${paramIndex++}`);
        values.push(exibirFinal);

        // Se não houver campos para atualizar, retorna sucesso sem fazer nada no banco
        if (setClauses.length === 0) {
            return res.status(200).json(membroAntigo);
        }

        values.push(id); // Adiciona o ID como último parâmetro para a cláusula WHERE

        const query = `
            UPDATE membros SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;

        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Membro não encontrado.' });
        }
        
        // 4. Deleta foto antiga do servidor se ela foi substituída
        if (
            nova_foto !== undefined &&
            nova_foto !== membroAntigo.foto &&
            membroAntigo.foto &&
            membroAntigo.foto.startsWith('/uploads/membros/')
        ) {
            const fullPathAntigo = path.join(
                uploadDir,
                membroAntigo.foto.replace('/uploads/membros/', '')
            );
            if (fs.existsSync(fullPathAntigo)) {
                fs.unlinkSync(fullPathAntigo);
            }
        }

        res.status(200).json(resultado.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar membro:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao atualizar membro.' });
    }
}


// [D]ELETE - Deletar Membro (DELETE)
async function deletarMembro(req, res) {
    const { id } = req.params;

    try {
        // 1. Busca o membro para obter o caminho da foto (se for local)
        const resMembro = await pool.query(
            'SELECT foto FROM membros WHERE id = $1',
            [id]
        );
        if (resMembro.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Membro não encontrado.' });
        }
        const { foto } = resMembro.rows[0];

        // 2. Deleta o registro do banco de dados
        const query = 'DELETE FROM membros WHERE id = $1;';
        const resultado = await pool.query(query, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Membro não encontrado.' });
        }
        
        // 3. Deleta a foto do servidor se for caminho local
        if (foto && foto.startsWith('/uploads/membros/')) {
            const fullPathImg = path.join(
                uploadDir,
                foto.replace('/uploads/membros/', '')
            );
            if (fs.existsSync(fullPathImg)) {
                fs.unlinkSync(fullPathImg);
            }
        }

        res.status(204).send(); // 204 No Content para deleção bem sucedida
    } catch (error) {
        console.error('Erro ao deletar membro:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao excluir membro.' });
    }
}


// -------------------------------------

async function listarMembrosPublicos(req, res) {
    const query = `
        SELECT 
            m.id, m.nome, m.descricao, m.foto, m.link, m.id_categoria, m.exibir,
            g.nome AS grupo_nome
        FROM membros m
        LEFT JOIN categoria_membros g ON m.id_categoria = g.id
        WHERE m.exibir = TRUE
        ORDER BY g.nome, m.nome;
    `;

    try {
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao listar membros públicos:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao listar membros.' });
    }
}


module.exports = {
    criarMembro,
    listarMembros,
    atualizarMembro,
    deletarMembro,
    listarMembrosPublicos,
};
