import { Payment, Order } from '../models/index.js';
import { createVNPayUrl, verifyVNPayReturn } from '../utils/vnpay.js';
import { success, error } from '../utils/response.js';

// ── VNPay ─────────────────────────────────────────────────────

/**
 * POST /api/v1/payments/vnpay/create
 * Body: { order_id }
 * Tạo URL thanh toán VNPay và trả về cho client redirect
 */
export const createVNPayPayment = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    if (!order_id) return error(res, 'Thiếu order_id', 400);

    const order = await Order.findOne({
      where: { pk_order_id: order_id, fk_user_id: req.user.pk_user_id },
      include: [{ association: 'payment' }],
    });
    if (!order) return error(res, 'Đơn hàng không tồn tại', 404);
    if (order.payment?.status === 'success') return error(res, 'Đơn hàng đã được thanh toán', 400);
    if (order.payment_method !== 'vnpay') return error(res, 'Đơn hàng không dùng phương thức VNPay', 400);

    const ipAddr =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const payUrl = createVNPayUrl({
      orderId: order.pk_order_id,
      amount: Number(order.total),
      orderInfo: `Thanh toan don hang ${order.pk_order_id}`,
      ipAddr,
    });

    console.log('[VNPay] pay_url:', payUrl);
    return success(res, { pay_url: payUrl });
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/payments/vnpay/callback
 * VNPay redirect về sau khi user thanh toán (có hoặc không thành công)
 */
export const vnpayCallback = async (req, res, next) => {
  try {
    const { isValid, isSuccess, orderId, transactionNo } = verifyVNPayReturn(req.query);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!isValid) {
      return res.redirect(`${frontendUrl}/payment/failed?reason=invalid_signature`);
    }

    await Payment.update(
      {
        status: isSuccess ? 'success' : 'failed',
        transaction_ref: transactionNo,
        paid_at: isSuccess ? new Date() : null,
      },
      { where: { fk_order_id: orderId } }
    );

    if (isSuccess) {
      await Order.update({ payment_status: 'paid' }, { where: { pk_order_id: orderId } });
    } else {
      await Order.update({ payment_status: 'failed' }, { where: { pk_order_id: orderId } });
    }

    return res.redirect(
      isSuccess
        ? `${frontendUrl}/payment/success?order_id=${orderId}`
        : `${frontendUrl}/payment/failed?order_id=${orderId}&code=${req.query.vnp_ResponseCode}`
    );
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/payments/vnpay/ipn
 * VNPay gọi server-to-server để xác nhận giao dịch (IPN)
 * Endpoint này KHÔNG cần auth middleware
 */
export const vnpayIPN = async (req, res, next) => {
  try {
    const { isValid, isSuccess, orderId, transactionNo } = verifyVNPayReturn(req.query);

    if (!isValid) {
      return res.json({ RspCode: '97', Message: 'Invalid signature' });
    }

    const payment = await Payment.findOne({ where: { fk_order_id: orderId } });
    if (!payment) return res.json({ RspCode: '01', Message: 'Order not found' });
    if (payment.status === 'success') return res.json({ RspCode: '02', Message: 'Order already confirmed' });

    await Payment.update(
      {
        status: isSuccess ? 'success' : 'failed',
        transaction_ref: transactionNo,
        paid_at: isSuccess ? new Date() : null,
      },
      { where: { fk_order_id: orderId } }
    );

    if (isSuccess) {
      await Order.update({ payment_status: 'paid' }, { where: { pk_order_id: orderId } });
    } else {
      await Order.update({ payment_status: 'failed' }, { where: { pk_order_id: orderId } });
    }

    return res.json({ RspCode: '00', Message: 'Confirm success' });
  } catch (err) { next(err); }
};

// ── MoMo (placeholder — chưa implement) ──────────────────────

export const momoCallback = async (req, res, next) => {
  try {
    const { orderId, resultCode, transId } = req.body;
    const isSuccess = resultCode === 0;
    await Payment.update(
      { status: isSuccess ? 'success' : 'failed', transaction_ref: String(transId), paid_at: isSuccess ? new Date() : null },
      { where: { fk_order_id: orderId } }
    );
    if (isSuccess) await Order.update({ payment_status: 'paid' }, { where: { pk_order_id: orderId } });
    return res.json({ message: 'OK' });
  } catch (err) { next(err); }
};
