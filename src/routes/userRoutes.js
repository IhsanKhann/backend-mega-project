import express from "express";
import {
    registerUser,
    loginUser,
    logOut,
    refreshTokken
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
router.post("/refresh-token", refreshTokken); 
// here we dont use verify tokken or a middleware because we have directly verify and decode in the controller.

// example of the route.
// http://localhost:3000/api/users/register
// http://localhost:3000/api/users/login



export default router;