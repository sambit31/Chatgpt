import { User } from "../models/user.models.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
         // Registration logic will go here

        const { email, password, fullName:{firstName, lastName }} = req.body;

        const emailExists = await User.findOne({ email });
        if(emailExists) return res.status(409).json({ message: "Email already in use" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            fullName: {
                firstName,
                lastName
            }
        });

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.cookie('token', token);
        return res.status(201).json({ message: "User registered successfully", user:{ email: newUser.email, fullName: newUser.fullName } });

    }catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Server error" });
    }
}



export const loginUser = async (req, res) => {  
    try {
        // Login logic will go here
        const { email, password } = req.body;

        if(!email || !password) return res.status(400).json({ message: "Email and password are required" });
        
        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({ message: "User not found" });       

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.cookie('token', token);
        res.status(200).json({ message: "Login successful", user:{ email: user.email, fullName: user.fullName } });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "Server error" });
    }
}
           