import { describe, expect, it } from 'vitest';
import { getMenuUrlFromQrUrl, getQrImageUrl } from './qrCode';

describe('qrCode utilities', () => {
  it('builds a QR image URL for the table link', () => {
    const imageUrl = getQrImageUrl('http://localhost:5173/r/spice-house?tableId=5', 256);

    expect(imageUrl).toContain('size=256x256');
    expect(imageUrl).toContain('data=http%3A%2F%2Flocalhost%3A5173%2Fr%2Fspice-house%3FtableId%3D5');
  });

  it('converts QR landing URLs to customer menu URLs', () => {
    expect(getMenuUrlFromQrUrl('http://localhost:5173/r/spice-house?tableId=5')).toBe(
      'http://localhost:5173/r/spice-house/menu?tableId=5',
    );
  });
});
