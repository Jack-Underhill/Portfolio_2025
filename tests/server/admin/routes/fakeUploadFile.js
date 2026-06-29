export function fakeUploadFile({
  name = 'upload.png',
  size = 1024,
  type = 'image/png',
  text,
  bytes,
} = {}) {
  const hasContent = bytes != null || text != null;
  const encoded = bytes ?? new TextEncoder().encode(text ?? '');

  return {
    name,
    size: hasContent ? encoded.byteLength : size,
    type,
    arrayBuffer: async () => encoded.buffer.slice(
      encoded.byteOffset,
      encoded.byteOffset + encoded.byteLength,
    ),
  };
}
