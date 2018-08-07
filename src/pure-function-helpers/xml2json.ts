import { parseString } from 'xml2js'

export async function xml2json (xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        return reject(err)
      }
      return resolve(result)
    })
  })
}
