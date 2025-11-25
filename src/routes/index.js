const express = require("express");
const router = express.Router();


const noticias = require("./noticiaRoutes");
const artigos = require("./artigosRoutes")
const membros = require("./membrosRoutes");
const projetos = require("./projetosRoutes");
const email = require("./emailRoutes");
const vagas = require("./vagasRoutes");
const busca = require("./buscaRoutes");

router.use('/noticias', noticias);
router.use('/artigos', artigos);
router.use('/membros', membros); 
router.use('/projetos', projetos);
router.use('/email', email);
router.use('/vagas', vagas);
router.use('/busca', require('./buscaRoutes'));

module.exports = router;
