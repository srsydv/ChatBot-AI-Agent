const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });
  return transporter;
};


const sendOTPEmail = async (toEmail, otp) => {
  const transport = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com';
  const appName = process.env.APP_NAME || 'Allo';

  if (!transport) {
    console.log(`[OTP] No SMTP configured. OTP for ${toEmail}: ${otp}`);
    return true;
  }

  try {
    await transport.sendMail({
      from: `"${appName}" <${from}>`,
      to: toEmail,
      subject: `Your ${appName} login code`,
      text: `Your one-time login code is: ${otp}\n\nThis code expires in 10 minutes.`,
      html: `
        <p>Your one-time login code is:</p>
        <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p>
        <p style="color:#888;">This code expires in 10 minutes.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Send OTP email error:', err);
    throw err;
  }
};

module.exports = { sendOTPEmail, getTransporter };
