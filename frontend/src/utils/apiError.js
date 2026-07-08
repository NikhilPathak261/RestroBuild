export function getApiErrorMessage(error, fallbackMessage) {
  const message = error?.response?.data?.message || fallbackMessage;
  const requestId = getResponseHeader(error, 'x-request-id');

  if (!requestId) {
    return message;
  }

  return `${message} (Request ID: ${requestId})`;
}

function getResponseHeader(error, headerName) {
  const headers = error?.response?.headers;
  if (!headers) {
    return '';
  }

  if (typeof headers.get === 'function') {
    return headers.get(headerName) || '';
  }

  return headers[headerName] || headers[headerName.toLowerCase()] || '';
}
