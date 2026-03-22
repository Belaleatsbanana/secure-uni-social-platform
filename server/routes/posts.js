import express from "express";
import { getFeedPosts, getUserPosts, likePost, addComment, deleteComment, updatePost, deletePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.patch("/:id", verifyToken, updatePost);

/* DELETE */
router.delete("/:id", verifyToken, deletePost);

/* COMMENTS */
router.post("/:id/comment", verifyToken, addComment);
router.delete("/:id/comment/:commentId", verifyToken, deleteComment);

export default router;
