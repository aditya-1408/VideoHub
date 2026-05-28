import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genrating refresh and access token",
      error
    );
  }
};
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
  const existedUser = await User.findOne({
    $or: [{ username }, { email }], //$or operator is used to check if either the username or email already exists in the database. If a user with the same username or email is found, it will return an error response indicating that the user already exists.
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User already exists with the same username or email"
    );
  }
  // check fro images,avatar
  // console.log("content-type", req.headers["content-type"]);
  // console.log("files", req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path; //express gives us req.body not directly gie=ves access to files,for that we use multer middleware,multer gives  us req.files.
  //req.files?.avator[0]?.path is used to access the path of the uploaded avatar image.
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //upload avatar on cloudinary and get the url,avatar got from req.file.path
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  // create user object- create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //remove password and refresh token from the field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken " // select method is used to exclude the pass and refresh token fields from the user document before sending the response back to the frontend. By using -password and -refreshToken, we are telling Mongoose to exclude these fields from the result.
  );
  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }
  // return response to frontend
  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

// logic for login
// get email and password from req.body
// validate email and password
// check if user exists with the given email
// if user exists then compare the password with the hashed password in db by user.isPasswordCorrect method
// if password is correct then generate access token and refresh token
// send cookies to frontend with access token and refresh token
// save refresh token in db for the user
// return access token and refresh token to frontend

//take the user details from req.body
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "Email or username are required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found with the given email or username");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});
// logic for logout
// get refresh token from cookies
// validate refresh token
// find user with the given refresh token in db
// if user found then remove refresh token from db
// clear cookies from frontend
// return response to frontend
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken:1
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ); // jwt.verify(token ,secretOrPublicKey)

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully", {}));
});

const getCurrentUserDetails = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User details fetched successfully", req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password ");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User details updated successfully", updatedUser)
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Cover image updated successfully", user));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        // for counting the number of subscribers
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        // for counting the number of channels the user has subscribed to
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers", // $size operator is used to count the number of elements in the subscribers array, which gives us the total number of subscribers for that channel.
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        // project stage is used to specify which fields should be included or excluded in the final result of the aggregation pipeline. In this case, we are excluding the password and refreshToken fields from the user document by setting them to 0. This means that these fields will not be included in the output when we fetch the user profile.
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Channel details fetched successfully", channel[0])
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  // logic for fetching watch history of user
  // get user id from req.user
  // find all the videos in watch history collection for the given user id and populate the video details using $lookup with videos collection
  // return response to frontend with the list of videos in watch history along with video details
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Watch history fetched successfully",
        user[0]?.watchHistory || []
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUserDetails,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserProfile,
  getWatchHistory,
};
