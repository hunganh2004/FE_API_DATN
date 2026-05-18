/**
 * Chat Controller — RAG Chatbot với Intent Detection
 * Flow: Groq phân tích intent → retrieve đúng data từ DB → Groq tạo câu trả lời
 * Stateless: lịch sử hội thoại do frontend giữ và gửi kèm mỗi request.
 */

import { groq, GROQ_MODEL } from '../utils/aiClient.js';
import { success, error } from '../utils/response.js';
import { Op } from 'sequelize';
import { Order, OrderItem, OrderStatusLog, Product, ProductImage, Category, Wishlist, Review } from '../models/index.js';

// ── Prompt phân tích intent ───────────────────────────────────
const INTENT_PROMPT = `Bạn là bộ phân tích intent cho chatbot cửa hàng phụ kiện thú cưng.
Phân tích câu hỏi của user và trả về JSON với format sau (KHÔNG giải thích gì thêm, chỉ trả JSON):

Các intent có thể:
- "new_products": hỏi sản phẩm mới nhất, hàng mới về
- "search_product": tìm/xem/hỏi về sản phẩm cụ thể theo tên hoặc loại
- "order_status": hỏi về đơn hàng, trạng thái giao hàng, thanh toán
- "wishlist": hỏi về sản phẩm yêu thích, danh sách quan tâm
- "product_review": hỏi đánh giá, chất lượng sản phẩm
- "unknown": câu hỏi không liên quan đến các intent trên

Format JSON:
{ "intent": "<intent>", "keywords": ["<từ khóa chính>", "<từ đồng nghĩa 1>", "<từ đồng nghĩa 2>"], "limit": <số lượng nếu user đề cập, mặc định 5> }

Với "keywords": liệt kê từ khóa chính và các từ đồng nghĩa/liên quan trong tiếng Việt để tìm kiếm sản phẩm. Để mảng rỗng [] nếu không cần tìm sản phẩm.

Ví dụ:
- "2 sản phẩm mới nhất là gì?" → { "intent": "new_products", "keywords": [], "limit": 2 }
- "Cho tôi xem dây dắt chó" → { "intent": "search_product", "keywords": ["dây dắt", "dây xích", "dây cổ", "vòng cổ"], "limit": 5 }
- "Đơn hàng của tôi đang ở đâu?" → { "intent": "order_status", "keywords": [], "limit": 5 }
- "Sản phẩm Royal Canin có tốt không?" → { "intent": "product_review", "keywords": ["Royal Canin"], "limit": 5 }
- "Có đồ ăn cho mèo không?" → { "intent": "search_product", "keywords": ["đồ ăn mèo", "thức ăn mèo", "hạt mèo", "pate mèo"], "limit": 5 }
- "Xin chào" → { "intent": "unknown", "keywords": [], "limit": 5 }`;

// ── System prompt tạo câu trả lời ────────────────────────────
const SYSTEM_PROMPT = `Bạn là trợ lý chăm sóc khách hàng của cửa hàng phụ kiện thú cưng.
Hãy trả lời thân thiện, ngắn gọn và chính xác bằng tiếng Việt.

Quy tắc bắt buộc:
- CHỈ trả lời dựa trên thông tin được cung cấp trong phần "Ngữ cảnh hiện tại" bên dưới.
- Nếu ngữ cảnh là "Không có thông tin", hãy nói thẳng rằng bạn không có thông tin đó và đề nghị khách liên hệ hỗ trợ trực tiếp.
- TUYỆT ĐỐI không tự bịa ra tên sản phẩm, giá tiền, hay bất kỳ thông tin nào không có trong ngữ cảnh.`;

// ── Bước 1: Phân tích intent bằng Groq ───────────────────────
async function detectIntent(message) {
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: INTENT_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0,
      max_tokens: 100,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    // Trích JSON từ response (đề phòng Groq thêm text thừa)
    const jsonMatch = raw.match(/\{.*\}/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: 'unknown', keyword: null, limit: 5 };
  } catch {
    return { intent: 'unknown', keyword: null, limit: 5 };
  }
}

// ── Bước 2: Retrieve data từ DB theo intent ───────────────────
async function retrieveByIntent({ intent, keywords = [], limit = 5 }, userId) {
  const safeLimit = Math.min(limit, 10);
  let contextText = '';
  let products = [];

  // Helper map product sang format FE
  const mapProduct = p => ({
    pk_product_id: p.pk_product_id,
    name: p.name,
    price: Number(p.price),
    sale_price: p.sale_price ? Number(p.sale_price) : null,
    stock: p.stock,
    image_url: p.images?.[0]?.image_url || null,
  });

  // Helper build product include
  const productInclude = [
    { model: Category, as: 'category', attributes: ['name'] },
    { model: ProductImage, as: 'images', where: { is_primary: 1 }, attributes: ['image_url'], required: false, limit: 1 },
  ];
  const productAttrs = ['pk_product_id', 'name', 'price', 'sale_price', 'stock'];

  const toContextLine = p => {
    const price = Number(p.sale_price || p.price).toLocaleString('vi-VN');
    const stock = p.stock > 0 ? `còn ${p.stock} sản phẩm` : 'hết hàng';
    return `${p.name} (${p.category?.name || ''}): giá=${price}đ, ${stock}`;
  };

  switch (intent) {

    case 'new_products': {
      const found = await Product.findAll({
        where: { is_active: 1 },
        include: productInclude,
        attributes: productAttrs,
        order: [['created_at', 'DESC']],
        limit: safeLimit,
      });
      if (found.length > 0) {
        contextText = `${safeLimit} sản phẩm mới nhất:\n` + found.map(toContextLine).join('\n');
        products = found.map(mapProduct);
      } else {
        contextText = 'Không có sản phẩm nào trong hệ thống.';
      }
      break;
    }

    case 'search_product': {
      const found = (keywords?.length > 0) ? await Product.findAll({
        where: {
          is_active: 1,
          [Op.or]: keywords.map(k => ({ name: { [Op.like]: `%${k}%` } })),
        },
        include: productInclude,
        attributes: productAttrs,
        limit: safeLimit,
      }) : [];
      if (found.length > 0) {
        contextText = `Sản phẩm tìm được:\n` + found.map(toContextLine).join('\n');
        products = found.map(mapProduct);
      } else {
        contextText = `Không tìm thấy sản phẩm nào liên quan đến "${keywords?.join(', ')}".`;
      }
      break;
    }

    case 'order_status': {
      if (!userId) {
        contextText = 'Khách chưa đăng nhập, không thể tra cứu đơn hàng.';
        break;
      }
      const orders = await Order.findAll({
        where: { fk_user_id: userId },
        include: [
          { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['name'] }] },
          { model: OrderStatusLog, as: 'statusLogs', limit: 2, order: [['created_at', 'DESC']] },
        ],
        order: [['created_at', 'DESC']],
        limit: 3,
      });
      if (orders.length > 0) {
        contextText = 'Đơn hàng gần đây:\n' + orders.map(o => {
          const items = o.items?.map(i => `${i.product?.name} x${i.quantity}`).join(', ') || '';
          const note = o.statusLogs?.[0]?.note ? ` (${o.statusLogs[0].note})` : '';
          return `Đơn #${o.pk_order_id}: trạng thái=${o.order_status}${note}, thanh toán=${o.payment_status}, tổng=${Number(o.total).toLocaleString('vi-VN')}đ, sản phẩm=[${items}]`;
        }).join('\n');
      } else {
        contextText = 'Khách chưa có đơn hàng nào.';
      }
      break;
    }

    case 'wishlist': {
      if (!userId) {
        contextText = 'Khách chưa đăng nhập, không thể xem danh sách yêu thích.';
        break;
      }
      const wishlist = await Wishlist.findAll({
        where: { fk_user_id: userId },
        include: [{ model: Product, as: 'product', attributes: productAttrs, include: productInclude }],
        limit: safeLimit,
      });
      if (wishlist.length > 0) {
        contextText = 'Sản phẩm yêu thích:\n' + wishlist.map(w => toContextLine(w.product)).join('\n');
        products = wishlist.map(w => mapProduct(w.product));
      } else {
        contextText = 'Khách chưa có sản phẩm yêu thích nào.';
      }
      break;
    }

    case 'product_review': {
      const reviews = (keywords?.length > 0) ? await Review.findAll({
        include: [{
          model: Product, as: 'product',
          where: { [Op.or]: keywords.map(k => ({ name: { [Op.like]: `%${k}%` } })) },
          attributes: ['pk_product_id', 'name'],
          include: productInclude,
        }],
        where: { fk_parent_id: null },
        attributes: ['rating', 'comment'],
        order: [['created_at', 'DESC']],
        limit: 5,
      }) : [];
      if (reviews.length > 0) {
        const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
        contextText = `Đánh giá "${reviews[0].product?.name}" (TB: ${avg}⭐):\n` +
          reviews.map(r => `[${r.rating}⭐] ${r.comment}`).join('\n');
        // Thêm sản phẩm được review vào products
        const p = reviews[0].product;
        if (p) products = [mapProduct(p)];
      } else {
        contextText = `Không tìm thấy đánh giá nào cho "${keywords?.join(', ')}".`;
      }
      break;
    }

    default:
      contextText = 'Không có thông tin';
  }

  return { contextText, products };
}

// ── Handler ───────────────────────────────────────────────────
export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return error(res, 'Tin nhắn không được để trống', 400);

    const userId = req.user?.pk_user_id || req.user?.id || null;

    // Bước 1: Phân tích intent
    const intentData = await detectIntent(message);

    // Bước 2: Retrieve context từ DB
    const { contextText, products } = await retrieveByIntent(intentData, userId);

    // Bước 3: Gọi Groq với context thực
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nNgữ cảnh hiện tại:\n${contextText}` },
        ...history.slice(-10),
        { role: 'user', content: message },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';
    return success(res, { reply, products });
  } catch (err) {
    console.error('[Chat] Error:', err?.status, err?.message, err?.error ?? '');
    return error(res, 'Dịch vụ chat tạm thời không khả dụng', 503);
  }
};
