import { ERROR_MESSAGES } from "./constants.js";

const errorMap = {
  400: ERROR_MESSAGES.VALIDATION_ERROR,
  401: ERROR_MESSAGES.UNAUTHORIZED,
  403: ERROR_MESSAGES.FORBIDDEN,
  404: ERROR_MESSAGES.NOT_FOUND,
  500: ERROR_MESSAGES.SERVER_ERROR,
  502: ERROR_MESSAGES.SERVER_ERROR,
  503: ERROR_MESSAGES.SERVER_ERROR,
};

export const handleApiError = (error) => {
  if (!error.response) return ERROR_MESSAGES.NETWORK_ERROR;
  const { status, data } = error.response;
  return data?.message || errorMap[status] || "Une erreur est survenue";
};

export const getErrorMessage = (error) =>
  typeof error === "string"
    ? error
    : error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Une erreur est survenue";

export const isAuthError = (error) => error?.response?.status === 401;

export const isValidationError = (error) => error?.response?.status === 400;

export const getValidationErrors = (error) => {
  const validationErrors = error?.response?.data?.errors;
  if (!validationErrors) return {};

  if (Array.isArray(validationErrors)) {
    return validationErrors.reduce((acc, err) => {
      if (err.param) acc[err.param] = err.msg;
      return acc;
    }, {});
  }

  return typeof validationErrors === "object" ? { ...validationErrors } : {};
};
