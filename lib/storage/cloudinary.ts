import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const b64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "blog",
    resource_type: "image",
  });

  return result.secure_url;
}
