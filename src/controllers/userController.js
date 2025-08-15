import { User } from "../models/user.model.js";
import uploadFileToCloudinary from "../utilities/cloudinary.js"; // must match your export
import jwt from "jsonwebtoken";
import config from "../config/config.js"

// -------------------
// Generate Tokens
// -------------------

const generateAccessAndRefreshTokens = async(userId) => {

    if(!userId) throw new Error("User id is required");

    const user = await User.findById(userId);
    if(!user) throw new Error("User not found");

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    // this means just save this field i-e the refresh token in mongoose and not the rest of the fields again.

    // we did the instance method step because model methods are available in the instance and not the User in this case.
    return {accessToken,refreshToken};
};

// -------------------
// REGISTER USER
// -------------------

const registerUser = async (req, res) => {
    try {
        // 1️⃣ Get user input from request body
        const { name, username, email, password } = req.body;

        // 2️⃣ Validate: All fields required
        if (!name?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({
                message: "All fields (name, username, email, password) are required",
                status: false,
            });
        }

        // 3️⃣ Check for duplicate email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists",
                status: false,
            });
        }

        // 4️⃣ Check for duplicate username
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists",
                status: false,
            });
        }

        // 5️⃣ Upload avatar image to Cloudinary (if provided)
        let avatarUrl = "";
        if (req.files?.avatar && req.files.avatar.length > 0) {
            const avatarPath = req.files.avatar[0].path;
            const cloudinaryResponse = await uploadFileToCloudinary(avatarPath);
            if (!cloudinaryResponse?.url) {
                return res.status(500).json({
                    message: "Avatar image upload failed",
                    status: false,
                });
            }
            avatarUrl = cloudinaryResponse.url;
        }

        // 6️⃣ Create and save new user
        const newUser = new User({
            fullName: name,
            username,
            email,
            password, // 🔒 hash this before save in production
            avatar: avatarUrl || "",
        });

        await newUser.save();

        // if you want an automatic login after registration, send tokens from here
        // const {accessToken,refreshToken} = await generateAccessAndRefreshTokens();

        // 7️⃣ Success response
        return res.status(201).json({
            message: "User registered successfully",
            status: true,
            user: newUser,
        });

    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};

// -------------------
// LOGIN USER
// -------------------

const loginUser = async (req, res) => { 
    
    try{
        const { username, email, password } = req.body;
        if(!username || !password){
            return res.status(400).json({
                status: false,
                message: "Username and password are required",
            })
        }
    
        // find in the db
        const user = await User.findOne({
            $or:[{username},{email}]
        });

        if(!user){
            return res.status(400).json({
                status: false,
                message: "User not found",
            })
        }

        // compare passwords:
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(400).json({
                status: false,
                message: "Invalid password",
            })
        }

        // generate tokens and send them back in cookies (http only cookies.)
        // now we give back the user and tokens back. Tokens in form of cookies.
        const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

        // send cookies and a response
        return res.cookie("accessToken",accessToken,{
            httpOnly: true,
            secure: true,
        }).cookie("refreshToken",refreshToken,{
            httpOnly: true,
            secure: true,
        }).status(200).json({
            status: true,
            message: "User logged in successfully",
            user,accessToken,refreshToken
        })
        
    }
    catch(error){
        res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        })
    }
};

// -------------------
// LOGOUT USER
// -------------------

const logOut = async (req,res) => {
    // 1- decode the token and get the id.
    // 2- find the user with the particular id and then update the refresh token to empty in the database backend only not in the frontend.The cookie is not cleared it is just set to undefined if we login again it will be generated again.
    // 3- clear the cookies.
    // 4- return the response
    try{
        // we get the id of the user and then we remove it.
        const userid = req.user._id; // upon decoding.

        const user = await User.findByIdAndUpdate(userid,{
            $set:{
                refreshToken: "" || undefined,
            }
        });

        if(!user){
            return res.status(400).json({
                status: false,
                message: "User not found",
            })
        }

       res
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
        .status(200)
        .json({
            status: true,
            message: "User logged out successfully",
        })

    }catch(error){
        res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        })
    }
};

// refresh and rotate the refresh tokken.
const refreshToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(400).json({
                status: false,
                message: "Refresh token not found",
            });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(incomingRefreshToken, config.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: "Invalid or expired refresh token",
            });
        }

        const user = await User.findById(decodedToken.id);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        // Compare stored refresh token with the incoming one
        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(403).json({
                status: false,
                message: "Refresh token mismatch",
            });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        // Send new cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            status: true,
            message: "Tokens refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
        });

    } catch (error) {
        console.error("Error refreshing tokens:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};

// refresh tokkens -> with this approach we refresh/generate another access token (this is simpler only make a new access token) but complex is we generate both the tokens, an access token as well as a refresh tokken.

// get current user
const getUser = async(req,res) => {
    const user = req.user;
    res.status(200).json({
        status: false,
        message: "User found",
        user,
    })
}

// confirm your password.
const confirmCurrentPassword = async(req,res) => {
    try{
        const {oldPassword,newPassword,ConfirmPassword} = req.body;
    // we need user, and its password from the database.
    const user = req.user;

    // if(user.password !== oldPassword){
    //     return res.status(400).json({
    //         status: false,
    //         message: "Invalid old password",
    //     })
    // }; this wont work as the password is hashed.
    
    const userPresent = await User.findById(user._id);
    if(!userPresent){
        res.status(400).json({
            status: false,
            message: "User not found",
        })
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if(!isPasswordValid){
        return res.status(400).json({
            status: false,
            message: "Invalid old password",
        })
    }

    if(newPassword !== ConfirmPassword){
        return res.status(400).json({
            status: false,
            message: "Passwords do not match",
        })
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $set:{
                password: newPassword,
            },
        },
        {new:true},
    )

    res.status(200).json({
        status: true,
        message: "Password updated successfully",
        updatedUser,
    })

    }catch(error){
        res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

// updateDetails:
const updateDetails = async (req, res) => {
  try {
    const { username, lastName, email } = req.body;

    if (!username || !lastName || !email) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Can't find the user",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { username, email, lastName },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      status: true,
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// exports:
export {
    registerUser,
    loginUser,
    logOut,
    refreshToken,
    getUser,
    updateDetails,
    confirmCurrentPassword,
};
