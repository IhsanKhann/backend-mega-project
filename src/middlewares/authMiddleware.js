// now we verify the token.
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js";

// we do this so that we can decode the token for our id, as we want security and we dont want to use req.params directly in logout. After decoding we give the userid(the one logged in - authorized user) to the logout function, and simply clear the cookies.

const VerifyToken = async(req,res,next) => {
    const token = req.cookies?.accessToken;
    // using the access token and not the refresh token.

    if(!token){
        return res.status(401).json({
            status: false,
            message: "Unauthorized",
        })
    }

    const decodedToken = jwt.verify(token, config.ACCESS_TOKEN_EXPIRY);
    if(!decodedToken){
        return res.status(401).json({
            status: false,
            message: "Invalid token",
        })
    }

    const user = await User.findById(decodedToken.id);
    req.user = user;
    next(); 
    // this after verification sends code to the logout function.

};

export default VerifyToken;