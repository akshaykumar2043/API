const Post = require('../models/post');
const Like = require("../models/like");



exports.createPost = async (req, res) => {
    try {
        const { content, taggedFriends } = req.body;
        let image = "";
        if (req.files && req.files.image && req.files.image[0]) {
            image = `image/${req.files.image[0].filename}`;
        }
         const post = await Post.create({
            user: req.userId,
            content,
            image,
            taggedFriends
        });
        if (!post) {
            return res.status(400).json({ message: "Post not created!" });
        }
        return res.status(200).json({ message: "Successful post", post });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("user");
        return res.status(200).json({ message: "successfull post!!", posts });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error!!!", error: err.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.userId });
        return res.status(201).json({ message: "successfull get post!!", posts });
    } catch (error) {
        return res.status(400).json({ message: "Internal server error", error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, user: req.userId });
        console.log("Post found:", post);
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) {
            return res.status(400).json({ error: "Failed to update post" });
        }
        return res.status(200).json({ message: "Successfully updated post!", post: updatedPost });
    } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const posts = await Post.findByIdAndDelete(req.params.id, { new: true });
        if (!posts) return res.status(400).json({ error: "post not found!!!" });
        return res.status(200).json({ message: "successfull delete posts!!", posts });
    } catch (error) {
        return res.status(400).json({ message: "Internal server error", error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {

        const like = await Like.create({
            post: req.body.post,
            likedBy: req.userId
        });

        return res.status(200).json({ message: "Post liked", like });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.unlikePost = async (req, res) => {
    try {
        const like = await Like.findOneAndDelete({ post: req.body.post, likedBy: req.userId });
        if (!like) {
            return res.status(400).json({ message: "Like not found" });
        }
        return res.status(200).json({ message: "Post unliked", like });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.totalLike = async (req, res) => {
    try {
        const totalLikes = await Like.find()
            .populate("likedBy")
            .populate("post");

        if (!totalLikes.length) {
            return res.status(404).json({ message: "No likes found" });
        }
        return res.status(200).json({ message: "Likes retrieved successfully", total: totalLikes });
    } catch (error) {
        console.error("Error retrieving likes:", error);
        return res.status(500).json({ message: "Server error while retrieving likes" });
    }
};



