import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    
    // Authorization check - user can only create posts as themselves
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Not authorized to create posts for other users" });
    }

    // Input validation
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Post description is required" });
    }

    if (description.length > 5000) {
      return res.status(400).json({ error: "Description too long (max 5000 characters)" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description: description.trim(),
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const posts = await Post.find().sort({ createdAt: -1 }).limit(50); // Add pagination
    res.status(201).json(posts);
  } catch (err) {
    console.error("Create post error:", err.message);
    res.status(500).json({ error: "Failed to create post" });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json(posts);
  } catch (err) {
    console.error("Get feed posts error:", err.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Get user posts error:", err.message);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Authorization check - user can only like as themselves
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Like post error:", err.message);
    res.status(500).json({ error: "Failed to update post" });
  }
};
