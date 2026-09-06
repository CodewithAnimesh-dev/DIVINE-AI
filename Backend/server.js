import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";


const app = express();
const PORT = process.env.PORT || 8080;


// ===============================
// MIDDLEWARE
// ===============================

app.use(
    express.json({
        limit: "20mb"
    })
);

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(cookieParser());


// ===============================
// ROUTES
// ===============================

// Chat routes
app.use("/api", chatRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);


// ===============================
// DATABASE CONNECTION
// ===============================

const connectDB = async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "Connected with Database"
        );

    } catch (err) {

        console.log(
            "Failed to connect with Db",
            err
        );

    }

};


// ===============================
// START SERVER
// ===============================

app.get("/", (req, res) => {
    res.send("DIVINE AI Backend is running successfully 🚀");
});


app.listen(PORT, () => {

    console.log(
        `server is running on ${PORT}`
    );

    connectDB();

});