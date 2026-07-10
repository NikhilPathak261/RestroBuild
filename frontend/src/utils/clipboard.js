export async function copyText(value) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is unavailable.');
  }

  await navigator.clipboard.writeText(value);
}
