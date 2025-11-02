const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das routes
const artigosRoutes = require('./routes/artigosRoutes');
const publicArtigosRoutes = require('./routes/publicArtigosRoutes'); // Rota para a área pública
// const categoriasRoutes = require('./routes/categoriasRoutes'); // Deixaremos simples por enquanto

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir que o frontend acesse a API
app.use(cors()); 

// Middleware para analisar o corpo das requisições como JSON
app.use(express.json());

// Servir arquivos estáticos (como as imagens e PDFs upados)
app.use('/uploads', express.static('src/upload')); // Agora 'http://localhost:3000/uploads/imagem.jpg' funcionará

// routes da aplicação
app.use('/api/artigos', artigosRoutes);
app.use('/api/public-artigos', publicArtigosRoutes); // Endpoint para artigos públicos
// app.use('/api/categorias', categoriasRoutes); // Descomente quando criar as categoriasRoutes

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Arquivos estáticos em http://localhost:${PORT}/uploads`);
});