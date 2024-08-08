const express = require("express");
const router = express.Router();


const friendController = require("../controllers/friendController");
const authMiddleware = require("../middleware/authMiddleware")



// friendRequest API
router.put("/friendRequest",authMiddleware.auth_Token, friendController.friendRequest);
router.get("/getFriendRequest", friendController.historyFriendRequest);

router.get("/received", authMiddleware.auth_Token,friendController.receivedRequest);
router.get("/sender",authMiddleware.auth_Token,friendController.senderRequest);
router.get("/sendandreceived",authMiddleware.auth_Token,friendController.sendAndReceived);

router.put("/acceptFriendRequest/:id",authMiddleware.auth_Token,friendController.acceptRequest);

router.put("/rejectedFriendRequest/:id",authMiddleware.auth_Token,friendController.rejectedRequest);

module.exports = router;





 