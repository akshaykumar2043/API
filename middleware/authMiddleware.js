const jwt = require("jsonwebtoken");
const User = require("../models/user","../models/friend");
const config = require("../db/config");
const env = require("dotenv");
env.config();

module.exports = {

    auth_Token: async (req, res, next) => {
        const token = req.header("Authorization");
        if (!token) { return res.status(400).json({ error: "access denied!!" }) };
        try {
            const decoded = jwt.verify(token, config.secretkey);
            if (decoded && decoded.userId) {
                const checkUser = await User.findById(decoded.userId);
                if (!checkUser) { return res.status(401).json({ message: "Your session has expired.Please login again!!" }) };
                req.userId = decoded.userId;
                return next();
            } else {
                req.userId = null;
                return next();
            }
        } catch (error) {
            console.error("JWT Verification Error:", error);
            return res.status(500).json({ message: "Invalid token!!!" });
        }
    },

    auth_Admin: async (req, res, next) => {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(400).json({ error: "Access denied!!" });
        }
        try {
            const decoded = jwt.verify(token, config.secretkey);
            if (decoded && decoded.userId) {
                const checkUser = await User.findById(decoded.userId);
                if (checkUser.auth_token !== token) {return res.status(401).json({ message: "Your session has expired. Please login again!" })}
                if (!checkUser.isAdmin) {
                    return res.status(403).json({ message: "Forbidden: Admin access required" });
                }
                req.userId = decoded.userId;
                return next();
            } else {
                req.userId = null;
                return next();
            }
        } catch (error) {
            return res.status(500).json({ message: "Invalid token!!" });
        }
    },
}




















