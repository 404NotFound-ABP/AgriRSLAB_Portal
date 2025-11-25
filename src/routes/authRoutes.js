const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rota POST para login
router.post("/login", authController.login);

module.exports = router;