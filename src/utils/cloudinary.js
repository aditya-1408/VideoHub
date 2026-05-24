import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try{
       if(!localFilePath) return null;
       //upload the file to cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto" 
       })
       // file uploaded successfully then remove from local uploads folder
       console.log("File uploaded successfully on cloudinary",response.url);
       return response
} catch(error){
      fs.unlinkSync() //remove the locally saved
      // temporary file as the upload failed
      return null;
    }
}

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