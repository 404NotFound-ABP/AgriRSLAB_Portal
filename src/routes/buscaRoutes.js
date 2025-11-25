const express = require('express');
const router = express.Router();
const { buscarGeral } = require('../controllers/buscaController');

router.get('/', buscarGeral);

module.exports = router;
