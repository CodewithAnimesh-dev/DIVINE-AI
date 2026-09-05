import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAIAPIResponse from "../utils/gemini.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();


// =========================
// TEST ROUTE
// =========================

router.post(
    "/test",
    authMiddleware,
    async (req, res) => {

        try {

            const thread = new Thread({
                threadId: "xyz",
                title: "Testing new Thread",
                user: req.user.id
            });

            const response = await thread.save();

            res.send(response);

        } catch (err) {

            console.log(err);

            res.status(500).json({
                error: "Failed to save in DB"
            });

        }

    }
);


// =========================
// GET ALL THREADS
// =========================

router.get(
    "/thread",
    authMiddleware,
    async (req, res) => {

        try {

            const threads = await Thread.find({
                user: req.user.id
            })
            .sort({
                updatedAt: -1
            });

            res.json(threads);

        } catch (err) {

            console.log(err);

            res.status(500).json({
                error: "Failed to fetch threads"
            });

        }

    }
);


// =========================
// GET ONE THREAD
// =========================

router.get(
    "/thread/:threadId",
    authMiddleware,
    async (req, res) => {

        const { threadId } = req.params;

        try {

            const thread = await Thread.findOne({
                threadId: threadId,
                user: req.user.id
            });

            if (!thread) {

                return res.status(404).json({
                    error: "Thread not found"
                });

            }

            res.json(thread.messages);

        } catch (err) {

            console.log(err);

            res.status(500).json({
                error: "Failed to fetch chat"
            });

        }

    }
);


// =========================
// DELETE THREAD
// =========================

router.delete(
    "/thread/:threadId",
    authMiddleware,
    async (req, res) => {

        const { threadId } = req.params;

        try {

            const deletedThread =
                await Thread.findOneAndDelete({
                    threadId: threadId,
                    user: req.user.id
                });

            if (!deletedThread) {

                return res.status(404).json({
                    error: "Thread not found"
                });

            }

            res.status(200).json({
                success: "Thread deleted successfully"
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({
                error: "Failed to delete thread"
            });

        }

    }
);


// =========================
// CHAT ROUTE
// =========================

router.post(
    "/chat",
    authMiddleware,
    async (req, res) => {

        const {
            threadId,
            message,
            image
        } = req.body;


        // =========================
        // VALIDATE REQUEST
        // =========================

        if (!threadId) {

            return res.status(400).json({
                error: "Thread ID is required"
            });

        }


        // User must send text or an image
        if (
            (!message || !message.trim()) &&
            !image
        ) {

            return res.status(400).json({
                error:
                    "Please provide a message or an image"
            });

        }


        try {

            // =========================
            // FIND USER'S THREAD
            // =========================

            let thread =
                await Thread.findOne({
                    threadId: threadId,
                    user: req.user.id
                });


            // =========================
            // CREATE THREAD
            // =========================

            if (!thread) {

                thread = new Thread({

                    threadId: threadId,

                    title:
                        message?.trim() ||
                        "Image conversation",

                    user: req.user.id,

                    messages: []

                });

            }


            // =========================
            // GET GEMINI RESPONSE
            // =========================

            const assistantReply =
                await getGeminiAIAPIResponse(
                    message?.trim() ||
                    "Please analyze this image.",
                    image
                );


            // =========================
            // SAVE USER MESSAGE
            // =========================

            thread.messages.push({

                role: "user",

                content:
                    message?.trim() ||
                    "Image uploaded"

            });


            // =========================
            // SAVE ASSISTANT RESPONSE
            // =========================

            thread.messages.push({

                role: "assistant",

                content: assistantReply

            });


            // =========================
            // UPDATE TIME
            // =========================

            thread.updatedAt = new Date();


            // =========================
            // SAVE THREAD
            // =========================

            await thread.save();


            // =========================
            // SEND RESPONSE
            // =========================

            res.status(200).json({

                reply: assistantReply

            });

        } catch (err) {

            console.log(
                "CHAT ROUTE ERROR:",
                err
            );


            // =========================
            // GEMINI QUOTA ERROR
            // =========================

            if (
                err.message &&
                err.message
                    .toLowerCase()
                    .includes("quota")
            ) {

                return res.status(429).json({

                    error:
                        "Divine is temporarily unavailable because the Gemini API limit has been reached. Please try again later."

                });

            }


            // =========================
            // OTHER ERRORS
            // =========================

            return res.status(500).json({

                error:
                    err.message ||
                    "Something went wrong. Please try again."

            });

        }

    }
);


export default router;