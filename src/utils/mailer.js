import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const send = (to, subject, html) =>
  transporter.sendMail({
    from: `"PetShop" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });

// ── Layout ────────────────────────────────────────────────────

const EMERALD = '#10b981';
const EMERALD_DARK = '#059669';

const layout = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${EMERALD};padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">🐾 PetShop</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#374151;font-size:15px;line-height:1.7;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 PetShop. Mọi thắc mắc vui lòng liên hệ
                <a href="mailto:${process.env.GMAIL_USER}" style="color:${EMERALD};text-decoration:none;">${process.env.GMAIL_USER}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const btn = (href, text) =>
  `<a href="${href}" style="display:inline-block;margin-top:20px;padding:13px 28px;background:${EMERALD};color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
    ${text}
  </a>`;

// ── Templates ─────────────────────────────────────────────────

export const sendWelcome = (to, fullName) =>
  send(to, '🐾 Chào mừng bạn đến với PetShop!', layout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Xin chào ${fullName}! 👋</h2>
    <p>Tài khoản của bạn đã được tạo thành công tại <strong>PetShop</strong>.</p>
    <p>Khám phá hàng ngàn sản phẩm chất lượng dành cho thú cưng của bạn ngay hôm nay.</p>
    <p>Chúc bạn mua sắm vui vẻ! 🐶🐱</p>
  `));

export const sendPasswordChanged = (to, fullName) =>
  send(to, '🔒 Mật khẩu đã được thay đổi', layout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Xin chào ${fullName},</h2>
    <p>Mật khẩu tài khoản của bạn vừa được <strong>thay đổi thành công</strong>.</p>
    <p style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;color:#92400e;">
      ⚠️ Nếu bạn không thực hiện thao tác này, vui lòng liên hệ với chúng tôi ngay để được hỗ trợ.
    </p>
  `));

export const sendResetPassword = (to, fullName, resetUrl) =>
  send(to, '🔑 Đặt lại mật khẩu PetShop', layout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Xin chào ${fullName},</h2>
    <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>
    ${btn(resetUrl, 'Đặt lại mật khẩu')}
    <p style="margin-top:20px;color:#6b7280;font-size:13px;">
      Link có hiệu lực trong <strong>15 phút</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.
    </p>
  `));

export const sendOrderConfirm = (to, fullName, orderId, total) =>
  send(to, `✅ Xác nhận đơn hàng #${orderId}`, layout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Xin chào ${fullName},</h2>
    <p>Đơn hàng của bạn đã được đặt thành công!</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
      <tr>
        <td style="color:#6b7280;font-size:14px;">Mã đơn hàng</td>
        <td align="right" style="font-weight:700;color:#111827;">#${orderId}</td>
      </tr>
      <tr>
        <td style="color:#6b7280;font-size:14px;padding-top:8px;">Tổng tiền</td>
        <td align="right" style="font-weight:700;color:${EMERALD};font-size:16px;padding-top:8px;">${Number(total).toLocaleString('vi-VN')}đ</td>
      </tr>
    </table>
    <p>Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể. 🐾</p>
  `));

export const sendPromotion = (to, fullName, title, message) =>
  send(to, title, layout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Xin chào ${fullName},</h2>
    <p>${message}</p>
  `));
