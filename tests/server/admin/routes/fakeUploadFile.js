export function fakeUploadFile({
  name = 'upload.png',
  size = 1024,
  type = 'image/png',
} = {}) {
  return {
    name,
    size,
    type,
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}
