import { v2 as cloudinary } from "cloudinary"

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET

if (
  !cloudinaryCloudName ||
  !cloudinaryApiKey ||
  !cloudinaryApiSecret
) {
  throw new Error(
    "Cloudinary environment variables are missing."
  )
}

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
})

export { cloudinary }