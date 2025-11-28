import axios from "axios"
import { createApiKeyMiddleware } from "../../middleware/apikey.js"

export default function (app) {
  // Ruta /tools/hd
  app.get("/maker/hd", createApiKeyMiddleware(), async (req, res) => {
    try {
      const imageUrl = req.query.url
      if (!imageUrl) return res.status(400).json({ error: "Debes enviar la URL de la imagen" })

      const formData = new FormData()
      formData.append("image", imageUrl)
      formData.append("scale", "2")

      const headers = {
        ...formData.getHeaders(),
        "accept": "application/json",
        "x-client-version": "web",
        "x-locale": "es",
      }

      const response = await axios.post("https://api2.pixelcut.app/image/upscale/v1", formData, { headers })

      res.json(response.data)
    } catch (err) {
      console.error("Error en /tools/hd:", err.response?.data || err.message)
      res.status(500).json({ error: "Ocurrió un error al mejorar la imagen" })
    }
  })
}
