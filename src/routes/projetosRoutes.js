const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const {
    createProjeto,
    getAllProjetos,
    getProjetosPublicados,
    getProjetosPublicosComDestaque,
    getProjetoById,
    updateProjeto,
    deleteProjeto
} = require('../controllers/projetosController');

const uploadDir = path.resolve(__dirname, '..', 'upload', 'projetos');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + unique + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 5 MB
}).fields([{ name: 'imagem', maxCount: 1 }]);


// ==================================================
//  ROTAS ESPECÍFICAS 
// ==================================================

// ✔ Nova rota para destaque
router.get('/publicos-com-destaque', getProjetosPublicosComDestaque);

// ✔ Rota normal de publicados
router.get('/publicos', getProjetosPublicados);

// ✔ Listar todos
router.get('/', getAllProjetos);

// ==================================================
// ROTAS DINÂMICAS 
// ==================================================
router.get('/:id', getProjetoById);
router.post('/', upload, createProjeto);
router.put('/:id', upload, updateProjeto);
router.delete('/:id', deleteProjeto);

module.exports = router;
