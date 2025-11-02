// src/database/dbConfig.js

const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432, // Porta padrão do PostgreSQL
});

// Um teste simples de conexão (opcional)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    } else {
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso:', res.rows[0].now);
    }
});

module.exports = {
    pool,
};