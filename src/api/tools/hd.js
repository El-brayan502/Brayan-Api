import fetch from "node-fetch";
import FormData from "form-data";

export default function hdRoute(app) {
  app.get("/tools/hd", async (req, res) => {
    try {
      const imageUrl = req.query.url;
      if (!imageUrl) return res.status(400).json({ error: "Missing image URL" });

      const form = new FormData();
      form.append("image", await (await fetch(imageUrl)).buffer(), { filename: "image.jpg" });
      form.append("scale", "2");

      const response = await fetch("https://api2.pixelcut.app/image/upscale/v1", {
        method: "POST",
        headers: {
          ...form.getHeaders(),
          accept: "application/json",
          "x-client-version": "web",
          "x-locale": "es",
        },
        body: form,
      });

      if (!response.ok) return res.status(response.status).json({ error: "Failed to process image" });

      const result = await response.json();
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
}