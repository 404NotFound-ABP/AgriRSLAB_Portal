// src/routes/publicArtigosRoutes.js

const express = require('express');
const router = express.Router();
const publicArtigosController = require('../controllers/publicArtigosController');

// GET: Listar todos os Artigos públicos (onde exibir = true)
router.get('/', publicArtigosController.listarArtigosPublicos);


module.exports = router;