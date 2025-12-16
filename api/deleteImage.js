import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req, res) {
  try {
    console.log("deleteImage invoked", {
      method: req.method,
      cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    })

    // Basic CORS handling (for dev + browser calls)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Handle preflight
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { publicId } = req.body || {};

    if (!publicId) {
      return res.status(400).json({ error: "Missing publicId" });
    }

    // If you only want a health check, uncomment the next line and comment out the Cloudinary call
    // return res.status(200).json({ msg: "API is working" });

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary destroy result", result);

    return res.status(200).json({ result });
  } catch (error) {
    console.error("deleteImage error", error);
    return res.status(500).json({ error: "Image deletion failed!" });
  }
}