const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const artigosController = require('../controllers/artigosController');

// --- Configuração do Multer para Upload ---
const uploadDir = path.resolve(__dirname, '..', 'upload');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // O Multer vai salvar os arquivos na pasta 'src/upload'
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Define o nome do arquivo como: timestamp-nomeoriginal.ext
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Inicializa o Multer: aceita 1 imagem e 1 pdf
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 1024 * 1024 * 20 // Limite de 5MB por arquivo, ajuste se necessário
    }
}).fields([
    { name: 'imagem', maxCount: 1 }, // Campo 'imagem' para o upload
    { name: 'pdf', maxCount: 1 }     // Campo 'pdf' para o upload
]); 
// ------------------------------------------


// controller para listar os artigos no site (publico)
router.get('/publicos', artigosController.listarArtigosPublicos);


// Rotas para o CRUD de Artigos/Publicações (pág. ADMIN)

// POST: Criar Artigo (com upload)
// Note que usamos "upload" como um middleware antes do controller
router.post('/', upload, artigosController.criarArtigo);
router.get('/', artigosController.listarArtigos);
router.put('/:id', upload, artigosController.atualizarArtigo);
router.delete('/:id', artigosController.deletarArtigo);

// GET: Rota específica para download do PDF
router.get('/:id/download', artigosController.downloadPdf);

module.exports = router;