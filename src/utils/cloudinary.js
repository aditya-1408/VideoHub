import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("cloudinary env loaded", {
  cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const resolvedPath = path.resolve(localFilePath);
    //upload the file to cloudinary
    const response = await cloudinary.uploader.upload(resolvedPath, {
      resource_type: "auto",
    });
    // file uploaded successfully then remove from local uploads folder
    console.log("File uploaded successfully on cloudinary", response.url);
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    if (localFilePath) {
      fs.unlinkSync(path.resolve(localFilePath)); // remove locally saved temp file
    }
    // temporary file as the upload failed
    return null;
  }
};

export { uploadOnCloudinary };

//  cloudinary.uploader
//   .upload(
//     "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//     {
//       public_id: "shoes",
//     }
//   )
//   .catch((error) => {
//     console.log(error);
//   });
