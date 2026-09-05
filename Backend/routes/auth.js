import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();


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


        // Check required fields
        if (!username || !email || !password) {

            return res.status(400).json({
                error: "All fields are required"
            });

        }


        // Check password length
        if (password.length < 6) {

            return res.status(400).json({
                error: "Password must be at least 6 characters"
            });

        }


        // Check if email already exists
        const existingEmail = await User.findOne({
            email
        });

        if (existingEmail) {

            return res.status(400).json({
                error: "Email already registered"
            });

        }


        // Check username
        const existingUsername = await User.findOne({
            username
        });

        if (existingUsername) {

            return res.status(400).json({
                error: "Username already exists"
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user
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


        // Check fields
        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required"
            });

        }


        // Find user
        const user = await User.findOne({
            email
        });


        if (!user) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        // Compare password
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


        // Create JWT
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


        // Store JWT in HTTP-only cookie
        res.cookie(
            "token",
            token,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
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

    res.clearCookie("token");

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

        res.status(401).json({
            error: "Not authenticated"
        });

    }

});


export default router;