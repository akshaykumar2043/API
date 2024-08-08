const express = require("express");
const router = express.Router();

const likeController=require("../controllers/likeController")
const authMiddleware = require("../middleware/authMiddleware")




router.put("/like/:id",authMiddleware.auth_Token,likeController.likePost);
router.put("/unlike/:id",authMiddleware.auth_Token,likeController.unlikePost);
module.exports = router;
