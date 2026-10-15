const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      // Gmail requires an App Password here, not the normal account password.
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Platform Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error('Email delivery failed:', {
      message: error.message,
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
    });
    throw error;
  }
};

module.exports = sendEmail;
