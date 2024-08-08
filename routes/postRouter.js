const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const postController=require("../controllers/postController")
const authMiddleware = require("../middleware/authMiddleware")
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, res, cb) => {
            const directory = "uploads/post";
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory)
            }
            cb(null, directory);
        },
        filename: function (req, file, cb) {
            let exitArray = file.originalname.split(".");
            let extension = exitArray[exitArray.length - 1];
            cb(null, Date.now() + "_post." + extension);
        }
    })
}).fields([
    { name: "image", minCount: 1 }
]);


router.post("/createPost",upload,authMiddleware.auth_Token,postController.createPost);
router.get("/getAllPost",postController.getAllPosts);
router.get("/getPostById",authMiddleware.auth_Token,postController.getPostById);
router.put("/updatePost/:id",authMiddleware.auth_Token,postController.updatePost);
router.delete("/deletePost/:id",authMiddleware.auth_Token,postController.deletePost);


//like api 
router.post("/like",authMiddleware.auth_Token,postController.likePost);
router.post("/unlike",authMiddleware.auth_Token,postController.unlikePost);
router.get("/totallike",postController.totalLike);

module.exports = router;

