import nodemailer from "nodemailer";

let transporter = null;

// Credentials come ONLY from environment variables — never hardcode them.
// Local: backend/.env   |   Vercel: Project → Settings → Environment Variables
export const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "Email is not configured. Set EMAIL_USER and EMAIL_PASS env vars."
    );
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
};

export const sendOtpMail = async (to, code) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e7e5e4;border-radius:16px;">
      <h2 style="color:#0f172a;margin:0 0 8px;">Your PlayTube code</h2>
      <p style="color:#64748b;font-size:14px;">Enter this 6-digit code to verify your email. It expires in 10 minutes.</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#ea580c;text-align:center;padding:16px;background:#fff7ed;border-radius:12px;margin:16px 0;">${code}</div>
      <p style="color:#94a3b8;font-size:12px;">Didn't ask for this? Ignore the email — nothing changes.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: `"PlayTube" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${code} is your PlayTube verification code`,
    text: `Your PlayTube verification code is ${code}. It expires in 10 minutes.`,
    html,
  });
};

export const sendResetMail = async (to, link) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e7e5e4;border-radius:16px;">
      <h2 style="color:#0f172a;margin:0 0 8px;">Reset your PlayTube password</h2>
      <p style="color:#64748b;font-size:14px;">Someone asked for a new password on this email. The link below works once and expires in 15 minutes.</p>
      <a href="${link}" style="display:block;text-align:center;font-size:15px;font-weight:700;color:#ffffff;background:#ea580c;border-radius:12px;padding:14px;margin:16px 0;text-decoration:none;">Set a new password</a>
      <p style="color:#94a3b8;font-size:12px;">Wasn't you? Ignore this email — your password stays exactly as it is.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: `"PlayTube" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your PlayTube password",
    text: `Reset your PlayTube password (expires in 15 minutes): ${link}`,
    html,
  });
};
