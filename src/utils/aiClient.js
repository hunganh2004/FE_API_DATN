/**
 * AI Service HTTP Client
 * Wrapper gọi Python FastAPI tại AI_SERVICE_URL với timeout và fallback.
 */

import axios from 'axios';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const TIMEOUT = 5000;

const client = axios.create({ baseURL: AI_URL, timeout: TIMEOUT });

/**
 * Kiểm tra AI Service còn sống không.
 * @returns {Promise<boolean>}
 */
export const isAIHealthy = async () => {
  try {
    const { data } = await client.get('/health');
    return data?.status === 'ok';
  } catch {
    return false;
  }
};

/**
 * Gợi ý sản phẩm trang chủ (collaborative filtering).
 * @param {number} userId
 * @param {number} topN
 */
export const fetchHomepageRecommendations = (userId, topN = 10) =>
  client.get('/recommendations/homepage', { params: { user_id: userId, top_n: topN } })
    .then(r => r.data);

/**
 * Gợi ý sản phẩm mua kèm (association rules).
 * @param {number} productId
 * @param {number} topN
 */
export const fetchProductRecommendations = (productId, topN = 5) =>
  client.get(`/recommendations/product/${productId}`, { params: { top_n: topN } })
    .then(r => r.data);

/**
 * Nhắc mua lại sản phẩm tiêu hao.
 * @param {number} userId
 * @param {number} daysAhead
 */
export const fetchRepurchaseReminders = (userId, daysAhead = 7) =>
  client.get('/recommendations/repurchase', { params: { user_id: userId, days_ahead: daysAhead } })
    .then(r => r.data);

/**
 * Lấy phân cụm của một user.
 * @param {number} userId
 */
export const fetchUserSegment = (userId) =>
  client.get(`/segments/user/${userId}`).then(r => r.data);

/**
 * Lấy tất cả phân cụm.
 */
export const fetchAllSegments = () =>
  client.get('/segments/all').then(r => r.data);

/**
 * Train tất cả mô hình (background).
 */
export const trainAll = () =>
  client.post('/train/all').then(r => r.data);

/**
 * Train từng mô hình riêng.
 * @param {'association'|'collaborative'|'clustering'|'repurchase'} model
 */
export const trainModel = (model) =>
  client.post(`/train/${model}`).then(r => r.data);
