const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    profile: { type: String, },
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    country_code: { type: String, },
    phone_number: { type: String, },
    isAdmin: { type: Boolean, default: false, },
    auth_token: { type: String },
    forgot_token: { type: String },
    auth_token_Expires: { type: String, },

    email_verified: { type: String, },
    email_verfication_token: { type: String, },

    phone_verified_otp: { type: Boolean, default: false },
    email_verified_otp: { type: Boolean, default: false },
    email_verfication_otp: { type: String },

    
    // createdAt: { type: Date, default: Date.now },

},{timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;
