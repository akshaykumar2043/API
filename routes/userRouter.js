const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware")

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, res, cb) => {
            const directory = "uploads/user";
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory)
            }
            cb(null, directory);
        },
        filename: function (req, file, cb) {
            let exitArray = file.originalname.split(".");
            let extension = exitArray[exitArray.length - 1];
            cb(null, Date.now() + "_user." + extension);
        }
    })
}).fields([
    { name: "profile", minCount: 1 }
]);


router.post("/userSign", upload, userController.signIn);
router.get("/getAllUser", userController.getAllUser);

router.post("/loginUser", userController.logInUser);
router.post("/logoutUser", authMiddleware.auth_Token, userController.logOutUser);

router.post("/forgotUser", userController.forgotUser);
router.post("/resetPasswordUser/:token", userController.resetPasswordUser);

// send verification by token
router.post("/sendVerificationEmailUser", userController.sendVerificationEmailUser);
router.get("/verifyEmailUser/:token", userController.verifyEmailUser);

// verification by otp
router.post("/sendOTP", userController.sendOTP);
router.post("/verifyOTP", userController.verifyOTP);
router.post("/sendVerificationEmailOTP", userController.sendVerificationEmailOTP);
router.post("/verifyEmailOTP/:otp", userController.verifyEmailOTP);

//pagination
router.get("/user",userController.userPagination);

//URL query string (Query)
router.get("/SearchQ",userController.searchwithQuery);

//URL body (Body)
router.get("/searchB" ,userController.searchWithBody);

//URL parameters (Params)
router.get("/searchP/:id",userController.searchWithParams);

module.exports = router;
