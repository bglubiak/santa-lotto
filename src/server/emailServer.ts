import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Environment variables expected:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Or alternatively set EMAIL_SERVICE (e.g. 'gmail') and SMTP_USER/SMTP_PASS
// Optionally: FROM_EMAIL (defaults to SMTP_USER)

const PORT = process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : 4000;

interface OutgoingEmail {
  to: string;
  subject: string;
  body: string; // plain text
}

interface SendEmailsPayload {
  emails: OutgoingEmail[];
}

function buildTransport() {
  if (process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const transporter = buildTransport();

const app = express();
app.use(cors({ origin: [/localhost:\d+$/], methods: ['POST'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/send-emails', async (req, res) => {
  const payload: SendEmailsPayload = req.body;
  if (!payload || !Array.isArray(payload.emails)) {
    return res.status(400).json({ error: 'Invalid payload; expected { emails: [...] }' });
  }
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ error: 'Email credentials not configured.' });
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER!;
  const results: { to: string; success: boolean; error?: string }[] = [];

  for (const email of payload.emails) {
    try {
      await transporter.sendMail({
        from,
        to: email.to,
        subject: email.subject,
        text: email.body,
      });
      results.push({ to: email.to, success: true });
    } catch (err: any) {
      results.push({ to: email.to, success: false, error: err?.message || 'Unknown error' });
    }
  }

  const failed = results.filter(r => !r.success);
  res.json({ total: results.length, failedCount: failed.length, results });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[email-server] listening on http://localhost:${PORT}`);
});

