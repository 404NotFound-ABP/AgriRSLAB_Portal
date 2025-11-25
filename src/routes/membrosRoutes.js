const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const membrosController = require('../controllers/membrosController');

// --- Configuração do Multer para Upload ---
const uploadDir = path.resolve(__dirname, '..', 'upload', 'membros');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // O Multer vai salvar os arquivos na pasta 'src/upload/membros'
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Define o nome do arquivo como: timestamp-nomeoriginal.ext
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Inicializa o Multer: aceita 1 foto
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 1024 * 1024 * 20 // Limite de 5MB por arquivo, ajuste se necessário
    }
}).fields([
    { name: 'foto', maxCount: 1 } // Campo 'foto' para o upload
]); 
// ------------------------------------------

// Rotas CRUD
// POST: Criar Membro (com upload)
// Note que usamos "upload" como um middleware antes do controller
router.post('/', upload, membrosController.criarMembro);

// GET: Listar todos os Membros
router.get('/', membrosController.listarMembros);

// GET: Listar Membros públicos (para o site)
router.get('/publicos', membrosController.listarMembrosPublicos);

// PUT: Atualizar Membro (pode incluir novo upload)
router.put('/:id', upload, membrosController.atualizarMembro);

// DELETE: Deletar Membro
router.delete('/:id', membrosController.deletarMembro);

module.exports = router;
