import crypto from 'crypto';

/**
 * Sắp xếp object theo key và tạo chuỗi query string (không encode giá trị)
 */
function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = obj[key];
      return sorted;
    }, {});
}

/**
 * Tạo URL thanh toán VNPay
 * @param {object} params
 * @param {number} params.orderId
 * @param {number} params.amount - Số tiền VND (chưa nhân 100)
 * @param {string} params.orderInfo - Mô tả đơn hàng
 * @param {string} params.ipAddr - IP của client
 * @param {string} [params.locale='vn'] - 'vn' hoặc 'en'
 * @returns {string} URL redirect đến VNPay
 */
export function createVNPayUrl({ orderId, amount, orderInfo, ipAddr, locale = 'vn' }) {
  const {
    VNPAY_TMN_CODE,
    VNPAY_HASH_SECRET,
    VNPAY_URL,
    VNPAY_RETURN_URL,
  } = process.env;

  // VNPay yêu cầu createDate theo giờ GMT+7, format YYYYMMDDHHmmss
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const createDate = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

  // orderInfo chỉ được chứa chữ cái, số, dấu cách — không dùng ký tự đặc biệt
  const safeOrderInfo = orderInfo.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 255);

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Locale: locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: safeOrderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(amount) * 100, // VNPay yêu cầu nhân 100
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sorted = sortObject(params);

  // Build URLSearchParams để encode đúng chuẩn
  const urlParams = new URLSearchParams(sorted);

  // Tính HMAC trên chuỗi đã encode (không bao gồm vnp_SecureHash)
  const signData = urlParams.toString();
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  urlParams.append('vnp_SecureHash', secureHash);
  return `${VNPAY_URL}?${urlParams.toString()}`;
}

/**
 * Verify chữ ký từ VNPay callback
 * @param {object} query - req.query từ VNPay redirect về
 * @returns {{ isValid: boolean, isSuccess: boolean, orderId: string, transactionNo: string }}
 */
export function verifyVNPayReturn(query) {
  const { vnp_SecureHash, vnp_SecureHashType, ...params } = query;
  const sorted = sortObject(params);

  const signData = new URLSearchParams(sorted).toString();

  const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
  const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValid = expectedHash === vnp_SecureHash;
  const isSuccess = params.vnp_ResponseCode === '00';

  return {
    isValid,
    isSuccess,
    orderId: params.vnp_TxnRef,
    transactionNo: params.vnp_TransactionNo,
    responseCode: params.vnp_ResponseCode,
  };
}
