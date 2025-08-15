import express from "express";
import {
    registerUser,
    loginUser,
    logOut,
    refreshToken,
    updateDetails,
    getUser,
    confirmCurrentPassword,
} from "../controllers/userController.js"
import {upload} from "../middlewares/multerMiddleare.js"
import VerifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// user routes: register user, login, logout, getCurrentUser etc
router.post("/register", 
    upload.fields(
        [{
            name:"avatar",
            maxCount: 1,
        },{
            name:"coverImage",
            maxCount: 1,
        }]
    ),
    registerUser
);
router.post("/login", loginUser);
router.post("/logout", VerifyToken, logOut);
router.post("/refresh-token", refreshToken); // we verify the token inside the controller.

router.get("/getUser", VerifyToken, getUser);

router.put("/updateDetails",VerifyToken,updateDetails);
router.put("/confirmCurrentPassword",VerifyToken,confirmCurrentPassword);

// here we dont use verify tokken or a middleware because we have directly verify and decode in the controller.

// example of the route.
// http://localhost:3000/api/users/register
// http://localhost:3000/api/users/login


export default router;