import    {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
  // Logic to register a user
  // get user details from frontend
  //validation of user details-not empty
  //check if user already exists in db (by username or email)
  // check fro images,avatar
  //upload avatar on cloudinary and get the url,avatar got from req.file.path
  // create user object- create entry in db
  //remove password and refresh token from the field from response
  //check for user creation
  // return response to frontend

  // get user details from frontend
  const { fullName, email, username, password } = req.body;
  console.log("email", email);
  //validation of user details-not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "") // if any of the required fields are empty or contain only whitespace, return an error response
  ) {
    throw new ApiError(400, "All  fields are required and should not be empty");
  }
  //check if user already exists in db (by username or email)
  const existedUser = User.findOne({
    $or: [{ username }, { email }], //$or operator is used to check if either the username or email already exists in the database. If a user with the same username or email is found, it will return an error response indicating that the user already exists.
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User already exists with the same username or email"
    );
  }
  // check fro images,avatar
   const avatarLocalPath=req.files?.avator[0]?.path; //express gives us req.body not directly gie=ves access to files,for that we use multer middleware,multer gives  us req.files.
  //req.files?.avator[0]?.path is used to access the path of the uploaded avatar image. 
  const coverImageLocalPath=req.files?.coverImage[0]?.path;
  if(!avatarLocalPath) {
    throw new ApiError(400,"Avatar is required")
  }

  //upload avatar on cloudinary and get the url,avatar got from req.file.path
const avatar=  await uploadOnCloudinary(avatarLocalPath)
const coverImage= await uploadOnCloudinary(coverImageLocalPath)
if(!avatar){
  throw new ApiError(400,"Avatar file is required")
}
 // create user object- create entry in db
const user=await User.create({
  fullName,
  avatar:avatar.url,
  coverImage:coverImage?.url || "",
  email,
  password,
  username: username.toLowerCase()
})
  //remove password and refresh token from the field from response
 const createdUser=await User.findById(user._id).select(
  "-password -refreshToken " // select method is used to exclude the pass and refresh token fields from the user document before sending the response back to the frontend. By using -password and -refreshToken, we are telling Mongoose to exclude these fields from the result.
 )
 //check for user creation
 if(!createdUser){
  throw new ApiError(500,"Something went wrong while creating user")
 }
  // return response to frontend
   return res.status(201).json(
    new ApiResponse(201,"User created successfully",createdUser)
   )
}); 

export { registerUser };