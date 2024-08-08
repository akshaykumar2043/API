const friend = require("../models/friend.js")
const User = require("../models/user.js")

// FRIEND REQUEST API

exports.friendRequest = async (req, res) => {
    try {

        // console.log(params);
        const friendRequest = await friend.create({
            sender: req.userId,
            receiver: req.body.receiver
        });
        return res.status(201).json({ message: "Friend request sent successfully", friendRequest });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//history of friendrequest list
exports.historyFriendRequest = async (req, res) => {
    try {
        const list = await friend.find({ status: "pending" });
        console.log(`found ${list.length} pending list`);
        return res.status(201).json({ message: "successfull", list });

    } catch (error) {
        return res.status(400).json({ message: "unsuccessfull", error });
    }
}

//one person how many received Request

exports.receivedRequest = async (req, res) => {
    try {
        const user = await friend.find({ receiver: req.userId });
        if (user.length === 0) {
            return res.status(404).json({ message: "No friend recived requests found" });
        }
        console.log(user);
        return res.status(200).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error", err });
    }
};

//one person how many send Request
exports.senderRequest = async (req, res) => {
    try {
        const user = await friend.find({ sender: req.userId });
        if (user.length === 0) {
            return res.status(404).json({ message: "No friend send requests found" });
        }
        return res.status(201).json({ message: "successfull all find to send request by user", user })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", err });
    }
}

//send and received request
exports.sendAndReceived = async (req, res) => {
    try {
        // Pagination
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;

        // Sort options
        // const sortField = req.query.sortField || 'createdAt';
        // const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
       
        const user = await friend
            .find({ $or: [{ sender: req.userId }, { receiver: req.userId }] })
            // .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit);

             // Separate sender and receiver
        const senders = user.filter(friend => friend.sender.toString() === req.userId.toString());
        const receivers = user.filter(friend => friend.receiver.toString() === req.userId.toString());

        const totalCount = await friend.countDocuments();
        console.log("Fetched user data:", user);

        return res.status(200).json({
            message: "Get successfully.",
            // user,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            senders,
            receivers
        });
    } catch (error) {
        console.error("Error retrieving friend requests:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



exports.acceptRequest = async (req, res) => {
    try {
        const userUpdate = await friend.findOneAndUpdate(
            { sender: req.params.id },
            { $set: { status: "accepted" } },
            { new: true }
        );
        if (!userUpdate) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        console.log({ message: "Successfully accepted", userUpdate });
        return res.status(200).json({ message: "Successfully accepted", userUpdate });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.rejectedRequest = async (req, res) => {
    try {
        const userUpdate = await friend.findOneAndUpdate(
            { sender: req.params.id },
            { $set: { status: "Rejected" } },
            { new: true }
        );
        if (!userUpdate) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        console.log({ message: "Successfully rejected", userUpdate });
        return res.status(200).json({ message: "Successfully rejected", userUpdate });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};












