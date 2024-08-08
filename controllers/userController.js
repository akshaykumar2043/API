const User = require("../models/user")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const config = require("../db/config");

//otp TWILIO
const twilio = require('twilio');
const accountSid = "AC7f995548ba6276c0348d693f910e3acb";
const authToken = "4c80bcef4ee33032cd876645cb6bf813";
const twilioServiceId = "VA364a32b24a29abf708359b70636a915b";
const client = require("twilio")(accountSid, authToken);



const { body, validationResult } = require('express-validator');

exports.signIn = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email')
        .notEmpty().withMessage('Email address is required')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    async (req, res) => {
        try {
            const { username, email, password, country_code, phone_number } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "Email is already registered" });
            }
            let profile = '';
            if (req.files && req.files.profile && req.files.profile[0]) {
                profile = `profile / ${req.files.profile[0].filename}`;
            }
            const Saltround = 10;
            const hashpassword = await bcrypt.hash(password, Saltround);
            const user = await User.create({
                profile,
                username,
                email,
                password: hashpassword,
                country_code,
                phone_number
            });

            // const token = jwt.sign(
            //     { userId: user._id },
            //     config.secretkey,
            //     { expiresIn: "3hr" }
            // )

            // const updateToken = await User.findByIdAndUpdate(
            //     user._id,
            //     { auth_token: token },
            //     {
            //         new: true, projection: { password: 0, confirmpassword: 0 }
            //     });

            // console.log(updateToken);
            const transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                auth: {
                    user: 'netset.dev.rajan@gmail.com',
                    pass: 'hegnfatwryicpmfh',
                },
            });

            const mailOptions = {
                from: 'netset.dev.rajan@gmail.com',
                to: user.email,
                subject: "Registration Confirmation",
                text: "Your email has been successfully registered."
            };

            transporter.sendMail((mailOptions), (error, info) => {
                if (error) {
                    console.log({ message: "error register ", error });
                    return res.status(400).json({ message: "error register ", error });
                } else {
                    console.log({ message: "user register successfull", user });
                    return res.status(200).json({ message: "user resgister successfull", user });
                }
            })

        } catch (error) {
            console.log({ message: "user register unsuccessful", error });
            return res.status(400).json({ message: "user register unsuccessfull", error });
        }
    }];

exports.logInUser = async (req, res) => {
    try {
        const checkEmail = await User.findOne({ email: req.body.email });
        if (checkEmail) {
            const comparePassword = await bcrypt.compare(req.body.password, checkEmail.password);
            if (comparePassword) {
                const token = jwt.sign(
                    { userId: checkEmail._id },
                    config.secretkey,
                    { expiresIn: "1d" }
                );
                const updateToken = await User.findByIdAndUpdate(
                    checkEmail._id,
                    { auth_token: token },
                    { new: true, projection: { password: 0, comparePassword: 0 } }
                );
                return res.status(200).json({ message: "user successfull login", updateToken });
            } else {
                return res.status(400).json({ message: "unauth!!!" })
            }
        } else {
            return res.status(400).json({ message: "invalid email and password!!!" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "server error!!!" })
    }
};

exports.logOutUser = async (req, res) => {
    try {
        const logout = await User.findByIdAndUpdate(
            req.userId,
            { auth_token: "" },
            { new: true, projection: { password: 0, confirmpassword: 0 } }
        );
        console.log({ message: "user logout successfull", data: logout });
        return res.status(200).json({ message: "user logout successfull", logout });
    } catch (error) {
        console.log({ message: "user logout unsuccessfull", error });
        return res.status(400).json({ message: "user logout unsuccessfull", error })
    }
};

exports.getAllUser = async function (req, res) {
    try {
        //pagination
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        let skip = (page - 1) * limit;

        const allUser = await User.find({}).skip(skip).limit(limit);

        const totalCount = await User.countDocuments();

        return res.status(200).json({
            message: "Get successfully.",
            currentPage: page,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            swaps: allUser
        });
    } catch (error) {
        console.error("Error", error);
        res.status(400).json({ message: "Error all User", error });
    }
};

exports.forgotUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "user email invalid" });
        }
        //token
        const token = crypto.randomBytes(20).toString('hex'); //HEXDECIMAL
        user.forgot_token = token; // Update in memory
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: 'netset.dev.rajan@gmail.com',
                pass: 'hegnfatwryicpmfh'
            },
        });
        const mailOptions = {
            from: 'netset.dev.rajan@gmail.com',
            to: user.email,
            subject: `Password Reset Email`,
            text: `Use this token to reset your password: ${token}`,
        }
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json('Error sending email');
            } else {
                console.log('Email sent:', response);
                return res.status(200).json('Recovery email sent');
            }
        });
    } catch (error) {
        console.log({ message: "server error", error });
        return res.status(500).json({ message: "server error", error });
    }
};

exports.resetPasswordUser = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findOne({ forgot_token: req.params.token });
        console.log(user);
        if (!user) {
            return res.status(200).json({ message: "invalid token" });
        }
        const Saltround = 10;
        const hashNewPassword = await bcrypt.hash(newPassword, Saltround);
        user.password = hashNewPassword;
        user.forgot_token = "";
        await user.save();
        const confirmationTransporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: 'netset.dev.rajan@gmail.com',
                pass: 'hegnfatwryicpmfh',
            },
        });
        const confirmationMailOptions = {
            from: "netset.dev.rajan@gmail.com",
            to: user.email,
            subject: 'Password Reset Confirmation',
            text: 'Your password has been successfully reset.',
        }
        confirmationTransporter.sendMail((confirmationMailOptions), (err, response) => {
            if (err) {
                console.log({ message: "password reset error confirmation", err });
                return res.status(500).json({ message: "password reset error confirmation", err });
            } else {
                console.log({ message: "password reset successfull" });
                return res.status(200).json({ message: "password reset successfull" });
            }
        })
    } catch (error) {
        console.log({ message: "server error", error });
        return res.status(500).json({ message: "server error", error })
    }
};

//email verification by token
exports.sendVerificationEmailUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "user email invalid" });
        }
        //token
        const token = crypto.randomBytes(20).toString('hex'); //HEXDECIMAL
        user.email_verfication_token = token; // Update in memory
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: 'netset.dev.rajan@gmail.com',
                pass: 'hegnfatwryicpmfh'
            },
        });

        const mailOptions = {
            from: 'netset.dev.rajan@gmail.com',
            to: user.email,
            subject: `Email verification`,
            text: `verify your email: 
         http://localhost:2001/api/verifyEmailUser/${token}`,
        }
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json('Error sending email');
            } else {
                console.log('Email sent:', response);
                return res.status(200).json('Email verification sent');
            }
        });
    } catch (error) {
        console.log({ message: "server error", error });
        return res.status(500).json({ message: "server error", error });
    }
};

exports.verifyEmailUser = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ email_verfication_token: token });
        if (!user) { return res.status(400).json({ message: "invalid user email_verification_token" }) };

        user.email_verified = true;
        user.email_verfication_token = null;

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: 'netset.dev.rajan@gmail.com',
                pass: 'hegnfatwryicpmfh'
            }
        });
        const mailOptions = {
            from: 'netset.dev.rajan@gmail.com',
            to: user.email,
            subject: "email verified!!",
            text: `email verified successfull:
            ${user}`
        }
        transporter.sendMail((mailOptions), (error, info) => {
            if (error) {
                return res.status(400).json({ message: "error to verified email", error });
            } else {
                return res.status(201).json({ message: "email verified successfull", info });
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "server error", error });

    }
}

// exports.updateAadharPassword = async (req, res) => {
//     try {
//         const { authorization } = req.headers;
//         const { currentPassword, newPassword } = req.body;

//         // Extract token from Authorization header
//         const token = authorization && authorization.split(' ')[1];

//         // Validate token
//         if (!token) {
//             return res.status(401).json({ message: "Unauthorized: Missing token" });
//         }

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userid = decoded.userid;

//         // Find Aadhar profile by userid
//         const user = await Aadhar.findById(userid);

//         if (!user) {
//             return res.status(404).json({ message: "Aadhar profile not found" });
//         }

//         // Check if current password matches
//         const passwordMatch = await bcrypt.compare(currentPassword, user.password);

//         if (!passwordMatch) {
//             return res.status(400).json({ message: "Current password is incorrect" });
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10); // Adjust salt rounds as per your security needs

//         // Update the password
//         user.password = hashedPassword;
//         await user.save();

//         console.log("Password updated successfully for user:", userid);
//         return res.status(200).json({ message: "Password updated successfully" });

//     } catch (error) {
//         // Handle validation errors, JWT errors, or server errors
//         console.error("Error updating password:", error);
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({ message: "Unauthorized: Invalid token" });
//         }
//         return res.status(500).json({
//             message: "Server error while updating password"
//         });
//     }
// };



// MOBILE VERIFICATION BY OTP

exports.sendOTP = async (req, res) => {
    const { country_code, phone_number } = req.body;

    try {
        let user = new User({
            country_code,
            phone_number
        });
        await user.save();

        const verification = await client
            .verify.v2
            .services(twilioServiceId)
            .verifications
            .create({
                to: `+${country_code}${phone_number}`,
                channel: 'sms'
            });

        console.log('Verification SID:', verification.sid);

        return res.json({ message: 'OTP sent successfully', data: { verification_sid: verification.sid } });
    } catch (error) {
        console.error('Error sending OTP:', error);
        if (error.code === 60200) {
            return res.status(400).json({ message: 'Invalid phone number', error: error.message });
        }
        return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    const { country_code, phone_number, code } = req.body;
    try {

        let verificationCheck = await client
            .verify.v2
            .services(twilioServiceId)
            .verificationChecks
            .create({
                to: `+${country_code}${phone_number}`,
                code: code
            });

        console.log('verificationCheck', verificationCheck);

        if (verificationCheck.status === 'approved') {

            await User.findOneAndUpdate(
                { country_code, phone_number },
                { $set: { phone_verified_otp: true } }
            );

            return res.json({ message: 'OTP verified successfully', data: verificationCheck });
        } else {
            return res.status(400).json({ message: 'OTP verification failed', data: verificationCheck });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
    }
};

// EMAIL VERIFICATION BY OTP
exports.sendVerificationEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User email invalid" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        user.email_verfication_otp = otp;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'netset.dev.rajan@gmail.com',
                pass: 'hegnfatwryicpmfh'
            },
        });

        const mailOptions = {
            from: 'netset.dev.rajan@gmail.com',
            to: user.email,
            subject: `Email Verification`,
            text: `verify your email: 
            http://localhost:2001/api/verifyEmailOTP/${otp}`,
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                console.log('Email sent:', response);
                return res.status(200).json({ message: 'Email verification sent' });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

exports.verifyEmailOTP = async (req, res) => {
    try {
        const { otp } = req.params;
        const user = await User.findOne({ email_verfication_otp: otp });
        if (!user) { return res.status(400).json({ message: "invalid user email_verfication_otp" }) };

        user.email_verified_otp = true;
        user.email_verfication_otp = null;

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: 'netset.dev.rajan@gmail.com',
                pass: 'hegnfatwryicpmfh'
            }
        });

        const mailOptions = {
            from: 'netset.dev.rajan@gmail.com',
            to: user.email,
            subject: `Email Verification`,
            text: `Your email has been successfully verified.`
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                console.log('Email verified successfully:', response);
                return res.status(200).json({ message: "Email verified successfully" });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

//pagination
exports.userPagination = async function (req, res) {
    try {
        //pagination
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;
        const user = await User.find({}).skip(skip).limit(limit);
        const totalCount = await User.countDocuments();
        return res.status(200).json({
            message: "Get successfully.",
            currentPage: page,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            swaps: user
        });
    } catch (error) {
        console.error("Error", error);
        res.status(400).json({ message: "Error user", error });
    }
};

//URL query string (Query)
exports.searchwithQuery = async (req, res) => {
    try {
        const { username, email, isAdmin, sortBy, sortOrder } = req.query;
        console.log('Received query parameters:', req.query);

        const filter = {};

        if (username) filter.username = username;
        if (email) filter.email = email;
        if (isAdmin !== undefined) filter.isAdmin = isAdmin === 'true';

        console.log('Constructed filter:', filter);

        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortOptions = { createdAt: -1 };
        }
        console.log('Sorting options:', sortOptions);
        const users = await User.find(filter).sort(sortOptions).lean();
        console.log('Users found:', users);
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error in fetching users:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

//URL body (Body)
exports.searchWithBody = async (req, res) => {
    try {
        const { username, email, isAdmin, sortBy, sortOrder } = req.body;
        console.log('Received body parameters:', req.body);

        const filter = {};

        if (username) filter.username = username;
        if (email) filter.email = email;
        if (isAdmin !== undefined) filter.isAdmin = isAdmin === true;
       
        console.log('Constructed filter:', filter);
        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortOptions = { createdAt: -1 };
        }
        console.log('Sorting options:', sortOptions);
        
        const users = await User.find(filter).sort(sortOptions).lean();
        console.log('Users found:', users);
        
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error in fetching users:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

//URL parameters (Params)
exports.searchWithParams = async (req, res) => {
    try {
       
        let filter = {};
        if (req.params.id) {
            filter._id = req.params.id;
        }
       
        const users = await User.find(filter);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
