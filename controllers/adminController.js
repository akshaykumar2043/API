const jwt = require("jsonwebtoken");
const User = require("../models/user")
const config = require("../db/config")
const bcrypt = require("bcrypt");


exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (!user.isAdmin) {
            return res.status(403).json({ message: "User is not an admin" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Incorrect email or password" });
        }
        const token = jwt.sign(
            { userId: user._id },
            config.secretkey,
            { expiresIn: "9hr" }
        );
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { auth_token: token },
            { new: true }
        );

        return res.status(200).json({ message: "Admin login successful", user: updatedUser });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.logoutAdmin = async (req, res) => {
    try {

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.auth_token = "";
        await user.save();
        return res.status(200).json({ message: "Admin logout successful", user });

    } catch (error) {
        console.error("Admin logout unsuccessful:", error.message);
        return res.status(500).json({ message: "Admin logout unsuccessful", error: error.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const userId = req.params._id;
        if (!userId) {
            return res.status(404).json({ message: "invalid user" });
        }
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old password and new password are required." });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "Your new password is similar to your old password, please use another password." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }
        const Saltround = 10;
        const hashedPassword = await bcrypt.hash(newPassword, Saltround);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Password updated successfully", updatedUser });

    } catch (error) {

        return res.status(500).json({ message: "Server error" });
    }
};
