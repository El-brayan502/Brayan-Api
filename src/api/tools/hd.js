import express from "express"
import fetch from "node-fetch"
import FormData from "form-data"
import axios from "axios"
const router = express.Router()

router.get('/hd', async (req, res) => {
  try {
    const url = req.query.url
    if (!url)
      return res.status(400).json({
        status: false,
        message: "Falta el parámetro: ?url="
      })

    // Descargar imagen desde URL
    const img = await axios.get(url, { responseType: 'arraybuffer' })
    const mime = img.headers['content-type'] || "image/jpeg"
    const ext = mime.split('/')[1]
    const filename = `image_${Date.now()}.${ext}`

    // Crear formulario
    const form = new FormData()
    form.append('image', img.data, { filename, contentType: mime })
    form.append('scale', '2')

    const headers = {
      ...form.getHeaders(),
      'accept': 'application/json',
      'x-client-version': 'web',
      'x-locale': 'es'
    }

    // Llamar al API real de Pixelcut
    const response = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    })

    if (!response.ok) {
      return res.status(response.status).json({
        status: false,
        message: `Error del servidor externo: ${response.status}`
      })
    }

    const result = await response.json()

    // Devolver resultado
    res.json({
      status: true,
      upscale: result
    })

  } catch (e) {
    res.status(500).json({
      status: false,
      error: e.message
    })
  }
})

export default router