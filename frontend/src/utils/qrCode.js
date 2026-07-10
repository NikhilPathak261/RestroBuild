export function getQrImageUrl(qrCodeUrl, size = 180) {
  const encodedData = encodeURIComponent(qrCodeUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
}

export function getMenuUrlFromQrUrl(qrCodeUrl) {
  try {
    const url = new URL(qrCodeUrl);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (pathSegments.length >= 2 && pathSegments[0] === 'r') {
      url.pathname = `/r/${pathSegments[1]}/menu`;
      return url.toString();
    }
  } catch {
    return qrCodeUrl;
  }

  return qrCodeUrl;
}
