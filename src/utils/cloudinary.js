import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    try {
      await fs.promises.unlink(resolvedPath);
    } catch (unlinkError) {
      console.error("Failed to remove local temp file", unlinkError);
    }
    console.log("File uploaded successfully on cloudinary", response.url);
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    if (localFilePath) {
      try {
        await fs.promises.unlink(path.resolve(localFilePath)); // remove locally saved temp file
      } catch (unlinkError) {
        console.error("Failed to remove local temp file", unlinkError);
      }
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
