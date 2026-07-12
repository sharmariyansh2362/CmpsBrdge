// Standardized API response helpers
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

const error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: message });
};

const paginated = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = { AppError, success, error, paginated };
