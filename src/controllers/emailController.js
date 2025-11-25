const nodemailer = require('nodemailer');

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transportConfig = {
    host,
    port,
    secure
  };

  if (user && pass) {
    transportConfig.auth = {
      user,
      pass
    };
  }

  return nodemailer.createTransport(transportConfig);
}

async function enviarContato(req, res) {
  const { nome, email, assunto, comentario } = req.body || {};

  if (!nome || !email || !comentario) {
    return res.status(400).json({
      mensagem: 'Nome, e-mail e mensagem são obrigatórios.'
    });
  }

  const transporter = createTransporter();
  const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;

  if (!to) {
    return res.status(500).json({
      mensagem: 'E-mail de destino do contato não configurado no servidor.'
    });
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || to;

  const mailOptions = {
    from: `"Site AgriRSLAB" <${fromAddress}>`,
    to,
    replyTo: email,
    subject: assunto ? `Contato: ${assunto}` : 'Contato pelo site',
    text: [
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `Assunto: ${assunto || '-'}`,
      '',
      'Mensagem:',
      comentario
    ].join('\n')
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      mensagem: 'Contato enviado com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail de contato:', error);
    return res.status(500).json({
      mensagem: 'Erro interno ao enviar o e-mail de contato.'
    });
  }
}

async function enviarCandidatura(req, res) {
  const { nome, email, telefone, lattes, resumo } = req.body || {};

  if (!nome || !email) {
    return res.status(400).json({
      mensagem: 'Nome e e-mail são obrigatórios.'
    });
  }

  const transporter = createTransporter();
  const to = process.env.CANDIDATE_TO_EMAIL || process.env.SMTP_USER;

  if (!to) {
    return res.status(500).json({
      mensagem: 'E-mail de destino de candidatura não configurado no servidor.'
    });
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || to;

  const attachments = [];

  if (req.file && req.file.path) {
    attachments.push({
      filename: req.file.originalname || req.file.filename,
      path: req.file.path
    });
  }

  const mailOptions = {
    from: `"Site AgriRSLAB" <${fromAddress}>`,
    to,
    replyTo: email,
    subject: 'Nova candidatura enviada pelo site',
    text: [
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `Telefone: ${telefone || '-'}`,
      `Lattes / Currículo / LinkedIn: ${lattes || '-'}`,
      '',
      'Resumo de experiência:',
      resumo || '-'
    ].join('\n'),
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      mensagem: 'Candidatura enviada com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail de candidatura:', error);
    return res.status(500).json({
      mensagem: 'Erro interno ao enviar o e-mail de candidatura.'
    });
  }
}

module.exports = {
  enviarContato,
  enviarCandidatura
};

