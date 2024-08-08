const express = require("express");
const router = express.Router();

const swapController = require("../controllers/swapController")

router.post("/swap", swapController.Swap);
router.get("/getAllSwap", swapController.getAllSwap);





module.exports = router