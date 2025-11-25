const { pool } = require("../database/dbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-secret-change-me";
}

async function login(req, res) {
  try {
    const { email_admin, senha_admin } = req.body || {}; // Adaptado para os names do seu HTML atual ou JSON
    
    // Normalização para usar 'mail' e 'senha' internamente
    const mail = email_admin || req.body.mail;
    const senha = senha_admin || req.body.senha;

    if (!mail || !senha) {
      return res.status(400).json({ error: "Informe e-mail e senha" });
    }

    const result = await pool.query(
      "SELECT idusuario, mail, senha FROM usuarios WHERE mail = $1 LIMIT 1",
      [String(mail).trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const user = result.rows[0];
    const senhaValida = await bcrypt.compare(String(senha), user.senha || "");

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gera o Token
    const token = jwt.sign(
      { sub: user.idusuario, mail: user.mail },
      getJwtSecret(),
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Login efetuado com sucesso",
      token,
      usuario: { idusuario: user.idusuario, mail: user.mail },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro ao efetuar login" });
  }
}

module.exports = { login };