import axios from "axios"
import FormData from "form-data"
import { createApiKeyMiddleware } from "../../middleware/apikey.js"

export default (app) => {

  // Función que llama al Pixelcut Upscaler
  async function upscaleHD(url) {
    try {
      // Descargar la imagen primero
      const imgRes = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 20000,
      })

      const form = new FormData()
      form.append("image", imgRes.data, {
        filename: "image.jpg",
        contentType: "image/jpeg"
      })
      form.append("scale", "2")

      const headers = {
        ...form.getHeaders(),
        accept: "application/json",
        "x-client-version": "web",
        "x-locale": "es",
      }

      // Enviar a Pixelcut
      const response = await axios.post(
        "https://api2.pixelcut.app/image/upscale/v1",
        form,
        {
          timeout: 35000,
          headers,
        }
      )

      const result = response.data

      if (!result?.result_url) {
        throw new Error("Pixelcut no regresó una URL válida")
      }

      // Descargar imagen final
      const output = await axios.get(result.result_url, {
        responseType: "arraybuffer",
        timeout: 20000,
      })

      return Buffer.from(output.data)

    } catch (error) {
      console.error("Error Pixelcut HD:", error)
      throw new Error(error.message || "Error al mejorar imagen")
    }
  }

  // Endpoint: /maker/hd
  app.get("/maker/hd", createApiKeyMiddleware(), async (req, res) => {
    try {
      let { url } = req.query

      if (!url) {
        return res.status(400).json({
          status: false,
          message: "Falta el parámetro 'url' con una imagen válida"
        })
      }

      if (!url.startsWith("http") && !url.startsWith("data:image")) {
        return res.status(400).json({
          status: false,
          message: "URL inválida. Debe ser una imagen http o Base64."
        })
      }

      const hdBuffer = await upscaleHD(url)

      res.setHeader("Content-Type", "image/jpeg")
      res.setHeader("Content-Length", hdBuffer.length)
      res.setHeader("Cache-Control", "public, max-age=3600")

      return res.end(hdBuffer)

    } catch (error) {
      console.error("HD Endpoint Error:", error)

      return res.status(500).json({
        status: false,
        message: "No se pudo mejorar la imagen",
        error: error.message
      })
    }
  })
    }
