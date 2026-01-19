export const handleApiError = (error, defaultMessage) => {
  if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
    return null;
  }

  if (error.code === 'ECONNABORTED') {
    throw {
      code: 'TIMEOUT',
      message: 'La petición tardó demasiado. Inténtalo nuevamente.',
    };
  }

  if (error.response?.data) {
      const apiError = error.response.data;
      if (apiError.success === false) {
        throw {
          code: apiError.error.code,
          message: apiError.error.message,
        };
      } 
    }

  throw {
    code: error.code || 'UNKNOWN_ERROR', 
    message: defaultMessage || 'Ocurrió un error inesperado. Inténtalo nuevamente más tarde.',
  };
};
