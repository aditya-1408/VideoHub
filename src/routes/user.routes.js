import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router();
// upload fields is used to get files from the request and store them in the specified location, in this case, the "public/temp" directory. The fields method allows you to specify multiple file fields that can be uploaded in a single request. Each field is defined with a name and a maximum count of files that can be uploaded for that field. In this example, we have two fields: "avatar" and "coverImage", each allowing a maximum of one file to be uploaded.
router.route("/resgister").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser);

export default router;