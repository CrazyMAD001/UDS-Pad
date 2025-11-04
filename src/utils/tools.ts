function stringToHexArrayBuffer(str: string) {
  // 创建一个TextEncoder实例
  const encoder = new TextEncoder()
  // 将字符串编码为Uint8Array
  const uint8Array = encoder.encode(str)
  // 创建一个与Uint8Array相同大小的ArrayBuffer
  const arrayBuffer = uint8Array.buffer
  // 将ArrayBuffer的内容转换为16进制字符串（可选步骤）
  const hexString = Array.from(new Uint8Array(arrayBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ')
  return { arrayBuffer, hexString }
}

function blobToHexString(blob: Blob) {
  return new Promise((resolve, reject) => {
    blob
      .arrayBuffer()
      .then((arrayBuffer) => {
        const hexString = Array.from(new Uint8Array(arrayBuffer))
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join(' ')
        resolve(hexString)
      })
      .catch((error) => reject(error))
  })
}
export { stringToHexArrayBuffer, blobToHexString }
