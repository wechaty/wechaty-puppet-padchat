// The npm package of my best choice for QR code decoding on Angular SPA
// https://dev.to/j_sakamoto/the-npm-package-of-my-best-choice-for-qr-code-decoding-on-angular-spa-4747?returning-user=true
import Jimp             from 'jimp'
import jsQR             from 'jsqr'

import { FileBox } from 'file-box'

export async function fileBoxToQrcode (file: FileBox): Promise<string> {
  const image = await Jimp.read(await file.toBuffer())
  const qrCodeImageArray = new Uint8ClampedArray(image.bitmap.data.buffer)

  const qrCodeResult = jsQR(
    qrCodeImageArray,
    image.bitmap.width,
    image.bitmap.height,
  )

  if (qrCodeResult) {
    return qrCodeResult.data
  } else {
    throw new Error('WXGetQRCode() qrCode decode fail')
  }
}
