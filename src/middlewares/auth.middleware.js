import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const  verifyJWT = asyncHandler(async(req,res,next)=>{
   try{
     const token =
       req.cookies.accessToken ||
       req.headers.authorization?.replace("Bearer ", ""); // check if token is present in cookies or in authorization header
     if (!token) {
       throw new ApiError(401, "Unauthorized, token is missing");
     }

     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     const user = await User.findById(decodedToken?._id).select(
       "-password -refreshToken"
     );

     if (!user) {
       throw new ApiError(401, "Invalid Access Token, user not found");
     }

     req.user = user; // attach user to req object for further use in controllers
     next();
   }
    catch(error){ 
        throw new ApiError(401,error?.message ||"Invalid access token");
      }
})
