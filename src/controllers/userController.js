import { User } from "../models/user.model.js";
import uploadFileToCloudinary from "../utilities/cloudinary.js"; // must match your export

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
            name,
            username,
            email,
            password, // 🔒 hash this before save in production
            avatar: avatarUrl,
        });

        await newUser.save();

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
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                status: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: false,
            });
        }

        // ⚠️ Password comparison should use bcrypt in real apps
        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid credentials",
                status: false,
            });
        }

        return res.status(200).json({
            message: "Login successful",
            status: true,
            user,
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        return res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
};

export {
    registerUser,
    loginUser,
};
