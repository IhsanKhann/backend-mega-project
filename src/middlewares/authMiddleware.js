// now we verify the token.
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js";

// we do this so that we can decode the token for our id, as we want security and we dont want to use req.params directly in logout. After decoding we give the userid(the one logged in - authorized user) to the logout function, and simply clear the cookies.

const VerifyToken = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized - No token provided",
            });
        }

        const decodedToken = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            return res.status(401).json({
                status: false,
                message: "Invalid token",
            });
        }

        const user = await User.findById(decodedToken._id);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: "Token verification failed",
            error: error.message,
        });
    }
};

export default VerifyToken;