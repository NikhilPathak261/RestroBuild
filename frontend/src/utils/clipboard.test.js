import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from './clipboard';

describe('copyText', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes text to the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await copyText('https://demo.local');

    expect(writeText).toHaveBeenCalledWith('https://demo.local');
  });

  it('fails when the Clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', {});

    await expect(copyText('https://demo.local')).rejects.toThrow('Clipboard API is unavailable.');
  });
});
