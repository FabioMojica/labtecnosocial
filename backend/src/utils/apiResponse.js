export const successResponse = (res, data = null, message = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  }); 
};

export const errorResponse = (res, code, message, status = 400) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

export const ERROR_CODES = {
  TOKEN_MISSING: 'TOKEN_MISSING', 
  TOKEN_INVALID: 'TOKEN_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_DISABLED: 'USER_DISABLED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
};
