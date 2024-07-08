const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Crear transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Configurar opciones del email
  const mensaje = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.mensaje,
    html: options.html // Opcional: para enviar emails en formato HTML
  };

  try {
    // Enviar email
    const info = await transporter.sendMail(mensaje);
    console.log('Email enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('Error al enviar email');
  }
};

module.exports = sendEmail;
