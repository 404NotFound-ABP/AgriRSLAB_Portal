const express = require('express');
const router = express.Router();
const vagasController = require('../controllers/vagasController');

// Rotas públicas
router.get('/publicos', vagasController.listarVagasPublicas);

// Rotas administrativas
router.post('/', vagasController.criarVaga);
router.get('/', vagasController.listarVagas); // lista tudo
router.get('/:id', vagasController.buscarVagaPorId);
router.put('/:id', vagasController.atualizarVaga);
router.delete('/:id', vagasController.deletarVaga);
router.patch('/:id/exibir', vagasController.atualizarExibir);

module.exports = router;
