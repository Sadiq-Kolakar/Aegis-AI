const nodemailer = require('nodemailer');

function getTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Export async function sendAlert(sender, text, reason, parent_message)
 * - If imageData is provided, attach + embed inline.
 * - Never throws.
 */
async function sendAlert(sender, text, reason, parent_message, imageData) {
  try {
    const to = process.env.PARENT_EMAIL;
    const from = process.env.EMAIL_USER;
    if (!to || !from) return;

    const transporter = getTransport();
    if (!transporter) return;

    const safeSender = escapeHtml(sender);
    const safeText = escapeHtml(text);
    const safeReason = escapeHtml(reason);
    const safeParent = escapeHtml(parent_message);

    const hasScreenshot = typeof imageData === 'string' && imageData.startsWith('data:image/png');

    const attachments = [];
    if (hasScreenshot) {
      const b64 = imageData.replace(/^data:image\/png;base64,/, '');
      attachments.push({
        filename: 'aegis-incident-screenshot.png',
        content: b64,
        encoding: 'base64',
        cid: 'screenshot',
        contentDisposition: 'inline'
      });
    }

    const screenshotSection = hasScreenshot
      ? `
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0" />
        <div style="margin:0 0 10px 0;font-weight:700;color:#111827">📸 Chat Screenshot at Time of Incident</div>
        <p style="margin:0 0 10px 0;font-size:13px;color:#6b7280">This is what was visible in the chat when Aegis intervened.</p>
        <img src="cid:screenshot" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;display:block" />
      `
      : '';

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; background:#f3f4f6; padding:22px">
        <div style="max-width:640px;margin:0 auto">
          <div style="background:#b91c1c;color:white;padding:14px 18px;border-radius:12px 12px 0 0;font-weight:800;font-size:16px">
            🛡️ Aegis Safety Alert
          </div>
          <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:18px;border-radius:0 0 12px 12px">
            <p style="margin:0 0 14px 0;color:#111827;font-size:14px">
              A harmful message was detected and blocked on Aegis.
            </p>

            <div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin:0 0 12px 0">
              <div style="font-size:13px;color:#374151;margin:0 0 6px 0">Blocked message</div>
              <div style="font-size:14px;color:#111827;line-height:1.4">“${safeText}”</div>
              <div style="margin-top:8px;font-size:12px;color:#6b7280">Sender: <strong style="color:#111827">${safeSender}</strong></div>
            </div>

            <div style="border-left:4px solid #ef4444;background:#fff1f2;border-radius:10px;padding:12px 14px;margin:0 0 12px 0">
              <div style="font-size:13px;font-weight:700;color:#991b1b;margin:0 0 6px 0">Why it was blocked:</div>
              <div style="font-size:13px;color:#111827">${safeReason}</div>
            </div>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;margin:0 0 14px 0">
              <div style="font-size:13px;font-weight:700;color:#1d4ed8;margin:0 0 6px 0">What this means:</div>
              <div style="font-size:13px;color:#111827;line-height:1.45">${safeParent}</div>
            </div>

            ${screenshotSection}

            <div style="display:flex;gap:10px;margin-top:14px">
              <a href="#" style="flex:1;text-align:center;background:#16a34a;color:white;text-decoration:none;padding:10px 12px;border-radius:10px;font-weight:800;font-size:13px">📞 Call Child</a>
              <a href="#" style="flex:1;text-align:center;background:#ef4444;color:white;text-decoration:none;padding:10px 12px;border-radius:10px;font-weight:800;font-size:13px">🚫 Disable Chat</a>
            </div>

            <div style="margin-top:16px;background:#16a34a;color:white;padding:12px 14px;border-radius:10px;font-size:13px;font-weight:700">
              ✓ The message was blocked before it reached the recipient. Screenshot captured automatically.
            </div>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: '🚨 Aegis Safety Alert — Message Blocked',
      html,
      attachments: attachments.length ? attachments : undefined
    });
  } catch (e) {
    console.log('Aegis mailer error:', e?.message || e);
  }
}

module.exports = { sendAlert };

