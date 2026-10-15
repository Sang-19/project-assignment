const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
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

  await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully to ${options.email}`);
};

module.exports = sendEmail;
