import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

    try {

        const token = req.cookies?.token;

        if (!token) {

            return res.status(401).json({
                error: "Not authenticated"
            });

        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        req.user = decoded;

        next();

    } catch (err) {

        console.log("Authentication error:", err);

        return res.status(401).json({
            error: "Invalid or expired authentication"
        });

    }

};


export default authMiddleware;