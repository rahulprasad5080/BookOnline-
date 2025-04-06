import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const protectRoute = async (req, res, next) => {
    try {
        //get token
        const token = req.header("Authorization").replace("Bearer", "")
        if (!token) {
            res.status(401).json({ error: "No Authorization this url" });
        }

        //verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        //find the user

        const user = await User.findById(decode.userId).select("-password")


        if (!user) {
            res.status(401).json({ error: "Token is invalid" });
        }

        req.user = user
        next()


    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error);
    }
}

export default protectRoute