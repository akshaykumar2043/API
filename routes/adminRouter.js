const express = require("express");
const router = express.Router();


const adminUserRoute = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware")


router.post("/adminlogin", adminUserRoute.loginAdmin);
router.post("/adminlogout", authMiddleware.auth_Admin, adminUserRoute.logoutAdmin);
router.put("/updatePassword/:_id", authMiddleware.auth_Admin, adminUserRoute.updatePassword);
module.exports = router;
