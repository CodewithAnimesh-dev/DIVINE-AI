import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();


// ===============================
// COOKIE OPTIONS
// ===============================

const cookieOptions = {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",

    maxAge: 7 * 24 * 60 * 60 * 1000
};


// ===============================
// REGISTER
// ===============================

router.post("/register", async (req, res) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;


        if (!username || !email || !password) {

            return res.status(400).json({
                error: "All fields are required"
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                error: "Password must be at least 6 characters"
            });

        }


        const existingEmail = await User.findOne({
            email
        });


        if (existingEmail) {

            return res.status(400).json({
                error: "Email already registered"
            });

        }


        const existingUsername = await User.findOne({
            username
        });


        if (existingUsername) {

            return res.status(400).json({
                error: "Username already exists"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = new User({

            username,
            email,
            password: hashedPassword

        });


        await user.save();


        res.status(201).json({

            message: "Registration successful",

            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }

        });

    } catch (err) {

        console.log("Register error:", err);

        res.status(500).json({
            error: "Registration failed"
        });

    }

});


// ===============================
// LOGIN
// ===============================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required"
            });

        }


        const user = await User.findOne({
            email
        });


        if (!user) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        const token = jwt.sign(

            {
                id: user._id,
                username: user.username,
                email: user.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        // Store JWT in cookie
        res.cookie(
            "token",
            token,
            cookieOptions
        );


        res.json({

            message: "Login successful",

            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }

        });

    } catch (err) {

        console.log("Login error:", err);

        res.status(500).json({
            error: "Login failed"
        });

    }

});


// ===============================
// LOGOUT
// ===============================

router.post("/logout", (req, res) => {

    res.clearCookie(
        "token",
        {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax"
        }
    );


    res.json({
        message: "Logout successful"
    });

});


// ===============================
// CHECK CURRENT USER
// ===============================

router.get("/me", async (req, res) => {

    try {

        const token = req.cookies.token;


        if (!token) {

            return res.status(401).json({
                error: "Not logged in"
            });

        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        const user = await User.findById(
            decoded.id
        ).select("-password");


        if (!user) {

            return res.status(404).json({
                error: "User not found"
            });

        }


        res.json({
            user
        });

    } catch (err) {

        console.log(
            "Authentication error:",
            err.message
        );

        res.status(401).json({
            error: "Not authenticated"
        });

    }

});


export default router;