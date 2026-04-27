export const success = (res, data = null, message = 'Thành công', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const created = (res, data = null, message = 'Tạo thành công') =>
  success(res, data, message, 201);

export const paginated = (res, rows, count, page, limit) =>
  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  });

export const error = (res, message = 'Lỗi', statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });
