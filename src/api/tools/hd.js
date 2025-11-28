
import fetch from 'node-fetch'
import FormData from 'form-data'
import axios from 'axios'

export default async function handler(req, res) {
  try {
    const url = req.query.url
    if (!url) {
      return res.status(400).json({
        status: false,
        message: "Falta el parámetro: ?url="
      })
    }

    // Descargar imagen desde link
    const img = await axios.get(url, { responseType: 'arraybuffer' })
    const mime = img.headers['content-type'] || "image/jpeg"
    const ext = mime.split('/')[1]
    const filename = `hd_${Date.now()}.${ext}`

    // Crear form para Pixelcut
    const form = new FormData()
    form.append('image', img.data, { filename, contentType: mime })
    form.append('scale', '2')

    const headers = {
      ...form.getHeaders(),
      'accept': 'application/json',
      'x-client-version': 'web',
      'x-locale': 'es'
    }

    // Enviar a servidor de upscale
    const result = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    })

    if (!result.ok) {
      return res.status(result.status).json({
        status: false,
        message: `Error del servidor externo: ${result.status}`
      })
    }

    const json = await result.json()

    // Respuesta final
    return res.json({
      status: true,
      upscale: json,
      creator: "Brayan"
    })

  } catch (e) {
    return res.status(500).json({
      status: false,
      error: e.message
    })
  }
}