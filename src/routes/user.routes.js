import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUserDetails,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// upload fields is used to get files from the request and store them in the specified location, in this case, the "public/temp" directory. The fields method allows you to specify multiple file fields that can be uploaded in a single request. Each field is defined with a name and a maximum count of files that can be uploaded for that field. In this example, we have two fields: "avatar" and "coverImage", each allowing a maximum of one file to be uploaded.
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/me").get(verifyJWT, getCurrentUserDetails);
router.route("/update").patch(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserProfile);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
