const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER && process.env.EMAIL_USER.trim();
const emailPass = process.env.EMAIL_PASS && process.env.EMAIL_PASS.trim();

const transporter =
  emailUser && emailPass
    ? nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: emailUser,
          // Gmail requires an App Password here, not the normal account password.
          pass: emailPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      })
    : null;

const getEmailConfigurationError = () => {
  if (!emailUser || !emailPass) {
    return new Error('Email service is not configured.');
  }

  return null;
};

const sendEmail = async (options) => {
  const configurationError = getEmailConfigurationError();
  if (configurationError) {
    throw configurationError;
  }

  const mailOptions = {
    from: `"Platform Support" <${emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    if (!transporter) {
      throw configurationError;
    }

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

sendEmail.isConfigured = () => !getEmailConfigurationError();

module.exports = sendEmail;
