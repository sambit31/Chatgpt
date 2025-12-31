import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.models.js';

export const authToken = async (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("-password");

        if (!user) return res.status(404).json({ message: "User not found." });

        req.user = user;
        next();

    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
} 