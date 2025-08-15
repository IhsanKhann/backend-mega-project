import dotenv from "dotenv";
dotenv.config();

import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import config from "../config/config.js"

// we also need expiry of refresh and access token.
// along with secrets for them(long random str)

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: false,
        },
        coverImage: {
            type: String, // cloudinary url
            required: false,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)
// summary: Fullname,password,username,email,refreshToken,watchHistory(array) of the videos.

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// this we also call comparePassword sometimes. used in the login. compared saved passwords with the coming password from the form.
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

// generate tokens. Refresh and access.
// also do this in the controller (just pass the whole data of the user to generate token).
// takes three arguments. 
// sign is for verification of the token
// stored at the client side and is short lived.

userSchema.methods.generateAccessToken = function(){
    console.log("Access Secret:", config.ACCESS_TOKEN_SECRET);
    console.log("Access Expiry:", config.ACCESS_TOKEN_EXPIRY);

    

    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        config.ACCESS_TOKEN_SECRET,
        {
            expiresIn: config.ACCESS_TOKEN_EXPIRY
        }
    )
}

// this is for the refresh token.
// longer expiry stored in the db(server side)
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,            
        },
       config.REFRESH_TOKEN_SECRET,
        {
            expiresIn: config.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
export default User;