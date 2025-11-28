module.exports = function (app) {
  const axios = require("axios");
  const FormData = require("form-data");

  async function pixelHD(imageUrl) {
    try {
      // Descargar la imagen
      const img = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 20000
      });

      const form = new FormData();
      form.append("image", img.data, {
        filename: "image.jpg",
        contentType: "image/jpeg"
      });
      form.append("scale", "2");

      const headers = {
        ...form.getHeaders(),
        accept: "application/json",
        "x-client-version": "web",
        "x-locale": "es"
      };

      // Enviar a Pixelcut
      const res = await axios.post(
        "https://api2.pixelcut.app/image/upscale/v1",
        form,
        {
          timeout: 30000,
          headers
        }
      );

      const data = res.data;

      if (!data?.result_url) {
        throw new Error("Pixelcut no devolvió imagen");
      }

      // Descargar la imagen mejorada
      const finalImg = await axios.get(data.result_url, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      return Buffer.from(finalImg.data);

    } catch (e) {
      console.error("❌ Error HD:", e);
      return { error: e.message || "Error al mejorar la imagen" };
    }
  }

  app.get("/tools/hd", async (req, res) => {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          status: false,
          message: "Falta el parámetro 'url'"
        });
      }

      const result = await pixelHD(url);

      if (result.error) {
        return res.status(500).json({
          status: false,
          message: "No se pudo mejorar la imagen",
          error: result.error
        });
      }

      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Length", result.length);
      res.setHeader("Cache-Control", "public, max-age=3600");

      return res.end(result);

    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message
      });
    }
  });
};