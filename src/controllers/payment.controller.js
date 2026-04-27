import { Payment, Order } from '../models/index.js';

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

export const vnpayCallback = async (req, res, next) => {
  try {
    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = req.query;
    const isSuccess = vnp_ResponseCode === '00';
    await Payment.update(
      { status: isSuccess ? 'success' : 'failed', transaction_ref: vnp_TransactionNo, paid_at: isSuccess ? new Date() : null },
      { where: { fk_order_id: vnp_TxnRef } }
    );
    if (isSuccess) await Order.update({ payment_status: 'paid' }, { where: { pk_order_id: vnp_TxnRef } });
    return res.redirect(isSuccess ? '/payment/success' : '/payment/failed');
  } catch (err) { next(err); }
};
