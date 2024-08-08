const Like=require("../models/like");



exports.likePost = async (req, res) => {
    try {
        // const post = await Like.findOne({PostId:{ _id: req.params.id}}, {userId:{user: req.userId}});
        

        if (post.likes > 0) {  
            return res.status(400).json({ message: "Post already liked" });
        }
        post.likes += 1;
        await post.save();

        return res.status(200).json({ message: "Post liked", post });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error", error:error.message });
    }
};


exports.unlikePost = async (req, res) => {
    try {
     
        // const post = await Like.findOne({ _id: req.params.id, user: req.userId });
        if (!post) {
            return res.status(400).json({ message: "Post not found" });
        }
     
        if (post.likes <= 0) {
            return res.status(400).json({ message: "Post not liked" });
        }
        post.likes -= 1;
        await post.save();

        return res.status(200).json({ message: "Post unliked", post });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};